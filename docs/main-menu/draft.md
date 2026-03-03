# Main Menu and Difficulty Selection Draft

## Overview
The entry point of Puzzlemino will be an interactive Main Menu screen, rather than dropping the player immediately into a live game. The Main Menu will allow the user to select a difficulty level and start a new game. 

## Screen Layout
- **Title Layout**: Stylized "PUZZLEMINO" title at the top, potentially with some retro micro-animations.
- **Center Focus**:
  - **Difficulty Selector**: A set of toggle buttons or a visually distinct selector for `Easy`, `Normal`, and `Hard`.
  - **Play Button**: A prominent "Start Game" button.
- **Aesthetic**: Muted retro styling, utilizing the existing Tailwind palette to maintain consistency with the main game layout.

## Difficulty Settings (Ideas)
How should difficulty map to the game configuration? Below are some proposed mechanisms. We can adjust the existing `gameConfig.json` data structure to support this.

### 1. Easy
- **Board Size:** 10x10 (Standard space)
- **Hand Size:** 3 or 4 (More options to choose from)
- **Piece Pool:** Simpler base shapes (e.g., small blocks, 3-block standard lines and angles)
- **Starting Squares:** 0 (Completely empty board)

### 2. Normal (Classic)
- **Board Size:** 10x10
- **Hand Size:** 3
- **Piece Pool:** The classic Tetrominoes (4 blocks each, I, J, L, O, S, T, Z)
- **Starting Squares:** 5-10 randomly placed single squares scattered on the board.

### 3. Hard
- **Board Size:** 8x8 or 9x9 (Less grid space makes placement significantly harder)
- **Hand Size:** 3
- **Piece Pool:** Introduces Pentominoes (5-block shapes) which are notoriously difficult to fit as the board gets populated.
- **Starting Squares:** 15-20 randomly placed single squares to create immediate obstacles.

## Application State Routing
- Update the Zustand `GameStore` to include an `appState` or `gameState` variable (`menu` | `playing` | `gameover`).
- The `App.tsx` component will branch based on this state. When `menu`, it renders `<MainMenu />`. When `playing` or `gameover`, it handles the standard game layout with an option to "Return to Menu" after a game over.
