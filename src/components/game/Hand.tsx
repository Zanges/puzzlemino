import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useGameStore } from '../../store/gameStore';
import { Piece } from './Piece';
import type { PieceVariant } from '../../types/game';

export const Hand: React.FC = () => {
    const hand = useGameStore(state => state.hand);

    return (
        <div className="flex flex-row md:flex-col landscape:flex-col gap-4 mt-6 md:mt-0 landscape:mt-0 md:ml-8 landscape:ml-8 p-4 bg-slate-800 rounded-lg shadow-xl w-full md:w-auto overflow-x-auto md:overflow-visible landscape:overflow-visible items-center md:items-start landscape:items-start min-h-[120px] md:min-h-[400px] landscape:min-h-[400px]">
            {hand.map((piece, index) => (
                <div key={piece?.id || index} className="flex-1 flex items-center justify-center min-w-[80px] min-h-[80px] bg-slate-700/30 rounded-md border border-slate-600/30 p-2">
                    {piece && <DraggablePiece piece={piece} />}
                </div>
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
