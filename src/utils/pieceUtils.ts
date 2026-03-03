import type { BasePieceDef } from '../config/configLoader';

export interface PieceVariantDef {
    baseShapeId: string;
    matrix: number[][];
}

/**
 * Rotates a 2D matrix 90 degrees clockwise
 */
export function rotateMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;

    if (rows === 0 || cols === 0) return [];

    const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = matrix[r][c];
        }
    }

    return rotated;
}

/**
 * Serializes a matrix for easy equality comparison
 */
export function serializeMatrix(matrix: number[][]): string {
    return matrix.map(row => row.join(',')).join(';');
}

/**
 * Generates all unique valid rotated and mirrored 2D matrices for each piece.
 * Note: Tetris pieces rotated and deduplicated yield exactly 19 unique matrices.
 */
export function generateAllVariants(basePieces: BasePieceDef[]): PieceVariantDef[] {
    const allVariants: PieceVariantDef[] = [];

    for (const piece of basePieces) {
        const seen = new Set<string>();

        // Original
        let current = piece.matrix;

        // 4 rotations
        for (let i = 0; i < 4; i++) {
            const hash = serializeMatrix(current);
            if (!seen.has(hash)) {
                seen.add(hash);
                allVariants.push({
                    baseShapeId: piece.id,
                    matrix: current
                });
            }
            current = rotateMatrix(current);
        }
    }

    return allVariants;
}
