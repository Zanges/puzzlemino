# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Puzzlemino is a zero-gravity tetromino puzzle game built with React 19, TypeScript, and Vite. Players drag and drop tetromino pieces onto a 10x10 board. Completed rows and columns are cleared (no gravity/falling). The game ends when no valid placements remain.

## Commands

```bash
npm run dev        # Dev server (port 5173)
npm run build      # Type-check (tsc -b) + Vite build
npm run lint       # ESLint on .ts/.tsx files
npm run preview    # Preview production build
npx vitest         # Run all tests
npx vitest run src/engine/__tests__/board.test.ts  # Run a single test file
```

## Architecture

### State Management
Single Zustand store (`src/store/gameStore.ts`) manages all game state: app state (menu/playing/gameOver), board grid, hand pieces, score, piece bag, and difficulty. Components consume state via hooks.

### Game Engine (`src/engine/`)
Pure functions with no React dependencies:
- **board.ts** — Board creation, piece placement, starting square generation
- **validator.ts** — Placement validation (bounds checking, collision detection)
- **lines.ts** — Row and column clearing (both axes, no gravity)
- **bagStore.ts** — Fisher-Yates shuffled piece bag with auto-refill
- **gameOver.ts** — Checks if any piece in hand can be placed anywhere
- **Tests live in `src/engine/__tests__/`**

### UI Components (`src/components/game/`)
- **GameLayout.tsx** — Main game screen; sets up dnd-kit drag/drop context with mouse+touch sensors
- **Board.tsx** — Renders the grid; shows drag-over preview with validation feedback
- **Hand.tsx** — Displays draggable pieces from the player's hand
- **Piece.tsx** — Renders a single tetromino as a grid of colored cells
- **MainMenu.tsx** — Difficulty selection screen

### Configuration
`public/gameConfig.json` defines difficulty levels (easy/normal/hard), each specifying board dimensions, hand size, starting squares count, and available pieces. Loaded at runtime by `src/config/configLoader.ts`.

### Piece System (`src/utils/pieceUtils.ts`)
Generates all rotation variants for the 7 standard tetrominoes (19 unique rotations total). Colors are randomly assigned to shapes at game start.

## Key Conventions

- **Strict TypeScript** — `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- **Immutable state updates** — Board/game state never mutated directly
- **Tailwind CSS** — Styling via utility classes; custom CSS variables for piece colors and board theme defined in `src/index.css`
- **cn() utility** (`src/lib/utils.ts`) — Merges Tailwind classes conditionally (clsx + tailwind-merge)
