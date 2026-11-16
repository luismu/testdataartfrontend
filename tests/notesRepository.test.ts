import { beforeEach, describe, expect, it } from 'vitest';
import { Note } from '../src/domain/types';
import { LocalStorageNotesRepository, MockApiNotesRepository } from '../src/infrastructure/notesRepository';

// In-memory mock for localStorage in Node/Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Infrastructure - Repositories', () => {
  const sampleNote: Note = {
    id: 'test-1',
    content: 'Unit test note',
    x: 100,
    y: 100,
    width: 200,
    height: 180,
    zIndex: 1,
    color: 'yellow',
    createdAt: 1000,
    updatedAt: 1000,
  };

  describe('LocalStorageNotesRepository', () => {
    let repo: LocalStorageNotesRepository;

    beforeEach(() => {
      localStorage.clear();
      repo = new LocalStorageNotesRepository();
    });

    it('returns empty array when nothing is stored', async () => {
      const notes = await repo.getAll();
      expect(notes).toEqual([]);
    });

    it('saves and retrieves notes from storage', async () => {
      await repo.saveAll([sampleNote]);
      const notes = await repo.getAll();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('test-1');
      expect(notes[0].content).toBe('Unit test note');
    });

    it('upserts a note (insert new and update existing)', async () => {
      await repo.upsert(sampleNote);
      let notes = await repo.getAll();
      expect(notes).toHaveLength(1);

      const updated = { ...sampleNote, content: 'Updated content' };
      await repo.upsert(updated);
      notes = await repo.getAll();
      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe('Updated content');
    });

    it('deletes a note by id', async () => {
      await repo.saveAll([sampleNote]);
      await repo.delete('test-1');
      const notes = await repo.getAll();
      expect(notes).toHaveLength(0);
    });
  });

  describe('MockApiNotesRepository', () => {
    let apiRepo: MockApiNotesRepository;

    beforeEach(() => {
      localStorage.clear();
      apiRepo = new MockApiNotesRepository(10); // low latency for fast test runs
    });

    it('asynchronously persists notes in memory and retrieves them', async () => {
      await apiRepo.saveAll([sampleNote]);
      const fetched = await apiRepo.getAll();
      expect(fetched).toHaveLength(1);
      expect(fetched[0].id).toBe('test-1');
    });

    it('asynchronously deletes notes', async () => {
      await apiRepo.upsert(sampleNote);
      await apiRepo.delete('test-1');
      const fetched = await apiRepo.getAll();
      expect(fetched).toHaveLength(0);
    });
  });
});
