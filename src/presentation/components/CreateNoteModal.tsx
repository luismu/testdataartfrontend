import React, { useState } from 'react';
import { DEFAULT_COLOR_ID, DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH, MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH, NOTE_COLORS } from '../../domain/constants';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    content: string;
  }) => void;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [x, setX] = useState<number>(200);
  const [y, setY] = useState<number>(150);
  const [width, setWidth] = useState<number>(DEFAULT_NOTE_WIDTH);
  const [height, setHeight] = useState<number>(DEFAULT_NOTE_HEIGHT);
  const [color, setColor] = useState<string>(DEFAULT_COLOR_ID);
  const [content, setContent] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.max(MIN_NOTE_WIDTH, width),
      height: Math.max(MIN_NOTE_HEIGHT, height),
      color,
      content,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Note with Specified Size & Position</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="note-x">Position X (px):</label>
              <input
                id="note-x"
                type="number"
                min="0"
                max="2500"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="note-y">Position Y (px):</label>
              <input
                id="note-y"
                type="number"
                min="0"
                max="2500"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="note-width">Width (min {MIN_NOTE_WIDTH}px):</label>
              <input
                id="note-width"
                type="number"
                min={MIN_NOTE_WIDTH}
                max="1000"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="note-height">Height (min {MIN_NOTE_HEIGHT}px):</label>
              <input
                id="note-height"
                type="number"
                min={MIN_NOTE_HEIGHT}
                max="1000"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Color:</label>
            <div className="color-palette-selection">
              {Object.values(NOTE_COLORS).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`color-choice-btn ${color === c.id ? 'active' : ''}`}
                  style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
                  onClick={() => setColor(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="note-text">Initial Note Text:</label>
            <textarea
              id="note-text"
              rows={3}
              placeholder="Enter note text..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
