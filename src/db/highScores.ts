import Dexie, { type Table } from 'dexie';

export interface HighScoreEntry {
    id?: number;
    name: string;
    score: number;
    difficulty: string;
    date: string;
}

class HighScoreDB extends Dexie {
    highScores!: Table<HighScoreEntry>;

    constructor() {
        super('puzzlemino');
        this.version(1).stores({
            highScores: '++id, score'
        });
        this.version(2).stores({
            highScores: '++id, score, difficulty'
        });
    }
}

const db = new HighScoreDB();

const MAX_ENTRIES_PER_DIFFICULTY = 5;

export async function getTopScores(difficulty: string, limit = MAX_ENTRIES_PER_DIFFICULTY): Promise<HighScoreEntry[]> {
    const all = await db.highScores
        .where('difficulty')
        .equals(difficulty)
        .reverse()
        .sortBy('score');
    return all.slice(0, limit);
}

export async function isHighScore(score: number, difficulty: string): Promise<boolean> {
    if (score <= 0) return false;
    const entries = await db.highScores
        .where('difficulty')
        .equals(difficulty)
        .toArray();
    if (entries.length < MAX_ENTRIES_PER_DIFFICULTY) return true;
    const lowest = entries.reduce((min, e) => e.score < min.score ? e : min, entries[0]);
    return score > lowest.score;
}

export async function clearAllScores(): Promise<void> {
    await db.highScores.clear();
}

export async function addHighScore(name: string, score: number, difficulty: string): Promise<void> {
    await db.highScores.add({
        name,
        score,
        difficulty,
        date: new Date().toISOString()
    });

    // Keep only top entries per difficulty
    const entries = await db.highScores
        .where('difficulty')
        .equals(difficulty)
        .toArray();

    if (entries.length > MAX_ENTRIES_PER_DIFFICULTY) {
        entries.sort((a, b) => b.score - a.score);
        const toRemove = entries
            .slice(MAX_ENTRIES_PER_DIFFICULTY)
            .map(e => e.id!)
            .filter(Boolean);
        await db.highScores.bulkDelete(toRemove);
    }
}
