import React from 'react';
import { Move } from 'chess.js';

interface MoveHistoryProps {
  moves: Move[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border border-neon-green/30 neon-border-green p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 border-b border-neon-green/20 pb-2">
        <div className="w-2 h-2 bg-neon-green animate-pulse" />
        <h3 className="text-xs font-bold text-neon-green tracking-widest uppercase">
          // MOVE_LOG.EXE
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar">
        {moves.length === 0 ? (
          <div className="text-zinc-600 italic">WAITING FOR INITIALIZATION...</div>
        ) : (
          moves.map((move, index) => (
            <div key={index} className="flex gap-4 group">
              <span className="text-zinc-500 w-6">{(index + 1).toString().padStart(3, '0')}</span>
              <span className={move.color === 'w' ? 'text-neon-cyan' : 'text-neon-pink'}>
                {move.color === 'w' ? 'P1_WHITE' : 'P2_BLACK'}
              </span>
              <span className="text-zinc-300 font-bold">
                {move.from} → {move.to}
              </span>
              {move.captured && (
                <span className="text-neon-orange opacity-70 group-hover:opacity-100 transition-opacity">
                  [CAPTURED: {move.captured.toUpperCase()}]
                </span>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-2 border-t border-neon-green/20 text-[8px] text-zinc-500 flex justify-between">
        <span>TOTAL_MOVES: {moves.length}</span>
        <span className="animate-pulse">_CURSOR_READY</span>
      </div>
    </div>
  );
};

export default MoveHistory;
