import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';

interface BalloonGameProps extends BaseGameProps {
  customContent?: any;
}

interface Balloon {
  id: number;
  x: number; // percentage 5 - 90
  y: number; // in px
  speed: number;
  color: string;
  isGold: boolean;
  size: number;
}

const BALLOON_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const BalloonGame: React.FC<BalloonGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#F97316',
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

  const { activeLayout, layoutPrimary, layoutSecondary, darkPrimary, layoutGlow, isLightMode } = useActiveGamePalette({
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
  const [gameOver, setGameOver] = useState(false);
  const balloonsRef = useRef<Balloon[]>([]);
  const nextId = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setTick] = useState(0);

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

  // Balloon physics loop
  useEffect(() => {
    if (gameOver) return;
    let animId: number;
    let lastSpawn = Date.now();

    const loop = () => {
      const now = Date.now();
      const contHeight = containerRef.current?.clientHeight || 440;

      // Spawn every 450ms
      if (now - lastSpawn > 450) {
        const isGold = Math.random() < 0.2;
        balloonsRef.current.push({
          id: nextId.current++,
          x: 10 + Math.random() * 80,
          y: contHeight + 20, // starts just below bottom
          speed: 2.5 + Math.random() * 2.5,
          color: isGold ? '#F59E0B' : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
          isGold,
          size: isGold ? 72 : 88,
        });
        lastSpawn = now;
      }

      // Update positions
      balloonsRef.current = balloonsRef.current
        .map((b) => ({ ...b, y: b.y - b.speed }))
        .filter((b) => b.y > -100);

      setTick(now);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver]);

  const popBalloon = (id: number, isGold: boolean) => {
    sound.playClick();
    if (isGold) {
      sound.playSuccess();
      setScore((s) => s + 250);
    } else {
      setScore((s) => s + 100);
    }
    balloonsRef.current = balloonsRef.current.filter((b) => b.id !== id);
  };

  const restart = () => {
    balloonsRef.current = [];
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
  };

  return (
    <GameContainer
      title="Estoura Balões"
      category="Casual"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={layoutPrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
      gameLayout={activeLayout}
      palette={palette}
      layoutColorHue={layoutColorHue}
    >
      <div
        ref={containerRef}
        style={{ borderColor: `${layoutPrimary}44` }}
        className="relative w-full max-w-4xl lg:max-w-5xl flex-1 max-h-[78vh] min-h-[480px] sm:min-h-[560px] my-auto bg-slate-900/80 backdrop-blur-xl rounded-3xl border-4 overflow-hidden select-none touch-none shadow-2xl animate-in fade-in duration-300"
      >
        <div 
          style={{ borderColor: `${layoutPrimary}55`, color: layoutPrimary }}
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-black/70 border-2 text-sm sm:text-lg font-black pointer-events-none z-10 shadow-2xl"
        >
          Toque para estourar os balões! Balões dourados valem mais! 🎈
        </div>

        {/* Floating Balloons */}
        {balloonsRef.current.map((b) => (
          <button
            key={b.id}
            onPointerDown={(e) => {
              e.preventDefault();
              popBalloon(b.id, b.isGold);
            }}
            style={{
              left: `${b.x}%`,
              top: `${b.y}px`,
              width: `${b.size}px`,
              height: `${b.size * 1.25}px`,
              backgroundColor: b.color,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-2xl active:scale-125 border-4 border-white/40 flex items-center justify-center font-black text-white transition-transform cursor-pointer"
          >
            {b.isGold && <span className="text-xl sm:text-2xl drop-shadow-md">★</span>}
          </button>
        ))}
      </div>
    </GameContainer>
  );
};
