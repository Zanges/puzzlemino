export type AppState = 'menu' | 'playing' | 'gameover';
export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface BlockInfo {
    colorId: string | null;
    isEmpty: boolean;
}

export type BoardState = BlockInfo[][];

export interface PieceVariant {
    id: string; // Unique identifier for the drawn instance
    baseShapeId: string; // e.g., 'L', 'T'
    matrix: number[][]; // The 2D array representing this specific rotation/mirror of the shape
    colorId: string; // The retro color assigned at the start of the game for this base shape
}

export interface GameState {
    appState: AppState;
    difficulty: DifficultyLevel;
    board: BoardState;
    hand: (PieceVariant | null)[];
    score: number;
    bag: string[]; // The current draw bag of baseShapeIds
}
