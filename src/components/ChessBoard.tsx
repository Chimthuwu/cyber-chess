import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { Chess, Move, Square } from 'chess.js';
import ChessPiece from './ChessPiece';
import { soundService } from '../services/soundService';
import { motion, AnimatePresence } from 'motion/react';

interface ChessBoardProps {
  onMove?: (move: Move) => void;
  onGameOver?: (result: string) => void;
  isAiThinking?: boolean;
}

export interface ChessBoardRef {
  undo: () => void;
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => boolean;
  getFen: () => string;
  getTurn: () => 'w' | 'b';
}

const ChessBoard = forwardRef<ChessBoardRef, ChessBoardProps>(({ onMove, onGameOver, isAiThinking }, ref) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [shockwaves, setShockwaves] = useState<{ id: number; square: string; color: string }[]>([]);

  const playMoveSound = useCallback((move: Move) => {
    if (move.captured) {
      soundService.playCapture();
    } else {
      soundService.playMove();
    }
    
    if (game.inCheck() && !game.isGameOver()) {
      soundService.playCheck();
    }
  }, [game]);

  const checkGameOver = useCallback(() => {
    if (game.isGameOver()) {
      let result = '';
      if (game.isCheckmate()) result = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
      else if (game.isDraw()) result = 'Draw!';
      else if (game.isStalemate()) result = 'Stalemate!';
      else if (game.isThreefoldRepetition()) result = 'Threefold Repetition!';
      
      soundService.playGameOver();
      onGameOver?.(result);
    }
  }, [game, onGameOver]);

  const addShockwave = (square: string, color: string) => {
    const id = Date.now();
    setShockwaves(prev => [...prev, { id, square, color }]);
    setTimeout(() => {
      setShockwaves(prev => prev.filter(s => s.id !== id));
    }, 600);
  };

  const makeMove = useCallback((moveData: string | { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.move(moveData);
      if (result) {
        setGame(new Chess(game.fen()));
        playMoveSound(result);
        checkGameOver();
        onMove?.(result);
        addShockwave(result.to, result.color === 'w' ? 'var(--color-neon-cyan)' : 'var(--color-neon-pink)');
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, playMoveSound, checkGameOver, onMove]);

  useImperativeHandle(ref, () => ({
    undo: () => {
      game.undo();
      setGame(new Chess(game.fen()));
      soundService.playUndo();
    },
    makeMove,
    getFen: () => game.fen(),
    getTurn: () => game.turn(),
  }));

  const onSquareClick = (square: Square) => {
    if (game.isGameOver() || isAiThinking) return;

    if (selectedSquare === null) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      const moveSuccess = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      setSelectedSquare(null);
    }
  };

  const renderSquare = (i: number) => {
    const file = String.fromCharCode(97 + (i % 8));
    const rank = 8 - Math.floor(i / 8);
    const square = `${file}${rank}` as Square;
    const piece = game.get(square);
    const isDark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
    const isSelected = selectedSquare === square;
    
    const validMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }) : [];
    const isPossibleMove = validMoves.some(m => m.to === square);
    const isCheck = game.inCheck() && piece?.type === 'k' && piece?.color === game.turn();
    const history = game.history({ verbose: true });
    const lastMove = history[history.length - 1];
    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

    return (
      <div
        key={square}
        onClick={() => onSquareClick(square)}
        className={`
          relative flex items-center justify-center cursor-pointer transition-all duration-500
          ${isDark ? 'bg-zinc-950/60' : 'bg-zinc-900/30'}
          ${isLastMove ? 'bg-neon-orange/5' : ''}
          hover:bg-white/5 group
        `}
        style={{
          boxShadow: 'none',
        }}
      >
        {/* Hover Pulse Effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:animate-pulse transition-opacity duration-300 pointer-events-none ${isPossibleMove ? 'bg-neon-green/20' : 'bg-white/10'}`} 
             style={{ animation: 'square-pulse 2s infinite' }} />

        {/* Holographic Surface Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Square Border Glow */}
        <div className={`absolute inset-0 border transition-colors duration-500 ${isLastMove ? 'border-neon-orange/30' : 'border-white/5'}`} />
        
        {/* Animated Grid Scanlines inside square */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="w-full h-[1px] bg-neon-cyan/30 animate-[scanline_4s_linear_infinite]" style={{ animationDelay: `${Math.random() * 4}s` }} />
        </div>

        {/* Check Pulse */}
        {isCheck && (
          <div className="absolute inset-0 bg-neon-red/10 animate-pulse z-10">
            <div className="absolute inset-0 border-2 border-neon-red/50 shadow-[0_0_15px_rgba(255,0,60,0.4)]" />
          </div>
        )}

        {/* Shockwaves */}
        {shockwaves.filter(s => s.square === square).map(s => (
          <div key={s.id} className="shockwave" style={{ color: s.color }} />
        ))}

        {/* Piece */}
        <AnimatePresence mode="popLayout">
          {piece && (
            <motion.div
              key={`${piece.type}-${piece.color}-${square}`}
              initial={{ scale: 0.5, opacity: 0, z: 100 }}
              animate={{ scale: 1, opacity: 1, z: 0 }}
              exit={{ 
                scale: 1.5, 
                opacity: 0, 
                filter: 'brightness(5) blur(10px)',
                y: -40,
                rotateX: 45,
                transition: { duration: 0.6 }
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 25
              }}
              className="w-full h-full z-20 flex items-center justify-center p-1"
            >
              <ChessPiece
                type={piece.type}
                color={piece.color}
                className={`w-full h-full transition-all duration-300 ${isAiThinking && game.turn() === piece.color ? 'opacity-60 grayscale' : ''}`}
                isSelected={isSelected}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Possible Move Ring */}
        {isPossibleMove && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border border-neon-green/60 shadow-[0_0_10px_rgba(0,255,65,0.3)] animate-pulse" />
            <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-neon-green/40 rounded-full blur-sm" />
          </div>
        )}

        {/* Coordinates */}
        {file === 'a' && (
          <span className="absolute left-1 top-1 text-[7px] font-black text-zinc-700 uppercase tracking-tighter">
            {rank}
          </span>
        )}
        {rank === 1 && (
          <span className="absolute right-1 bottom-1 text-[7px] font-black text-zinc-700 uppercase tracking-tighter">
            {file}
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative p-0 group/board w-full max-w-[800px] mx-auto"
    >
      {/* Board Rails / Frame */}
      <div className="absolute inset-0 border-2 border-neon-cyan/20 rounded-lg blur-sm pointer-events-none hidden sm:block" />
      
      <div 
        ref={boardRef}
        className="grid grid-cols-8 grid-rows-8 w-full aspect-square glass-panel border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative"
        style={{
          boxShadow: `
            0 30px 60px -12px rgba(0,0,0,0.9),
            0 18px 36px -18px rgba(0,0,0,0.9),
            0 0 40px rgba(0, 243, 255, 0.05),
            inset 0 0 80px rgba(0,0,0,0.6)
          `
        }}
      >
        {Array.from({ length: 64 }).map((_, i) => renderSquare(i))}
      </div>
      
      {/* Synthwave Grid Background */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none [perspective:1000px]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:linear-gradient(to_bottom,transparent,black)]" 
             style={{ transform: 'rotateX(60deg) scale(2) translateY(20%)' }} />
      </div>

      {/* Under-board Energy Core */}
      <div className="absolute inset-0 -z-10 blur-[120px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, var(--color-neon-pink), var(--color-neon-cyan), transparent 70%)',
          transform: 'translateY(100px) scale(1.2) rotateX(28deg)'
        }}
      />
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';

export default ChessBoard;
