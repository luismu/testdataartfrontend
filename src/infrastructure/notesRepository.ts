import { Note } from '../domain/types';

export interface INotesRepository {
  getAll(): Promise<Note[]>;
  saveAll(notes: Note[]): Promise<void>;
  upsert(note: Note): Promise<Note>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export const LOCAL_STORAGE_KEY = 'sticky_notes_local_db_v1';
export const MOCK_API_STORAGE_KEY = 'sticky_notes_mock_api_db_v1';

/**
 * Concrete implementation for LocalStorage persistence (Bonus III).
 * Fully isolated client-side database.
 */
export class LocalStorageNotesRepository implements INotesRepository {
  private key: string;

  constructor(key = LOCAL_STORAGE_KEY) {
    this.key = key;
  }

  async getAll(): Promise<Note[]> {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to read notes from localStorage', e);
      return [];
    }
  }

  async saveAll(notes: Note[]): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }

  async upsert(note: Note): Promise<Note> {
    const notes = await this.getAll();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }
    await this.saveAll(notes);
    return note;
  }

  async delete(id: string): Promise<void> {
    const notes = await this.getAll();
    const filtered = notes.filter((n) => n.id !== id);
    await this.saveAll(filtered);
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key);
  }
}

/**
 * Concrete implementation for Mock REST API (Bonus V).
 * Simulates asynchronous HTTP network roundtrips with configurable latency.
 * Stores its data in an isolated storage key ('sticky_notes_mock_api_db_v1')
 * representing an independent remote server database.
 */
export class MockApiNotesRepository implements INotesRepository {
  private key: string;
  private latencyMs: number;

  constructor(latencyMs = 300, key = MOCK_API_STORAGE_KEY) {
    this.latencyMs = latencyMs;
    this.key = key;
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }

  async getAll(): Promise<Note[]> {
    await this.delay();
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to fetch from Mock API', e);
      return [];
    }
  }

  async saveAll(notes: Note[]): Promise<void> {
    await this.delay();
    try {
      localStorage.setItem(this.key, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save to Mock API', e);
    }
  }

  async upsert(note: Note): Promise<Note> {
    await this.delay();
    const notes = await this.getAll();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }
    try {
      localStorage.setItem(this.key, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to upsert to Mock API', e);
    }
    return note;
  }

  async delete(id: string): Promise<void> {
    await this.delay();
    const notes = await this.getAll();
    const filtered = notes.filter((n) => n.id !== id);
    try {
      localStorage.setItem(this.key, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete from Mock API', e);
    }
  }

  async clear(): Promise<void> {
    await this.delay();
    localStorage.removeItem(this.key);
  }
}
