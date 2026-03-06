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

interface ClearingCell {
    x: number;
    y: number;
    colorId: string | null;
}

interface GameStore extends GameState {
    isGameOver: boolean;
    configLoaded: boolean;
    allVariants: PieceVariantDef[];
    colorMap: Record<string, string>;
    clearingCells: ClearingCell[];

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
    clearingCells: [],

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

        // 1. Validate placement (snap is handled in the UI layer)
        if (!canPlacePiece(state.board, piece, startX, startY)) {
            return false;
        }

        // 2. Place the piece
        const boardWithPiece = placePieceOnBoard(state.board, piece, startX, startY);

        // 3. Score (Base blocks)
        let blocksPlaced = 0;
        piece.matrix.forEach(row => row.forEach(val => { if (val === 1) blocksPlaced++; }));
        let pointsGained = blocksPlaced;

        // 4. Detect line clears
        const { nextBoard: clearedBoard, linesCleared, clearedCells } = clearLines(boardWithPiece);

        if (linesCleared > 0) {
            pointsGained += (linesCleared * 10);
            if (linesCleared > 1) {
                pointsGained += (linesCleared * 5);
            }
        }

        // Board clear bonus: double total score if every cell is empty after clearing
        const isBoardClear = linesCleared > 0 && clearedBoard.every(row => row.every(cell => cell.isEmpty));
        let newScore = state.score + pointsGained;
        if (isBoardClear) {
            newScore *= 2;
        }

        // 5. Update Hand
        const nextHand = [...state.hand];
        nextHand[pieceIndex] = null;

        // 6. Refill Hand logic
        const activePieces = nextHand.filter(p => p !== null);
        let nextBag = [...state.bag];

        if (activePieces.length === 0 && state.configLoaded) {
            const baseShapeIds = Object.keys(state.colorMap);
            for (let i = 0; i < nextHand.length; i++) {
                const { piece: newPiece, nextBag: newBag } = drawPiece(nextBag, baseShapeIds, state.allVariants, state.colorMap);
                nextHand[i] = newPiece;
                nextBag = newBag;
            }
        }

        if (linesCleared > 0) {
            // Phase 1: Show board with piece placed, mark cells as clearing
            const cellsWithColor = clearedCells.map(c => ({
                x: c.x,
                y: c.y,
                colorId: boardWithPiece[c.y][c.x].colorId
            }));

            set({
                board: boardWithPiece,
                hand: nextHand,
                score: newScore,
                bag: nextBag,
                clearingCells: cellsWithColor
            });

            // Phase 2: After animation, clear the cells and check game over
            setTimeout(() => {
                const gameOver = isGameOver(clearedBoard, get().hand);
                set({
                    appState: gameOver ? 'gameover' : get().appState,
                    board: clearedBoard,
                    clearingCells: [],
                    isGameOver: gameOver
                });
            }, 500);
        } else {
            // No lines to clear — commit immediately
            const gameOver = isGameOver(boardWithPiece, nextHand);
            set({
                appState: gameOver ? 'gameover' : state.appState,
                board: boardWithPiece,
                hand: nextHand,
                score: newScore,
                bag: nextBag,
                isGameOver: gameOver
            });
        }

        return true;
    }
}));
