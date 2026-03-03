import { describe, it, expect } from 'vitest';
import { canPlacePiece } from '../validator';
import { createEmptyBoard, placePieceOnBoard } from '../board';
import type { PieceVariant } from '../../types/game';

describe('Placement Validator', () => {
    const testPiece: PieceVariant = {
        id: 'p1',
        baseShapeId: 'O',
        colorId: 'blue',
        matrix: [
            [1, 1],
            [1, 1]
        ]
    };

    it('allows valid placement on empty board', () => {
        const board = createEmptyBoard(10, 10);
        expect(canPlacePiece(board, testPiece, 0, 0)).toBe(true);
        expect(canPlacePiece(board, testPiece, 8, 8)).toBe(true);
    });

    it('rejects placement with out of bounds overhangs', () => {
        const board = createEmptyBoard(10, 10);
        expect(canPlacePiece(board, testPiece, -1, 0)).toBe(false);
        expect(canPlacePiece(board, testPiece, 0, -1)).toBe(false);
        expect(canPlacePiece(board, testPiece, 9, 0)).toBe(false); // width 2 piece at x=9 goes to 10
        expect(canPlacePiece(board, testPiece, 0, 9)).toBe(false);
    });

    it('rejects placement over existing blocks', () => {
        let board = createEmptyBoard(10, 10);
        board = placePieceOnBoard(board, testPiece, 5, 5);

        expect(canPlacePiece(board, testPiece, 4, 4)).toBe(false);
        expect(canPlacePiece(board, testPiece, 5, 5)).toBe(false);
        expect(canPlacePiece(board, testPiece, 3, 5)).toBe(true);
    });

    it('allows placement if negative offset only hits empty matrix space', () => {
        const weirdPiece: PieceVariant = {
            id: 'p2', baseShapeId: 'Test', colorId: 'x',
            matrix: [
                [0, 1],
                [0, 1]
            ]
        };
        const board = createEmptyBoard(10, 10);
        // Placing at x=-1 means the '0' is out of bounds, but the '1' is at x=0.
        expect(canPlacePiece(board, weirdPiece, -1, 0)).toBe(true);
    });
});
