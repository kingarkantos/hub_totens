import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Lock, Unlock } from 'lucide-react';

import { BaseGameProps } from '../types';

interface SafeGameProps extends BaseGameProps {
  customContent?: any;
}

export const SafeGame: React.FC<SafeGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#D97706',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
  isLight,
  themeMode,
  gameLayout,
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
      theme={theme}
      isLight={isLight}
      themeMode={themeMode}
      gameLayout={gameLayout}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl flex-1 flex flex-col items-center justify-between py-4 sm:py-8 px-2 sm:px-6 my-auto gap-6 sm:gap-8 select-none animate-in fade-in duration-300">
        {/* Safe Vault Graphic */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 p-5 sm:p-7 rounded-full bg-slate-900/90 border-4 border-amber-400 shadow-2xl flex items-center justify-center backdrop-blur-xl">
          {unlocked ? (
            <Unlock className="w-14 h-14 sm:w-18 sm:h-18 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-14 h-14 sm:w-18 sm:h-18 text-amber-400" />
          )}
        </div>

        <p className="text-center text-sm sm:text-xl font-black text-slate-200">
          Ajuste os 3 discos numéricos usando as dicas e destranque o cofre! 🔐
        </p>

        {/* 3 Dials Grid */}
        <div className="grid grid-cols-3 gap-3.5 sm:gap-6 w-full">
          {[0, 1, 2].map((idx) => {
            const hint = getHint(idx);
            return (
              <div
                key={idx}
                className="flex flex-col items-center p-4 sm:p-6 rounded-3xl bg-slate-900/85 border-2 sm:border-4 border-white/20 backdrop-blur-xl shadow-2xl"
              >
                <button
                  onClick={() => changeDial(idx, 1)}
                  className="w-full py-4 sm:py-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-2xl sm:text-3xl font-black text-white mb-3 transition-transform"
                >
                  ▲
                </button>

                <div className="w-22 h-26 sm:w-30 sm:h-36 rounded-2xl sm:rounded-3xl bg-slate-950 border-2 sm:border-4 border-white/25 flex items-center justify-center text-5xl sm:text-7xl md:text-8xl font-mono font-black text-amber-400 shadow-inner">
                  {currentDials[idx]}
                </div>

                <button
                  onClick={() => changeDial(idx, -1)}
                  className="w-full py-4 sm:py-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-2xl sm:text-3xl font-black text-white mt-3 transition-transform"
                >
                  ▼
                </button>

                <span className={`text-xs sm:text-base font-black mt-3 text-center ${hint.color}`}>
                  {hint.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Large Unlock Button */}
        <button
          onClick={testUnlock}
          style={{ backgroundColor: themePrimary }}
          className="w-full py-6 sm:py-8 px-8 rounded-3xl text-white font-black text-xl sm:text-3xl uppercase tracking-wider shadow-2xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-4 border-4 border-white/20"
        >
          <Unlock className="w-8 h-8 sm:w-10 sm:h-10" />
          <span>DESTRANCAR COFRE</span>
        </button>
      </div>
    </GameContainer>
  );
};
