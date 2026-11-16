import React from 'react';
import { StorageProviderType } from '../../domain/types';
import { SyncStatus } from '../../application/useNotes';

interface ToolbarProps {
  noteCount: number;
  storageType: StorageProviderType;
  syncStatus: SyncStatus;
  isDrawMode: boolean;
  onToggleDrawMode: () => void;
  onOpenCreateModal: () => void;
  onQuickAdd: () => void;
  onSwitchStorage: (type: StorageProviderType) => void;
  onClearAll: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  noteCount,
  storageType,
  syncStatus,
  isDrawMode,
  onToggleDrawMode,
  onOpenCreateModal,
  onQuickAdd,
  onSwitchStorage,
  onClearAll,
}) => {
  return (
    <header className="app-toolbar">
      <div className="toolbar-brand">
        <span className="brand-logo">📌</span>
        <div>
          <h1 className="brand-title">Sticky Notes TS</h1>
          <span className="brand-subtitle">Desktop Workspace (1024×768+)</span>
        </div>
      </div>

      <div className="toolbar-section actions-group">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onQuickAdd}
          title="Add a default note in workspace"
        >
          <span className="btn-icon">+</span> Quick Add
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenCreateModal}
          title="Create note specifying exact position and dimensions"
        >
          ⚙ Specify Size & Pos
        </button>

        <button
          type="button"
          className={`btn ${isDrawMode ? 'btn-active-toggle' : 'btn-secondary'}`}
          onClick={onToggleDrawMode}
          title="Click and drag on the canvas to draw a note"
        >
          ✏ {isDrawMode ? 'Drawing Mode: ON (Drag Canvas)' : 'Draw on Canvas'}
        </button>
      </div>

      <div className="toolbar-section persistence-group">
        <div className="storage-toggle">
          <span className="storage-label">Storage:</span>
          <button
            type="button"
            className={`toggle-option ${storageType === 'local' ? 'active' : ''}`}
            onClick={() => onSwitchStorage('local')}
            title="Save to browser localStorage (instant)"
          >
            LocalStorage
          </button>
          <button
            type="button"
            className={`toggle-option ${storageType === 'mock-api' ? 'active' : ''}`}
            onClick={() => onSwitchStorage('mock-api')}
            title="Save to asynchronous Mock REST API with simulated network latency"
          >
            Mock REST API
          </button>
        </div>

        <div className={`sync-indicator sync-${syncStatus}`} title={`Sync status: ${syncStatus}`}>
          <span className="sync-dot"></span>
          <span className="sync-text">
            {syncStatus === 'saving' && 'Syncing...'}
            {syncStatus === 'synced' && 'Synced'}
            {syncStatus === 'error' && 'Sync Error'}
            {syncStatus === 'idle' && 'Idle'}
          </span>
        </div>
      </div>

      <div className="toolbar-section stats-group">
        <span className="notes-counter">
          <strong>{noteCount}</strong> {noteCount === 1 ? 'note' : 'notes'}
        </span>
        {noteCount > 0 && (
          <button
            type="button"
            className="btn btn-danger-ghost"
            onClick={onClearAll}
            title="Clear all notes"
          >
            Clear All
          </button>
        )}
      </div>
    </header>
  );
};
