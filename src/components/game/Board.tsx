import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../../store/gameStore';
import { cn } from '../../lib/utils';
import type { PieceVariant } from '../../types/game';

interface BoardProps {
    activePiece: PieceVariant | null;
    snapPosition: { x: number; y: number; valid: boolean } | null;
    gridRef: React.RefObject<HTMLDivElement | null>;
}

export const Board: React.FC<BoardProps> = ({ activePiece, snapPosition, gridRef }) => {
    const board = useGameStore(state => state.board);
    const clearingCells = useGameStore(state => state.clearingCells);

    // Build a set for O(1) lookup of clearing cells
    const clearingSet = React.useMemo(() => {
        const s = new Set<string>();
        for (const c of clearingCells) {
            s.add(`${c.x},${c.y}`);
        }
        return s;
    }, [clearingCells]);

    const hoveredX = snapPosition?.x ?? null;
    const hoveredY = snapPosition?.y ?? null;
    const isValidHover = snapPosition?.valid ?? false;

    return (
        <div className="bg-slate-800 p-[2px] md:p-3 rounded-lg shadow-xl inline-block touch-none select-none">
            <div
                ref={gridRef}
                className="grid gap-[1px] md:gap-1 bg-slate-700/50 p-[2px] md:p-2 rounded-md"
                style={{
                    gridTemplateRows: `repeat(${board.length}, minmax(0, 1fr))`,
                    gridTemplateColumns: `repeat(${board[0]?.length || 0}, minmax(0, 1fr))`
                }}
            >
                {board.map((row, y) => (
                    row.map((cell, x) => {
                        // Check if this specific cell (x, y) should be highlighted as part of the preview
                        let isPreview = false;
                        let isInvalidPreview = false;
                        let previewColor = null;

                        if (hoveredX !== null && hoveredY !== null && activePiece) {
                            // Is this cell within the piece's matrix relative to the hovered start point?
                            const pieceY = y - hoveredY;
                            const pieceX = x - hoveredX;

                            if (
                                pieceY >= 0 && pieceY < activePiece.matrix.length &&
                                pieceX >= 0 && pieceX < activePiece.matrix[0].length &&
                                activePiece.matrix[pieceY][pieceX] === 1
                            ) {
                                if (isValidHover) {
                                    isPreview = true;
                                    previewColor = activePiece.colorId;
                                } else {
                                    isInvalidPreview = true;
                                }
                            }
                        }

                        const isClearing = clearingSet.has(`${x},${y}`);

                        return (
                            <BoardCell
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                isEmpty={cell.isEmpty}
                                colorId={cell.colorId}
                                isPreview={isPreview}
                                isInvalidPreview={isInvalidPreview}
                                previewColor={previewColor}
                                isClearing={isClearing}
                            />
                        );
                    })
                ))}
            </div>
        </div>
    );
};

interface BoardCellProps {
    x: number;
    y: number;
    isEmpty: boolean;
    colorId: string | null;
    isPreview: boolean;
    isInvalidPreview: boolean;
    previewColor: string | null;
    isClearing: boolean;
}

const BoardCell: React.FC<BoardCellProps> = ({
    x, y, isEmpty, colorId, isPreview, isInvalidPreview, previewColor, isClearing
}) => {
    const { setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: { x, y }
    });

    return (
        <div
            ref={setNodeRef}
            style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
            className={cn(
                "rounded-sm",
                isEmpty && !isPreview && !isInvalidPreview ? "bg-slate-700/40 border border-slate-600/30" : "",
                !isEmpty && !isClearing ? colorId : "",
                !isEmpty && !isClearing ? "shadow-sm border border-black/10" : "",
                isClearing ? `${colorId} animate-line-clear` : "",
                isPreview ? `${previewColor} opacity-50 border-2 border-white/70` : "",
                isInvalidPreview ? "bg-red-500/80" : ""
            )}
        />
    );
};
