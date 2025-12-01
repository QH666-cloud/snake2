export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface ScoreEntry {
  id: string;
  score: number;
  date: string;
  comment?: string;
}

export interface GameConfig {
  gridSize: number;
  speed: number;
}