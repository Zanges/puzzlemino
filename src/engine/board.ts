import type { BoardState, PieceVariant, BlockInfo } from '../types/game';

/**
 * Initializes and returns a new blank grid based on dimensions.
 */
export function createEmptyBoard(width: number, height: number): BoardState {
    const board: BoardState = [];
    for (let y = 0; y < height; y++) {
        const row: BlockInfo[] = [];
        for (let x = 0; x < width; x++) {
            row.push({ colorId: null, isEmpty: true });
        }
        board.push(row);
    }
    return board;
}

/**
 * Mutates the board in-place to populate it with `count` random single squares.
 * Ensures we don't accidentally create full lines during initialization if possible,
 * but for simplicity, places them purely randomly for now.
 */
export function generateStartingSquares(board: BoardState, count: number, colorMap: Record<string, string>) {
    const height = board.length;
    const width = board[0].length;
    let placed = 0;

    const colors = Object.values(colorMap);
    if (colors.length === 0) return;

    // Avoid infinite loop if requested count is larger than board size
    const maxSquares = width * height;
    const targetCount = Math.min(count, maxSquares);

    while (placed < targetCount) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);

        if (board[y][x].isEmpty) {
            board[y][x] = {
                colorId: colors[Math.floor(Math.random() * colors.length)],
                isEmpty: false
            };
            placed++;
        }
    }
}

/**
 * Takes the current board state and a piece, and returns a new immutable board state with the piece placed.
 * Assumes placement has already been validated.
 */
export function placePieceOnBoard(board: BoardState, piece: PieceVariant, startX: number, startY: number): BoardState {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));

    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] === 1) {
                const targetY = startY + y;
                const targetX = startX + x;

                if (targetY >= 0 && targetY < newBoard.length && targetX >= 0 && targetX < newBoard[0].length) {
                    newBoard[targetY][targetX] = {
                        colorId: piece.colorId,
                        isEmpty: false
                    };
                }
            }
        }
    }

    return newBoard;
}
