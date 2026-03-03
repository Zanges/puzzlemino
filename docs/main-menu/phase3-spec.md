# Phase 3: UI Implementation Spec

## Overview
Phase 3 focuses on the visual user interface for the Main Menu and difficulty selection. Building upon the core state and configuration logic established in Phase 2, this phase involves developing the React components and implementing application-level routing to seamlessly transition between the menu and the active game view.

## 1. Main Menu Component (`src/components/game/MainMenu.tsx`)

The Main Menu serves as the entry point for the player.

### Layout & Elements
- **Title Layout**: 
  - A stylized, prominent application title ("PUZZLEMINO").
  - Must align with the established muted retro aesthetic.
- **Difficulty Selector**:
  - Implement using a Shadcn UI `ToggleGroup`, segmented control, or styled radio group.
  - Options: **Easy**, **Normal**, and **Hard**.
  - Provide a clear active state for the currently selected option.
  - The default selected difficulty should be "Normal".
- **Play Button**:
  - A large primary action button labeled "Start Game".
  - Trigger: Calls `initializeGame(selectedDifficulty)` from the `GameStore` and updates the app state.

### Design & Interaction
- Ensure interactive elements (hovers, active states, focus rings) utilize the existing standard UI components (Shadcn/Tailwind).
- Consider adding subtle micro-animations (e.g., a gentle float or pulse on the title) to give the application landing page a polished, dynamic feel.

## 2. Application Routing Logic (`src/App.tsx`)

The root `App` component will function as a simple view router driven by the Zustand store's `appState`.

### Conditional Rendering Flow
- Extract `appState` from `useGameStore`.
- **`appState === 'menu'`**: Render the `<MainMenu />` component. The game board is hidden.
- **`appState === 'playing' | 'gameover'`**: Render the standard `<GameLayout />`. 
  - *Note: Overlays (like pausing or the game over screen) handle specific states within the active game layout.*

## 3. Game Over Navigation & State Reset

The player needs a clean pathway to exit the game session and return to the entry point.

### Game Over Updates
- In the Game Over modal or overlay, append a new action button: **"Return to Main Menu"**.
- Action: On click, this triggers the `returnToMenu()` method on the store, which will set `appState` back to `'menu'` and clear out the active board data.

## Success Criteria for Phase 3
- [ ] On initialization, the app starts at the `<MainMenu />` screen rather than directly dropping the user into a game.
- [ ] The difficulty selector visually updates based on user interaction.
- [ ] Pressing "Start Game" successfully transitions the UI to the game board using the selected difficulty's configuration.
- [ ] The Game Over screen includes a functional option to head back to the Main Menu.
- [ ] Transitioning back to the menu correctly resets the underlying board state, allowing the user to start a completely fresh game.
