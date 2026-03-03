import type { PieceVariant } from '../types/game';
import type { PieceVariantDef } from '../utils/pieceUtils';

/**
 * Creates a new randomly shuffled bag containing exactly one of each available base shape.
 */
export function createBag(baseShapeIds: string[]): string[] {
    const newBag = [...baseShapeIds];

    // Fisher-Yates shuffle
    for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
    }

    return newBag;
}

/**
 * Draws the next piece from the bag. If the bag is empty, it automatically automatically re-initializes and shuffles a new bag.
 * Populates the drawn piece with a random variant and its assigned color from the color map.
 */
export function drawPiece(
    bag: string[],
    baseShapeIds: string[],
    allVariants: PieceVariantDef[],
    colorMap: Record<string, string>
): { piece: PieceVariant, nextBag: string[] } {
    let currentBag = [...bag];

    if (currentBag.length === 0) {
        currentBag = createBag(baseShapeIds);
    }

    // Pop the next base shape
    const drawnShapeId = currentBag.pop();

    // Fallback just in case baseShapeIds is empty, though it shouldn't be in practice
    if (!drawnShapeId) {
        throw new Error("Cannot draw a piece from an empty set of base actions");
    }

    // Filter variants to just the newly drawn base shape
    const shapeVariants = allVariants.filter(v => v.baseShapeId === drawnShapeId);

    if (shapeVariants.length === 0) {
        throw new Error(`No variants found for base shape: ${drawnShapeId}`);
    }

    // Pick a random rotation/mirror variant
    const randomVariantDef = shapeVariants[Math.floor(Math.random() * shapeVariants.length)];

    // Assign a unique ID so React mapping later is stable
    const uniqueId = `piece-${drawnShapeId}-${Math.random().toString(36).substring(2, 9)}`;

    const piece: PieceVariant = {
        id: uniqueId,
        baseShapeId: drawnShapeId,
        matrix: randomVariantDef.matrix,
        colorId: colorMap[drawnShapeId] || 'color-piece-default'
    };

    return { piece, nextBag: currentBag };
}
