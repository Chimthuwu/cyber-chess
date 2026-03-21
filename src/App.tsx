import React, { useState, useRef, useEffect } from 'react';
import ChessBoard, { ChessBoardRef } from './components/ChessBoard';
import MoveHistory from './components/MoveHistory';
import { getBestMove, Difficulty } from './services/aiService';
import { soundService } from './services/soundService';
import { Move } from 'chess.js';
import { 
  Terminal, Cpu, History, Settings, Trophy, AlertTriangle, 
  Shield, Activity, Zap, Database, User, Bot, Info,
  ChevronRight, Maximize2, Volume2, VolumeX
} from 'lucide-react';
import Background from './components/Background';

const App: React.FC = () => {
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('VETERAN');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [moves, setMoves] = useState<Move[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>('SYSTEM_READY // AWAITING_INPUT');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const boardRef = useRef<ChessBoardRef>(null);

  const handleMove = (move: Move) => {
    setMoves(prev => [...prev, move]);
    setAiExplanation(`MOVE_REGISTERED: ${move.san} // ANALYZING_REACTION`);
    if (!isMuted) soundService.playMove();
  };

  const handleGameOver = (result: string) => {
    setGameOver(result);
    setAiExplanation(`CRITICAL_TERMINATION: ${result.toUpperCase()}`);
    if (!isMuted) soundService.playGameOver();
  };

  useEffect(() => {
    if (isAiMode && !gameOver && boardRef.current?.getTurn() === 'b' && !isAiThinking) {
      const triggerAiMove = async () => {
        setIsAiThinking(true);
        setAiExplanation('NEURAL_PROCESSOR: CALCULATING_TRAJECTORY...');
        
        const fen = boardRef.current?.getFen() || '';
        const aiMove = await getBestMove(fen, aiDifficulty);
        
        if (aiMove) {
          boardRef.current?.makeMove(aiMove);
          setAiExplanation(`AI_CORE: ${aiMove.explanation?.toUpperCase()}`);
        }
        setIsAiThinking(false);
      };

      const timer = setTimeout(triggerAiMove, 600);
      return () => clearTimeout(timer);
    }
  }, [isAiMode, gameOver, moves.length, isAiThinking]);

  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-2 sm:p-4 font-mono selection:bg-neon-cyan selection:text-black bg-cyber-bg overflow-hidden w-full max-w-[100vw]">
      <Background />
      <div className="vignette" />
      <div className="scanlines" />
      
      {/* Top Command Bar */}
      <header className="w-full max-w-[1800px] flex justify-between items-center z-50 glass-panel px-2 py-2 md:px-6 md:py-3 neon-border-cyan relative">
        <div className="hud-bracket-tl border-neon-cyan" />
        <div className="hud-bracket-tr border-neon-cyan" />
        
        {/* Title */}
        <h1 className="text-sm sm:text-lg md:text-3xl font-black tracking-tighter text-neon-cyan italic font-display truncate mr-1 sm:mr-2">
          CYBERCHESS
        </h1>
        
        {/* Stats - Hidden on mobile */}
        <div className="hidden md:flex justify-center gap-8">
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">MOVES</span>
            <span className="text-xl font-black text-white font-display leading-none">{moves.length}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">ENGINE</span>
            <span className="text-xl font-black text-neon-orange font-display leading-none">
              {aiDifficulty === 'ROOKIE' ? 'R-01' : aiDifficulty === 'VETERAN' ? 'V-02' : 'M-03'}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">SYNC</span>
            <span className="text-xl font-black text-neon-green font-display leading-none">99.9%</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-1 sm:gap-1.5 md:gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 sm:p-1.5 md:p-3 glass-panel text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          
          <button 
            onClick={() => {
              const levels: Difficulty[] = ['ROOKIE', 'VETERAN', 'MASTER'];
              setAiDifficulty(levels[(levels.indexOf(aiDifficulty) + 1) % levels.length]);
            }}
            className="px-1.5 py-1.5 sm:px-2 md:px-4 md:py-2 glass-panel text-[7px] sm:text-[8px] md:text-[10px] font-black tracking-widest text-neon-orange neon-border-orange hover:bg-neon-orange/10 transition-all flex items-center justify-center gap-1 md:gap-2"
          >
            <Cpu size={12} className="md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">LVL: {aiDifficulty}</span>
            <span className="sm:hidden">{aiDifficulty.substring(0,3)}</span>
          </button>

          <button 
            onClick={() => setIsAiMode(!isAiMode)}
            className={`px-1.5 py-1.5 sm:px-2 md:px-4 md:py-2 glass-panel text-[7px] sm:text-[8px] md:text-[10px] font-black tracking-widest transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${isAiMode ? 'text-neon-cyan neon-border-cyan bg-neon-cyan/5' : 'text-zinc-500 border-zinc-800'}`}
          >
            <Bot size={12} className="md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">{isAiMode ? 'AI_CORE: ON' : 'AI_CORE: OFF'}</span>
            <span className="sm:hidden">{isAiMode ? 'AI: ON' : 'AI: OFF'}</span>
          </button>
          <button 
            onClick={resetGame}
            className="px-1.5 py-1.5 sm:px-2 md:px-4 md:py-2 glass-panel text-[7px] sm:text-[8px] md:text-[10px] font-black tracking-widest text-neon-pink neon-border-pink hover:bg-neon-pink/10 transition-all flex items-center justify-center gap-1 md:gap-2"
          >
            <Settings size={12} className="md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">REBOOT</span>
            <span className="sm:hidden">RBT</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1800px] flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-2 md:gap-6 items-center py-2 md:py-6 z-40 overflow-hidden">
        {/* Left Panel: BATTLE_LOG */}
        <aside className="h-full flex flex-col gap-6 hidden lg:flex">
          <section className={`glass-panel p-5 neon-border-green relative flex flex-col transition-all duration-300 ${isLogOpen ? 'flex-1' : 'h-auto'}`}>
            <div className="hud-bracket-tr border-neon-green/50" />
            <div className="hud-bracket-bl border-neon-green/50" />

            <button 
              onClick={() => setIsLogOpen(!isLogOpen)}
              className="text-[10px] font-black text-neon-green mb-4 flex items-center justify-between gap-2 uppercase tracking-[0.3em] w-full"
            >
              <span className="flex items-center gap-2">
                <History size={14} /> MOVE_LOG.EXE
              </span>
              <ChevronRight size={14} className={`transition-transform ${isLogOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {isLogOpen && (
              <div className="flex-1 overflow-hidden">
                <MoveHistory moves={moves} />
              </div>
            )}
          </section>
        </aside>

        {/* Center: The Hologrid Board */}
        <section className="flex flex-col items-center justify-center relative w-full">
          <div className="absolute -z-10 w-[1000px] h-[1000px] bg-neon-cyan/5 rounded-full blur-[150px] pointer-events-none" />
          
          <ChessBoard 
            ref={boardRef}
            onMove={handleMove}
            onGameOver={handleGameOver}
            isAiThinking={isAiThinking}
          />
        </section>
      </main>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="glass-panel p-12 neon-border-red max-w-md w-full text-center relative overflow-hidden">
            <div className="hud-bracket-tl border-neon-red" />
            <div className="hud-bracket-tr border-neon-red" />
            <div className="hud-bracket-bl border-neon-red" />
            <div className="hud-bracket-br border-neon-red" />
            
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-neon-red flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(255,0,60,0.6)]">
              <AlertTriangle className="text-white" />
            </div>
            
            <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase font-display glitch-effect">
              SYSTEM <span className="text-neon-red">BREACH</span>
            </h2>
            <p className="text-zinc-400 text-[10px] mb-8 font-bold uppercase tracking-[0.4em] text-flicker">
              {gameOver}
            </p>
            
            <div className="bg-neon-red/5 border border-neon-red/20 p-4 mb-8 rounded text-left font-mono text-[9px] text-neon-red/80 space-y-1">
              <div>{'>'} TRACE_COMPLETE: USER_IDENTIFIED</div>
              <div>{'>'} DATA_CORRUPTION: DETECTED</div>
              <div>{'>'} EMERGENCY_REBOOT: REQUIRED</div>
            </div>
            
            <button 
              onClick={resetGame}
              className="w-full py-4 bg-neon-red text-white font-black uppercase tracking-[0.3em] hover:bg-neon-red/80 transition-all shadow-[0_0_20px_rgba(255,0,60,0.3)] relative group overflow-hidden"
            >
              <span className="relative z-10">RE-ESTABLISH_LINK</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
