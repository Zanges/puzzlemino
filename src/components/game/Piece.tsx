import React from 'react';
import { cn } from '../../lib/utils';
import type { PieceVariant } from '../../types/game';

interface PieceProps {
    piece: PieceVariant;
    className?: string;
    isDragging?: boolean;
}

export const Piece: React.FC<PieceProps> = ({ piece, className, isDragging }) => {
    const { matrix, colorId } = piece;
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;

    return (
        <div
            className={cn(
                "inline-grid gap-[1px] md:gap-1 pointer-events-none", // pointer-events-none so it doesn't block drag events
                isDragging && "opacity-80 scale-105 transition-transform duration-200",
                className
            )}
            style={{
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
            }}
        >
            {matrix.map((row, y) => (
                row.map((val, x) => (
                    <div
                        key={`${y}-${x}`}
                        style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
                        className={cn(
                            "rounded-sm",
                            val === 1 ? `${colorId} shadow-sm border border-black/10` : "bg-transparent"
                        )}
                    />
                ))
            ))}
        </div>
    );
};
