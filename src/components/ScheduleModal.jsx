import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/ScheduleModal.css';

const RECURRENCE_OPTIONS = [
  { value: 'every-hour', label: 'Every Hour' },
  { value: 'every-day', label: 'Every Day' },
  { value: 'every-week', label: 'Every Week' },
  { value: 'every-monday', label: 'Every Monday' },
  { value: 'every-sunday', label: 'Every Sunday' },
];

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export default function ScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  initialMessage,
  initialDatetime,
  initialRecurrence,
  isEditing = false,
}) {
  const [datetime, setDatetime] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [recurrence, setRecurrence] = useState('every-day');
  const [draftMessage, setDraftMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDatetime(toLocalDateTimeInput(initialDatetime));
    setRepeat(Boolean(initialRecurrence));
    setRecurrence(initialRecurrence || 'every-day');
    setDraftMessage(initialMessage || '');
  }, [isOpen, initialDatetime, initialRecurrence, initialMessage]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const preview = useMemo(() => {
    const text = (draftMessage || '').trim();
    if (!text) return 'No message selected';
    return text.length > 100 ? `${text.slice(0, 100)}...` : text;
  }, [draftMessage]);

  if (!isOpen) return null;

  return createPortal(
    <div className="schedule-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="schedule-modal">
        <h3 className="schedule-modal-title">SCHEDULE BROADCAST</h3>

        <div className="schedule-modal-group">
          <label>Preview</label>
          <div className="schedule-modal-preview">{preview}</div>
        </div>

        {isEditing && (
          <div className="schedule-modal-group">
            <label>Message</label>
            <textarea
              className="schedule-modal-textarea"
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Edit scheduled message"
            />
          </div>
        )}

        <div className="schedule-modal-group">
          <label>Date & Time</label>
          <input
            className="schedule-modal-datetime"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </div>

        <div className="schedule-modal-group schedule-modal-repeat-row">
          <label className="schedule-modal-checkbox">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
            <span>REPEAT</span>
          </label>
        </div>

        {repeat && (
          <div className="schedule-modal-group">
            <select
              className="schedule-modal-select"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="schedule-modal-confirm"
          onClick={async () => {
            const combined = new Date(datetime);
            const localISOString = new Date(
              combined.getTime() - combined.getTimezoneOffset() * 60000
            ).toISOString();

            await onConfirm({
              datetime: localISOString,
              recurrence: repeat ? recurrence : null,
              message: draftMessage,
            });
            onClose();
          }}
          disabled={!datetime || !draftMessage.trim()}
        >
          {'\u25c8 CONFIRM SCHEDULE'}
        </button>

        <button className="schedule-modal-cancel" onClick={onClose}>
          {'\u2715 CANCEL'}
        </button>
      </div>
    </div>,
    document.body
  );
}
