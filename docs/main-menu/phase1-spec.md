# Phase 1: Planning and Design Spec

## Overview
Phase 1 focuses on designing the layout and mechanics of the Main Menu and Difficulty Selection features before full implementation. This phase turns the draft ideas into a concrete specification that we can follow to implement the game configuration changes.

## 1. Main Menu Layout Specification
The `MainMenu.tsx` component serves as the application entry point.

### Visual Design
- **Title**: "PUZZLEMINO"
  - Displayed prominently at the top.
  - Font: The game's retro pixel font (e.g., Press Start 2P or similar, if used).
- **Core Elements**: Centered vertically and horizontally.
  - **Difficulty Selector**: A visually clear toggle or segmented control (Easy, Normal, Hard).
  - **Play Button**: A large, primary action button.
- **Aesthetic**: Muted retro theme matching the existing `index.css` and Shadcn UI configurations.

### State Dependencies
- The menu requires the Zustand `GameStore` to be updated with an `appState` parameter (`'menu' | 'playing' | 'gameover'`).
- The `App.tsx` component will conditionally render `<MainMenu />` when `appState === 'menu'`.

## 2. Difficulty Parameters Specification
We will define three distinct difficulty levels. These parameters dictate how the game initializes.

### Easy
- **Board Size:** 10x10
- **Hand Size:** 4 (Provides more choices to the player)
- **Piece Pool:** Simplified combinations. Target config:
  - 1x1 block
  - 2x1, 3x1 straight lines
  - 3-block L-shapes
- **Starting Squares:** 0 (Completely empty board)

### Normal (Classic)
- **Board Size:** 10x10
- **Hand Size:** 3
- **Piece Pool:** Standard Tetrominoes (4-block shapes: I, J, L, O, S, T, Z)
- **Starting Squares:** 5 to 10 randomly distributed single blocks.

### Hard
- **Board Size:** 8x8 (Constrained space)
- **Hand Size:** 3
- **Piece Pool:** Introduces Pentominoes (5-block shapes) alongside standard Tetrominoes.
- **Starting Squares:** 15 to 20 randomly distributed single blocks.

## 3. Engine Modifications Required
To support these parameters, the core engine components and configuration loader need to be adjusted:

1. **Config Architecture**: Instead of a single `gameConfig.json`, the app should load difficulty-specific configurations, or a single master JSON file containing all three presets.
2. **Random Square Generation**: The `createEmptyBoard` or `initializeGame` functions must be updated to accept a `startingSquares` parameter and randomly populate the initial grid with `1`s (filled spaces) without creating premature line clears if possible.
3. **App State Handling**: Adding `appState` to `types/game.ts` and updating the store to route the user gracefully between the menu, active game, and game over screens.
