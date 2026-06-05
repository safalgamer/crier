import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../supabase';
import { Plus, Trash2, LogOut } from 'lucide-react';
import AddServerModal from './AddServerModal';
import '../styles/Sidebar.css';

const CrierLogo = () => (
  <svg width="28" height="28" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sgold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8c070" />
        <stop offset="100%" stopColor="#c8a55a" />
      </linearGradient>
      <linearGradient id="scyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#0099cc" />
      </linearGradient>
    </defs>
    <path d="M 148,58 A 62,62 0 1,0 148,142" fill="none" stroke="url(#sgold)" strokeWidth="16" strokeLinecap="square" />
    <path d="M 155,88 Q 163,94 155,100 Q 147,106 155,112" fill="none" stroke="url(#scyan)" strokeWidth="4" strokeLinecap="round" />
    <path d="M 163,80 Q 176,90 163,100 Q 150,110 163,120" fill="none" stroke="url(#scyan)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M 171,72 Q 188,86 171,100 Q 154,114 171,128" fill="none" stroke="url(#scyan)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <circle cx="152" cy="100" r="5" fill="#00d4ff" opacity="0.9" />
  </svg>
);

const SERVER_TABS = [
  { id: 'compose', emoji: '\ud83d\udce1', label: 'COMPOSE' },
  { id: 'templates', emoji: '\ud83d\udccb', label: 'TEMPLATES' },
  { id: 'settings', emoji: '\u2699\ufe0f', label: 'SETTINGS' },
];

export default function Sidebar({ user, activeTab, setActiveTab, activePage, setActivePage }) {
  const { servers, selectedServerId, setSelectedServer, removeServer, loadServers } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const handleServerClick = (serverId) => {
    setSelectedServer(serverId);
    setActivePage('dashboard');
    if (activeTab === undefined) setActiveTab('compose');
  };

  const handlePageNav = (page) => {
    setActivePage(page);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-topbar">
        <div className="sidebar-logo">
          <CrierLogo />
          <span className="sidebar-title">CRIER</span>
        </div>
        <div className="sidebar-clock">{formatTime(time)}</div>
        <div className="sidebar-user">{user?.email || 'User'}</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Servers</div>
        <button
          className="btn btn-primary add-server-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Add Server
        </button>
      </div>

      <div className="servers-list">
        {servers.map((server) => {
          const isSelected = selectedServerId === server.id && activePage === 'dashboard';
          return (
            <div key={server.id}>
              <div className={`server-item ${isSelected ? 'active' : ''}`}>
                <button
                  className="server-btn"
                  onClick={() => handleServerClick(server.id)}
                >
                  {server.icon ? (
                    <img src={server.icon} alt={server.name} className="server-icon" />
                  ) : (
                    <div className="server-icon-placeholder">S</div>
                  )}
                  <span>{server.name}</span>
                </button>
                <button
                  className="btn-delete"
                  onClick={() => removeServer(server.id)}
                  title="Delete server"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {isSelected && (
                <div className="server-tabs">
                  {SERVER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`server-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-emoji">{tab.emoji}</span>
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="global-nav">
        <button
          className={`global-nav-btn${activePage === 'analytics' ? ' active' : ''}`}
          onClick={() => handlePageNav('analytics')}
        >
          <span className="tab-emoji">{'\ud83d\udcca'}</span>
          <span className="tab-label">ANALYTICS</span>
        </button>
        <button
          className={`global-nav-btn${activePage === 'logs' ? ' active' : ''}`}
          onClick={() => handlePageNav('logs')}
        >
          <span className="tab-emoji">{'\ud83d\udcdc'}</span>
          <span className="tab-label">LOGS</span>
        </button>
      </div>

      <button
        className="signout-btn"
        onClick={handleLogout}
        title="Sign out"
      >
        <LogOut size={16} /> Sign Out
      </button>

      <AddServerModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </aside>
  );
}