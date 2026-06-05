import { useState, forwardRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Send } from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import '../styles/ComposePanel.css';

export default forwardRef(function ComposePanel({
  serverId,
  senderInputRef,
  messageInputRef,
  broadcastBtnRef,
}, ref) {
  const {
    servers,
    addLog,
    setCurrentCompose,
    setComposeFields,
    scheduled,
    loadScheduled,
    removeScheduled,
    addScheduled,
    updateScheduled,
    templateSenderName,
    templateAvatarUrl,
    templateMessage,
    templateSelectedChannels,
    templates,
    fetchTemplates,
    loadTemplate,
  } = useStore();

  const [senderName, setSenderName] = useState(templateSenderName);
  const [avatarUrl, setAvatarUrl] = useState(templateAvatarUrl);
  const [message, setMessage] = useState(templateMessage);
  const [selectedChannels, setSelectedChannels] = useState(templateSelectedChannels);
  const [sending, setSending] = useState(false);

  const [embedActive, setEmbedActive] = useState(false);
  const [embedColor, setEmbedColor] = useState('#c8a55a');
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [embedImageUrl, setEmbedImageUrl] = useState('');
  const [embedFooter, setEmbedFooter] = useState('Crier - Free Discord Broadcast Tool');

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState('');
  const [broadcastResult, setBroadcastResult] = useState('');

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduledExpanded, setIsScheduledExpanded] = useState(false);
  const [isTemplatesExpanded, setIsTemplatesExpanded] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const server = servers.find((s) => s.id === serverId);

  const filteredScheduled = useMemo(() => {
    if (!server) return [];
    return scheduled.filter((item) =>
      (item.channels || []).some((channelId) =>
        server.channels.some((channel) => channel.id === channelId)
      )
    );
  }, [scheduled, server]);

  const handleSenderNameChange = (e) => {
    const value = e.target.value;
    setSenderName(value);
    setComposeFields({ senderName: value, avatarUrl, message, selectedChannels });
  };

  const handleAvatarUrlChange = (e) => {
    const value = e.target.value;
    setAvatarUrl(value);
    setComposeFields({ senderName, avatarUrl: value, message, selectedChannels });
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setComposeFields({ senderName, avatarUrl, message: value, selectedChannels });
    setCurrentCompose(senderName, value);
  };

  useEffect(() => {
    setSenderName(templateSenderName);
  }, [templateSenderName]);

  useEffect(() => {
    setAvatarUrl(templateAvatarUrl);
  }, [templateAvatarUrl]);

  useEffect(() => {
    setMessage(templateMessage);
    setCurrentCompose(templateSenderName, templateMessage);
  }, [templateMessage, templateSenderName, setCurrentCompose]);

  useEffect(() => {
    setSelectedChannels(templateSelectedChannels);
  }, [templateSelectedChannels]);

  useEffect(() => {
    loadScheduled();
  }, [loadScheduled]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const toggleChannel = (channelId) => {
    setSelectedChannels((prev) => {
      const newChannels = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId];
      setComposeFields({ senderName, avatarUrl, message, selectedChannels: newChannels });
      return newChannels;
    });
  };

  const resetCompose = () => {
    setMessage('');
    setSelectedChannels([]);
    if (embedActive) {
      setEmbedTitle('');
      setEmbedDescription('');
      setEmbedImageUrl('');
      setEmbedFooter('Crier - Free Discord Broadcast Tool');
    }
  };

  const handleBroadcast = async () => {
    if (!message.trim() || selectedChannels.length === 0) return;

    setSending(true);
    for (const channelId of selectedChannels) {
      const channel = server.channels.find((c) => c.id === channelId);
      if (channel && channel.webhook) {
        try {
          const body = {
            username: senderName,
            content: message,
            avatar_url: avatarUrl || undefined,
          };
          if (embedActive) {
            body.embeds = [
              {
                color: parseInt(embedColor.replace('#', ''), 16),
                title: embedTitle,
                description: embedDescription,
                image: embedImageUrl ? { url: embedImageUrl } : undefined,
                footer: embedFooter ? { text: embedFooter } : undefined,
              },
            ];
          }

          const success = await fetch(channel.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }).then((res) => res.ok || res.status === 204);

          await addLog({
            channel: channel.name,
            message,
            status: success ? 'success' : 'failed',
          });
        } catch (error) {
          console.error('Error sending webhook:', error);
          await addLog({
            channel: channel.name,
            message,
            status: 'failed',
          });
        }
      }
    }

    setSending(false);
    resetCompose();
  };

  const handleBroadcastAll = async () => {
    if (!message.trim() || servers.length === 0) return;

    setIsBroadcasting(true);
    let sentCount = 0;
    let failCount = 0;
    let totalChannels = 0;

    for (const srv of servers) {
      for (const channel of srv.channels) {
        totalChannels++;
        setBroadcastProgress(`${sentCount + failCount}/${totalChannels}`);

        if (channel.webhook) {
          try {
            const body = {
              username: senderName,
              content: message,
              avatar_url: avatarUrl || undefined,
            };
            if (embedActive) {
              body.embeds = [
                {
                  color: parseInt(embedColor.replace('#', ''), 16),
                  title: embedTitle,
                  description: embedDescription,
                  image: embedImageUrl ? { url: embedImageUrl } : undefined,
                  footer: embedFooter ? { text: embedFooter } : undefined,
                },
              ];
            }

            const success = await fetch(channel.webhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }).then((res) => res.ok || res.status === 204);

            if (success) {
              sentCount++;
            } else {
              failCount++;
            }

            await addLog({
              channel: channel.name,
              message,
              status: success ? 'success' : 'failed',
            });
          } catch (error) {
            console.error('Error sending webhook:', error);
            failCount++;
            await addLog({
              channel: channel.name,
              message,
              status: 'failed',
            });
          }
        }
      }
    }

    setIsBroadcasting(false);
    setBroadcastProgress('');
    setBroadcastResult(`\u2713 COMPLETE - ${sentCount} sent, ${failCount} failed`);
    setTimeout(() => {
      setBroadcastResult('');
    }, 3000);
    resetCompose();
  };

  const handleConfirmSchedule = async ({ datetime, recurrence, message: modalMessage }) => {
    if (!datetime || !(modalMessage || '').trim()) return;

    if (editingItem) {
      await updateScheduled(editingItem.id, {
        message: modalMessage.trim(),
        datetime: new Date(datetime).toISOString(),
        recurrence: recurrence || null,
      });
      setEditingItem(null);
      return;
    }

    await addScheduled({
      message: (modalMessage || message).trim(),
      senderName,
      avatarUrl,
      channels: selectedChannels,
      datetime,
      recurrence: recurrence || null,
    });
  };

  const handleEditScheduled = (item) => {
    setEditingItem(item);
    setIsScheduleModalOpen(true);
  };

  if (!server) return null;

  return (
    <div className="compose-panel" ref={ref}>
      <div className="compose-header-row">
        <h2>Compose Broadcast</h2>
        <button
          className={`embed-toggle-btn${embedActive ? ' active' : ''}`}
          type="button"
          onClick={() => setEmbedActive((v) => !v)}
        >
          {embedActive ? 'EMBED ON' : 'EMBED OFF'}
        </button>
      </div>

      <div className="compose-left">
        <div className="compose-templates-section" style={{ marginBottom: '20px' }}>
          <button
            className="scheduled-toggle-btn"
            type="button"
            onClick={() => setIsTemplatesExpanded((v) => !v)}
            style={{ width: '100%', marginBottom: isTemplatesExpanded ? '10px' : '0' }}
          >
            {isTemplatesExpanded ? '▼' : '▶'} ◈ TEMPLATES ({templates.length})
          </button>
          {isTemplatesExpanded && (
            <div className="scheduled-list">
              {templates.length === 0 ? (
                <p className="scheduled-empty">No saved templates.</p>
              ) : (
                templates.map((tpl) => (
                  <div key={tpl.id} className="scheduled-item">
                    <div className="scheduled-info">
                      <p className="scheduled-time">{tpl.name}</p>
                      <p className="scheduled-preview">
                        {(tpl.message || '').slice(0, 100)}
                        {(tpl.message || '').length > 100 ? '...' : ''}
                      </p>
                    </div>
                    <div className="scheduled-actions">
                      <button
                        className="scheduled-edit-btn"
                        onClick={() => {
                          loadTemplate(tpl);
                          setIsTemplatesExpanded(false);
                        }}
                      >
                        LOAD
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Sender Name</label>
          <input
            ref={senderInputRef}
            type="text"
            value={senderName}
            onChange={handleSenderNameChange}
            placeholder="Crier"
          />
        </div>

        <div className="form-group">
          <label>Avatar URL (optional)</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={handleAvatarUrlChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            ref={messageInputRef}
            value={message}
            onChange={handleMessageChange}
            placeholder="This message was sent via Crier - your free Discord broadcast tool."
            className="message-textarea"
          />
        </div>

        {embedActive && (
          <div className="embed-fields">
            <div className="form-group">
              <label>Embed Color</label>
              <input
                type="color"
                value={embedColor}
                onChange={e => setEmbedColor(e.target.value)}
                style={{ width: 40, height: 28, border: 'none', background: 'none', marginLeft: 8 }}
              />
            </div>
            <div className="form-group">
              <label>Embed Title</label>
              <input
                type="text"
                value={embedTitle}
                onChange={e => setEmbedTitle(e.target.value)}
                placeholder="Announcement Title"
              />
            </div>
            <div className="form-group">
              <label>Embed Description</label>
              <textarea
                value={embedDescription}
                onChange={e => setEmbedDescription(e.target.value)}
                placeholder="Detailed description..."
              />
            </div>
            <div className="form-group">
              <label>Embed Image URL</label>
              <input
                type="text"
                value={embedImageUrl}
                onChange={e => setEmbedImageUrl(e.target.value)}
                placeholder="https://image-url..."
              />
            </div>
            <div className="form-group">
              <label>Embed Footer</label>
              <input
                type="text"
                value={embedFooter}
                onChange={e => setEmbedFooter(e.target.value)}
                placeholder="Crier - Free Discord Broadcast Tool"
              />
            </div>
          </div>
        )}

        <div className="channels-list" style={{ margin: '18px 0 12px' }}>
          {server.channels.length === 0 ? (
            <p className="no-channels-hint">No channels yet - add them in the settings tab</p>
          ) : (
            server.channels.map((channel) => (
              <button
                key={channel.id}
                className={`chip ${selectedChannels.includes(channel.id) ? 'active' : ''}`}
                onClick={() => toggleChannel(channel.id)}
              >
                {channel.name}
              </button>
            ))
          )}
        </div>

        <div className="broadcast-btn-row">
          <button
            ref={broadcastBtnRef}
            className="btn-broadcast-now"
            onClick={handleBroadcast}
            disabled={sending || selectedChannels.length === 0 || !message.trim()}
          >
            ◈ BROADCAST NOW
          </button>
          <button
            className="btn-schedule-quick"
            onClick={() => {
              setEditingItem(null);
              setIsScheduleModalOpen(true);
            }}
            disabled={!message.trim() || selectedChannels.length === 0}
          >
            ⏰ SCHEDULE
          </button>
        </div>

        {isBroadcasting && <p className="broadcast-status">Broadcasting... {broadcastProgress}</p>}
        {broadcastResult && <p className="broadcast-status">{broadcastResult}</p>}

        <div className="scheduled-section">
          <button
            type="button"
            className="scheduled-toggle-btn"
            onClick={() => setIsScheduledExpanded((prev) => !prev)}
          >
            {isScheduledExpanded ? '\u25bc' : '\u25b6'} SCHEDULED ({filteredScheduled.length})
          </button>

          {isScheduledExpanded && (
            <div className="scheduled-list">
              {filteredScheduled.length === 0 ? (
                <p className="scheduled-empty">No scheduled broadcasts.</p>
              ) : (
                filteredScheduled.map((item) => (
                  <div key={item.id} className="scheduled-item">
                    <div className="scheduled-info">
                      <p className="scheduled-time">{new Date(item.datetime).toLocaleString()}</p>
                      <p className="scheduled-preview">
                        {(item.message || '').slice(0, 100)}
                        {(item.message || '').length > 100 ? '...' : ''}
                      </p>
                    </div>
                    <div className="scheduled-actions">
                      <button className="scheduled-edit-btn" onClick={() => handleEditScheduled(item)}>
                        EDIT
                      </button>
                      <button className="scheduled-delete-btn" onClick={() => removeScheduled(item.id)}>
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingItem(null);
        }}
        onConfirm={handleConfirmSchedule}
        initialMessage={editingItem ? editingItem.message : message}
        initialDatetime={editingItem ? editingItem.datetime : ''}
        initialRecurrence={editingItem?.recurrence || null}
        isEditing={Boolean(editingItem)}
      />
    </div>
  );
});
