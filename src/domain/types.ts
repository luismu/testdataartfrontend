export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rect extends Point, Dimensions {}

export interface NoteColor {
  id: string;
  name: string;
  bg: string;
  headerBg: string;
  border: string;
  text: string;
}

export interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export type StorageProviderType = 'local' | 'mock-api';
