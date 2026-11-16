# Sticky Notes Desktop Application - Luis Murillo (React + TypeScript)

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

> **Empirical Cross-Browser Validation (Not Just a Claim)**:  
> Rather than simply stating compatibility on paper, cross-browser behavior was programmatically verified and audited using **Playwright**. Real browser engines—**Chromium** (powering Google Chrome and Microsoft Edge) and **Firefox** (Gecko)—were instantiated to execute identical automated user journeys (pointer capture drag-and-drop, corner resizing math, DOM collision detection, and localStorage lifecycle). The complete reproducible test suite is included in this repository.

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v26)
- `pnpm` (required package manager)

### Dependency & Security Policy

- **`pnpm` over `npm`**: Chosen deliberately to prevent supply-chain vulnerabilities common to npm's flat/hoisted tree. `pnpm` uses a strict content-addressable store, prevents phantom dependencies, and enforces build script authorization policies (`pnpm approve-builds`) to block untrusted postinstall scripts.
- **Strict Version Pinning (No `^` Caret)**: All dependencies and devDependencies in `package.json` are pinned to exact versions (e.g., `"react": "19.3.1"` rather than `"^19.0.0"`). Avoiding the circumflex (`^`) eliminates the unpredictability of automatic minor/patch updates, ensuring 100% deterministic, hermetic, and reproducible builds across developer machines and CI/CD pipelines.

### Installation & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Start local development server
pnpm run dev

# 3. Run automated unit tests (Vitest)
pnpm test

# 4. Run automated cross-browser E2E suite (Chromium & Firefox via Playwright)
pnpm run test:e2e

# 5. Build for production
pnpm run build
```

---

## Testing & Cross-Browser Verification

### 1. Unit Tests (Domain Math & Persistence)
```bash
pnpm test
```
- **11 / 11 tests passing**: Validates pure AABB bounding-box intersection thresholds, coordinate clamping, and `LocalStorage` / `MockApi` repository operations.

### 2. End-to-End Cross-Browser Suite (Playwright)
```bash
pnpm run test:e2e
```

#### Automated Cross-Browser Test Report

| Test Case | Chromium (Chrome/Edge) | Firefox | Status |
|---|:---:|:---:|:---:|
| **1. Create Note (Specified Size & Position)**<br>*(Opens modal, enters custom dimensions X:180, Y:140, 280×240px, picks Soft Green)* |  PASSED |  PASSED |  Pass |
| **2. Move Note by Dragging**<br>*(Pointer capture on header, moves +120px X, +80px Y)* |  PASSED |  PASSED |  Pass |
| **3. Resize Note by Dragging**<br>*(Drags SE corner handle +60px W, +40px H, verifies dimension badge)* |  PASSED |  PASSED |  Pass |
| **4. Color Switching & Text Editing**<br>*(Types text, selects Rose Pink, reloads page, validates persistence)* |  PASSED |  PASSED |  Pass |
| **5. Delete Note via Trash Zone**<br>*(Drags over predefined trash, triggers `.trash-hovered`, releases to delete)* |  PASSED |  PASSED |  Pass |

```text
Running 10 tests using 4 workers

  ✓ [chromium] › e2e/sticky-notes.spec.ts:11:3 › loads desktop workspace and creates a note of specified size and position (1.6s)
  ✓ [chromium] › e2e/sticky-notes.spec.ts:38:3 › moves a note by dragging the header handle (1.1s)
  ✓ [chromium] › e2e/sticky-notes.spec.ts:59:3 › resizes a note by dragging the bottom-right resize handle (1.1s)
  ✓ [chromium] › e2e/sticky-notes.spec.ts:82:3 › changes note color and preserves content on page reload (1.2s)
  ✓ [chromium] › e2e/sticky-notes.spec.ts:100:3 › removes a note by dragging it over the predefined trash zone (998ms)
  ✓ [firefox]  › e2e/sticky-notes.spec.ts:11:3 › loads desktop workspace and creates a note of specified size and position (3.9s)
  ✓ [firefox]  › e2e/sticky-notes.spec.ts:38:3 › moves a note by dragging the header handle (3.8s)
  ✓ [firefox]  › e2e/sticky-notes.spec.ts:59:3 › resizes a note by dragging the bottom-right resize handle (3.6s)
  ✓ [firefox]  › e2e/sticky-notes.spec.ts:82:3 › changes note color and preserves content on page reload (3.7s)
  ✓ [firefox]  › e2e/sticky-notes.spec.ts:100:3 › removes a note by dragging it over the predefined trash zone (1.7s)

  10 passed (10.1s)
```

To view the interactive HTML report with DOM snapshots and traces:
```bash
pnpm exec playwright show-report
```
