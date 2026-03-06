import { canPlacePiece } from '../engine/validator';
import type { BoardState, PieceVariant } from '../types/game';

const SNAP_THRESHOLD = 0.75; // in cell units

/**
 * Computes the snap position for a piece based on the pointer's pixel position
 * relative to the board grid. Only snaps if the pointer is within SNAP_THRESHOLD
 * cells of a grid-aligned position.
 */
export function computeSnapPosition(
    gridElement: HTMLElement,
    pointerX: number,
    pointerY: number,
    piece: PieceVariant,
    board: BoardState,
): { x: number; y: number; valid: boolean } | null {
    const numCols = board[0]?.length || 0;
    const children = gridElement.children;
    if (children.length < numCols + 1) return null;

    // Derive cell step from the first two cells
    const cell0Rect = children[0].getBoundingClientRect();
    const cell1Rect = children[1].getBoundingClientRect();
    const cellStepX = cell1Rect.left - cell0Rect.left;

    const cellRowRect = children[numCols].getBoundingClientRect();
    const cellStepY = cellRowRect.top - cell0Rect.top;

    if (cellStepX === 0 || cellStepY === 0) return null;

    // Origin = center of cell (0, 0)
    const originX = cell0Rect.left + cell0Rect.width / 2;
    const originY = cell0Rect.top + cell0Rect.height / 2;

    // Fractional board position of pointer
    const fracX = (pointerX - originX) / cellStepX;
    const fracY = (pointerY - originY) / cellStepY;

    // Piece center of mass
    const matrix = piece.matrix;
    let sumX = 0, sumY = 0, count = 0;
    for (let py = 0; py < matrix.length; py++) {
        for (let px = 0; px < matrix[py].length; px++) {
            if (matrix[py][px] === 1) { sumX += px; sumY += py; count++; }
        }
    }
    const centerX = sumX / count;
    const centerY = sumY / count;

    // Anchor = top-left of piece placement
    const anchorFracX = fracX - centerX;
    const anchorFracY = fracY - centerY;

    const gridX = Math.round(anchorFracX);
    const gridY = Math.round(anchorFracY);

    const dx = anchorFracX - gridX;
    const dy = anchorFracY - gridY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > SNAP_THRESHOLD) return null;

    const valid = canPlacePiece(board, piece, gridX, gridY);
    return { x: gridX, y: gridY, valid };
}
