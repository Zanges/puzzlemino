import { create } from 'zustand';
import type { GameState, PieceVariant, AppState, DifficultyLevel } from '../types/game';
import { createEmptyBoard, placePieceOnBoard, generateStartingSquares } from '../engine/board';
import { createBag, drawPiece } from '../engine/bagStore';
import { clearLines } from '../engine/lines';
import { isGameOver } from '../engine/gameOver';
import { canPlacePiece } from '../engine/validator';
import { loadGameConfig } from '../config/configLoader';
import { generateAllVariants } from '../utils/pieceUtils';
import type { PieceVariantDef } from '../utils/pieceUtils';

interface GameStore extends GameState {
    isGameOver: boolean;
    configLoaded: boolean;
    allVariants: PieceVariantDef[];
    colorMap: Record<string, string>;

    // Actions
    setAppState: (state: AppState) => void;
    setDifficulty: (diff: DifficultyLevel) => void;
    initializeGame: (difficulty?: DifficultyLevel) => Promise<void>;
    returnToMenu: () => void;
    tryPlacePiece: (pieceId: string, startX: number, startY: number) => boolean;
}

const COLORS = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400',
    'bg-yellow-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'
];

export const useGameStore = create<GameStore>((set, get) => ({
    appState: 'menu',
    difficulty: 'normal',
    board: [],
    hand: [],
    score: 0,
    bag: [],
    isGameOver: false,
    configLoaded: false,
    allVariants: [],
    colorMap: {},

    setAppState: (state) => set({ appState: state }),
    setDifficulty: (diff) => set({ difficulty: diff }),
    returnToMenu: () => set({ appState: 'menu' }),

    initializeGame: async (difficultyOverride?: DifficultyLevel) => {
        try {
            const currentDiff = difficultyOverride || get().difficulty;
            const config = await loadGameConfig(currentDiff);

            // Generate all variants
            const variants = generateAllVariants(config.pieces);

            // Map colors to base shapes randomly
            const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
            const map: Record<string, string> = {};
            config.pieces.forEach((p, i) => {
                map[p.id] = shuffledColors[i % shuffledColors.length];
            });

            // Initialize board
            const initialBoard = createEmptyBoard(config.boardWidth, config.boardHeight);

            // Populate starting squares based on difficulty
            if (config.startingSquares && config.startingSquares > 0) {
                generateStartingSquares(initialBoard, config.startingSquares, map);
            }

            // Initialize bag
            const baseShapeIds = config.pieces.map(p => p.id);
            let currentBag = createBag(baseShapeIds);

            // Draw initial hand
            const initialHand: (PieceVariant | null)[] = [];
            for (let i = 0; i < config.handSize; i++) {
                const { piece, nextBag } = drawPiece(currentBag, baseShapeIds, variants, map);
                initialHand.push(piece);
                currentBag = nextBag;
            }

            set({
                appState: 'playing',
                difficulty: currentDiff,
                board: initialBoard,
                hand: initialHand,
                score: 0,
                bag: currentBag,
                isGameOver: false,
                configLoaded: true,
                allVariants: variants,
                colorMap: map
            });

        } catch (error) {
            console.error("Failed to initialize game:", error);
        }
    },

    tryPlacePiece: (pieceId: string, startX: number, startY: number) => {
        const state = get();
        if (state.isGameOver) return false;

        const pieceIndex = state.hand.findIndex(p => p?.id === pieceId);
        if (pieceIndex === -1) return false;

        const piece = state.hand[pieceIndex];
        if (!piece) return false;

        // 1. Validate
        if (!canPlacePiece(state.board, piece, startX, startY)) {
            return false;
        }

        // 2. Place
        let nextBoard = placePieceOnBoard(state.board, piece, startX, startY);

        // 3. Score (Base blocks)
        let blocksPlaced = 0;
        piece.matrix.forEach(row => row.forEach(val => { if (val === 1) blocksPlaced++; }));
        let pointsGained = blocksPlaced;

        // 4. Line Clears
        const { nextBoard: clearedBoard, linesCleared } = clearLines(nextBoard);
        nextBoard = clearedBoard;

        if (linesCleared > 0) {
            pointsGained += (linesCleared * 10);
            // Bonus for multiple lines
            if (linesCleared > 1) {
                pointsGained += (linesCleared * 5); // Simple combo bonus
            }
        }

        // 5. Update Hand
        const nextHand = [...state.hand];
        nextHand[pieceIndex] = null; // Remove piece from hand momentarily

        // 6. Refill Hand logic
        // If hand is completely empty, refill it all at once
        const activePieces = nextHand.filter(p => p !== null);
        let nextBag = [...state.bag];

        // Wait, Puzzlemino/1010 style usually refills the whole hand when it's completely empty.
        // Let's implement that: if activePieces.length === 0, pull 3 new ones.
        if (activePieces.length === 0 && state.configLoaded) {
            // Need base shapes to draw
            const baseShapeIds = Object.keys(state.colorMap);
            for (let i = 0; i < nextHand.length; i++) {
                const { piece: newPiece, nextBag: newBag } = drawPiece(nextBag, baseShapeIds, state.allVariants, state.colorMap);
                nextHand[i] = newPiece;
                nextBag = newBag;
            }
        }

        // 7. Game Over Check
        const gameOver = isGameOver(nextBoard, nextHand);

        // 8. Commit state
        set({
            appState: gameOver ? 'gameover' : state.appState,
            board: nextBoard,
            hand: nextHand,
            score: state.score + pointsGained,
            bag: nextBag,
            isGameOver: gameOver
        });

        return true;
    }
}));
