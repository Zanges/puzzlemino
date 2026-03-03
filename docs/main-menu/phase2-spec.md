# Phase 2: Configuration & State Management Spec

## Overview
Phase 2 focuses on implementing the data structures, configuration parsing, and core state management required to support multiple difficulty levels and a main menu screen. This phase lays the engine groundwork so that Phase 3 can seamlessly integrate the UI.

## 1. Game Configuration Architecture

Instead of having a single static configuration in `public/gameConfig.json`, we will structure it to support multiple difficulties easily. 

### Proposed Structure
Update `public/gameConfig.json` to contain an object mapping difficulty tiers to their respective parameters:

```json
{
  "difficulties": {
    "easy": {
      "boardWidth": 10,
      "boardHeight": 10,
      "handSize": 4,
      "pieces": [ /* easy pool subset */ ],
      "startingBlocks": 0
    },
    "normal": {
      "boardWidth": 10,
      "boardHeight": 10,
      "handSize": 3,
      "pieces": [ /* standard 7 tetrominoes */ ],
      "startingBlocks": 8
    },
    "hard": {
      "boardWidth": 8,
      "boardHeight": 8,
      "handSize": 3,
      "pieces": [ /* standard tetrominoes + pentominoes */ ],
      "startingBlocks": 15
    }
  }
}
```

### Config Loader Updates
- Modify `loadGameConfig()` in `src/utils/configLoader.ts` to parse the new structure.
- It should fetch the master JSON and return the full object, allowing the Zustand store to pick and apply the correct configuration based on the user's difficulty selection.

## 2. Type Definition Updates (`src/types/game.ts`)

### App State
Introduce an enum or union type for the overall application routing state:
```typescript
export type AppState = 'menu' | 'playing' | 'gameover';
export type DifficultyLevel = 'easy' | 'normal' | 'hard';
```

### GameState Interface
Extend the `GameState` interface to include the new core fields and actions:
```typescript
export interface GameState {
  // New overall app properties
  appState: AppState;
  difficulty: DifficultyLevel;
  
  // Existing properties...
  board: number[][];
  hand: Piece[];
  score: number;
  
  // Actions
  setAppState: (state: AppState) => void;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  initializeGame: (difficulty: DifficultyLevel) => Promise<void>;
  returnToMenu: () => void;
}
```

## 3. Zustand Store Implementation (`src/store/gameStore.ts`)

### Action Implementations
- **`initializeGame(difficulty)`**: 
  - Retrieve the configuration for the selected difficulty.
  - Call the board generator with the defined width, height, and number of starting blocks.
  - Populate the initial piece hand based on the difficulty's `handSize` and `pieces` pool.
  - Set `appState` to `'playing'`.
  - Reset `score`.
- **`returnToMenu()`**:
  - Set `appState` to `'menu'`.
  - Clear or retain the board/score states as desired (safest to reset).
- **`setAppState()`**: Utility to imperatively change the application view state.

## 4. Board Initialization Logic (`src/utils/boardUtils.ts`)

Update `createEmptyBoard` (or create a dedicated `initializeBoard` function):
```typescript
export function initializeBoard(width: number, height: number, startingBlocks: number = 0): number[][] {
  // 1. Create standard empty `width` x `height` 2D array of `0`s.
  // 2. If `startingBlocks` > 0, randomly select coordinates (x, y) and set them to `1`.
  // 3. Ensure no full lines (horizontal or vertical) are inadvertently created during this initialization.
  // 4. Return the populated board.
}
```

## Success Criteria for Phase 2
- [ ] `gameConfig.json` is successfully updated and strongly typed.
- [ ] `loadGameConfig()` successfully fetches and parses the multiple difficulty modes.
- [ ] The generic `GameState` successfully tracks `appState` and `difficulty`.
- [ ] Calling `initializeGame('hard')` correctly populates a constrained 8x8 board with the correct hand size and predefined random block obstacles.
- [ ] The engine routes smoothly without fatal errors when switching between `'menu'` and `'playing'` states (even if UI is just placeholders for now).
