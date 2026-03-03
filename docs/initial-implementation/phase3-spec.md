# Phase 3: UI & Interactions Specification

## Objective
Implement the user interface and interaction layer for Puzzlemino, focusing entirely on the Drag and Drop mechanics, rendering the board and hand, and providing crucial user feedback via drag previews, snapping, and layout responsiveness. This phase relies on the core engine developed in Phase 2.

## 1. Board and Hand Rendering
- **File:** `src/components/Board.tsx`, `src/components/Hand.tsx`, `src/components/GameLayout.tsx`
- **GameLayout:** 
  - Manage the overall layout of the game screen.
  - Responsive design: The hand should be positioned **below** the board on vertical/mobile screens, and **beside** the board on landscape/desktop screens.
- **Board Component:**
  - Map the `BoardState` 2D array to a responsive CSS Grid.
  - Apply retro/muted styling using Tailwind CSS.
  - Empty cells should have a subtle background, while filled cells should display their assigned color from the game state.
- **Hand Component:**
  - Render the pieces currently available to the player.
  - Pieces in the hand must be visually distinct but scaled appropriately to match the board's cell size.

## 2. Drag & Drop Implementation
- **Technology:** `@dnd-kit/core` and related packages (`@dnd-kit/utilities`, etc.) for robust React drag-and-drop mechanics.
- **Drag Source:** 
  - Pieces in the hand become draggable elements (using `useDraggable`).
- **Drop Target:**
  - The board cells or the board itself becomes the droppable area (using `useDroppable`), allowing us to track which grid coordinates the piece is hovering over.
- **UX Detail: Grab Snapping:**
  - When a piece is picked up, use dnd-kit modifiers or custom drag overlay styling so that the center (or top-left) of the piece is floating **slightly above** the cursor/finger. This is critical for mobile to prevent the player's finger from obstructing their view of the piece and the board.
- **UX Detail: Smooth Dragging:**
  - The dragged physical piece must decouple from the layout flow using `<DragOverlay>` and glide smoothly, following the exact pointer coordinates.
- **Mobile UX Enhancements:**
  - Utilize dnd-kit's `TouchSensor` for mobile interactions.
  - Explicitly apply CSS rules like `touch-action: none` and `user-select: none` to the draggable elements and the board area to prevent the browser from interpreting drags as scrolling, zooming, or text selection.
  - Prevent the long-press context menu by neutralizing it via events.

## 3. Drag Previews & Hints
- **Logic:** 
  - While a piece is being dragged, calculate the grid coordinates `(x, y)` its origin point is hovering over based on the pointer position relative to the board's dimensions.
- **Visual Feedback:**
  - **Valid Placement:** If the current hovered position is a valid placement (no overhangs, no collisions, verified via Phase 2 `canPlacePiece`):
    - Display a muted, translucent preview of the piece on the board.
    - This preview shadow must **rigidly snap** precisely to the grid cells, serving as a clear landing target, even while the dragged physical piece glides smoothly above it.
  - **Invalid Placement:** If the hovered position is invalid (overlaps existing blocks or extends past the grid boundaries):
    - Display a distinct red overlay/tint over the hovered grid cells (if within bounds) or on the piece itself.
    - Ensure overhangs trigger the invalid visual state immediately.

## 4. Drop Action
- **Event:** Triggered on `onPointerUp` or drag end.
- **Logic:**
  - Determine the final hovered grid coordinates.
  - Validate placement via `canPlacePiece`.
  - **Successful Drop:** If valid, dispatch the placement action to the game state (e.g., executing `placePieceOnBoard` followed by `clearLines`), and clear the drag state. The piece visually snaps permanently into the board.
  - **Rejected Drop:** If invalid, reject the placement. Visually flash the piece red briefly, and animate its return to its original position in the hand.

## Success Criteria for Phase 3
- The board renders accurately according to the 2D array state.
- Layout smoothly transitions between portrait (hand below) and landscape (hand beside) orientations.
- Pieces can be picked up and dragged smoothly using pointer events.
- Snapping logic precisely offsets the dragged piece above the pointer to maintain board visibility.
- Mobile touch interactions feel completely native; no accidental screen scrolling or context menus occur during drags.
- Hovering over the board displays a snapping, translucent preview for valid placements and a red warning for invalid placements.
- Dropping a piece successfully updates the visually rendered board state.
- Dropping a piece invalidly intuitively snaps it back to the hand.
