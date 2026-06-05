import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Clock } from 'lucide-react';
import '../styles/SchedulePanel.css';

export default function SchedulePanel({ serverId }) {
  const {
    servers, scheduled, addScheduled, removeScheduled, loadScheduled,
    templateSenderName, templateAvatarUrl, templateMessage, templateSelectedChannels
  } = useStore();
  const [message, setMessage] = useState(templateMessage || '');
  const [senderName, setSenderName] = useState(templateSenderName || 'SMP Administration');
  const [avatarUrl, setAvatarUrl] = useState(templateAvatarUrl || '');
  const [selectedChannels, setSelectedChannels] = useState(templateSelectedChannels || []);
  const [datetime, setDatetime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('every-day');

  const server = servers.find((s) => s.id === serverId);

  useEffect(() => {
    loadScheduled();
  }, [loadScheduled]);

  const handleSchedule = async () => {
    if (!message.trim() || selectedChannels.length === 0 || !datetime) return;

    await addScheduled({
      message: message.trim(),
      senderName,
      avatarUrl,
      channels: selectedChannels,
      datetime,
      recurrence: isRecurring ? recurrenceInterval : null,
    });

    setMessage('');
    setSenderName('SMP Administration');
    setAvatarUrl('');
    setSelectedChannels([]);
    setDatetime('');
    setIsRecurring(false);
    setRecurrenceInterval('every-day');
  };

  const handleDelete = async (scheduledId) => {
    await removeScheduled(scheduledId);
  };

  const toggleChannel = (channelId) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  if (!server) return null;

  return (
    <div className="schedule-panel">
      <h3>
        <Clock size={18} /> Schedule Announcement
      </h3>

      <div className="form-group">
        <label>Sender Name</label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="SMP Administration"
        />
      </div>

      <div className="form-group">
        <label>Avatar URL (optional)</label>
        <input
          type="text"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="form-group">
        <label>Message (max 2000 chars)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
          placeholder="Your announcement..."
          rows="4"
        />
        <span className="char-count">
          {message.length}/2000
        </span>
      </div>

      <div className="form-group">
        <label>Send Date & Time</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="datetime-input"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          {' '}RECURRING
        </label>
      </div>

      {isRecurring && (
        <div className="form-group">
          <label>Repeat Interval</label>
          <div className="recurrence-options">
            {[
              { value: 'every-hour', label: 'Every Hour' },
              { value: 'every-day', label: 'Every Day' },
              { value: 'every-week', label: 'Every Week' },
              { value: 'every-monday', label: 'Every Monday' },
              { value: 'every-sunday', label: 'Every Sunday' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`recurrence-btn ${recurrenceInterval === opt.value ? 'active' : ''}`}
                onClick={() => setRecurrenceInterval(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}      <div className="form-group">
        <label>Select Channels</label>
        <div className="channel-chips">
          {server.channels.map((channel) => (
            <button
              key={channel.id}
              className={`chip ${selectedChannels.includes(channel.id) ? 'active' : ''
                }`}
              onClick={() => toggleChannel(channel.id)}
            >
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSchedule}>
        Schedule
      </button>

      {scheduled.length > 0 && (
        <div className="scheduled-list">
          <h4>Scheduled Messages</h4>
          {scheduled.map((sched) => (
            <div key={sched.id} className="scheduled-item">
              <div className="scheduled-info">
                <p className="scheduled-time">
                  {new Date(sched.datetime).toLocaleString()}
                </p>
                <p className="scheduled-preview">
                  {sched.message.substring(0, 100)}
                  {sched.message.length > 100 ? '...' : ''}
                </p>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(sched.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
