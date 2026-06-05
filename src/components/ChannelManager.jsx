import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Plus } from 'lucide-react';
import '../styles/ChannelManager.css';

export default function ChannelManager({ serverId }) {
  const { servers, removeChannel, updateChannel, addChannel } = useStore();
  const server = servers.find((s) => s.id === serverId);

  const [newChannelName, setNewChannelName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const handleNameChange = async (serverId, channelId, newName) => {
    await updateChannel(serverId, channelId, { name: newName });
  };

  const handleWebhookChange = async (serverId, channelId, newWebhook) => {
    await updateChannel(serverId, channelId, { webhook: newWebhook });
  };

  const handleDelete = async (serverId, channelId) => {
    await removeChannel(serverId, channelId);
  };

  const handleAddChannel = async () => {
    if (!newChannelName.trim() || !newWebhookUrl.trim()) return;
    setAdding(true);
    await addChannel(serverId, {
      name: newChannelName.trim(),
      webhook: newWebhookUrl.trim(),
    });
    setNewChannelName('');
    setNewWebhookUrl('');
    setAdding(false);
  };

  if (!server) return <div className="channel-manager">Select a server first</div>;

  return (
    <div className="channel-manager settings-tab">
      {/* Server name header */}
      <div className="settings-server-header">
        <div className="settings-server-label">SERVER</div>
        <div className="settings-server-name">{server.name}</div>
      </div>

      <div className="settings-section-title">CHANNELS</div>

      <div className="channels-list">
        {server.channels.length === 0 && (
          <div className="channels-empty">No channels yet. Add one below.</div>
        )}
        {server.channels.map((channel) => (
          <div key={channel.id} className="channel-item">
            <input
              type="text"
              value={channel.name}
              onChange={(e) =>
                handleNameChange(serverId, channel.id, e.target.value)
              }
              placeholder="Channel name"
              className="channel-name-input"
            />
            <textarea
              value={channel.webhook}
              onChange={(e) =>
                handleWebhookChange(serverId, channel.id, e.target.value)
              }
              placeholder="Webhook URL"
              className="webhook-input"
              rows="2"
            />
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(serverId, channel.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add channel form */}
      <div className="add-channel-section">
        <div className="add-channel-inputs">
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Channel name"
            className="add-channel-name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
          />
          <input
            type="text"
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            placeholder="Webhook URL (https://discord.com/api/webhooks/...)"
            className="add-channel-webhook"
            onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
          />
        </div>
        <button
          className="btn btn-primary add-channel-btn"
          onClick={handleAddChannel}
          disabled={adding || !newChannelName.trim() || !newWebhookUrl.trim()}
        >
          <Plus size={16} /> ADD CHANNEL
        </button>
      </div>
    </div>
  );
}
