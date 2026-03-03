import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const MainMenu: React.FC = () => {
    const { difficulty, setDifficulty, initializeGame } = useGameStore();

    const handleStartGame = async () => {
        // Initialize the game with the chosen difficulty, which loads config and generates board
        await initializeGame(difficulty);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4 font-sans select-none">
            <header className="mb-12 text-center flex flex-col gap-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    PUZZLEMINO
                </h1>
                <p className="text-slate-400 text-lg md:text-xl tracking-widest uppercase">
                    Zero Gravity Puzzle
                </p>
            </header>

            <main className="flex flex-col items-center w-full max-w-sm gap-8">

                {/* Difficulty Selector */}
                <div className="w-full flex flex-col gap-3">
                    <label className="text-slate-300 font-semibold tracking-wide text-sm uppercase px-1">
                        Select Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/50 rounded-lg">
                        {(['easy', 'normal', 'hard'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={`
                                    py-3 px-2 rounded-md font-medium text-sm transition-all duration-200 capitalize
                                    ${difficulty === level
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                    }
                                `}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Play Button */}
                <button
                    onClick={handleStartGame}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-900 font-bold text-xl rounded-lg shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                >
                    Start Game
                </button>

            </main>

            <footer className="absolute bottom-8 text-slate-500 text-sm">
                Built with React & dnd-kit
            </footer>
        </div>
    );
};
