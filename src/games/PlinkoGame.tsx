import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { Trophy, Sparkles, RotateCcw, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useActiveGamePalette } from '../context/GameLayoutContext';
import { PlinkoCustomConfig, PlinkoSlotItem } from '../types/gameContent';

interface PlinkoGameProps extends BaseGameProps {
  customContent?: PlinkoCustomConfig;
}

interface Pin {
  x: number;
  y: number;
  radius: number;
  glowTime: number; // timestamp until which pin glows
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  settled: boolean;
  targetSlot: number | null;
}

const DEFAULT_SLOTS: PlinkoSlotItem[] = [
  { id: 0, label: '100 pts', points: 100, color: '#3B82F6' },
  { id: 1, label: '250 pts', points: 250, color: '#10B981' },
  { id: 2, label: '500 pts', points: 500, color: '#F59E0B' },
  { id: 3, label: '1000 pts', points: 1000, color: '#DC2626' },
  { id: 4, label: '250 pts', points: 250, color: '#10B981' },
  { id: 5, label: '100 pts', points: 100, color: '#3B82F6' },
];

export const PlinkoGame: React.FC<PlinkoGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#0284C7',
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
    customContent,
  } = props;

  const {
    activeLayout,
    layoutDef,
    layoutPrimary,
    layoutSecondary,
    darkPrimary,
    layoutGlow,
    layoutAccent,
    isLightMode,
  } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

  const totalBalls = customContent?.ballsCount && customContent.ballsCount > 0 ? customContent.ballsCount : 3;
  const slots: PlinkoSlotItem[] = customContent?.slots && customContent.slots.length >= 3 ? customContent.slots : DEFAULT_SLOTS;
  const gameTitle = customContent?.title || 'Plinko da Sorte';

  const [ballsRemaining, setBallsRemaining] = useState<number>(totalBalls);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [ballHistory, setBallHistory] = useState<number[]>([]);
  const [dropperX, setDropperX] = useState<number>(0.5); // 0 to 1 horizontal ratio
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [activeSlotHighlight, setActiveSlotHighlight] = useState<number | null>(null);
  const [floatingToast, setFloatingToast] = useState<{ text: string; x: number; y: number } | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mutable state for the 60fps canvas loop
  const stateRef = useRef({
    ball: null as Ball | null,
    pins: [] as Pin[],
    dropperX: 0.5,
    isDropping: false,
    ballsRemaining: totalBalls,
    score: 0,
    history: [] as number[],
    slots: slots,
    gameOver: false,
    boardWidth: 640,
    boardHeight: 900,
    theme: {
      layoutPrimary,
      layoutSecondary,
      darkPrimary,
      layoutGlow,
      layoutAccent: layoutAccent || '#F59E0B',
      isLightMode,
    },
  });

  // Sync slots and balls config
  useEffect(() => {
    stateRef.current.slots = slots;
  }, [slots]);

  useEffect(() => {
    stateRef.current.dropperX = dropperX;
  }, [dropperX]);

  // Keep theme in stateRef up-to-date
  useEffect(() => {
    stateRef.current.theme = {
      layoutPrimary,
      layoutSecondary,
      darkPrimary,
      layoutGlow,
      layoutAccent: layoutAccent || '#F59E0B',
      isLightMode,
    };
  }, [layoutPrimary, layoutSecondary, darkPrimary, layoutGlow, layoutAccent, isLightMode]);

  // Drop Ball Action
  const dropBall = useCallback(() => {
    if (stateRef.current.isDropping || stateRef.current.ballsRemaining <= 0 || stateRef.current.gameOver) return;

    sound.playClick();
    setIsDropping(true);
    stateRef.current.isDropping = true;

    const width = stateRef.current.boardWidth;
    const startX = width * Math.max(0.10, Math.min(0.90, stateRef.current.dropperX));
    const startY = 50;

    stateRef.current.ball = {
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 2.0,
      vy: 1.5,
      radius: 13,
      settled: false,
      targetSlot: null,
    };
  }, []);

  // Main Canvas & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate Pins Grid covering wide area
    const generatePins = (w: number, h: number): Pin[] => {
      const pinsList: Pin[] = [];
      const rows = 10;
      const startY = 95;
      const slotAreaY = h - 120;
      const rowSpacing = (slotAreaY - startY) / (rows - 1);
      const pinRadius = 5.5;

      for (let r = 0; r < rows; r++) {
        const pinCount = 3 + r;
        const py = startY + r * rowSpacing;
        // Widen row span: 42% at top to 92% at bottom for maximum playable width
        const rowWidth = w * (0.42 + (r / (rows - 1)) * 0.50);
        const startX = (w - rowWidth) / 2;
        const spacingX = rowWidth / (pinCount - 1);

        for (let c = 0; c < pinCount; c++) {
          const px = startX + c * spacingX;
          pinsList.push({
            x: px,
            y: py,
            radius: pinRadius,
            glowTime: 0,
          });
        }
      }
      return pinsList;
    };

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const width = canvas.width;
      const height = canvas.height;
      stateRef.current.boardWidth = width;
      stateRef.current.boardHeight = height;

      if (stateRef.current.pins.length === 0) {
        stateRef.current.pins = generatePins(width, height);
      }

      const ball = stateRef.current.ball;
      const pins = stateRef.current.pins;
      const currentSlots = stateRef.current.slots;
      const slotAreaY = height - 120;
      const currentTheme = stateRef.current.theme;

      // ==========================================
      // PHYSICS UPDATE
      // ==========================================
      if (ball && !ball.settled) {
        // Gravity & Air Resistance
        const gravity = 560;
        ball.vy += gravity * dt;
        ball.vx *= 0.995;

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Side Walls Collision Reflection
        if (ball.x - ball.radius < 10) {
          ball.x = 10 + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.75 + 15;
        }
        if (ball.x + ball.radius > width - 10) {
          ball.x = width - 10 - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.75 - 15;
        }

        // Pin Collisions
        pins.forEach((pin) => {
          const dx = ball.x - pin.x;
          const dy = ball.y - pin.y;
          const dist = Math.hypot(dx, dy);
          const minDist = ball.radius + pin.radius;

          if (dist < minDist) {
            sound.playTick();
            pin.glowTime = now + 220;

            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            // Reposition ball outside pin
            ball.x = pin.x + nx * minDist;
            ball.y = pin.y + ny * minDist;

            // Velocity reflection
            const kx = ball.vx * nx + ball.vy * ny;
            if (kx < 0) {
              const elasticity = 0.65;
              ball.vx -= (1 + elasticity) * kx * nx;
              ball.vy -= (1 + elasticity) * kx * ny;

              // Subtle horizontal impulse to keep movement lively
              const nudge = (Math.random() - 0.5) * 45;
              ball.vx += nudge;
            }
          }
        });

        // Check Slot Landing at Bottom
        if (ball.y + ball.radius >= slotAreaY + 10) {
          const slotCount = currentSlots.length;
          const slotWidth = width / slotCount;
          const slotIdx = Math.max(0, Math.min(slotCount - 1, Math.floor(ball.x / slotWidth)));
          const landedSlot = currentSlots[slotIdx];

          ball.settled = true;
          ball.targetSlot = slotIdx;

          // Sound & Score
          sound.playSuccess();
          const earned = landedSlot.points;
          stateRef.current.score += earned;
          stateRef.current.history.push(earned);
          stateRef.current.ballsRemaining -= 1;

          setCurrentScore(stateRef.current.score);
          setBallHistory([...stateRef.current.history]);
          setBallsRemaining(stateRef.current.ballsRemaining);
          setActiveSlotHighlight(slotIdx);

          // Confetti & Toast
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { x: (slotIdx + 0.5) / currentSlots.length, y: 0.88 },
          });

          setFloatingToast({
            text: `+${earned} pts!`,
            x: ball.x,
            y: slotAreaY - 20,
          });

          setTimeout(() => {
            setActiveSlotHighlight(null);
            setFloatingToast(null);
            stateRef.current.ball = null;
            stateRef.current.isDropping = false;
            setIsDropping(false);

            // Check if match ended
            if (stateRef.current.ballsRemaining <= 0) {
              stateRef.current.gameOver = true;
              setGameOver(true);
              setGameWon(true);
              sound.playFanfare();
            }
          }, 1100);
        }
      }

      // ==========================================
      // CANVAS RENDERING (Theme-based design)
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // Background Gradient based on Active Theme
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (currentTheme.isLightMode) {
        bgGrad.addColorStop(0, '#FFFFFF');
        bgGrad.addColorStop(0.5, '#F8FAFC');
        bgGrad.addColorStop(1, '#E2E8F0');
      } else {
        bgGrad.addColorStop(0, '#0B0F19');
        bgGrad.addColorStop(0.4, currentTheme.darkPrimary || '#111827');
        bgGrad.addColorStop(1, '#050811');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient Center Glow using Theme Primary & Secondary
      const ambientGlow = ctx.createRadialGradient(
        width / 2, height * 0.42, 20,
        width / 2, height * 0.42, width * 0.65
      );
      ambientGlow.addColorStop(0, `${currentTheme.layoutPrimary}33`);
      ambientGlow.addColorStop(0.6, `${currentTheme.layoutSecondary}15`);
      ambientGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Dots Pattern
      ctx.fillStyle = currentTheme.isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)';
      for (let bx = 20; bx < width; bx += 40) {
        for (let by = 20; by < height; by += 40) {
          ctx.beginPath();
          ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top Dropper Indicator Track
      const trackY = 50;
      ctx.strokeStyle = currentTheme.isLightMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.10, trackY);
      ctx.lineTo(width * 0.90, trackY);
      ctx.stroke();

      // Dropper Cursor Handle
      const dropCurX = width * Math.max(0.10, Math.min(0.90, stateRef.current.dropperX));
      ctx.fillStyle = currentTheme.layoutPrimary;
      ctx.shadowColor = currentTheme.layoutGlow;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(dropCurX, trackY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner shine on dropper
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(dropCurX - 4, trackY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pins
      pins.forEach((pin) => {
        const isGlowing = now < pin.glowTime;

        if (isGlowing) {
          ctx.fillStyle = currentTheme.layoutAccent;
          ctx.shadowColor = currentTheme.layoutAccent;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, pin.radius + 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Pin soft shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.arc(pin.x + 1.5, pin.y + 1.5, pin.radius, 0, Math.PI * 2);
          ctx.fill();

          // Pin Body
          ctx.fillStyle = currentTheme.isLightMode ? '#64748B' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
          ctx.fill();

          // Highlight dot on pin
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pin.x - 1.2, pin.y - 1.2, pin.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Bottom Slots (Canaletas)
      const slotCount = currentSlots.length;
      const slotW = width / slotCount;
      const slotH = height - slotAreaY;

      // Curved Divider Bridge right above slots
      const bridgeGrad = ctx.createLinearGradient(0, slotAreaY - 8, width, slotAreaY + 8);
      bridgeGrad.addColorStop(0, currentTheme.layoutPrimary);
      bridgeGrad.addColorStop(1, currentTheme.layoutSecondary);
      ctx.fillStyle = bridgeGrad;
      ctx.beginPath();
      ctx.ellipse(width / 2, slotAreaY - 6, width * 0.48, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < slotCount; s++) {
        const sItem = currentSlots[s];
        const sx = s * slotW;
        const isHit = activeSlotHighlight === s;

        // Slot Background: theme-based alternating cards or configured color
        if (isHit) {
          ctx.fillStyle = currentTheme.layoutAccent;
        } else if (sItem.color) {
          ctx.fillStyle = sItem.color;
        } else {
          const isEven = s % 2 === 0;
          if (currentTheme.isLightMode) {
            ctx.fillStyle = isEven ? '#FFFFFF' : '#F1F5F9';
          } else {
            ctx.fillStyle = isEven ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)';
          }
        }

        ctx.fillRect(sx, slotAreaY, slotW - 2, slotH);

        // Slot Divider Pegs
        ctx.fillStyle = currentTheme.isLightMode ? '#CBD5E1' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sx, slotAreaY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Slot Vertical Text
        ctx.save();
        ctx.translate(sx + slotW / 2 - 1, slotAreaY + slotH / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = isHit
          ? '#FFFFFF'
          : (sItem.color || !currentTheme.isLightMode)
          ? '#FFFFFF'
          : '#0F172A';
        ctx.font = 'bold 15px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sItem.label.toUpperCase(), 0, 0);
        ctx.restore();
      }

      // Rightmost peg
      ctx.fillStyle = currentTheme.isLightMode ? '#CBD5E1' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(width, slotAreaY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw Falling Ball
      if (ball) {
        // Ball Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(ball.x + 3, ball.y + 4, ball.radius, ball.radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vibrant Glossy Red Ball
        const ballGrad = ctx.createRadialGradient(
          ball.x - 4, ball.y - 4, 2,
          ball.x, ball.y, ball.radius
        );
        ballGrad.addColorStop(0, '#FF8A8A');
        ballGrad.addColorStop(0.4, '#EF4444');
        ballGrad.addColorStop(1, '#991B1B');
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Specular Reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(ball.x - 4, ball.y - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Handle Dragging Dropper on Board
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (stateRef.current.isDropping) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relX = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0.10, Math.min(0.90, relX));
    setDropperX(clamped);
    stateRef.current.dropperX = clamped;
  };

  const restart = () => {
    setIsDropping(false);
    setGameOver(false);
    setGameWon(false);
    setCurrentScore(0);
    setBallHistory([]);
    setBallsRemaining(totalBalls);
    setActiveSlotHighlight(null);
    setFloatingToast(null);

    stateRef.current.ball = null;
    stateRef.current.isDropping = false;
    stateRef.current.gameOver = false;
    stateRef.current.score = 0;
    stateRef.current.history = [];
    stateRef.current.ballsRemaining = totalBalls;
  };

  return (
    <GameContainer
      title={gameTitle}
      category="Sorte & Recompensas"
      score={currentScore}
      timeRemaining={0}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, currentScore)}
      correctAnswers={ballHistory.length}
      customScoreLabel="Pontos"
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
      <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none p-2 sm:p-3">
        {/* Top Header Bar: Status & Ball Indicators */}
        <div className="w-full max-w-xl md:max-w-2xl flex items-center justify-between px-3 py-1.5 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-300 uppercase">
              Bolinhas:
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalBalls }).map((_, idx) => {
                const isAvailable = idx < ballsRemaining;
                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      isAvailable
                        ? 'bg-red-500 border-white shadow-lg scale-105'
                        : 'bg-transparent border-white/30 scale-95 opacity-50'
                    }`}
                  >
                    {isAvailable && (
                      <div className="w-2 h-2 rounded-full bg-white/70" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="px-3 py-1 rounded-xl font-bold text-xs sm:text-sm border shadow"
            style={{
              borderColor: `${layoutPrimary}55`,
              backgroundColor: isLightMode ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
              color: isLightMode ? '#0F172A' : '#FFFFFF',
            }}
          >
            {ballsRemaining} restantes
          </div>
        </div>

        {/* Large Playable Canvas Board */}
        <div
          className="relative w-full max-w-xl md:max-w-2xl flex-1 min-h-[460px] max-h-[76vh] aspect-[9/13.5] sm:aspect-[9/13] rounded-3xl overflow-hidden shadow-2xl border-4 touch-none flex items-center justify-center my-auto"
          style={{
            borderColor: layoutPrimary,
            boxShadow: `0 0 35px ${layoutGlow}`,
          }}
          onMouseMove={handleTouchMove}
          onTouchMove={handleTouchMove}
          onClick={handleTouchMove}
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={900}
            className="w-full h-full object-fill"
          />

          {/* Floating Toast upon Landing */}
          {floatingToast && (
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-bounce px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-2xl flex items-center gap-1.5"
              style={{
                left: `${(floatingToast.x / 640) * 100}%`,
                top: `${(floatingToast.y / 900) * 100}%`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{floatingToast.text}</span>
            </div>
          )}
        </div>

        {/* Bottom CTA Button: Drop Ball */}
        <div className="w-full max-w-xl md:max-w-2xl pt-2 pb-1 px-2 z-20">
          <button
            type="button"
            onClick={dropBall}
            disabled={isDropping || ballsRemaining <= 0 || gameOver}
            className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
              layoutDef.buttonClass
            } ${
              isDropping || ballsRemaining <= 0
                ? 'opacity-50 pointer-events-none bg-slate-700 text-slate-400'
                : 'text-white border-2 border-white/30 hover:scale-[1.01]'
            }`}
            style={
              !isDropping && ballsRemaining > 0
                ? {
                    background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                    boxShadow: `0 8px 25px ${layoutGlow}`,
                  }
                : undefined
            }
          >
            <ArrowDown className="w-5 h-5 stroke-[3] animate-bounce" />
            <span>
              {isDropping
                ? 'Bolinha em Jogo...'
                : ballsRemaining > 0
                ? `Soltar Bolinha (${ballsRemaining} Restantes)`
                : 'Sem Bolinhas'}
            </span>
          </button>
        </div>

        {/* Game Over / Victory Modal */}
        {gameOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <div
              className={`p-6 sm:p-8 rounded-3xl max-w-md w-full ${layoutDef.cardClass} border-2 text-center shadow-2xl flex flex-col items-center gap-4`}
              style={{
                borderColor: layoutPrimary,
                boxShadow: `0 0 50px ${layoutGlow}`,
              }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-xl animate-bounce"
                style={{
                  background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                }}
              >
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" /> Desafio Concluído!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {gameTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Todas as {totalBalls} bolinhas foram jogadas com sucesso!
                </p>
              </div>

              {/* Total Score Box */}
              <div className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-slate-400">Pontuação Total</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono mt-1 drop-shadow">
                  {currentScore} pts
                </span>

                {/* Individual ball points pills */}
                <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                  {ballHistory.map((pts, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white/15 text-[11px] font-bold text-white border border-white/20"
                    >
                      Bolinha {i + 1}: <strong>+{pts}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={restart}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base text-white shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${layoutDef.buttonClass}`}
                style={{
                  background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                  boxShadow: `0 4px 25px ${layoutGlow}`,
                }}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Jogar Novamente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
