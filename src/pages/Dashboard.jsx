import { useRef, useState } from 'react'
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import ComposePanel from '../components/ComposePanel';
import TemplatesPanel from '../components/TemplatesPanel';
import ChannelManager from '../components/ChannelManager';
import TransmissionLog from '../components/TransmissionLog';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts.jsx'
import '../styles/Dashboard.css';

export default function Dashboard({ user }) {
  const { selectedServerId } = useStore();
  const composePanelRef = useRef(null);
  const templatesPanelRef = useRef(null);
  const senderInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const broadcastBtnRef = useRef(null);

  // Tab & page state
  const [activeTab, setActiveTab] = useState('compose');
  const [activePage, setActivePage] = useState('dashboard');

  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onBroadcast: () => broadcastBtnRef.current?.click(),
    onClear: () => {
      if (senderInputRef.current) {
        senderInputRef.current.value = '';
        senderInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (messageInputRef.current) {
        messageInputRef.current.value = '';
        messageInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    onFocusSender: () => senderInputRef.current?.focus(),
    onFocusMessage: () => messageInputRef.current?.focus(),
    onFocusTemplates: () => setActiveTab('templates'),
  });

  const renderMainContent = () => {
    // Full-page views (no server tabs)
    if (activePage === 'analytics') {
      return (
        <div className="fullpage-panel">
          <AnalyticsPanel />
        </div>
      );
    }
    if (activePage === 'logs') {
      return (
        <div className="fullpage-panel">
          <TransmissionLog />
        </div>
      );
    }

    // Server dashboard
    if (!selectedServerId) {
      return (
        <div className="empty-state">
          <h2>No server selected</h2>
          <p>Add a server from the sidebar to get started</p>
        </div>
      );
    }

    return (
      <div className="tab-content">
        {activeTab === 'compose' && (
          <ComposePanel
            ref={composePanelRef}
            serverId={selectedServerId}
            senderInputRef={senderInputRef}
            messageInputRef={messageInputRef}
            broadcastBtnRef={broadcastBtnRef}
          />
        )}
        {activeTab === 'templates' && (
          <TemplatesPanel ref={templatesPanelRef} />
        )}
        {activeTab === 'settings' && (
          <ChannelManager serverId={selectedServerId} />
        )}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="dashboard-main">
        {renderMainContent()}
      </main>

      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
