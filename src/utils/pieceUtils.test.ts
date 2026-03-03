import { describe, it, expect } from 'vitest';
import { generateAllVariants, rotateMatrix, serializeMatrix } from './pieceUtils';
import configData from '../../public/gameConfig.json';
import type { MasterGameConfig } from '../config/configLoader';

describe('pieceUtils', () => {
    it('rotates a matrix 90 degrees clockwise', () => {
        const matrix = [
            [1, 0, 0],
            [1, 1, 1]
        ];
        // Expected after 90 deg clockwise:
        // [1, 1]
        // [1, 0]
        // [1, 0]
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

    it('generates exactly 19 unique matrices from the 7 base Tetrominoes', () => {
        // Read the actual config file
        const masterConfig: MasterGameConfig = configData;
        const config = masterConfig.difficulties['normal'];

        const variants = generateAllVariants(config.pieces);

        // Group variants by baseShapeId to log or assert
        const variantsByPiece = variants.reduce((acc, v) => {
            acc[v.baseShapeId] = (acc[v.baseShapeId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Total should be exactly 19
        expect(variants.length).toBe(19);

        // I has 2 unique rotations
        expect(variantsByPiece['I']).toBe(2);
        // J has 4
        expect(variantsByPiece['J']).toBe(4);
        // L has 4
        expect(variantsByPiece['L']).toBe(4);
        // O has 1
        expect(variantsByPiece['O']).toBe(1);
        // S has 2
        expect(variantsByPiece['S']).toBe(2);
        // T has 4
        expect(variantsByPiece['T']).toBe(4);
        // Z has 2
        expect(variantsByPiece['Z']).toBe(2);
    });
});
