import { describe, it, expect } from 'vitest';
import { clearLines } from '../lines';
import { createEmptyBoard } from '../board';

describe('Zero Gravity Line Clearing', () => {
    it('clears horizontal lines and leaves blocks above floating', () => {
        const board = createEmptyBoard(5, 5);

        for (let x = 0; x < 5; x++) board[3][x] = { colorId: 'c1', isEmpty: false };
        board[1][2] = { colorId: 'c2', isEmpty: false };

        const { nextBoard, linesCleared } = clearLines(board);

        expect(linesCleared).toBe(1);
        expect(nextBoard[3][0].isEmpty).toBe(true);
        expect(nextBoard[1][2].isEmpty).toBe(false); // floating!
    });

    it('clears vertical lines', () => {
        const board = createEmptyBoard(5, 5);

        for (let y = 0; y < 5; y++) board[y][2] = { colorId: 'c1', isEmpty: false };

        const { nextBoard, linesCleared } = clearLines(board);

        expect(linesCleared).toBe(1);
        expect(nextBoard[0][2].isEmpty).toBe(true);
    });

    it('handles intersecting lines properly without double counting', () => {
        const board = createEmptyBoard(5, 5);

        for (let x = 0; x < 5; x++) board[2][x] = { colorId: 'c1', isEmpty: false };
        for (let y = 0; y < 5; y++) board[y][2] = { colorId: 'c1', isEmpty: false };

        const { nextBoard, linesCleared } = clearLines(board);

        expect(linesCleared).toBe(2);

        expect(nextBoard[2][2].isEmpty).toBe(true);
        expect(nextBoard[2][0].isEmpty).toBe(true);
        expect(nextBoard[0][2].isEmpty).toBe(true);
    });
});
