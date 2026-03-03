# Phase 1: Foundation & Setup Specification

## Objective
Establish the project foundation, configure the development environment, and define the core data structures and configurations that will power the game engine.

## 1. Environment Initialization
- **Tooling:** Initialize a Vite project using the `react-ts` template.
- **Dependencies:** 
  - `react`, `react-dom`
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `clsx`, `tailwind-merge` (standard utilities for `shadcn/ui`)
  - `lucide-react` (for any UI icons)

## 2. Styling & UI Foundation
- **Tailwind Configuration:** 
  - Configure `tailwind.config.js` to define standard breakpoints.
  - Set up a custom color palette in `index.css` using CSS variables to define the "muted retro" aesthetic (e.g., `--color-piece-i`, `--color-board-bg`).
- **Component Library:**
  - Initialize the `shadcn/ui` base structure (fonts, utility classes).
  - Create placeholder folders for components (`src/components/ui` for primitives, `src/components/game` for game-specific components).

## 3. Game Configuration Store
- **File:** `public/gameConfig.json` (Loaded dynamically at runtime)
- **Properties:**
  - `boardWidth`: 10
  - `boardHeight`: 10
  - `handSize`: 3
- **Base Piece Definitions:**
  - Define the classic 7 Tetrominoes (`I, J, L, O, S, T, Z`) as 2D number arrays within the JSON.
  - Example representation for an 'L' piece:
    ```json
    {
      "id": "L",
      "matrix": [
        [1, 0],
        [1, 0],
        [1, 1]
      ]
    }
    ```
- **Configuration Loader:** Create `src/config/configLoader.ts` to `fetch` and type-validate this configuration when the game starts.
  - **Validation Rule:** The loader must check the matrix dimensions of every piece against `boardWidth` and `boardHeight`. If any piece has a width or height strictly greater than the board dimensions, it is physically impossible to place, and the configuration must be rejected as invalid.

## 4. Core Data Structures & Types
- **File:** `src/types/game.ts`
- **Types Needed:**
  - `BlockInfo`: Represents a single cell on the board (e.g., `interface BlockInfo { colorId: string | null; isEmpty: boolean; }`).
  - `BoardState`: A 2D array of `BlockInfo` representing the 10x10 grid.
  - `PieceVariant`: Represents a piece ready to be placed on the board.
    - `id`: Unique identifier for the drawn instance.
    - `baseShapeId`: E.g., 'L', 'T'.
    - `matrix`: The 2D array representing this specific rotation of the shape.
    - `colorId`: The retro color assigned at the start of the game for this base shape.
  - `GameState`: The overall state for Context/Zustand.
    - `board`: `BoardState`
    - `hand`: `(PieceVariant | null)[]`
    - `score`: `number`
    - `bag`: `baseShapeId[]` (The current draw bag)

## 5. Piece Generator Utilities (Pre-computation)
- **File:** `src/utils/pieceUtils.ts`
- **Functions:**
  - `generateAllVariants()`: Accepts the base pieces from `gameConfig` and returns an object containing all valid rotated and mirrored 2D matrices for each piece. This should run once at startup.
  - *Utility definitions for matrix rotation and de-duplication to ensure only distinct shapes are generated (e.g., 'O' shape only needs 1 variant, 'I' needs 2).*

## Success Criteria for Phase 1
- Running `npm run dev` serves a blank Vite React page without errors.
- The Tailwind configuration is active and responding to defined CSS variables.
- The core data structures are strictly typed in `src/types`.
- Unit tests written for `pieceUtils` to verify that `generateAllVariants` produces exactly 19 unique matrices from the 7 base Tetrominoes.
