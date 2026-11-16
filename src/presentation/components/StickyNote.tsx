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
    const [pinPhase, setPinPhase] = useState<'pinned' | 'unpinning' | 'dragging' | 'pinning'>('pinned');
    const isCollidingTrashRef = useRef(false);
    const pinTimerRef = useRef<number | null>(null);

    // Clean up animation timers on unmount
    useEffect(() => {
      return () => {
        if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
      };
    }, []);

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
    const {
      handlePointerDown: onHeaderPointerDown,
      handlePointerMove: onHeaderPointerMove,
      handlePointerUp: onHeaderPointerUp,
    } = useDrag({
      onDragStart: () => {
        if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
        setIsDragging(true);
        setPinPhase('unpinning');
        pinTimerRef.current = window.setTimeout(() => {
          setPinPhase('dragging');
        }, 280);
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
        if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
        setIsDragging(false);
        const wasColliding = isCollidingTrashRef.current;
        if (wasColliding) {
          if (onDragEndWithCollision) {
            onDragEndWithCollision(note.id, true, finalPos);
          } else {
            onDelete(note.id);
          }
        } else {
          // Unpinned pin plunges back, then seats flush as pinned
          setPinPhase('pinning');
          pinTimerRef.current = window.setTimeout(() => {
            setPinPhase('pinned');
          }, 200);

          if (onDragEndWithCollision) {
            onDragEndWithCollision(note.id, false, finalPos);
          } else {
            onPositionChange(note.id, finalPos);
          }
        }
        isCollidingTrashRef.current = false;
      },
    });

    // Resizing logic (from bottom-right handle)
    const {
      handlePointerDown: onResizePointerDown,
      handlePointerMove: onResizePointerMove,
      handlePointerUp: onResizePointerUp,
    } = useResize({
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
        {/* Pushpin / Chincheta physical removal and insertion simulation */}
        <div className={`sticky-thumbtack pin-phase-${pinPhase}`} aria-hidden="true">
          {pinPhase === 'pinned' && (
            <img
              src="/pin-pinned.png"
              alt=""
              className="thumbtack-img pin-pinned"
              draggable={false}
            />
          )}
          {(pinPhase === 'unpinning' || pinPhase === 'pinning') && (
            <img
              src="/pin-unpinned.png"
              alt=""
              className="thumbtack-img pin-unpinned"
              draggable={false}
            />
          )}
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
            onPointerDown={(e) => e.stopPropagation()}
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
            <path
              d="M11 1L1 11M11 5L5 11M11 9L9 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }
);

StickyNote.displayName = 'StickyNote';
