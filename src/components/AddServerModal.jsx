import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import '../styles/AddServerModal.css';

export default function AddServerModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const { addServer } = useStore();

  // BUG 5 fix: Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addServer({
      name: name.trim(),
      icon: icon.trim() || null,
    });
    setName('');
    setIcon('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Server</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Server Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My SMP"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Server Icon URL (optional)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <button type="submit" className="btn-create-server">
            ◈ CREATE SERVER
          </button>
        </form>
      </div>
    </div>
  );
}
