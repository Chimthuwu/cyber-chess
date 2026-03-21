import { Chess } from 'chess.js';

export type Difficulty = 'ROOKIE' | 'VETERAN' | 'MASTER';

const pieceValues: Record<string, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const val = pieceValues[piece.type] || 0;
        totalEvaluation += piece.color === 'w' ? val : -val;
      }
    }
  }
  return totalEvaluation;
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }
  
  const moves = game.moves();
  
  if (isMaximizingPlayer) {
    let bestVal = -Infinity;
    for (const move of moves) {
      game.move(move);
      bestVal = Math.max(bestVal, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      alpha = Math.max(alpha, bestVal);
      if (beta <= alpha) break;
    }
    return bestVal;
  } else {
    let bestVal = Infinity;
    for (const move of moves) {
      game.move(move);
      bestVal = Math.min(bestVal, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      beta = Math.min(beta, bestVal);
      if (beta <= alpha) break;
    }
    return bestVal;
  }
};

export const getBestMove = async (fen: string, difficulty: Difficulty): Promise<any | null> => {
  return new Promise((resolve) => {
    // Use setTimeout to allow UI to render "thinking" state
    setTimeout(() => {
      const game = new Chess(fen);
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) {
        resolve(null);
        return;
      }

      if (difficulty === 'ROOKIE') {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        resolve({
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion,
          explanation: 'RANDOM_NODE_SELECTED',
          san: randomMove.san
        });
        return;
      }

      const depth = difficulty === 'MASTER' ? 3 : 2;
      let bestMove = null;
      const isWhite = game.turn() === 'w';
      let bestValue = isWhite ? -Infinity : Infinity;

      // Sort moves to improve alpha-beta pruning (captures first)
      moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

      for (const move of moves) {
        game.move(move);
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
        game.undo();

        if (isWhite) {
          if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
          }
        } else {
          if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
          }
        }
      }

      if (!bestMove) {
        bestMove = moves[Math.floor(Math.random() * moves.length)];
      }

      resolve({
        from: bestMove.from,
        to: bestMove.to,
        promotion: bestMove.promotion,
        explanation: `MINIMAX_D${depth}_EVAL_${bestValue}`,
        san: bestMove.san
      });
    }, 50);
  });
};
