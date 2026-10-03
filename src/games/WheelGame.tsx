import React, { useRef, useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, CheckCircle2, Sparkles, Gift } from 'lucide-react';

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

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const WheelGame: React.FC<WheelGameProps> = (props) => {
  const {
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

  const PRIZES = customContent && customContent.length >= 3 ? customContent : DEFAULT_PRIZES;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wonPrize, setWonPrize] = useState<(typeof PRIZES)[0] | null>(null);

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
    ctx.strokeStyle = layoutPrimary;
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
      ctx.font = 'bold 18px Outfit, Inter, sans-serif';
      ctx.shadowColor = '#000000aa';
      ctx.shadowBlur = 4;
      ctx.fillText(PRIZES[i].label, radius - 24, 6);
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
    ctx.strokeStyle = layoutPrimary;
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
        sound.playFanfare();
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.55 },
          colors: [selected.color, '#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#FFFFFF'],
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const restart = () => {
    setGameOver(false);
    setWonPrize(null);
    drawWheel(currentAngle);
  };

  return (
    <GameContainer
      title="Roleta Premiada"
      category="Sorte"
      score={0}
      hideScore={true}
      prizeWon={wonPrize ? { label: wonPrize.label, color: wonPrize.color } : undefined}
      gameOver={gameOver}
      gameWon={!!wonPrize}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, 1)}
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
      <div className="flex flex-col items-center justify-between gap-6 sm:gap-10 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl my-auto py-4 sm:py-8 px-2 sm:px-6 select-none animate-in fade-in duration-300">
        {/* Pointer indicator */}
        <div className="relative flex flex-col items-center">
          <div 
            style={{ borderTopColor: wonPrize?.color || layoutPrimary }}
            className={`w-0 h-0 border-x-[20px] sm:border-x-[26px] border-x-transparent border-t-[34px] sm:border-t-[44px] drop-shadow-2xl z-20 -mb-6 sm:-mb-8 transition-all duration-300 ${
              wonPrize ? 'scale-125 animate-bounce' : ''
            }`} 
          />
          
          <div 
            style={{ borderColor: wonPrize ? (wonPrize.color || layoutPrimary) : `${layoutPrimary}44` }}
            className="relative rounded-full p-3 sm:p-4 bg-slate-900/90 border-4 shadow-2xl backdrop-blur-xl transition-colors duration-500"
          >
            <canvas
              ref={canvasRef}
              width={440}
              height={440}
              className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[460px] md:h-[460px] max-w-[55vh] max-h-[55vh] cursor-pointer touch-none"
              onClick={spin}
            />
          </div>
        </div>

        {/* Prize Showcase Card when won, or Big Spin button */}
        {wonPrize ? (
          <div 
            style={{
              borderColor: wonPrize.color || layoutPrimary,
              boxShadow: `0 0 45px ${wonPrize.color || layoutPrimary}44`,
            }}
            className="w-full p-5 sm:p-7 rounded-3xl bg-slate-900/95 backdrop-blur-xl border-4 shadow-2xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-400"
          >
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs sm:text-sm tracking-widest uppercase">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin" />
              <span>PARABÉNS! VOCÊ GANHOU:</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin" />
            </div>

            <div 
              style={{ color: wonPrize.color || '#F59E0B' }}
              className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            >
              {wonPrize.label}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-bold text-center">
              Apresente esta tela no ponto de atendimento para resgatar seu brinde!
            </p>

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                type="button"
                onClick={restart}
                className="flex-1 py-4 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm sm:text-base border-2 border-slate-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span>Girar Novamente</span>
              </button>

              {rankingEnabled && onSubmitScore ? (
                <button
                  type="button"
                  onClick={() => setGameOver(true)}
                  className="flex-1 py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base border-2 border-yellow-300 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Gift className="w-5 h-5 text-slate-950" />
                  <span>Registrar Prêmio</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base border-2 border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Concluir</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            style={{ 
              backgroundColor: layoutPrimary,
              boxShadow: `0 10px 30px ${layoutGlow}`,
              borderColor: `${darkPrimary}66`,
            }}
            className="w-full py-6 sm:py-8 px-10 rounded-3xl text-white font-black text-2xl sm:text-3xl tracking-wider uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none hover:brightness-110 flex items-center justify-center gap-4 animate-totem-pulse border-4 cursor-pointer"
          >
            <span className="text-3xl">🎯</span>
            <span>{spinning ? 'GIRANDO...' : 'TOQUE PARA GIRAR!'}</span>
          </button>
        )}
      </div>
    </GameContainer>
  );
};
