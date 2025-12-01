import React from 'react';
import { Point, GameStatus } from '../types';
import { GRID_SIZE, THEME } from '../constants';

interface GameBoardProps {
  snake: Point[];
  food: Point;
  status: GameStatus;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, status }) => {
  // Create grid cells
  const cells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const isFood = food.x === x && food.y === y;
      const snakeIndex = snake.findIndex((s) => s.x === x && s.y === y);
      const isHead = snakeIndex === 0;
      const isBody = snakeIndex > 0;

      let cellClass = `w-full h-full rounded-sm transition-colors duration-75 ${THEME.empty}`;
      
      if (isFood) {
        cellClass = `w-full h-full rounded-full ${THEME.food} shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse`;
      } else if (isHead) {
        cellClass = `w-full h-full rounded-sm ${THEME.snakeHead} z-10`;
        if (status === GameStatus.GAME_OVER) {
             cellClass += ' bg-red-500 animate-bounce';
        }
      } else if (isBody) {
        cellClass = `w-full h-full rounded-sm ${THEME.snakeBody} opacity-80`;
      }

      cells.push(
        <div key={`${x}-${y}`} className={cellClass} />
      );
    }
  }

  return (
    <div 
      className="relative bg-slate-800 p-1 rounded-lg shadow-2xl border border-slate-700 mx-auto"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        gap: '1px',
        width: 'min(90vw, 400px)',
        height: 'min(90vw, 400px)',
      }}
    >
      {cells}
      
      {status === GameStatus.PAUSED && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
          <span className="font-pixel text-yellow-400 text-2xl tracking-widest">PAUSED</span>
        </div>
      )}
      
      {status === GameStatus.IDLE && (
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
          <div className="text-center">
            <p className="font-pixel text-emerald-400 text-lg mb-2">READY?</p>
            <p className="text-slate-300 text-xs">Press Arrows / Swipe</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;