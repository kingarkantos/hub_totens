import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { Crosshair, Target, Award, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface BullseyeGameProps extends BaseGameProps {
  customContent?: any;
}

interface ShotImpact {
  id: number;
  x: number; // percentage
  y: number; // percentage
  points: number;
  label: string;
}

export const BullseyeGame: React.FC<BullseyeGameProps> = (props) => {
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

  const totalShots = 5;
  const [shotsLeft, setShotsLeft] = useState(totalShots);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState<ShotImpact[]>([]);
  const [lastShot, setLastShot] = useState<ShotImpact | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // Crosshair animation physics
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const animFrameRef = useRef<number | null>(null);

  // Oscillating crosshair coordinates using sin/cos with varying frequencies
  useEffect(() => {
    if (gameOver) return;

    let startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Combined sine waves for unpredictable natural aiming drift
      const x = 50 + Math.sin(elapsed * 2.2) * 28 + Math.cos(elapsed * 1.3) * 12;
      const y = 50 + Math.cos(elapsed * 2.6) * 28 + Math.sin(elapsed * 1.7) * 12;

      setCrosshairPos({
        x: Math.max(10, Math.min(90, x)),
        y: Math.max(10, Math.min(90, y)),
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameOver]);

  const handleShoot = () => {
    if (gameOver || shotsLeft <= 0) return;

    sound.playClick();

    // Distance from center (50, 50)
    const dx = crosshairPos.x - 50;
    const dy = crosshairPos.y - 50;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let points = 0;
    let label = 'Fora do Alvo';

    if (distance <= 6.5) {
      // Bullseye!
      points = 500;
      label = '🎯 BULLSEYE! Centro Perfeito';
      sound.playFanfare();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
      });
    } else if (distance <= 15) {
      points = 300;
      label = '🥇 Anel Ouro / Quase Centro!';
      sound.playSuccess();
    } else if (distance <= 26) {
      points = 180;
      label = '🥈 Anel Prata';
      sound.playSuccess();
    } else if (distance <= 38) {
      points = 100;
      label = '🥉 Anel Bronze';
      sound.playClick();
    } else {
      points = 30;
      label = 'Borda Externa';
    }

    const shotImpact: ShotImpact = {
      id: Date.now(),
      x: crosshairPos.x,
      y: crosshairPos.y,
      points,
      label,
    };

    const newShots = [...shots, shotImpact];
    setShots(newShots);
    setLastShot(shotImpact);
    setScore((s) => s + points);

    const remaining = shotsLeft - 1;
    setShotsLeft(remaining);

    if (remaining <= 0) {
      setTimeout(() => setGameOver(true), 1200);
    }
  };

  const restart = () => {
    setShotsLeft(totalShots);
    setScore(0);
    setShots([]);
    setLastShot(null);
    setGameOver(false);
  };

  return (
    <GameContainer
      title="Mira Certa"
      category="Precisão & Coordenação"
      score={score}
      gameOver={gameOver}
      gameWon={score >= 600}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      customScoreLabel="Pontos"
      correctAnswers={shots.filter((s) => s.points >= 300).length}
      totalQuestions={totalShots}
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
      <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 max-w-4xl mx-auto select-none">
        {/* Top HUD: Shots remaining */}
        <div className="w-full flex items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border"
            style={{ borderColor: `${layoutPrimary}44` }}
          >
            <Target className="w-5 h-5" style={{ color: layoutPrimary }} />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              Disparos: <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>{totalShots - shotsLeft + 1} de {totalShots}</strong>
            </span>
          </div>

          {/* Shot Bullet Indicators */}
          <div 
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border"
            style={{ borderColor: `${layoutPrimary}44` }}
          >
            {Array.from({ length: totalShots }).map((_, i) => (
              <span
                key={i}
                style={
                  i < totalShots - shotsLeft
                    ? { backgroundColor: layoutPrimary, borderColor: layoutSecondary, boxShadow: `0 0 10px ${layoutGlow}` }
                    : undefined
                }
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  i < totalShots - shotsLeft
                    ? 'shadow-sm'
                    : 'bg-white/15 border-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Central Interactive Target Board */}
        <div className="relative my-auto flex flex-col items-center w-full">
          {/* Target Container */}
          <div
            onClick={handleShoot}
            style={{ borderColor: `${layoutPrimary}66`, boxShadow: `0 0 45px ${layoutGlow}` }}
            className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border-4 bg-slate-950 shadow-2xl flex items-center justify-center cursor-crosshair overflow-hidden select-none"
          >
            {/* Outer Ring (100 pts) */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-slate-800/80 border-2 border-slate-600 flex items-center justify-center">
              {/* Bronze Ring (180 pts) */}
              <div className="absolute w-[70%] h-[70%] rounded-full bg-amber-900/60 border-2 border-amber-700 flex items-center justify-center">
                {/* Silver Ring (300 pts) */}
                <div className="absolute w-[60%] h-[60%] rounded-full bg-blue-900/60 border-2 border-blue-500 flex items-center justify-center">
                  {/* Bullseye Center (500 pts) */}
                  <div 
                    style={{
                      background: `radial-gradient(circle, ${layoutSecondary} 0%, ${layoutPrimary} 100%)`,
                      boxShadow: `0 0 30px ${layoutGlow}`
                    }}
                    className="absolute w-[35%] h-[35%] rounded-full border-2 border-yellow-300 flex items-center justify-center animate-pulse"
                  >
                    <span className="text-[10px] font-black text-white font-mono uppercase tracking-tighter">
                      500
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Shot Impacts */}
            {shots.map((shot, idx) => (
              <div
                key={shot.id}
                style={{
                  left: `${shot.x}%`,
                  top: `${shot.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute w-5 h-5 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center shadow-lg pointer-events-none z-10 animate-in zoom-in duration-150"
              >
                <span className="text-[8px] font-black text-black">{idx + 1}</span>
              </div>
            ))}

            {/* Moving Crosshair (The Scope) */}
            {!gameOver && (
              <div
                style={{
                  left: `${crosshairPos.x}%`,
                  top: `${crosshairPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute pointer-events-none z-20 transition-transform duration-75"
              >
                <div 
                  className="w-12 h-12 rounded-full border-2 shadow-[0_0_15px_#10B981] flex items-center justify-center"
                  style={{ borderColor: layoutPrimary }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <div className="absolute w-full h-[1px]" style={{ backgroundColor: layoutPrimary }} />
                  <div className="absolute h-full w-[1px]" style={{ backgroundColor: layoutPrimary }} />
                </div>
              </div>
            )}
          </div>

          {/* Last Shot Feedback */}
          {lastShot && (
            <div className="mt-4 text-center animate-in zoom-in-95 duration-200">
              <span className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1.5 drop-shadow">
                {lastShot.label} <strong className="text-amber-400 font-mono">(+{lastShot.points} pts)</strong>
              </span>
            </div>
          )}
        </div>

        {/* Big Touch Shoot Button */}
        <div className="w-full max-w-md pb-2">
          <button
            type="button"
            onClick={handleShoot}
            disabled={gameOver || shotsLeft <= 0}
            style={{
              background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
              boxShadow: `0 10px 30px ${layoutGlow}`
            }}
            className="w-full py-5 sm:py-6 px-8 rounded-2xl sm:rounded-3xl hover:opacity-95 active:scale-95 text-white font-black text-xl sm:text-2xl tracking-wider uppercase shadow-xl border-2 border-white/30 flex items-center justify-center gap-3 select-none transition-all"
          >
            <Crosshair className="w-7 h-7 animate-spin duration-3000" />
            <span>DISPARAR NO ALVO! 🎯</span>
          </button>
        </div>
      </div>
    </GameContainer>
  );
};
