import React, { useCallback, useRef, useState } from 'react';
import { useNotes } from '../../application/useNotes';
import { StickyNote } from './StickyNote';
import { TrashZone } from './TrashZone';
import { Toolbar } from './Toolbar';
import { CreateNoteModal } from './CreateNoteModal';
import { Point, Rect } from '../../domain/types';
import { DEFAULT_COLOR_ID, MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH } from '../../domain/constants';

export const Board: React.FC = () => {
  const {
    notes,
    selectedNoteId,
    setSelectedNoteId,
    storageType,
    setStorageType,
    syncStatus,
    isHoveringTrash,
    createNote,
    updateNotePosition,
    updateNoteDimensions,
    updateNoteContent,
    updateNoteColor,
    deleteNote,
    bringToFront,
    registerTrashRect,
    checkTrashCollision,
  } = useNotes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawRect, setDrawRect] = useState<Rect | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<Point>({ x: 0, y: 0 });

  // Quick add with smart staggered positioning
  const handleQuickAdd = useCallback(() => {
    const offset = (notes.length % 8) * 30;
    createNote({
      x: 100 + offset,
      y: 100 + offset,
      width: 220,
      height: 200,
      color: DEFAULT_COLOR_ID,
      content: '',
    });
  }, [createNote, notes.length]);

  // Canvas drawing handlers (interactive drag-to-create)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawMode || e.button !== 0 || !boardRef.current) return;

    // Don't start drawing if clicking inside an existing note or toolbar
    if ((e.target as HTMLElement).closest('.sticky-note, .app-toolbar, .trash-zone, .modal-dialog')) {
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    isDrawingRef.current = true;
    drawStartRef.current = { x: startX, y: startY };
    setDrawRect({ x: startX, y: startY, width: 0, height: 0 });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const startX = drawStartRef.current.x;
    const startY = drawStartRef.current.y;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    setDrawRect({ x, y, width, height });
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    if (drawRect && drawRect.width >= 40 && drawRect.height >= 40) {
      // Create new note with the drawn geometry clamped to min dimensions
      createNote({
        x: drawRect.x,
        y: drawRect.y,
        width: Math.max(MIN_NOTE_WIDTH, drawRect.width),
        height: Math.max(MIN_NOTE_HEIGHT, drawRect.height),
        color: DEFAULT_COLOR_ID,
        content: '',
      });
      setIsDrawMode(false); // Turn off draw mode after successfully creating note
    }

    setDrawRect(null);
  };

  // Clear all notes helper
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all notes?')) {
      notes.forEach((n) => deleteNote(n.id));
    }
  };

  return (
    <div className="workspace-container">
      <Toolbar
        noteCount={notes.length}
        storageType={storageType}
        syncStatus={syncStatus}
        isDrawMode={isDrawMode}
        onToggleDrawMode={() => setIsDrawMode((prev) => !prev)}
        onOpenCreateModal={() => setIsModalOpen(true)}
        onQuickAdd={handleQuickAdd}
        onSwitchStorage={setStorageType}
        onClearAll={handleClearAll}
      />

      <main
        ref={boardRef}
        className={`canvas-board ${isDrawMode ? 'canvas-draw-cursor' : ''}`}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        {/* Visual instruction banner if canvas is empty */}
        {notes.length === 0 && (
          <div className="empty-board-hint">
            <h2>Canvas is empty</h2>
            <p>Click "+ Quick Add", "Specify Size & Pos", or "Draw on Canvas" above to begin.</p>
          </div>
        )}

        {/* Sticky Notes */}
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            onSelect={setSelectedNoteId}
            onPositionChange={updateNotePosition}
            onDimensionsChange={updateNoteDimensions}
            onContentChange={updateNoteContent}
            onColorChange={updateNoteColor}
            onDelete={deleteNote}
            onBringToFront={bringToFront}
            onDragMove={checkTrashCollision}
            onDragEndWithCollision={(id, wasColliding, finalPos) => {
              if (wasColliding) {
                deleteNote(id);
              } else {
                updateNotePosition(id, finalPos);
              }
            }}
          />
        ))}

        {/* Interactive Draw Mode Preview Box */}
        {drawRect && (
          <div
            className="drawing-preview-box"
            style={{
              left: `${drawRect.x}px`,
              top: `${drawRect.y}px`,
              width: `${drawRect.width}px`,
              height: `${drawRect.height}px`,
            }}
          >
            <span>
              {Math.round(drawRect.width)} × {Math.round(drawRect.height)}
            </span>
          </div>
        )}

        {/* Predefined Trash Zone for drag-to-delete */}
        <TrashZone isHovered={isHoveringTrash} onRegisterRect={registerTrashRect} />
      </main>

      {/* Modal for creating a note of specified position and dimensions */}
      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(params) => createNote(params)}
      />
    </div>
  );
};
