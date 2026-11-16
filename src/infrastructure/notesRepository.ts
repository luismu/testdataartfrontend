import { Note } from '../domain/types';

export interface INotesRepository {
  getAll(): Promise<Note[]>;
  saveAll(notes: Note[]): Promise<void>;
  upsert(note: Note): Promise<Note>;
  delete(id: string): Promise<void>;
}

const LOCAL_STORAGE_KEY = 'sticky_notes_data_v1';

export class LocalStorageNotesRepository implements INotesRepository {
  async getAll(): Promise<Note[]> {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
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
}

/**
 * Mock REST API implementation satisfying Bonus V.
 * Simulates asynchronous HTTP network roundtrips with delays.
 */
export class MockApiNotesRepository implements INotesRepository {
  private inMemoryDb: Map<string, Note> = new Map();
  private latencyMs: number;

  constructor(latencyMs = 300) {
    this.latencyMs = latencyMs;
    // Pre-populate from localStorage if available to maintain continuity
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (existing) {
        const parsed: Note[] = JSON.parse(existing);
        parsed.forEach((n) => this.inMemoryDb.set(n.id, n));
      }
    } catch {
      // Ignore initial load error
    }
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }

  async getAll(): Promise<Note[]> {
    await this.delay();
    return Array.from(this.inMemoryDb.values());
  }

  async saveAll(notes: Note[]): Promise<void> {
    await this.delay();
    this.inMemoryDb.clear();
    notes.forEach((n) => this.inMemoryDb.set(n.id, n));
    // Keep localStorage in sync as backup
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }

  async upsert(note: Note): Promise<Note> {
    await this.delay();
    this.inMemoryDb.set(note.id, note);
    return note;
  }

  async delete(id: string): Promise<void> {
    await this.delay();
    this.inMemoryDb.delete(id);
  }
}
