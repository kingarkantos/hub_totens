import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';

interface CatcherGameProps extends BaseGameProps {
  customContent?: any;
}

interface FallingItem {
  id: number;
  x: number; // percentage 5 - 90
  y: number; // in px
  speed: number;
  type: 'gift' | 'star' | 'hazard';
}

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const CatcherGame: React.FC<CatcherGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#7C3AED',
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

  const [basketX, setBasketX] = useState(50); // percentage 10 - 90
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [gameOver, setGameOver] = useState(false);
  const itemsRef = useRef<FallingItem[]>([]);
  const nextId = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setRenderTrigger] = useState(0);

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

  // Touch Drag Controller
  const handleTouchMove = (clientX: number) => {
    if (!containerRef.current || gameOver) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(8, Math.min(92, relativeX));
    setBasketX(clamped);
  };

  // Game Loop
  useEffect(() => {
    if (gameOver) return;
    let animId: number;
    let lastSpawn = Date.now();

    const loop = () => {
      const now = Date.now();
      // Spawn item every 650ms
      if (now - lastSpawn > 650) {
        const types: ('gift' | 'star' | 'hazard')[] = ['gift', 'gift', 'star', 'hazard'];
        const type = types[Math.floor(Math.random() * types.length)];
        itemsRef.current.push({
          id: nextId.current++,
          x: 8 + Math.random() * 84,
          y: 0,
          speed: 3.5 + Math.random() * 3,
          type,
        });
        lastSpawn = now;
      }

      // Update positions & collisions
      const currentItems = [...itemsRef.current];
      const remainingItems: FallingItem[] = [];
      const contHeight = containerRef.current?.clientHeight || 440;
      const targetY = contHeight - 65;

      currentItems.forEach((item) => {
        const newY = item.y + item.speed;

        // Check collision with basket near bottom
        if (newY >= targetY - 25 && newY <= targetY + 25) {
          const distance = Math.abs(item.x - basketX);
          if (distance < 13) {
            // Collision!
            if (item.type === 'gift') {
              sound.playClick();
              setScore((s) => s + 150);
            } else if (item.type === 'star') {
              sound.playSuccess();
              setScore((s) => s + 300);
            } else {
              sound.playError();
              setScore((s) => Math.max(0, s - 200));
            }
            return; // item caught
          }
        }

        if (newY < contHeight) {
          remainingItems.push({ ...item, y: newY });
        }
      });

      itemsRef.current = remainingItems;
      setRenderTrigger(now);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, basketX]);

  const restart = () => {
    itemsRef.current = [];
    setScore(0);
    setTimeLeft(40);
    setBasketX(50);
    setGameOver(false);
  };

  return (
    <GameContainer
      title="Chuva de Brindes"
      category="Agilidade"
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
        ref={containerRef}
        onPointerMove={(e) => handleTouchMove(e.clientX)}
        onPointerDown={(e) => handleTouchMove(e.clientX)}
        style={{ borderColor: `${layoutPrimary}44` }}
        className="relative w-full max-w-4xl lg:max-w-5xl flex-1 max-h-[78vh] min-h-[480px] sm:min-h-[560px] my-auto bg-slate-900/80 backdrop-blur-xl rounded-3xl border-4 overflow-hidden select-none touch-none shadow-2xl animate-in fade-in duration-300"
      >
        <div 
          style={{ borderColor: `${layoutPrimary}55`, color: layoutPrimary }}
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-black/70 border-2 text-sm sm:text-lg font-black pointer-events-none z-10 shadow-2xl"
        >
          Arraste o veículo para coletar os brindes! 🎁
        </div>

        {/* Falling items */}
        {itemsRef.current.map((item) => (
          <div
            key={item.id}
            style={{
              left: `${item.x}%`,
              top: `${item.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute text-5xl sm:text-6xl pointer-events-none transition-transform drop-shadow-xl"
          >
            {item.type === 'gift' ? '🎁' : item.type === 'star' ? '⭐' : '💣'}
          </div>
        ))}

        {/* Player Basket / Car */}
        <div
          style={{
            left: `${basketX}%`,
            bottom: '24px',
            transform: 'translateX(-50%)',
          }}
          className="absolute flex flex-col items-center pointer-events-none transition-all duration-75"
        >
          <div 
            style={{
              background: `linear-gradient(to right, ${layoutPrimary}, ${layoutSecondary})`,
              boxShadow: `0 0 25px ${layoutGlow}`,
              borderColor: `${darkPrimary}88`,
            }}
            className="px-6 sm:px-8 py-3 rounded-2xl sm:rounded-3xl text-white font-black text-sm sm:text-lg border-4 shadow-2xl flex items-center gap-3"
          >
            <span className="text-2xl sm:text-3xl">🏎️</span>
            <span>COLETOR</span>
          </div>
          <div 
            style={{ backgroundColor: `${layoutPrimary}66` }}
            className="w-28 h-5 rounded-full blur-md mt-1" 
          />
        </div>
      </div>
    </GameContainer>
  );
};
