import { describe, it, expect } from 'vitest';
import { isGameOver } from '../gameOver';
import { createEmptyBoard, placePieceOnBoard } from '../board';
import type { PieceVariant } from '../../types/game';

describe('Game Over Detection', () => {
    const testPiece: PieceVariant = {
        id: 'p1', baseShapeId: 'O', colorId: 'blue',
        matrix: [
            [1, 1],
            [1, 1]
        ]
    };

    it('returns false if hand is empty', () => {
        const board = createEmptyBoard(10, 10);
        expect(isGameOver(board, [null, null, null])).toBe(false);
    });

    it('returns false if piece can be placed', () => {
        const board = createEmptyBoard(10, 10);
        expect(isGameOver(board, [testPiece, null, null])).toBe(false);
    });

    it('returns true if no piece can fit on full board', () => {
        const board = createEmptyBoard(2, 2);
        const almostFullBoard = placePieceOnBoard(board, {
            id: 'x', baseShapeId: 'x', colorId: 'x',
            matrix: [[1, 1], [1, 0]]
        }, 0, 0);

        expect(isGameOver(almostFullBoard, [testPiece])).toBe(true);
    });
});
