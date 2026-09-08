import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';

interface TargetGameProps extends BaseGameProps {
  customContent?: any;
}

interface TargetItem {
  id: number;
  x: number; // percentage 10 - 90
  y: number; // percentage 10 - 90
  size: number; // in px
  isBonus: boolean;
  spawnTime: number;
}

export const TargetGame: React.FC<TargetGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#E11D48',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
}) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const nextId = useRef(1);

  // Countdown
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  // Target spawner
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTargets((prev) => {
        // limit max active targets
        const now = Date.now();
        const filtered = prev.filter((t) => now - t.spawnTime < 1800);
        if (filtered.length >= 4) return filtered;

        const isBonus = Math.random() < 0.25;
        const newTarget: TargetItem = {
          id: nextId.current++,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: isBonus ? 55 : 75,
          isBonus,
          spawnTime: now,
        };
        return [...filtered, newTarget];
      });
    }, 550);

    return () => clearInterval(interval);
  }, [gameOver]);

  const handleHit = (id: number, isBonus: boolean) => {
    sound.playClick();
    if (isBonus) {
      sound.playSuccess();
      setScore((s) => s + 250);
    } else {
      setScore((s) => s + 100);
    }
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setGameOver(false);
  };

  return (
    <GameContainer
      title="Caça aos Alvos"
      category="Reflexo"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="relative w-full flex-1 max-h-[72vh] min-h-[420px] max-w-2xl sm:max-w-3xl my-auto bg-slate-900/75 backdrop-blur-xl rounded-3xl border-2 border-white/20 overflow-hidden select-none touch-none shadow-2xl">
        {/* Helper prompt */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/60 border border-white/20 text-xs sm:text-sm font-black text-amber-300 pointer-events-none z-10 shadow-lg">
          Toque nos alvos o mais rápido possível! 🎯
        </div>

        {/* Active targets */}
        {targets.map((t) => (
          <button
            key={t.id}
            onPointerDown={(e) => {
              e.preventDefault();
              handleHit(t.id, t.isBonus);
            }}
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.size}px`,
              height: `${t.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute rounded-full flex items-center justify-center font-black transition-all active:scale-75 animate-totem-pulse ${
              t.isBonus
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 shadow-lg shadow-amber-400/50 border-4 border-white'
                : 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-lg shadow-red-600/50 border-4 border-rose-300'
            }`}
          >
            <span className="text-xl md:text-2xl">{t.isBonus ? '★' : '◎'}</span>
          </button>
        ))}
      </div>
    </GameContainer>
  );
};
