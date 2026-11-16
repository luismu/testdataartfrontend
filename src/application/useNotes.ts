import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Note, Point, Rect, StorageProviderType } from '../domain/types';
import {
  DEFAULT_COLOR_ID,
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  MIN_NOTE_HEIGHT,
  MIN_NOTE_WIDTH,
} from '../domain/constants';
import { isIntersecting } from '../domain/collision';
import {
  INotesRepository,
  LocalStorageNotesRepository,
  MockApiNotesRepository,
} from '../infrastructure/notesRepository';

export type SyncStatus = 'idle' | 'saving' | 'synced' | 'error';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [storageType, setStorageType] = useState<StorageProviderType>('local');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isHoveringTrash, setIsHoveringTrash] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trash zone bounding rect for collision detection
  const trashRectRef = useRef<Rect | null>(null);

  // Repository instances
  const localRepoRef = useRef<INotesRepository>(new LocalStorageNotesRepository());
  const mockApiRepoRef = useRef<INotesRepository>(new MockApiNotesRepository());

  const getActiveRepo = useCallback((): INotesRepository => {
    return storageType === 'local' ? localRepoRef.current : mockApiRepoRef.current;
  }, [storageType]);

  // Load notes on mount and on storage type switch
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      setSyncStatus('saving');
      try {
        const repo = getActiveRepo();
        const data = await repo.getAll();
        if (!isCancelled) {
          if (data.length === 0 && !isLoaded) {
            // Seed with an initial sample note if completely empty
            const initialNote: Note = {
              id: 'sample-1',
              content: 'Welcome to Sticky Notes! 📝\n\n• Drag me around\n• Resize from corners\n• Drag to Trash to delete',
              x: 80,
              y: 80,
              width: 260,
              height: 220,
              zIndex: 1,
              color: DEFAULT_COLOR_ID,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            await repo.upsert(initialNote);
            setNotes([initialNote]);
          } else {
            setNotes(data);
          }
          setIsLoaded(true);
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Failed to load notes', err);
        if (!isCancelled) setSyncStatus('error');
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [getActiveRepo, isLoaded]);

  // Helper to persist list
  const persistNotes = useCallback(
    async (updatedList: Note[]) => {
      setSyncStatus('saving');
      try {
        const repo = getActiveRepo();
        await repo.saveAll(updatedList);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Failed to persist notes', err);
        setSyncStatus('error');
      }
    },
    [getActiveRepo]
  );

  // Maximum z-index computation
  const getNextZIndex = useCallback(() => {
    if (notes.length === 0) return 1;
    return Math.max(...notes.map((n) => n.zIndex || 0)) + 1;
  }, [notes]);

  // Bring a note to front (Bonus II)
  const bringToFront = useCallback(
    (id: string) => {
      setSelectedNoteId(id);
      setNotes((prev) => {
        const target = prev.find((n) => n.id === id);
        if (!target) return prev;
        const highestZ = Math.max(...prev.map((n) => n.zIndex || 0));
        if (target.zIndex === highestZ) return prev; // Already on top

        const nextZ = highestZ + 1;
        const updated = prev.map((n) => (n.id === id ? { ...n, zIndex: nextZ } : n));
        persistNotes(updated);
        return updated;
      });
    },
    [persistNotes]
  );

  // Create a note with specified position and size (Core Feature 1)
  const createNote = useCallback(
    (params?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      color?: string;
      content?: string;
    }) => {
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        content: params?.content ?? '',
        x: Math.round(params?.x ?? 120),
        y: Math.round(params?.y ?? 120),
        width: Math.max(MIN_NOTE_WIDTH, Math.round(params?.width ?? DEFAULT_NOTE_WIDTH)),
        height: Math.max(MIN_NOTE_HEIGHT, Math.round(params?.height ?? DEFAULT_NOTE_HEIGHT)),
        zIndex: getNextZIndex(),
        color: params?.color ?? DEFAULT_COLOR_ID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setNotes((prev) => {
        const updated = [...prev, newNote];
        persistNotes(updated);
        return updated;
      });
      setSelectedNoteId(newNote.id);
      return newNote;
    },
    [getNextZIndex, persistNotes]
  );

  // Move a note by dragging (Core Feature 3)
  const updateNotePosition = useCallback(
    (id: string, newPos: Point) => {
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === id
            ? { ...n, x: Math.round(newPos.x), y: Math.round(newPos.y), updatedAt: Date.now() }
            : n
        );
        persistNotes(updated);
        return updated;
      });
    },
    [persistNotes]
  );

  // Change note size by dragging (Core Feature 2)
  const updateNoteDimensions = useCallback(
    (id: string, newDim: Dimensions) => {
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === id
            ? {
                ...n,
                width: Math.max(MIN_NOTE_WIDTH, Math.round(newDim.width)),
                height: Math.max(MIN_NOTE_HEIGHT, Math.round(newDim.height)),
                updatedAt: Date.now(),
              }
            : n
        );
        persistNotes(updated);
        return updated;
      });
    },
    [persistNotes]
  );

  // Update note content (Bonus I)
  const updateNoteContent = useCallback(
    (id: string, content: string) => {
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, content, updatedAt: Date.now() } : n
        );
        persistNotes(updated);
        return updated;
      });
    },
    [persistNotes]
  );

  // Update note color (Bonus IV)
  const updateNoteColor = useCallback(
    (id: string, color: string) => {
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, color, updatedAt: Date.now() } : n
        );
        persistNotes(updated);
        return updated;
      });
    },
    [persistNotes]
  );

  // Delete note (Core Feature 4)
  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        persistNotes(updated);
        return updated;
      });
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
      setIsHoveringTrash(false);
    },
    [persistNotes, selectedNoteId]
  );

  // Register Trash zone element rect
  const registerTrashRect = useCallback((rect: Rect | null) => {
    trashRectRef.current = rect;
  }, []);

  // Check collision with Trash zone during active drag
  const checkTrashCollision = useCallback((noteRect: Rect): boolean => {
    if (!trashRectRef.current) return false;
    const isColliding = isIntersecting(noteRect, trashRectRef.current, 0.15);
    setIsHoveringTrash(isColliding);
    return isColliding;
  }, []);

  return {
    notes,
    selectedNoteId,
    setSelectedNoteId,
    storageType,
    setStorageType,
    syncStatus,
    isHoveringTrash,
    isLoaded,
    createNote,
    updateNotePosition,
    updateNoteDimensions,
    updateNoteContent,
    updateNoteColor,
    deleteNote,
    bringToFront,
    registerTrashRect,
    checkTrashCollision,
  };
}
