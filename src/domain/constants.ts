import { NoteColor } from './types';

export const MIN_NOTE_WIDTH = 150;
export const MIN_NOTE_HEIGHT = 140;
export const DEFAULT_NOTE_WIDTH = 220;
export const DEFAULT_NOTE_HEIGHT = 200;

export const NOTE_COLORS: Record<string, NoteColor> = {
  yellow: {
    id: 'yellow',
    name: 'Classic Yellow',
    bg: '#fef08a',
    headerBg: '#fde047',
    border: '#facc15',
    text: '#713f12',
  },
  green: {
    id: 'green',
    name: 'Soft Green',
    bg: '#bbf7d0',
    headerBg: '#86efac',
    border: '#4ade80',
    text: '#14532d',
  },
  blue: {
    id: 'blue',
    name: 'Sky Blue',
    bg: '#bae6fd',
    headerBg: '#7dd3fc',
    border: '#38bdf8',
    text: '#0c4a6e',
  },
  pink: {
    id: 'pink',
    name: 'Rose Pink',
    bg: '#fbcfe8',
    headerBg: '#f9a8d4',
    border: '#f472b6',
    text: '#831843',
  },
  purple: {
    id: 'purple',
    name: 'Lavender',
    bg: '#e9d5ff',
    headerBg: '#d8b4fe',
    border: '#c084fc',
    text: '#581c87',
  },
  orange: {
    id: 'orange',
    name: 'Peach Orange',
    bg: '#fed7aa',
    headerBg: '#fdba74',
    border: '#fb923c',
    text: '#7c2d12',
  },
};

export const DEFAULT_COLOR_ID = 'yellow';
