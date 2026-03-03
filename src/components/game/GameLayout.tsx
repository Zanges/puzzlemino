import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, Modifier } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useGameStore } from '../../store/gameStore';
import { Board } from './Board';
import { Hand } from './Hand';
import { Piece } from './Piece';
import type { PieceVariant } from '../../types/game';

export const GameLayout: React.FC = () => {
    const { initializeGame, configLoaded, isGameOver, tryPlacePiece, score, returnToMenu } = useGameStore();
    const [activePiece, setActivePiece] = useState<PieceVariant | null>(null);

    // Initialize the game once
    useEffect(() => {
        if (!configLoaded) {
            initializeGame();
        }
    }, [configLoaded, initializeGame]);

    // Setup drag sensors. 
    // MouseSensor for desktop. TouchSensor with delay for mobile (prevent accidental grabs when scrolling... though we disabled scrolling).
    const sensors = useSensors(
        // MouseSensor for desktop.
        useSensor(MouseSensor, {
            // Require a slight movement before dragging starts to allow clicks to pass through if needed
            activationConstraint: {
                distance: 5, // 5px movement required
            },
        }),
        // TouchSensor for mobile.
        useSensor(TouchSensor, {
            // Delay zero or very small, but require significant movement tolerance or just rely on delay.
            // For puzzlemino, we want instant grab on touch. So zero delay, but require a 5px drag.
            activationConstraint: {
                delay: 0,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const piece = active.data.current?.piece as PieceVariant;
        if (piece) {
            setActivePiece(piece);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { over } = event;

        if (over && activePiece) {
            // We dropped over a valid BoardCell drop target
            const cellData = over.data.current as { x: number, y: number };

            if (cellData) {
                // Attempt to place in store
                tryPlacePiece(activePiece.id, cellData.x, cellData.y);

                // If it failed, it will just snap back (handled by dnd-kit default behavior)
                // If it succeeded, React state (board/hand) updates immediately.
            }
        }

        // Always clear active piece on end (success or fail)
        setActivePiece(null);
    };

    const handleDragCancel = () => {
        setActivePiece(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    if (!configLoaded) {
        return <div className="text-white text-center p-8">Loading Game Engine...</div>;
    }

    // Custom modifier to push the dragged piece above the finger on touch devices
    const touchOffsetModifier: Modifier = ({ windowRect, transform, active }) => {
        if (!active || !windowRect) {
            return transform;
        }

        // We only want to apply the offset if the user is using a touch screen.
        // dnd-kit tracks the active sensor. If it's a touch sensor, we apply the offset.
        // We can inspect active.rect to see if the drag was initiated, but the easiest proxy
        // without dipping into internal dnd-kit state too heavily is to check if the browser supports touch
        // AND if the user is currently touching (or we can just apply a blanket offset since mobile is the primary issue).

        // Actually, dnd-kit provides `active.data.current`. We could inject sensor type there, 
        // but an easier approach for responsive UI is using window metrics or standard touch detection.
        // Given we don't know the exact active sensor inside the modifier cleanly, 
        // let's check standard navigator maxTouchPoints as a simple heuristic for "is this a mobile/tablet device".
        // A slightly better way is setting a state flag `isTouchDrag` during `onDragStart` if we could detect it,
        // but for Puzzlemino, a negative Y offset is actually fine for mouse *and* touch.
        // It provides a "picked up" feel. Let's apply a universal lift, but make it pronounced enough for thumbs.

        return {
            ...transform,
            x: transform.x - 20, // Shift slightly left of cursor/thumb
            y: transform.y - 60, // Shift significantly above cursor/thumb
        };
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4 font-sans select-none overflow-hidden">
                <header className="mb-8 text-center flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">Puzzlemino</h1>
                    <div className="text-xl md:text-2xl font-semibold text-slate-300">
                        Score: <span className="text-white bg-slate-800 px-3 py-1 rounded-md">{score}</span>
                    </div>
                </header>

                <main className="flex flex-col landscape:flex-row md:flex-row items-center md:items-start justify-center max-w-5xl w-full perspective-1000">
                    <div className="relative">
                        <Board activePiece={activePiece} />

                        {isGameOver && (
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                                <h2 className="text-4xl font-bold text-red-400 mb-2 drop-shadow-md">Game Over</h2>
                                <p className="text-lg text-slate-300 mb-6">Final Score: {score}</p>
                                <div className="flex gap-4">
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
                            </div>
                        )}
                    </div>

                    <Hand />
                </main>

                {/* The flying piece that follows the cursor */}
                <DragOverlay dropAnimation={dropAnimation} modifiers={[restrictToWindowEdges, touchOffsetModifier]}>
                    {activePiece ? (
                        <div className="pointer-events-none drop-shadow-2xl">
                            <Piece piece={activePiece} isDragging={true} />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};
