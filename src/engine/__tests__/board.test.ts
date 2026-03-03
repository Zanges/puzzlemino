import { describe, it, expect } from 'vitest';
import { createEmptyBoard, placePieceOnBoard } from '../board';
import type { PieceVariant } from '../../types/game';

describe('Board Management', () => {
    it('creates an empty board of correct dimensions', () => {
        const board = createEmptyBoard(10, 15);
        expect(board.length).toBe(15);
        expect(board[0].length).toBe(10);
        expect(board[0][0].isEmpty).toBe(true);
        expect(board[0][0].colorId).toBeNull();
    });

    it('places a piece correctly and is immutable', () => {
        const initialBoard = createEmptyBoard(5, 5);
        const testPiece: PieceVariant = {
            id: 'p1',
            baseShapeId: 'I',
            colorId: 'red',
            matrix: [
                [1, 1],
                [0, 1]
            ]
        };

        const newBoard = placePieceOnBoard(initialBoard, testPiece, 1, 1);

        // Original board unchanged
        expect(initialBoard[1][1].isEmpty).toBe(true);

        // New board updated correctly
        expect(newBoard[1][1].isEmpty).toBe(false);
        expect(newBoard[1][1].colorId).toBe('red');
        expect(newBoard[1][2].isEmpty).toBe(false);
        expect(newBoard[2][2].isEmpty).toBe(false);

        // Empty parts of matrix don't overwrite board
        expect(newBoard[2][1].isEmpty).toBe(true);
    });
});
