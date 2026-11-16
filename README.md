# Sticky Notes Desktop Application (React + TypeScript)

A lightweight desktop single-page application for interactive sticky notes, engineered from first principles in **React 19** and **TypeScript** without third-party component libraries or drag-and-drop frameworks.

---

## Architecture Overview

The application follows a Clean / Layered Architecture adhering to SOLID principles and separation of concerns across four distinct tiers:
- **Domain Layer (`src/domain/`)**: Houses the core business types (`Note`, `Rect`, `Point`, `NoteColor`), constants, and pure mathematical functions such as Axis-Aligned Bounding Box (AABB) intersection detection and coordinate clamping. This layer has zero external dependencies and encapsulates the fundamental rules of canvas geometry.
- **Infrastructure Layer (`src/infrastructure/`)**: Implements the Repository Pattern via the `INotesRepository` interface. It provides two pluggable persistence drivers: `LocalStorageNotesRepository` for synchronous browser persistence and `MockApiNotesRepository` for simulated asynchronous REST operations with network latency and Promise-based flows.
- **Application Layer (`src/application/`)**: Manages state orchestration and hardware-accelerated interaction lifecycles through custom hooks. `useDrag` and `useResize` harness native Pointer Events with `setPointerCapture` to provide high-frequency, jitter-free movement and resizing without re-rendering parent components unnecessarily. `useNotes` acts as the single source of truth for notes collection state, z-index layering, and collision evaluation.
- **Presentation Layer (`src/presentation/`)**: Comprises modular React components (`Board`, `StickyNote`, `TrashZone`, `Toolbar`, `CreateNoteModal`). Components leverage GPU-accelerated CSS `translate3d` transforms during active dragging to maintain smooth 60fps rendering, separating active gesture state from persistent committed state.

---

## Features Implemented

### Core Requirements
1. **Create Note of Specified Size & Position**:
   - Via the **"Specify Size & Pos"** modal (explicit pixel inputs for X, Y, Width, Height, and Color).
   - Via **"Draw on Canvas"** interactive drag-to-create mode (click and drag directly on the canvas to draw a note of exact dimensions).
   - Via **"Quick Add"** button with staggered cascading coordinates.
2. **Change Note Size by Dragging**:
   - Interactive resize handle in the bottom-right corner of each note, with enforced minimum dimension constraints (150×140px).
3. **Move Note by Dragging**:
   - Smooth header drag handle using native Pointer Events and pointer capture, fully responsive across desktop resolutions.
4. **Remove Note via Trash Zone**:
   - Predefined "Trash Zone" drop area with real-time AABB collision detection. The zone pulses and highlights on overlap, and releasing the note inside instantly deletes it.

### Bonus Features
- [x] **Bonus I - Text Editing**: Direct inline editable textarea with customized paper typography.
- [x] **Bonus II - Move Notes to Front**: Click or drag any note to dynamically elevate its `zIndex` above overlapping notes.
- [x] **Bonus III - LocalStorage Persistence**: Automatically saves state changes and restores notes upon page reload.
- [x] **Bonus IV - Color Palette**: 6 pastel sticky-note colors (Yellow, Green, Blue, Pink, Purple, Orange) switchable per note or at creation time.
- [x] **Bonus V - Asynchronous Mock REST API**: Switchable storage engine simulating real-world network latency (300ms) with asynchronous Promises and sync status indicators ("Syncing...", "Synced", "Error").

---

## System Requirements & Browser Compatibility

- **Target Platform**: Desktop (minimum resolution `1024x768`).
- **Supported Browsers**:
  - Google Chrome (latest, Windows/Mac/Linux)
  - Mozilla Firefox (latest, all platforms)
  - Microsoft Edge (latest)
  - Apple Safari (latest)

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v26)
- `pnpm` (or `npm`)

### Installation & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Start local development server
pnpm run dev

# 3. Run automated tests (Vitest)
pnpm test

# 4. Build for production
pnpm run build
```

---

## Testing

The project includes unit tests for the core mathematical collision engine and persistence repositories:

```bash
pnpm test
```
