import React, { useEffect, useState } from 'react'
import '../styles/KeyboardShortcuts.css'

export function useKeyboardShortcuts({
  onBroadcast,
  onClear,
  onFocusSender,
  onFocusMessage,
  onFocusTemplates,
} = {}) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Show help on ? or Shift+?
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !showHelp) {
        e.preventDefault()
        setShowHelp(true)
        return
      }

      // Close help on Escape when help is open
      if (e.key === 'Escape' && showHelp) {
        e.preventDefault()
        setShowHelp(false)
        return
      }

      // Skip shortcuts if help is open or user is typing in a textarea/input that's not ours
      if (showHelp) return
      
      const target = e.target
      const isFormInput = target.tagName === 'INPUT' && target.name && 
        (target.name === 'senderName' || target.name === 'message')
      const isComposing = e.isComposing

      if (isComposing) return

      // Ctrl+Enter: Broadcast current message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onBroadcast?.()
        return
      }

      // Escape: Clear compose fields
      if (e.key === 'Escape' && !isFormInput) {
        e.preventDefault()
        onClear?.()
        return
      }

      // Ctrl+Shift+A: Focus sender name
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'A') {
        e.preventDefault()
        onFocusSender?.()
        return
      }

      // Ctrl+Shift+M: Focus message input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'M') {
        e.preventDefault()
        onFocusMessage?.()
        return
      }

      // Ctrl+Shift+T: Show templates
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'T') {
        e.preventDefault()
        onFocusTemplates?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showHelp, onBroadcast, onClear, onFocusSender, onFocusMessage, onFocusTemplates])

  return { showHelp, setShowHelp }
}

export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null

  const shortcuts = [
    { key: 'Ctrl+Enter', description: 'Broadcast current message to selected channels' },
    { key: 'Ctrl+Shift+A', description: 'Focus sender name input' },
    { key: 'Ctrl+Shift+M', description: 'Focus message input' },
    { key: 'Ctrl+Shift+T', description: 'Jump to templates panel' },
    { key: 'Escape', description: 'Clear compose fields' },
    { key: '?', description: 'Show this help panel' },
  ]

  return (
    <>
      <div
        className="shortcuts-overlay"
        onClick={onClose}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
      <div className="shortcuts-panel">
        <div className="shortcuts-header">
          <h2>⌨ KEYBOARD SHORTCUTS</h2>
          <button className="shortcuts-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="shortcut-row">
              <kbd className="shortcut-key">{shortcut.key}</kbd>
              <span className="shortcut-desc">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="shortcuts-hint">Press Escape to close</div>
      </div>
    </>
  )
}
