import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../../store/gameStore';
import { cn } from '../../lib/utils';
import { nudgePlacement } from '../../engine/validator';
import type { PieceVariant } from '../../types/game';

interface BoardProps {
    activePiece: PieceVariant | null;
}

import { useDndContext } from '@dnd-kit/core';

export const Board: React.FC<BoardProps> = ({ activePiece }) => {
    const board = useGameStore(state => state.board);
    const { over } = useDndContext();

    // Determine the current hovered coordinates, centering the piece on the cursor
    let hoveredX: number | null = null;
    let hoveredY: number | null = null;
    let isValidHover = false;

    if (over && activePiece) {
        const cellData = over.data.current as { x: number, y: number };
        if (cellData) {
            // Compute the center of filled cells in the piece matrix
            const matrix = activePiece.matrix;
            let sumX = 0, sumY = 0, count = 0;
            for (let py = 0; py < matrix.length; py++) {
                for (let px = 0; px < matrix[py].length; px++) {
                    if (matrix[py][px] === 1) {
                        sumX += px;
                        sumY += py;
                        count++;
                    }
                }
            }
            // Offset so the piece center aligns with the hovered cell
            const offsetX = Math.round(sumX / count);
            const offsetY = Math.round(sumY / count);
            const anchorX = cellData.x - offsetX;
            const anchorY = cellData.y - offsetY;

            const nudged = nudgePlacement(board, activePiece, anchorX, anchorY);
            if (nudged) {
                hoveredX = nudged.x;
                hoveredY = nudged.y;
                isValidHover = true;
            } else {
                hoveredX = anchorX;
                hoveredY = anchorY;
                isValidHover = false;
            }
        }
    }

    return (
        <div className="bg-slate-800 p-[2px] md:p-3 rounded-lg shadow-xl inline-block touch-none select-none">
            <div
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
            style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
            className={cn(
                "rounded-sm",
                isEmpty && !isPreview && !isInvalidPreview ? "bg-slate-700/40 border border-slate-600/30" : "",
                !isEmpty ? colorId : "",
                !isEmpty ? "shadow-sm border border-black/10" : "",
                isPreview ? `${previewColor} opacity-50 border-2 border-white/70` : "",
                isInvalidPreview ? "bg-red-500/80" : ""
            )}
        />
    );
};
