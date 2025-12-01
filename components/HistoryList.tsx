import React from 'react';
import { ScoreEntry } from '../types';
import { Trophy, Calendar, MessageSquareQuote } from 'lucide-react';

interface HistoryListProps {
  history: ScoreEntry[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center text-slate-500 py-4 italic text-sm">
        暂无记录。开始游戏创造历史！
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
      <h3 className="font-pixel text-xs text-slate-400 uppercase mb-4 flex items-center gap-2 sticky top-0 bg-slate-800/90 py-2 backdrop-blur-sm">
        <Trophy size={14} className="text-yellow-500" /> 历史高分榜
      </h3>
      <div className="space-y-3">
        {history.map((entry, index) => (
          <div 
            key={entry.id} 
            className={`relative p-3 rounded-md border ${index === 0 ? 'bg-slate-700 border-yellow-500/30' : 'bg-slate-800 border-slate-700'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-pixel ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                #{index + 1}
              </span>
              <span className="font-pixel text-emerald-400 text-lg">
                {entry.score}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
              <Calendar size={10} /> {entry.date}
            </div>
            {entry.comment && (
              <div className="text-xs text-slate-300 italic bg-black/20 p-2 rounded border-l-2 border-emerald-500/50 flex gap-2">
                <MessageSquareQuote size={14} className="shrink-0 text-emerald-500" />
                "{entry.comment}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;