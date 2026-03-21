import React from 'react';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  isSelected?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = "", isSelected = false }) => {
  const isWhite = color === 'w';
  const neonColor = isWhite ? 'text-neon-cyan' : 'text-neon-pink';
  const glowClass = isWhite ? 'neon-glow-cyan' : 'neon-glow-pink';
  const [isGlitching, setIsGlitching] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: any;
    
    const scheduleGlitch = () => {
      // Trigger glitch every 3-7 seconds
      const nextGlitchIn = Math.random() * 4000 + 3000;
      timeoutId = setTimeout(() => {
        setIsGlitching(true);
        // Glitch duration 150-300ms
        setTimeout(() => {
          setIsGlitching(false);
          scheduleGlitch();
        }, 150 + Math.random() * 150);
      }, nextGlitchIn);
    };

    scheduleGlitch();
    return () => clearTimeout(timeoutId);
  }, []);

  // Futuristic Cyber-Hologram SVGs
  const pieces: Record<PieceType, React.ReactNode> = {
    p: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
        <defs>
          <linearGradient id={`grad-p-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path d="M12 4l4 4v2l-4 4-4-4V8l4-4z" fill={`url(#grad-p-${color})`} stroke="currentColor" strokeWidth="0.5" />
        <path d="M8 16h8l1 4H7l1-4z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="12" cy="8" r="1.5" fill="white" className="animate-pulse" />
      </svg>
    ),
    r: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
        <path d="M6 4h2v4H6V4zm4 0h4v4h-4V4zm6 0h2v4h-2V4z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
        <path d="M5 8h14v4l-2 2H7l-2-2V8z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" />
        <path d="M7 14v6h10v-6H7z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <rect x="6" y="20" width="12" height="2" fill="currentColor" />
        <rect x="11" y="10" width="2" height="6" fill="white" fillOpacity="0.5" className="animate-pulse" />
      </svg>
    ),
    n: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
        <path d="M8 20V10l4-6 4 2-2 4 4 2-4 8H8z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
        <path d="M12 4l4 2-2 4 4 2-4 8" stroke="white" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
        <circle cx="13" cy="7" r="1" fill="white" className="animate-pulse" />
        <path d="M8 20h8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    b: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
        <path d="M12 3l3 3-3 3-3-3 3-3z" fill="white" fillOpacity="0.8" stroke="currentColor" />
        <path d="M9 10l3-4 3 4v10H9V10z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <path d="M7 20h10" stroke="currentColor" strokeWidth="2" />
        <rect x="11.5" y="10" width="1" height="8" fill="white" fillOpacity="0.4" />
      </svg>
    ),
    q: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
        <circle cx="12" cy="4" r="2" fill="white" fillOpacity="0.9" stroke="currentColor" />
        <path d="M5 10l3-4 4 4 4-4 3 4-2 10H7L5 10z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
        <path d="M12 8v8" stroke="white" strokeWidth="0.5" strokeDasharray="1 1" />
        <path d="M6 20h12" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" fill="white" className="animate-pulse" />
      </svg>
    ),
    k: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
        <path d="M11 2h2v4h-2V2zM9 4h6v2H9V4z" fill="white" stroke="currentColor" />
        <path d="M8 8l4-2 4 2v12H8V8z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
        <path d="M7 20h10" stroke="currentColor" strokeWidth="2" />
        <rect x="11.5" y="8" width="1" height="10" fill="white" fillOpacity="0.5" />
        <circle cx="12" cy="10" r="2" stroke="white" strokeWidth="0.5" className="animate-pulse" />
      </svg>
    ),
  };

  return (
    <div className={`
      relative w-full h-full p-0.5 sm:p-1.5 flex items-center justify-center
      ${neonColor} ${glowClass} ${className} 
      transition-all duration-500
      ${isSelected ? 'scale-125 -translate-y-4 brightness-120' : 'animate-float'}
      hologram-flicker ${isGlitching ? 'glitch-effect' : ''}
    `}>
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {pieces[type]}
      </div>
      
      {/* Base Shadow / Projection */}
      <div className={`absolute bottom-0 w-2/3 h-1 bg-current opacity-20 blur-sm rounded-full transition-all duration-500`} />
    </div>
  );
};

export default ChessPiece;
