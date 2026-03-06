import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useGameStore } from '../../store/gameStore';
import { Piece } from './Piece';
import type { PieceVariant } from '../../types/game';

export const Hand: React.FC = () => {
    const hand = useGameStore(state => state.hand);

    return (
        <div
            className="flex flex-row md:flex-col landscape:flex-col gap-2 md:gap-4 mt-2 md:mt-0 landscape:mt-0 md:ml-4 landscape:ml-4 p-2 md:p-4 bg-slate-800 rounded-lg shadow-xl w-full md:w-auto overflow-x-auto md:overflow-visible landscape:overflow-visible items-center justify-center md:items-start landscape:items-start"
            style={{ '--cell-size': 'var(--hand-cell-size)' } as React.CSSProperties}
        >
            {hand.map((piece, index) => piece ? (
                <div key={piece.id} className="flex items-center justify-center bg-slate-700/30 rounded-md border border-slate-600/30 p-1 md:p-2">
                    <DraggablePiece piece={piece} />
                </div>
            ) : (
                <div key={`empty-${index}`} className="flex items-center justify-center bg-slate-700/30 rounded-md border border-slate-600/30 p-1 md:p-2" style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }} />
            ))}
        </div>
    );
};

interface DraggablePieceProps {
    piece: PieceVariant;
}

const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: piece.id,
        data: { piece }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            // Add touch-none to prevent scrolling while trying to grab a piece on mobile
            className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-0' : 'opacity-100'}`}
        >
            <Piece piece={piece} />
        </div>
    );
};
