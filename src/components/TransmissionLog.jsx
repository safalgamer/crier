import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useStore } from '../store/useStore';
import { Trash2 } from 'lucide-react';
import '../styles/TransmissionLog.css';

export default function TransmissionLog() {
  const { logs, clearLogs } = useStore();
  const [selectedLog, setSelectedLog] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (selectedLog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset position when modal closes
      setDragOffset({ x: 0, y: 0 });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedLog]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.log-modal-close') || !e.target.closest('.log-modal-header')) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleClear = async () => {
    await clearLogs();
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['timestamp', 'channel', 'message', 'status'];
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.channel || '',
      `"${(log.message || '').replace(/"/g, '""')}"`,
      log.status || ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crier-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="transmission-log">
      <div className="log-header">
        <h3>Transmission Log</h3>
        <div className="log-header-buttons">
          {logs.length > 0 && (
            <>
              <button className="btn btn-sm btn-gold" onClick={exportCSV}>
                <Trash2 size={14} style={{marginRight: 4}} /> EXPORT
              </button>
              <button className="btn btn-sm btn-muted" onClick={handleClear}>
                <Trash2 size={14} /> Clear
              </button>
            </>
          )}
        </div>
      </div>
      <div className="logs-container">
        {logs.length === 0 ? (
          <p className="log-empty">No transmissions yet</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`log-entry log-${log.status}`}
              onClick={() => setSelectedLog(log)}
            >
              <span className="log-time">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className="log-channel">{log.channel}</span>
              <span className="log-message">{log.message}</span>
              <span className={`log-status ${log.status}`}>
                {log.status === 'success' ? '✓' : '✗'}
              </span>
              <span className="log-view-hint">▶ VIEW</span>
            </div>
          ))
        )}
      </div>

      {selectedLog && ReactDOM.createPortal(
        <div className="log-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="log-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
            }}
          >
            <div className="log-modal-header" onMouseDown={handleMouseDown}>
              <h2 className="log-modal-title">◈ TRANSMISSION DETAILS</h2>
              <span className="log-modal-drag-hint">⠿ DRAG</span>
              <button
                className="log-modal-close"
                onClick={() => setSelectedLog(null)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-content">
              <div className="log-detail-row">
                <label>Status</label>
                <span className={`status-badge status-${selectedLog.status}`}>
                  {selectedLog.status === 'success' ? '✓ SENT' : '✗ FAILED'}
                </span>
              </div>
              <div className="log-detail-row">
                <label>Channel</label>
                <span>#{selectedLog.channel}</span>
              </div>
              <div className="log-detail-row">
                <label>Timestamp</label>
                <span className="log-detail-timestamp">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </span>
              </div>
              <div className="log-detail-row">
                <label>Message</label>
                <div className="log-detail-message">
                  {selectedLog.message}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
