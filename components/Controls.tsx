import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw, Pause } from 'lucide-react';
import { Direction, GameStatus } from '../types';

interface ControlsProps {
  onMove: (dir: Direction) => void;
  onAction: () => void;
  status: GameStatus;
}

const Controls: React.FC<ControlsProps> = ({ onMove, onAction, status }) => {
  const btnClass = "p-4 bg-slate-700 rounded-full active:bg-emerald-600 transition-colors shadow-lg touch-manipulation";
  const actionBtnClass = "px-6 py-2 rounded-lg font-bold font-pixel text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2";

  const renderActionButton = () => {
    switch (status) {
      case GameStatus.IDLE:
        return (
          <button onClick={onAction} className={`${actionBtnClass} bg-emerald-500 hover:bg-emerald-400 text-slate-900`}>
            <Play size={16} /> Start
          </button>
        );
      case GameStatus.PLAYING:
        return (
          <button onClick={onAction} className={`${actionBtnClass} bg-yellow-500 hover:bg-yellow-400 text-slate-900`}>
            <Pause size={16} /> Pause
          </button>
        );
      case GameStatus.PAUSED:
        return (
          <button onClick={onAction} className={`${actionBtnClass} bg-emerald-500 hover:bg-emerald-400 text-slate-900`}>
            <Play size={16} /> Resume
          </button>
        );
      case GameStatus.GAME_OVER:
        return (
          <button onClick={onAction} className={`${actionBtnClass} bg-blue-500 hover:bg-blue-400 text-white`}>
            <RotateCcw size={16} /> Retry
          </button>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-6 w-full max-w-md mx-auto">
      {/* Action Button */}
      <div className="mb-2">
        {renderActionButton()}
      </div>

      {/* D-Pad for Mobile */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onMove('UP'); }}>
          <ArrowUp className="text-white" />
        </button>
        <div />
        
        <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onMove('LEFT'); }}>
          <ArrowLeft className="text-white" />
        </button>
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onMove('RIGHT'); }}>
          <ArrowRight className="text-white" />
        </button>
        
        <div />
        <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onMove('DOWN'); }}>
          <ArrowDown className="text-white" />
        </button>
        <div />
      </div>
      
      <p className="text-xs text-slate-500 hidden md:block mt-2">
        Use Arrow Keys or WASD to move. Space to Start/Pause.
      </p>
    </div>
  );
};

export default Controls;