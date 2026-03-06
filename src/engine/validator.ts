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

/**
 * Find the closest valid placement to the given coordinates.
 * Searches in expanding Manhattan distance rings around (startX, startY).
 * Returns the nearest valid position, or null if none within maxNudge distance.
 */
export function nudgePlacement(
    board: BoardState,
    piece: PieceVariant,
    startX: number,
    startY: number,
    maxNudge: number = 1
): { x: number; y: number } | null {
    // If it already fits, return as-is
    if (canPlacePiece(board, piece, startX, startY)) {
        return { x: startX, y: startY };
    }

    // Search in expanding rings by Manhattan distance
    for (let dist = 1; dist <= maxNudge; dist++) {
        let best: { x: number; y: number; d: number } | null = null;

        for (let dy = -dist; dy <= dist; dy++) {
            const remainX = dist - Math.abs(dy);
            for (const dx of remainX === 0 ? [0] : [-remainX, remainX]) {
                const nx = startX + dx;
                const ny = startY + dy;
                if (canPlacePiece(board, piece, nx, ny)) {
                    // Prefer the candidate closest by Euclidean distance
                    const d = dx * dx + dy * dy;
                    if (!best || d < best.d) {
                        best = { x: nx, y: ny, d };
                    }
                }
            }
        }

        if (best) {
            return { x: best.x, y: best.y };
        }
    }

    return null;
}
