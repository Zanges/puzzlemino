import { describe, it, expect } from 'vitest';
import { generateAllVariants, rotateMatrix, serializeMatrix } from './pieceUtils';

// Standard 7 tetrominoes used for rotation tests (config-independent)
const STANDARD_TETROMINOES = [
    { id: 'I', matrix: [[1, 1, 1, 1]] },
    { id: 'J', matrix: [[1, 0, 0], [1, 1, 1]] },
    { id: 'L', matrix: [[0, 0, 1], [1, 1, 1]] },
    { id: 'O', matrix: [[1, 1], [1, 1]] },
    { id: 'S', matrix: [[0, 1, 1], [1, 1, 0]] },
    { id: 'T', matrix: [[0, 1, 0], [1, 1, 1]] },
    { id: 'Z', matrix: [[1, 1, 0], [0, 1, 1]] },
];

describe('pieceUtils', () => {
    it('rotates a matrix 90 degrees clockwise', () => {
        const matrix = [
            [1, 0, 0],
            [1, 1, 1]
        ];
        const rotated = rotateMatrix(matrix);
        expect(rotated).toEqual([
            [1, 1],
            [1, 0],
            [1, 0]
        ]);
    });

    it('serializes a matrix correctly', () => {
        const matrix = [
            [1, 0],
            [1, 1]
        ];
        expect(serializeMatrix(matrix)).toBe('1,0;1,1');
    });

    it('generates exactly 19 unique matrices from the 7 standard tetrominoes', () => {
        const variants = generateAllVariants(STANDARD_TETROMINOES);

        const variantsByPiece = variants.reduce((acc, v) => {
            acc[v.baseShapeId] = (acc[v.baseShapeId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        expect(variants.length).toBe(19);
        expect(variantsByPiece['I']).toBe(2);
        expect(variantsByPiece['J']).toBe(4);
        expect(variantsByPiece['L']).toBe(4);
        expect(variantsByPiece['O']).toBe(1);
        expect(variantsByPiece['S']).toBe(2);
        expect(variantsByPiece['T']).toBe(4);
        expect(variantsByPiece['Z']).toBe(2);
    });

    it('deduplicates symmetric pieces correctly', () => {
        // A 1x1 piece has only 1 rotation (all rotations are identical)
        const variants = generateAllVariants([{ id: '1x1', matrix: [[1]] }]);
        expect(variants.length).toBe(1);

        // A 2x2 square also has only 1 unique rotation
        const squareVariants = generateAllVariants([{ id: 'O', matrix: [[1, 1], [1, 1]] }]);
        expect(squareVariants.length).toBe(1);
    });
});
