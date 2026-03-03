import type { BoardState } from '../types/game';

export interface ClearedCoord {
    x: number;
    y: number;
}

export interface LineClearResult {
    nextBoard: BoardState;
    linesCleared: number;
    clearedCells: ClearedCoord[];
}

/**
 * Clears full rows and columns from the board without shifting blocks (Zero Gravity).
 * Handles intersecting lines gracefully by replacing all cleared blocks with empty spaces.
 */
export function clearLines(board: BoardState): LineClearResult {
    const height = board.length;
    const width = board[0]?.length || 0;

    const fullRows = new Set<number>();
    const fullCols = new Set<number>();

    // Identify full rows
    for (let y = 0; y < height; y++) {
        let isFull = true;
        for (let x = 0; x < width; x++) {
            if (board[y][x].isEmpty) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            fullRows.add(y);
        }
    }

    // Identify full columns
    for (let x = 0; x < width; x++) {
        let isFull = true;
        for (let y = 0; y < height; y++) {
            if (board[y][x].isEmpty) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            fullCols.add(x);
        }
    }

    const totalLines = fullRows.size + fullCols.size;

    if (totalLines === 0) {
        return { nextBoard: board, linesCleared: 0, clearedCells: [] };
    }

    // Collect cleared cell coordinates
    const clearedCells: ClearedCoord[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (fullRows.has(y) || fullCols.has(x)) {
                clearedCells.push({ x, y });
            }
        }
    }

    const nextBoard = board.map((row, y) =>
        row.map((cell, x) => {
            if (fullRows.has(y) || fullCols.has(x)) {
                return { colorId: null, isEmpty: true };
            }
            return { ...cell };
        })
    );

    return { nextBoard, linesCleared: totalLines, clearedCells };
}
