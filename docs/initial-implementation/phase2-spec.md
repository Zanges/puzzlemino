# Phase 2: Core Game Logic Specification

## Objective
Implement the core game engine for Puzzlemino, including board state management, the "7-Shape Bag" piece generation system, placement validation without overhangs, zero-gravity line clearing, and game over detection. Focus on creating pure, testable functions independent of the UI layer.

## 1. Board State Management
- **File:** `src/engine/board.ts` (or similar)
- **Data Structure:** Utilize the `BoardState` 2D array of `BlockInfo` defined in Phase 1.
- **Functions:**
  - `createEmptyBoard(width: number, height: number): BoardState`: Initializes and returns a new blank grid based on the configuration.
  - `placePieceOnBoard(board: BoardState, piece: PieceVariant, startX: number, startY: number): BoardState`: Takes the current board state and a piece, and returns a new immutable board state with the piece placed.

## 2. Piece Generation (The 7-Shape Bag System)
- **File:** `src/engine/bagStore.ts` (or manage within `GameState`/Zustand)
- **Concept:** Mimics classic Tetris piece distribution to prevent long droughts of specific shapes.
- **Logic:**
  - **Initialize Bag:** Create an array containing exactly one of each available base shape ID (e.g., `['I', 'J', 'L', 'O', 'S', 'T', 'Z']`).
  - **Shuffle Bag:** Use a robust shuffle algorithm (like Fisher-Yates) to randomize the order of the pieces in the bag.
  - **Draw Piece:** When pulling a shape from the bag to fill empty slots in the player's hand:
    - Pop the next base shape from the bag.
    - If the bag becomes empty, immediately re-initialize and shuffle a brand new bag.
    - Once the base shape is drawn, select a **random valid rotated/mirrored variant** for that shape (utilizing the pre-calculated list of variants from Phase 1 `src/utils/pieceUtils.ts`).
  - This guarantees players see an even distribution of base shapes while retaining unpredictable rotation variety.

## 3. Placement Validation
- **File:** `src/engine/validator.ts`
- **Function:** `canPlacePiece(board: BoardState, piece: PieceVariant, startX: number, startY: number): boolean`
- **Rules:**
  - **Bounds Checking (No Overhangs):** Every solid block (`1`) in the piece's matrix must fall precisely within the `0...boardWidth-1` and `0...boardHeight-1` bounds. Any setup where a solid block extends outside the grid is strictly an invalid placement.
  - **Collision Checking:** Every solid block (`1`) in the piece's matrix must map to a cell on the `board` that is currently marked as empty (`isEmpty === true` or equivalent).

## 4. Line Clearing Logic (Zero Gravity)
- **File:** `src/engine/lines.ts`
- **Function:** `clearLines(board: BoardState): { nextBoard: BoardState, linesCleared: number }` (or similar return type returning comprehensive info for scoring)
- **Details:**
  - After a successful piece placement, scan the board for completely filled rows and completely filled columns.
  - Identify all cells that are part of these full rows or columns.
  - **Intersecting Lines:** Carefully track the absolute cell coordinates being removed to ensure that a block situated where a cleared row and column intersect is only counted once, rewarding the player but avoiding duplicate removal errors.
  - **Zero Gravity:** Replace the identified full line blocks with empty cells. Crucially, do **not** shift any blocks downwards or inwards. Blocks above cleared lines remain completely stationary.

## 5. Game Over Detection
- **File:** `src/engine/gameOver.ts`
- **Function:** `isGameOver(board: BoardState, hand: (PieceVariant | null)[]): boolean`
- **Logic:**
  - Immediately after line clears are processed and the hand is evaluated, this detection must run.
  - Iterate through every un-played (non-null) piece currently in the hand.
  - For each piece, simulate placing it using `canPlacePiece` at **every possible** `(x, y)` coordinate on the current board.
  - If at least one valid placement exists for *any* single piece in the hand, the game continues (return `false`).
  - If *no* valid placement exists for *any* piece in the entire hand, return `true` (Game Over).

## Success Criteria for Phase 2
- Core engine utility functions are fully covered by unit tests (e.g., using Vitest):
  - **Bag System:** Tests prove the generator outputs exactly 7 distinct base shapes per cycle.
  - **Validation:** Tests reject overlaps and out-of-bounds matrices (overhangs), while accepting valid fits.
  - **Line Clearing:** Tests confirm both horizontal and vertical lines clear properly, handles intersecting lines flawlessly, and ensures no gravity/falling behavior occurs.
  - **Game Over:** Tests accurately trigger a game over when the remaining hand pieces cannot be placed anywhere.
- Architecture is pure and decoupled from React components.
