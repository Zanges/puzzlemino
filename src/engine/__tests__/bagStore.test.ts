import { describe, it, expect } from 'vitest';
import { createBag, drawPiece } from '../bagStore';
import type { PieceVariantDef } from '../../utils/pieceUtils';

describe('7-Shape Bag System', () => {
    const baseShapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const dummyVariants: PieceVariantDef[] = baseShapes.map(id => ({
        baseShapeId: id,
        matrix: [[1]]
    }));
    const colorMap: Record<string, string> = { I: 'cyan', J: 'blue' };

    it('creates a shuffled bag with all base shapes exactly once', () => {
        const bag = createBag(baseShapes);
        expect(bag.length).toBe(7);
        expect(new Set(bag).size).toBe(7);
        expect(bag).toEqual(expect.arrayContaining(baseShapes));
    });

    it('draws a piece and removes from bag until empty, then auto reshuffles', () => {
        let currentBag = createBag(baseShapes);
        const drawnIds = [];

        for (let i = 0; i < 7; i++) {
            const { piece, nextBag } = drawPiece(currentBag, baseShapes, dummyVariants, colorMap);
            drawnIds.push(piece.baseShapeId);
            currentBag = nextBag;
        }

        expect(currentBag.length).toBe(0);
        expect(new Set(drawnIds).size).toBe(7);

        const { piece, nextBag: finalBag } = drawPiece(currentBag, baseShapes, dummyVariants, colorMap);
        expect(finalBag.length).toBe(6);
        expect(baseShapes).toContain(piece.baseShapeId);
    });
});
