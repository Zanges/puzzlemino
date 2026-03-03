import type { BoardState, PieceVariant } from '../types/game';

/**
 * Checks if a piece can be placed at the given coordinates.
 */
export function canPlacePiece(board: BoardState, piece: PieceVariant, startX: number, startY: number): boolean {
    const boardHeight = board.length;
    const boardWidth = board[0]?.length || 0;

    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] === 1) {
                const targetY = startY + y;
                const targetX = startX + x;

                // Bounds checking (No overhangs allowed)
                if (targetY < 0 || targetY >= boardHeight || targetX < 0 || targetX >= boardWidth) {
                    return false;
                }

                // Collision checking
                if (!board[targetY][targetX].isEmpty) {
                    return false;
                }
            }
        }
    }

    return true;
}
