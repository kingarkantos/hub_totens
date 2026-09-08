import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Lock, Unlock } from 'lucide-react';

interface SafeGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  customContent?: any;
}

export const SafeGame: React.FC<SafeGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#D97706',
  customContent,
}) => {
  const [targetDigits, setTargetDigits] = useState<number[]>([3, 7, 5]);
  const [currentDials, setCurrentDials] = useState<number[]>([0, 0, 0]);
  const [timeLeft, setTimeLeft] = useState(40);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const initGame = () => {
    const d1 = Math.floor(Math.random() * 9) + 1;
    const d2 = Math.floor(Math.random() * 9) + 1;
    const d3 = Math.floor(Math.random() * 9) + 1;
    setTargetDigits([d1, d2, d3]);
    setCurrentDials([0, 0, 0]);
    setTimeLeft(40);
    setScore(0);
    setGameOver(false);
    setUnlocked(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const changeDial = (index: number, delta: number) => {
    sound.playClick();
    setCurrentDials((prev) => {
      const next = [...prev];
      next[index] = (next[index] + delta + 10) % 10;
      return next;
    });
  };

  const testUnlock = () => {
    const match =
      currentDials[0] === targetDigits[0] &&
      currentDials[1] === targetDigits[1] &&
      currentDials[2] === targetDigits[2];

    if (match) {
      sound.playSuccess();
      const finalScore = 600 + timeLeft * 15;
      setScore(finalScore);
      setUnlocked(true);
      setGameOver(true);
    } else {
      sound.playError();
    }
  };

  const getHint = (index: number) => {
    const curr = currentDials[index];
    const target = targetDigits[index];
    if (curr === target) return { text: '✓ CORRETO', color: 'text-emerald-400' };
    if (curr < target) return { text: '▲ MAIOR', color: 'text-amber-400' };
    return { text: '▼ MENOR', color: 'text-rose-400' };
  };

  return (
    <GameContainer
      title="Desafio do Cofre"
      category="Mistério"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={unlocked}
      onRestart={initGame}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-3 sm:gap-4 my-auto">
        {/* Safe Vault Graphic */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 p-4 rounded-full bg-slate-900 border-4 border-amber-500 shadow-2xl flex items-center justify-center">
          {unlocked ? (
            <Unlock className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-9 h-9 sm:w-10 sm:h-10 text-amber-400" />
          )}
        </div>

        <p className="text-center text-[11px] sm:text-xs font-bold text-slate-400">
          Ajuste os 3 discos numéricos usando as dicas e destranque o cofre! 🔐
        </p>

        {/* 3 Dials Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
          {[0, 1, 2].map((idx) => {
            const hint = getHint(idx);
            return (
              <div
                key={idx}
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border-2 border-white/15"
              >
                <button
                  onClick={() => changeDial(idx, 1)}
                  className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-bold text-white mb-1.5"
                >
                  ▲
                </button>

                <div className="w-13 h-16 sm:w-15 sm:h-18 rounded-xl bg-slate-950 border-2 border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-mono font-black text-amber-400 shadow-inner">
                  {currentDials[idx]}
                </div>

                <button
                  onClick={() => changeDial(idx, -1)}
                  className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-bold text-white mt-1.5"
                >
                  ▼
                </button>

                <span className={`text-[10px] font-black mt-1.5 ${hint.color}`}>
                  {hint.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Unlock Button */}
        <button
          onClick={testUnlock}
          style={{ backgroundColor: themePrimary }}
          className="w-full py-3 sm:py-3.5 px-6 rounded-2xl text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2"
        >
          <Unlock className="w-5 h-5" />
          <span>DESTRANCAR COFRE</span>
        </button>
      </div>
    </GameContainer>
  );
};
