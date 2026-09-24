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

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const TargetGame: React.FC<TargetGameProps> = (props) => {
  const {
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
    isLight,
    themeMode,
    gameLayout,
    palette,
    layoutColorHue,
  } = props;

  const { activeLayout, layoutPrimary, layoutSecondary, darkPrimary, layoutGlow, layoutAccent, isLightMode } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

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
          x: 12 + Math.random() * 76,
          y: 12 + Math.random() * 76,
          size: isBonus ? 75 : 100,
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
      sound.playClick();
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
      themePrimary={layoutPrimary}
      theme={theme}
      isLight={isLightMode}
      themeMode={themeMode}
      gameLayout={activeLayout}
      palette={palette}
      layoutColorHue={layoutColorHue}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div 
        style={{ borderColor: `${layoutPrimary}44` }}
        className="relative w-full flex-1 max-h-[78vh] min-h-[480px] sm:min-h-[560px] max-w-4xl lg:max-w-5xl my-auto bg-slate-900/80 backdrop-blur-xl rounded-3xl border-4 overflow-hidden select-none touch-none shadow-2xl animate-in fade-in duration-300"
      >
        {/* Helper prompt */}
        <div 
          style={{ borderColor: `${layoutPrimary}55`, color: layoutPrimary }}
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-black/70 border-2 text-sm sm:text-lg font-black pointer-events-none z-10 shadow-2xl"
        >
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
              ...(t.isBonus
                ? {
                    background: 'linear-gradient(to top right, #f59e0b, #fef08a)',
                    boxShadow: '0 0 25px rgba(245, 158, 11, 0.7)',
                    borderColor: '#ffffff',
                    color: '#020617',
                  }
                : {
                    background: `linear-gradient(to top right, ${layoutPrimary}, ${layoutSecondary})`,
                    boxShadow: `0 0 25px ${layoutGlow}`,
                    borderColor: '#ffffffcc',
                    color: '#ffffff',
                  }),
            }}
            className="absolute rounded-full flex items-center justify-center font-black transition-all active:scale-75 animate-totem-pulse border-4"
          >
            <span className="text-2xl sm:text-4xl">{t.isBonus ? '★' : '◎'}</span>
          </button>
        ))}
      </div>
    </GameContainer>
  );
};
