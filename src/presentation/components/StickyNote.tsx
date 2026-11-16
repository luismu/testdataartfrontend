import React, { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Note, Point, Rect } from '../../domain/types';
import { NOTE_COLORS } from '../../domain/constants';
import { useDrag } from '../../application/useDrag';
import { useResize } from '../../application/useResize';

interface StickyNoteProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, pos: Point) => void;
  onDimensionsChange: (id: string, dim: Dimensions) => void;
  onContentChange: (id: string, content: string) => void;
  onColorChange: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onDragMove?: (rect: Rect) => boolean; // returns true if colliding with trash
  onDragEndWithCollision?: (id: string, wasColliding: boolean, finalPos: Point) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = memo(
  ({
    note,
    isSelected,
    onSelect,
    onPositionChange,
    onDimensionsChange,
    onContentChange,
    onColorChange,
    onDelete,
    onBringToFront,
    onDragMove,
    onDragEndWithCollision,
  }) => {
    const [livePos, setLivePos] = useState<Point>({ x: note.x, y: note.y });
    const [liveDim, setLiveDim] = useState<Dimensions>({ width: note.width, height: note.height });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const isCollidingTrashRef = useRef(false);

    // Keep live values in sync when note props update externally
    useEffect(() => {
      if (!isDragging) {
        setLivePos({ x: note.x, y: note.y });
      }
    }, [note.x, note.y, isDragging]);

    useEffect(() => {
      if (!isResizing) {
        setLiveDim({ width: note.width, height: note.height });
      }
    }, [note.width, note.height, isResizing]);

    // Dragging logic
    const { handlePointerDown: onHeaderPointerDown, handlePointerMove: onHeaderPointerMove, handlePointerUp: onHeaderPointerUp } =
      useDrag({
        onDragStart: () => {
          setIsDragging(true);
          onBringToFront(note.id);
          onSelect(note.id);
        },
        onDrag: (currentPos) => {
          setLivePos(currentPos);
          if (onDragMove) {
            const colliding = onDragMove({
              x: currentPos.x,
              y: currentPos.y,
              width: liveDim.width,
              height: liveDim.height,
            });
            isCollidingTrashRef.current = colliding;
          }
        },
        onDragEnd: (finalPos) => {
          setIsDragging(false);
          const wasColliding = isCollidingTrashRef.current;
          if (onDragEndWithCollision) {
            onDragEndWithCollision(note.id, wasColliding, finalPos);
          } else if (wasColliding) {
            onDelete(note.id);
          } else {
            onPositionChange(note.id, finalPos);
          }
          isCollidingTrashRef.current = false;
        },
      });

    // Resizing logic (from bottom-right handle)
    const { handlePointerDown: onResizePointerDown, handlePointerMove: onResizePointerMove, handlePointerUp: onResizePointerUp } =
      useResize({
        onResizeStart: () => {
          setIsResizing(true);
          onBringToFront(note.id);
          onSelect(note.id);
        },
        onResize: (dim) => {
          setLiveDim(dim);
        },
        onResizeEnd: (finalDim) => {
          setIsResizing(false);
          onDimensionsChange(note.id, finalDim);
        },
      });

    const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;

    return (
      <div
        className={`sticky-note ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${
          isResizing ? 'resizing' : ''
        }`}
        style={{
          transform: `translate3d(${livePos.x}px, ${livePos.y}px, 0)`,
          width: `${liveDim.width}px`,
          height: `${liveDim.height}px`,
          zIndex: note.zIndex,
          backgroundColor: colorConfig.bg,
          borderColor: colorConfig.border,
          color: colorConfig.text,
        }}
        onPointerDown={() => onBringToFront(note.id)}
      >
        {/* Pushpin / Chincheta (pulls out during drag, pins back on release) */}
        <div
          className={`sticky-thumbtack ${isDragging ? 'unpinned' : 'pinned'}`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            className="thumbtack-svg"
          >
            <path d="M12 15V22" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="12" cy="14" rx="4.5" ry="1.8" fill="#991b1b" />
            <path
              d="M8.5 7C8.5 7 9.5 13 10 14H14C14.5 13 15.5 7 15.5 7H8.5Z"
              fill="url(#pinGradient)"
            />
            <circle cx="12" cy="6.5" r="4" fill="#ef4444" />
            <ellipse cx="10.8" cy="5.2" rx="1.5" ry="0.9" fill="#fca5a5" opacity="0.8" />
            <defs>
              <linearGradient id="pinGradient" x1="8.5" y1="7" x2="15.5" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ef4444" />
                <stop offset="1" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Note Header / Drag Handle */}
        <div
          className="sticky-note-header"
          style={{ backgroundColor: colorConfig.headerBg }}
          onPointerDown={(e) => onHeaderPointerDown(e, livePos)}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          title="Drag to move note"
        >
          <div className="drag-handle-grip" aria-label="Drag grip">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="header-actions" onPointerDown={(e) => e.stopPropagation()}>
            {/* Color switcher dots */}
            <div className="color-palette-inline">
              {Object.values(NOTE_COLORS).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`color-dot ${note.color === c.id ? 'active' : ''}`}
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                  title={`Change color to ${c.name}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange(note.id, c.id);
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className="note-delete-btn"
              title="Delete note"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Note Content (Textarea) */}
        <div className="sticky-note-body">
          <textarea
            className="note-textarea"
            placeholder="Type your note here..."
            value={note.content}
            onChange={(e) => onContentChange(note.id, e.target.value)}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when focusing or selecting text
            style={{ color: colorConfig.text }}
          />
        </div>

        {/* Note Footer Info */}
        <div className="sticky-note-footer">
          <span className="dimension-badge">
            {Math.round(liveDim.width)} × {Math.round(liveDim.height)}
          </span>
          <span className="pos-badge">
            X:{Math.round(livePos.x)} Y:{Math.round(livePos.y)}
          </span>
        </div>

        {/* Resize Handle (Bottom-Right) */}
        <div
          className="resize-handle se-handle"
          title="Drag to resize note"
          onPointerDown={(e) => onResizePointerDown(e, liveDim)}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }
);

StickyNote.displayName = 'StickyNote';
