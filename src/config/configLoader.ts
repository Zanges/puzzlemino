export interface BasePieceDef {
    id: string;
    matrix: number[][];
}

export interface GameConfig {
    boardWidth: number;
    boardHeight: number;
    handSize: number;
    startingSquares: number;
    pieces: BasePieceDef[];
}

export interface MasterGameConfig {
    difficulties: Record<string, GameConfig>;
}

export async function loadGameConfig(difficulty: string = 'normal'): Promise<GameConfig> {
    const response = await fetch('/gameConfig.json');
    if (!response.ok) {
        throw new Error('Failed to load game config');
    }

    const masterConfig: MasterGameConfig = await response.json();
    const config = masterConfig.difficulties[difficulty];

    if (!config) {
        throw new Error(`Difficulty level '${difficulty}' not found in configuration.`);
    }

    // Validate piece dimensions
    for (const piece of config.pieces) {
        const height = piece.matrix.length;
        const width = piece.matrix[0]?.length || 0;

        if (height > config.boardHeight || width > config.boardWidth) {
            throw new Error(`Piece ${piece.id} is impossible to place on board of size ${config.boardWidth}x${config.boardHeight}`);
        }
    }

    return config;
}
