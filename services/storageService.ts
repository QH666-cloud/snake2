import { ScoreEntry } from '../types';

const STORAGE_KEY = 'neon_snake_history';

export const getHistory = (): ScoreEntry[] => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
};

export const saveScore = (score: number, comment?: string): ScoreEntry[] => {
  const currentHistory = getHistory();
  const newEntry: ScoreEntry = {
    id: Date.now().toString(),
    score,
    date: new Date().toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    comment
  };

  // Keep top 20 recent scores, sorted by score descending then date
  const updatedHistory = [newEntry, ...currentHistory]
    .sort((a, b) => b.score - a.score || parseInt(b.id) - parseInt(a.id))
    .slice(0, 20);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};