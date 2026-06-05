import { useState, useEffect, forwardRef } from 'react';
import { useStore } from '../store/useStore';
import '../styles/TemplatesPanel.css';

const TemplatesPanel = forwardRef(function TemplatesPanel(props, ref) {
  const {
    templates,
    fetchTemplates,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
    currentMessage,
  } = useStore();
  const [templateName, setTemplateName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveStatusType, setSaveStatusType] = useState(''); // 'success' or 'error'
  const [loadedTemplateId, setLoadedTemplateId] = useState(null);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line
  }, []);

  // Save current compose fields as template
  const handleSave = async () => {
    if (!templateName.trim() || !currentMessage) {
      setSaveStatus('✗ Please enter a name and message');
      setSaveStatusType('error');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    
    setSaveStatus('Saving...');
    setSaveStatusType('');
    
    try {
      await saveTemplate(templateName.trim());
      setSaveStatus('✓ TEMPLATE SAVED');
      setSaveStatusType('success');
      setTemplateName('');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('✗ Failed to save template');
      setSaveStatusType('error');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleLoad = async (template) => {
    await loadTemplate(template);
    setLoadedTemplateId(template.id);
    setTimeout(() => setLoadedTemplateId(null), 1500);
  };

  return (
    <div className="templates-panel panel" ref={ref}>
      <h3>◈ TEMPLATES</h3>
      <div className="template-save-row">
        <input
          type="text"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Template name"
          disabled={!!saveStatus}
        />
        <button 
          className="btn-template-save" 
          onClick={handleSave}
          disabled={!!saveStatus}
        >
          {saveStatus || 'SAVE CURRENT'}
        </button>
        {saveStatus && (
          <span className={`template-save-status template-status-${saveStatusType}`}>
            {saveStatus}
          </span>
        )}
      </div>
      {templates.length === 0 ? (
        <div className="templates-empty">
          No templates saved. Compose a message and save it as a template.
        </div>
      ) : (
        <div className="templates-list">
          {templates.map(t => {
            const isLoaded = loadedTemplateId === t.id;
            return (
              <div className="template-item" key={t.id}>
                <div className="template-info">
                  <div className="template-name">{t.name}</div>
                  {t.sender_name && (
                    <div className="template-sender">From: {t.sender_name}</div>
                  )}
                  <div className="template-preview">
                    {t.message && t.message.length > 40
                      ? t.message.slice(0, 40) + '…'
                      : t.message}
                  </div>
                  {t.selected_channels && t.selected_channels.length > 0 && (
                    <div className="template-channels">
                      📡 {t.selected_channels.length} {t.selected_channels.length === 1 ? 'channel' : 'channels'}
                    </div>
                  )}
                </div>
                <div className="template-actions">
                  <button
                    className={`btn-template-load ${isLoaded ? 'loaded' : ''}`}
                    onClick={() => handleLoad(t)}
                  >
                    {isLoaded ? '✓ LOADED' : 'LOAD'}
                  </button>
                  <button className="btn-template-delete" onClick={() => deleteTemplate(t.id)}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default TemplatesPanel;
