import type { BoardState, PieceVariant } from '../types/game';
import { canPlacePiece } from './validator';

/**
 * Checks if there are any valid placements left for the given hand.
 */
export function isGameOver(board: BoardState, hand: (PieceVariant | null)[]): boolean {
    const activePieces = hand.filter((p): p is PieceVariant => p !== null);

    if (activePieces.length === 0) {
        return false; // Hand is empty, will draw new pieces
    }

    const height = board.length;
    const width = board[0]?.length || 0;

    for (const piece of activePieces) {
        const pieceHeight = piece.matrix.length;
        const pieceWidth = piece.matrix[0]?.length || 0;

        // Iterate with negative offset in case matrix has empty leading rows/cols
        for (let y = -pieceHeight; y < height; y++) {
            for (let x = -pieceWidth; x < width; x++) {
                if (canPlacePiece(board, piece, x, y)) {
                    return false; // Found at least one valid placement
                }
            }
        }
    }

    return true; // No valid placements for any piece in hand
}
