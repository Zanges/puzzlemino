import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../../store/gameStore';
import { cn } from '../../lib/utils';
import { canPlacePiece } from '../../engine/validator';
import type { PieceVariant } from '../../types/game';

interface BoardProps {
    activePiece: PieceVariant | null;
}

import { useDndContext } from '@dnd-kit/core';

export const Board: React.FC<BoardProps> = ({ activePiece }) => {
    const board = useGameStore(state => state.board);
    const { over } = useDndContext();

    // Determine the current hovered coordinates from dnd-kit context
    let hoveredX: number | null = null;
    let hoveredY: number | null = null;
    let isValidHover = false;

    if (over && activePiece) {
        const cellData = over.data.current as { x: number, y: number };
        if (cellData) {
            hoveredX = cellData.x;
            hoveredY = cellData.y;
            isValidHover = canPlacePiece(board, activePiece, hoveredX, hoveredY);
        }
    }

    return (
        <div className="bg-slate-800 p-2 md:p-3 rounded-lg shadow-xl inline-block touch-none select-none">
            <div
                className="grid gap-[2px] md:gap-1 bg-slate-700/50 p-1 md:p-2 rounded-md"
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
}

const BoardCell: React.FC<BoardCellProps> = ({
    x, y, isEmpty, colorId, isPreview, isInvalidPreview, previewColor
}) => {
    const { setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: { x, y }
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-sm transition-all duration-150 relative",
                isEmpty && !isPreview && !isInvalidPreview ? "bg-slate-700/40 border border-slate-600/30" : "",
                !isEmpty ? colorId : "",
                !isEmpty ? "shadow-sm border border-black/10" : "",
                isPreview ? `${previewColor} opacity-50 shadow-md ring-2 ring-white/70 scale-95` : "",
                isInvalidPreview ? "bg-red-500/80 shadow-inner" : ""
            )}
        />
    );
};
