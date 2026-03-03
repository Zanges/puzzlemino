# Main Menu and Difficulty Roadmap

## Phase 1: Planning and Design (Current)
- [x] Draft ideas for how difficulty impacts the game mechanics (board size, piece pools, hand size).
- [x] Define the UI layout for the Main Menu.
- [ ] Review documentation with the user and refine the difficulty parameters.

## Phase 2: Configuration & State Management
- [ ] **Config Updates**: Refactor or extend `public/gameConfig.json` (or split into multiple files: `config-easy.json`, `config-normal.json`, etc.) to support different difficulty parameters.
- [ ] **Board Initialization**: Update the engine (`createEmptyBoard` or `initializeGame`) to support placing `N` random single squares on the board based on the selected difficulty.
- [ ] **State Updates**: Update `GameState` in `src/types/game.ts` to include an overall app state (e.g., `gameState: 'menu' | 'playing' | 'gameover'`).
- [ ] **Initialization**: Modify `initializeGame` in the Zustand store to accept a chosen difficulty string and load the corresponding config variant.

## Phase 3: UI Implementation
- [ ] **Component Creation**:
  - Build `<MainMenu />` component with the game title.
  - Add "Start Game" button and a difficulty toggle selector (Easy / Normal / Hard).
- [ ] **Application Routing**: Update `<App />` to conditionally render the Main Menu or the Game Layout based on the current `gameState` in the store.
- [ ] **Game Over Navigation**: Ensure the Game Over modal includes a "Return to Main Menu" button.

## Phase 4: Polish
- [ ] Add retro micro-animations to the title screen.
- [ ] Add hover/active states for the menu buttons using Shadcn UI standards.
