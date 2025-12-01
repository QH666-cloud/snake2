import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import HistoryList from './components/HistoryList';
import { Point, Direction, GameStatus, ScoreEntry } from './types';
import { GRID_SIZE, DIRECTIONS, INITIAL_SPEED, SPEED_INCREMENT, MIN_SPEED } from './constants';
import { saveScore, getHistory } from './services/storageService';
import { generateGameCommentary } from './services/geminiService';
import { Bot, Gamepad2, MonitorDown } from 'lucide-react';

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';

const App: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [history, setHistory] = useState<ScoreEntry[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Use refs for values accessed inside interval to avoid stale closures without frequent re-renders
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const statusRef = useRef<GameStatus>(GameStatus.IDLE);
  const lastProcessedDirectionRef = useRef<Direction>(INITIAL_DIRECTION); // Prevent 180 turns in one tick

  useEffect(() => {
    setHistory(getHistory());

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Update refs when state changes
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOnSnake;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOnSnake = currentSnake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
    } while (isOnSnake);
    return newFood;
  }, []);

  const handleGameOver = useCallback(async (reason: string) => {
    setStatus(GameStatus.GAME_OVER);
    
    // Optimistic Save
    setAiLoading(true);
    let comment = "";
    
    const hasApiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY;

    if (hasApiKey) {
        comment = await generateGameCommentary(score, reason);
    } else {
        comment = score > 10 ? "不错不错！" : "再接再厉！";
    }
    setAiLoading(false);

    const newHistory = saveScore(score, comment);
    setHistory(newHistory);
  }, [score]);

  const moveSnake = useCallback(() => {
    if (statusRef.current !== GameStatus.PLAYING) return;

    const currentHead = snakeRef.current[0];
    const moveDir = directionRef.current;
    lastProcessedDirectionRef.current = moveDir;

    const delta = DIRECTIONS[moveDir];
    const newHead = { x: currentHead.x + delta.x, y: currentHead.y + delta.y };

    // Wall Collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      handleGameOver("撞墙了");
      return;
    }

    // Self Collision
    if (snakeRef.current.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      handleGameOver("咬到自己了");
      return;
    }

    const newSnake = [newHead, ...snakeRef.current];

    // Check Food
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore((s) => s + 1);
      setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
      setFood(generateFood(newSnake));
      // Don't pop, snake grows
    } else {
      newSnake.pop(); // Remove tail
    }

    setSnake(newSnake);
  }, [food, generateFood, handleGameOver]);

  // Game Loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = lastProcessedDirectionRef.current;
    const isOpposite =
      (newDir === 'UP' && currentDir === 'DOWN') ||
      (newDir === 'DOWN' && currentDir === 'UP') ||
      (newDir === 'LEFT' && currentDir === 'RIGHT') ||
      (newDir === 'RIGHT' && currentDir === 'LEFT');

    if (!isOpposite) {
      setDirection(newDir);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        changeDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        changeDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        changeDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        changeDirection('RIGHT');
        break;
      case ' ':
        e.preventDefault();
        toggleGame();
        break;
    }
  }, [changeDirection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setFood(generateFood(INITIAL_SNAKE));
    setStatus(GameStatus.PLAYING);
  };

  const toggleGame = () => {
    if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) {
      resetGame();
    } else if (status === GameStatus.PLAYING) {
      setStatus(GameStatus.PAUSED);
    } else if (status === GameStatus.PAUSED) {
      setStatus(GameStatus.PLAYING);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      
      {/* Game Area */}
      <div className="flex flex-col items-center w-full max-w-md">
        <header className="mb-6 flex flex-col items-center relative w-full">
          <h1 className="font-pixel text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 tracking-tighter drop-shadow-lg flex items-center gap-3">
             <Gamepad2 size={32} className="text-emerald-400" />
             NEON SNAKE
          </h1>
          
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="absolute right-0 top-2 lg:right-[-60px] p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border border-slate-700 shadow-lg"
              title="Install App"
            >
              <MonitorDown size={16} />
              <span className="hidden sm:inline">APP</span>
            </button>
          )}

          <div className="flex items-center gap-4 text-slate-400">
             <span className="font-mono bg-slate-800 px-3 py-1 rounded border border-slate-700">
               SCORE: <span className="text-white font-bold">{score}</span>
             </span>
             {aiLoading && (
               <span className="text-xs text-emerald-500 animate-pulse flex items-center gap-1">
                 <Bot size={12} /> AI Thinking...
               </span>
             )}
          </div>
        </header>

        <GameBoard snake={snake} food={food} status={status} />
        
        <Controls 
          onMove={changeDirection} 
          onAction={toggleGame} 
          status={status} 
        />
      </div>

      {/* Sidebar / History */}
      <div className="w-full max-w-md lg:w-80 lg:h-[600px] flex flex-col gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
           <div className="mb-4">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <Bot className="text-emerald-400" /> AI 记忆体
             </h2>
             <p className="text-xs text-slate-400">
               Gemini generates commentary based on your gameplay.
             </p>
           </div>
           
           <HistoryList history={history} />
        </div>
      </div>

    </div>
  );
};

export default App;