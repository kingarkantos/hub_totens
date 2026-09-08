import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

interface BalloonGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
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

export const BalloonGame: React.FC<BalloonGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#F97316',
  customContent,
}) => {
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
          size: isGold ? 48 : 58,
        });
        lastSpawn = now;
      }

      // Update positions
      balloonsRef.current = balloonsRef.current
        .map((b) => ({ ...b, y: b.y - b.speed }))
        .filter((b) => b.y > -80);

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
      themePrimary={themePrimary}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-md h-[440px] max-h-[62vh] min-h-[320px] my-auto bg-slate-900/70 rounded-3xl border-2 border-white/10 overflow-hidden select-none touch-none"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 pointer-events-none">
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
            className="absolute rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-lg active:scale-125 border-2 border-white/30 flex items-center justify-center font-bold text-white transition-transform cursor-pointer"
          >
            {b.isGold && <span className="text-xs">★</span>}
          </button>
        ))}
      </div>
    </GameContainer>
  );
};
