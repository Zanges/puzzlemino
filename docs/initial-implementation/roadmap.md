# Puzzlemino - Development Roadmap

## Overview
A web-based, gravity-free puzzle game inspired by Tetris and 1010!. The player is given a hand of pieces and must place them on a grid to form horizontal and vertical lines. The game is endless and ends when no available pieces can fit on the board.
There is **zero gravity**—when lines clear, blocks above them stay floating exactly where they were.

**Tech Stack:**
- **Framework:** React + TypeScript (via Vite)
- **Styling:** Tailwind CSS (fully configured)
- **UI Components:** shadcn/ui
- **State Management / Utils:** TanStack (if needed for routing/query) + Context/Zustand for game state
- **Drag & Drop:** Custom Pointer Events or `dnd-kit`

**Aesthetics:**
- Minimalistic, retro style with muted colors
- Satisfying micro-animations (snapping, line clearing, error flashing)

---

## Phase 1: Foundation & Setup
- [ ] Initialize Vite project with React and TypeScript.
- [ ] Install and configure Tailwind CSS and necessary PostCSS plugins.
- [ ] Set up `shadcn/ui` foundation (fonts, base variables, utility classes).
- [ ] Define the central **Game Config File/Store**:
  - `boardSize` (default: `10x10`)
  - `handSize` (default: `3`)
  - `piecePool` (default: Classic Tetrominoes base shapes initially)
- [ ] Define the core data structures (`Piece` matrices, `Board` grid state).
  - *Note: The engine should automatically calculate all valid rotated and mirrored variants for each base shape defined in the config.*

## Phase 2: Core Game Logic (The Engine)
- [ ] **Board State:** Implement a 2D array representation of the 10x10 grid.
- [ ] **Piece Generation (The 7-Shape Bag System):**
  - Create a "bag" containing one of each base shape type. Shuffle the bag. When pulling a shape from the bag to put in the player's hand, apply a random valid rotation/mirror to it. This keeps the distribution balanced like classic Tetris.
- [ ] **Placement Validation:** Write a function to check if a piece can be placed at a specific `(x, y)` coordinate.
  - *Edge Case (Overhangs):* Any piece extending outside the 10x10 grid is treated strictly as an invalid placement.
- [ ] **Line Clearing:** Logic to detect and clear full horizontal and vertical lines.
  - *Note: No gravity physics at all. Blocks above a cleared line stay floating exactly where they were.*
  - *Note: If a placement completes both a horizontal and vertical line that intersect, the logic must handle clearing the intersecting block gracefully without double-removing, while ensuring the player is rewarded for both lines.*
- [ ] **Game Over Detection:** Immediately evaluate if any piece in the current hand can fit anywhere on the remaining board. If no valid placement exists, end the game instantly (gray out remaining pieces, slightly darken the board, and show a Game Over modal).

## Phase 3: UI & Interactions (Drag and Drop)
- [ ] **Render the Board:** Map the 2D array to a CSS Grid component with retro/muted styling.
- [ ] **Render the Hand:** Display the available pieces. Layout should be *below* the board on vertical/mobile screens, and *beside* the board on landscape/desktop screens.
- [ ] **Drag & Drop Implementation:**
  - Allow pieces to be picked up from the hand.
  - **UX Detail (Grab Snap):** When a piece is grabbed, it should automatically snap so the center (or top-left) of the piece is positioned slightly above the cursor/finger, avoiding visual obstruction.
  - **UX Detail (Smooth Drag):** The physical dragged piece should glide smoothly following the exact pointer coordinates.
  - **Mobile UX:** Explicitly disable native touch actions, content selection, and context menus (`touch-action: none`, `user-select: none`) to prevent browser interference.
- [ ] **Drag Previews & Hints:**
  - Calculate hovered grid cells.
  - Show a red overlay on the grid if the placement is invalid (including overhangs).
  - Show a muted preview shadow that *rigidly snaps* to the grid cells if the placement is valid, serving as a clear landing target.
- [ ] **Drop Action:** If valid, snap piece to board, update state; if invalid, flash red and return to origin hand position.

## Phase 4: Polish & Animations
- [ ] **Line Clear Animation:** Implement subtle CSS transitions (e.g., shrinking or fading out) when lines are cleared.
- [ ] **Invalid Drop Animation:** Add a quick "shake" or specific flash effect when a placement is rejected.
- [ ] **Score Mechanics:** 
  - Baseline: 1 point per block placed + 10 points per line cleared.
  - Multipliers: Bonus points for clearing multiple lines with a single placement (e.g., intersecting lines count for both bases + combo bonus).
  - Tracking: Add current score, lines cleared, and high-score persistence via `localStorage`.
- [ ] **Aesthetics & Coloring:** At game start, randomly map a muted retro color from a predefined palette to each base shape type in the config, and stick to that mapping for the duration of the run.

## Phase 5: Future Configurations & Enhancements (Backlog)
- [ ] Piece rotation mechanics as an active player move (could be toggled via config or bound to a key/right-click).
- [ ] Advanced piece pools (e.g., standard Pentominoes, single blocks, massive blocks).
- [ ] Sound effects and haptic feedback (for mobile).
- [ ] Different color themes (e.g., Light Mode, Dark Retro, Gameboy style).
