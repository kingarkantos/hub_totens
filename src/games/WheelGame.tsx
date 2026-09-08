import React, { useRef, useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';
import { WheelItem } from '../types/gameContent';

interface WheelGameProps extends BaseGameProps {
  customContent?: WheelItem[];
}

const DEFAULT_PRIZES: WheelItem[] = [
  { label: 'Brinde Exclusivo', score: 500, color: '#DC2626' },
  { label: '10% Desconto', score: 300, color: '#2563EB' },
  { label: 'Kit Especial', score: 800, color: '#059669' },
  { label: 'Giro Extra', score: 200, color: '#D97706' },
  { label: 'Adesivo Oficial', score: 150, color: '#7C3AED' },
  { label: 'Garrafa Térmica', score: 600, color: '#DB2777' },
  { label: 'Boné da Marca', score: 450, color: '#0D9488' },
  { label: 'Chaveiro Turbo', score: 250, color: '#EA580C' },
];

export const WheelGame: React.FC<WheelGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#DC2626',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
}) => {
  const PRIZES = customContent && customContent.length >= 3 ? customContent : DEFAULT_PRIZES;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wonPrize, setWonPrize] = useState<(typeof PRIZES)[0] | null>(null);
  const [score, setScore] = useState(0);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;
    const numSlices = PRIZES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, size, size);

    // Outer glow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    ctx.restore();

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = PRIZES[i].color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff33';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Outfit, Inter, sans-serif';
      ctx.shadowColor = '#000000aa';
      ctx.shadowBlur = 4;
      ctx.fillText(PRIZES[i].label, radius - 20, 5);
      ctx.restore();
    }

    // Outer edge light dots
    for (let i = 0; i < numSlices * 2; i++) {
      const dotAngle = angle + (i * Math.PI) / numSlices;
      const dotX = center + (radius + 4) * Math.cos(dotAngle);
      const dotY = center + (radius + 4) * Math.sin(dotAngle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#ffffff';
      ctx.fill();
    }

    // Center hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GIRE', center, center);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentAngle);
  }, [currentAngle]);

  const spin = () => {
    if (spinning || gameOver) return;
    setSpinning(true);
    sound.playEngineRev();

    // Random winner index
    const targetIndex = Math.floor(Math.random() * PRIZES.length);
    const numSlices = PRIZES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pointer is at the top: 3 * Math.PI / 2
    // Calculate final angle
    const targetSliceCenter = 3 * Math.PI / 2 - (targetIndex * sliceAngle + sliceAngle / 2);
    const extraSpins = 6 + Math.floor(Math.random() * 4); // 6 to 9 full turns
    const totalRotation = extraSpins * 2 * Math.PI + targetSliceCenter;

    const start = performance.now();
    const duration = 5000;
    const startAngle = currentAngle % (2 * Math.PI);

    let lastTickAngle = startAngle;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newAngle = startAngle + totalRotation * easeOut;

      // Tick sound on slice crossing
      if (Math.abs(newAngle - lastTickAngle) > sliceAngle * 0.7) {
        sound.playTick();
        lastTickAngle = newAngle;
      }

      setCurrentAngle(newAngle);
      drawWheel(newAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const selected = PRIZES[targetIndex];
        setWonPrize(selected);
        setScore(selected.score);
        setGameOver(true);
      }
    };

    requestAnimationFrame(animate);
  };

  const restart = () => {
    setGameOver(false);
    setWonPrize(null);
    setScore(0);
    drawWheel(currentAngle);
  };

  return (
    <GameContainer
      title="Roleta Premiada"
      category="Sorte"
      score={score}
      gameOver={gameOver}
      gameWon={true}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      customScoreLabel="Pts"
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-lg my-auto">
        {/* Pointer indicator */}
        <div className="relative flex flex-col items-center">
          <div className="w-0 h-0 border-x-[16px] sm:border-x-[20px] border-x-transparent border-t-[28px] sm:border-t-[34px] border-t-amber-400 drop-shadow-xl z-20 -mb-5 sm:-mb-6" />
          
          <div className="relative rounded-full p-2 sm:p-3 bg-slate-900/90 border-4 border-white/20 shadow-2xl backdrop-blur-md">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] max-w-[50vh] max-h-[50vh] cursor-pointer touch-none"
              onClick={spin}
            />
          </div>
        </div>

        {/* Big Spin button for totem */}
        <button
          onClick={spin}
          disabled={spinning || gameOver}
          style={{ backgroundColor: themePrimary }}
          className="w-full py-5 sm:py-6 px-8 rounded-3xl text-white font-black text-xl sm:text-2xl tracking-wider uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none hover:brightness-110 flex items-center justify-center gap-3 animate-totem-pulse border-2 border-white/20"
        >
          <span>🎯</span>
          <span>{spinning ? 'GIRANDO...' : 'TOQUE PARA GIRAR!'}</span>
        </button>

        {wonPrize && !gameOver && (
          <div className="text-center font-bold text-amber-300 text-base sm:text-lg">
            Você ganhou: <span className="text-white text-lg sm:text-xl">{wonPrize.label}</span>!
          </div>
        )}
      </div>
    </GameContainer>
  );
};
