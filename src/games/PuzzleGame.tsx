import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

interface PuzzleGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  customContent?: any;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#059669',
  customContent,
}) => {
  // 3x3 sliding puzzle where 0 is the empty tile
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const shuffleTiles = () => {
    // Start solved and make 20 random valid moves
    let current = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    for (let i = 0; i < 24; i++) {
      const emptyIdx = current.indexOf(0);
      const validNeighbors: number[] = [];
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;

      if (row > 0) validNeighbors.push(emptyIdx - 3);
      if (row < 2) validNeighbors.push(emptyIdx + 3);
      if (col > 0) validNeighbors.push(emptyIdx - 1);
      if (col < 2) validNeighbors.push(emptyIdx + 1);

      const chosen = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      current[emptyIdx] = current[chosen];
      current[chosen] = 0;
    }
    setTiles(current);
    setMoves(0);
    setTimeLeft(90);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    shuffleTiles();
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setWon(false);
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const handleTileClick = (idx: number) => {
    if (gameOver) return;
    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;

    // Check adjacency
    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    if (!isAdjacent) return;

    sound.playClick();
    const newTiles = [...tiles];
    newTiles[emptyIdx] = newTiles[idx];
    newTiles[idx] = 0;
    setTiles(newTiles);
    setMoves((m) => m + 1);

    // Check win condition [1,2,3,4,5,6,7,8,0]
    const isSolved = newTiles.every((val, i) => (i === 8 ? val === 0 : val === i + 1));
    if (isSolved) {
      sound.playSuccess();
      const finalScore = Math.max(100, 1500 - moves * 20 + timeLeft * 10);
      setScore(finalScore);
      setWon(true);
      setGameOver(true);
    }
  };

  return (
    <GameContainer
      title="Quebra-Cabeça Rápido"
      category="Lógica"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={won}
      onRestart={shuffleTiles}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
    >
      <div className="w-full max-w-[280px] sm:max-w-sm flex flex-col items-center gap-3 my-auto">
        <div className="flex justify-between w-full text-xs font-bold text-slate-400 px-2">
          <span>Movimentos: <strong className="text-white font-mono">{moves}</strong></span>
          <span className="text-amber-400 font-bold">Ordene de 1 a 8</span>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full aspect-square p-2.5 sm:p-3 bg-slate-900 rounded-3xl border-2 border-white/15 shadow-2xl">
          {tiles.map((tile, idx) => {
            if (tile === 0) {
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/60 border border-white/5"
                />
              );
            }
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 border-2 border-emerald-400 text-white font-black text-3xl md:text-4xl shadow-lg active:scale-95 flex items-center justify-center transition-transform"
              >
                {tile}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
