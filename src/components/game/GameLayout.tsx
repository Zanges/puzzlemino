import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, Modifier } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useGameStore } from '../../store/gameStore';
import { Board } from './Board';
import { Hand } from './Hand';
import { Piece } from './Piece';
import type { PieceVariant } from '../../types/game';
import { isHighScore, addHighScore } from '../../db/highScores';

function useViewportSize() {
    const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
        const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return size;
}

export const GameLayout: React.FC = () => {
    const { initializeGame, configLoaded, isGameOver, tryPlacePiece, score, returnToMenu, difficulty } = useGameStore();
    const board = useGameStore(state => state.board);
    const viewport = useViewportSize();

    const isLandscape = viewport.w > viewport.h;

    const cellSize = useMemo(() => {
        const rows = board.length || 10;
        const cols = board[0]?.length || 10;
        const gap = 1; // gap in px between cells
        // Board chrome: 2px outer padding + 2px inner padding per side = 8px total per axis
        const boardChrome = 8;
        // Score bar height
        const scoreH = 32;

        let size: number;
        if (isLandscape) {
            const availableH = viewport.h - scoreH - boardChrome - 28;
            const availableW = viewport.w * 0.65 - boardChrome;
            size = Math.min(availableH / rows, availableW / cols);
        } else {
            const availableW = viewport.w - boardChrome;
            // Reserve space for hand (tallest piece is 4 cells × ~28px + chrome)
            const handH = 140;
            const availableH = viewport.h - scoreH - boardChrome - handH;
            size = Math.min(availableW / cols, availableH / rows);
        }

        // Account for gaps between cells
        size = size - gap;

        // Clamp between reasonable bounds
        return Math.max(16, Math.min(size, 48));
    }, [board, viewport, isLandscape]);
    const [activePiece, setActivePiece] = useState<PieceVariant | null>(null);
    const [showMenuConfirm, setShowMenuConfirm] = useState(false);
    const [showMenuDropdown, setShowMenuDropdown] = useState(false);
    const [showDragOverlay, setShowDragOverlay] = useState(false);
    const [highScoreState, setHighScoreState] = useState<'checking' | 'entering' | 'done'>('done');
    const [playerName, setPlayerName] = useState('');
    const isTouchDrag = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowMenuDropdown(false);
            }
        };
        if (showMenuDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenuDropdown]);

    // Check for high score when game ends
    useEffect(() => {
        if (isGameOver) {
            setHighScoreState('checking');
            isHighScore(score, difficulty).then(isHigh => {
                setHighScoreState(isHigh ? 'entering' : 'done');
            });
        } else {
            setHighScoreState('done');
            setPlayerName('');
        }
    }, [isGameOver, score]);

    const handleHighScoreSubmit = async () => {
        const name = playerName.trim() || 'Anonymous';
        await addHighScore(name, score, difficulty);
        setHighScoreState('done');
    };

    // Initialize the game once
    useEffect(() => {
        if (!configLoaded) {
            initializeGame();
        }
    }, [configLoaded, initializeGame]);

    // Setup drag sensors. 
    // MouseSensor for desktop. TouchSensor with delay for mobile (prevent accidental grabs when scrolling... though we disabled scrolling).
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 3 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 0, tolerance: 3 },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        isTouchDrag.current = event.activatorEvent?.type === 'touchstart';
        const piece = active.data.current?.piece as PieceVariant;
        if (piece) {
            setActivePiece(piece);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { over } = event;

        if (over && activePiece) {
            const cellData = over.data.current as { x: number, y: number };

            if (cellData) {
                // Center-align: offset by the piece's center of mass
                const matrix = activePiece.matrix;
                let sumX = 0, sumY = 0, count = 0;
                for (let py = 0; py < matrix.length; py++) {
                    for (let px = 0; px < matrix[py].length; px++) {
                        if (matrix[py][px] === 1) { sumX += px; sumY += py; count++; }
                    }
                }
                const anchorX = cellData.x - Math.round(sumX / count);
                const anchorY = cellData.y - Math.round(sumY / count);

                tryPlacePiece(activePiece.id, anchorX, anchorY);
            }
        }

        setActivePiece(null);
    };

    const handleDragCancel = () => {
        setActivePiece(null);
    };

    // Disable drop animation for instant feedback
    const dropAnimation = null;

    if (!configLoaded) {
        return <div className="text-white text-center p-8">Loading Game Engine...</div>;
    }

    // Offset the dragged piece away from the cursor/finger so it's fully visible
    const dragOffsetModifier: Modifier = ({ transform, active }) => {
        if (!active) return transform;

        if (isTouchDrag.current) {
            // Large offset for touch so the piece is well above the finger/thumb
            return {
                ...transform,
                x: transform.x,
                y: transform.y - 120,
            };
        }

        // Small offset for mouse — subtle "picked up" feel
        return {
            ...transform,
            x: transform.x,
            y: transform.y - 20,
        };
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div
                className="flex flex-col items-center justify-start h-[100dvh] bg-slate-900 text-slate-100 font-sans select-none overflow-hidden"
                style={{ '--cell-size': `${cellSize}px` } as React.CSSProperties}
            >
                <div className="py-1 flex items-center gap-3">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowMenuDropdown(prev => !prev)}
                            className="px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-300 hover:text-white rounded-md transition-colors"
                        >
                            Settings
                        </button>
                        {showMenuDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[180px] py-1">
                                <button
                                    onClick={() => { setShowMenuDropdown(false); setShowMenuConfirm(true); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    Main Menu
                                </button>
                                <div className="border-t border-slate-700 my-1" />
                                <button
                                    onClick={() => setShowDragOverlay(prev => !prev)}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-between"
                                >
                                    <span>Drag Preview</span>
                                    <span className={`w-8 h-4 rounded-full relative transition-colors ${showDragOverlay ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                                        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${showDragOverlay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="text-lg md:text-2xl font-semibold text-slate-300">
                        Score: <span className="text-white bg-slate-800 px-3 py-1 rounded-md">{score}</span>
                    </div>
                </div>

                {showMenuConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center">
                            <h3 className="text-xl font-bold text-slate-100 mb-2">Leave Game?</h3>
                            <p className="text-slate-400 mb-6">Your current progress will be lost.</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowMenuConfirm(false)}
                                    className="px-5 py-2 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white font-semibold rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { setShowMenuConfirm(false); returnToMenu(); }}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold rounded-md transition-colors"
                                >
                                    Leave
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex flex-col landscape:flex-row md:flex-row items-center md:items-start justify-start landscape:justify-center md:justify-center w-full flex-1 perspective-1000">
                    <div className="relative">
                        <Board activePiece={activePiece} />

                        {isGameOver && (
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                                <h2 className="text-4xl font-bold text-red-400 mb-2 drop-shadow-md">Game Over</h2>
                                <p className="text-lg text-slate-300 mb-4">Final Score: {score}</p>

                                {highScoreState === 'entering' && (
                                    <div className="flex flex-col items-center gap-3 mb-6">
                                        <p className="text-yellow-400 font-semibold text-sm">New High Score!</p>
                                        <form
                                            onSubmit={(e) => { e.preventDefault(); handleHighScoreSubmit(); }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                placeholder="Enter your name"
                                                maxLength={16}
                                                autoFocus
                                                className="px-3 py-2 bg-slate-700 border border-slate-500 rounded-md text-white text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-400 w-40"
                                            />
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-slate-900 font-semibold text-sm rounded-md transition-colors"
                                            >
                                                Save
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {highScoreState === 'done' && (
                                    <div className="flex gap-4 mt-2">
                                        <button
                                            onClick={() => initializeGame()}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-md shadow-lg transition-colors"
                                        >
                                            Play Again
                                        </button>
                                        <button
                                            onClick={() => returnToMenu()}
                                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-semibold rounded-md shadow-lg transition-colors"
                                        >
                                            Return to Menu
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Hand />
                </main>

                {/* Floating piece overlay — hidden by default, board preview is shown instead */}
                {showDragOverlay && (
                    <DragOverlay dropAnimation={dropAnimation} modifiers={[restrictToWindowEdges, dragOffsetModifier]}>
                        {activePiece ? (
                            <div className="pointer-events-none drop-shadow-2xl">
                                <Piece piece={activePiece} isDragging={true} />
                            </div>
                        ) : null}
                    </DragOverlay>
                )}
            </div>
        </DndContext>
    );
};
