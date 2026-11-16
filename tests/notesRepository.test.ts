import { beforeEach, describe, expect, it } from 'vitest';
import { Note } from '../src/domain/types';
import {
  LOCAL_STORAGE_KEY,
  LocalStorageNotesRepository,
  MOCK_API_STORAGE_KEY,
  MockApiNotesRepository,
} from '../src/infrastructure/notesRepository';

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

describe('Infrastructure - Repositories (Option B: Isolated Stores)', () => {
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

  const remoteNote: Note = {
    id: 'remote-1',
    content: 'Remote server note',
    x: 150,
    y: 150,
    width: 220,
    height: 200,
    zIndex: 1,
    color: 'blue',
    createdAt: 2000,
    updatedAt: 2000,
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

    it('saves and retrieves notes from local key', async () => {
      await repo.saveAll([sampleNote]);
      const notes = await repo.getAll();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('test-1');
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).not.toBeNull();
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

    it('clears all notes in local store', async () => {
      await repo.saveAll([sampleNote]);
      await repo.clear();
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

    it('asynchronously persists notes to mock API key and retrieves them', async () => {
      await apiRepo.saveAll([remoteNote]);
      const fetched = await apiRepo.getAll();
      expect(fetched).toHaveLength(1);
      expect(fetched[0].id).toBe('remote-1');
      expect(localStorage.getItem(MOCK_API_STORAGE_KEY)).not.toBeNull();
    });

    it('asynchronously deletes notes', async () => {
      await apiRepo.upsert(remoteNote);
      await apiRepo.delete('remote-1');
      const fetched = await apiRepo.getAll();
      expect(fetched).toHaveLength(0);
    });

    it('clears only mock API store', async () => {
      await apiRepo.saveAll([remoteNote]);
      await apiRepo.clear();
      const fetched = await apiRepo.getAll();
      expect(fetched).toHaveLength(0);
    });
  });

  describe('Store Isolation (Option B Verification)', () => {
    it('guarantees LocalStorage and MockApi do not cross-contaminate data', async () => {
      localStorage.clear();
      const localRepo = new LocalStorageNotesRepository();
      const apiRepo = new MockApiNotesRepository(10);

      // Save note in local repo
      await localRepo.saveAll([sampleNote]);
      // Save note in api repo
      await apiRepo.saveAll([remoteNote]);

      // Verify local repo only sees local note
      const localNotes = await localRepo.getAll();
      expect(localNotes).toHaveLength(1);
      expect(localNotes[0].id).toBe('test-1');

      // Verify API repo only sees remote note
      const apiNotes = await apiRepo.getAll();
      expect(apiNotes).toHaveLength(1);
      expect(apiNotes[0].id).toBe('remote-1');

      // Deleting in local repo does not affect API repo
      await localRepo.delete('test-1');
      expect(await localRepo.getAll()).toHaveLength(0);
      expect(await apiRepo.getAll()).toHaveLength(1);
      expect((await apiRepo.getAll())[0].id).toBe('remote-1');

      // Clearing API repo does not affect local repo
      await localRepo.saveAll([sampleNote]);
      await apiRepo.clear();
      expect(await apiRepo.getAll()).toHaveLength(0);
      expect(await localRepo.getAll()).toHaveLength(1);
    });
  });
});
