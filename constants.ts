import { GameConfig } from './types';

export const GRID_SIZE = 20; // 20x20 grid
export const INITIAL_SPEED = 150; // ms per tick
export const MIN_SPEED = 60;
export const SPEED_INCREMENT = 2;

export const THEME = {
  snakeHead: 'bg-emerald-400',
  snakeBody: 'bg-emerald-600',
  food: 'bg-rose-500',
  grid: 'bg-slate-800',
  empty: 'bg-slate-900/50',
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const DEFAULT_CONFIG: GameConfig = {
  gridSize: GRID_SIZE,
  speed: INITIAL_SPEED,
};