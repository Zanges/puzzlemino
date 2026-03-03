import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getTopScores, clearAllScores, type HighScoreEntry } from '../../db/highScores';

export const MainMenu: React.FC = () => {
    const { difficulty, setDifficulty, initializeGame } = useGameStore();
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        getTopScores(difficulty).then(setHighScores);
    }, [difficulty]);

    const handleResetScores = async () => {
        await clearAllScores();
        setHighScores([]);
        setShowResetConfirm(false);
    };

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

                {/* High Scores */}
                {highScores.length > 0 && (
                    <div className="w-full flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-slate-300 font-semibold tracking-wide text-sm uppercase">
                                High Scores — <span className="capitalize">{difficulty}</span>
                            </h2>
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 text-xs uppercase">
                                        <th className="text-left pb-2 w-8">#</th>
                                        <th className="text-left pb-2">Name</th>
                                        <th className="text-right pb-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {highScores.map((entry, i) => (
                                        <tr key={entry.id} className="text-slate-300">
                                            <td className="py-1 text-slate-500">{i + 1}</td>
                                            <td className="py-1">{entry.name}</td>
                                            <td className="py-1 text-right font-mono text-white">{entry.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showResetConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center">
                            <h3 className="text-xl font-bold text-slate-100 mb-2">Reset Leaderboard?</h3>
                            <p className="text-slate-400 mb-6">This will permanently delete all high scores across all difficulties.</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="px-5 py-2 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white font-semibold rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetScores}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold rounded-md transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            <footer className="absolute bottom-8 text-slate-500 text-sm">
                Built with React & dnd-kit
            </footer>
        </div>
    );
};
