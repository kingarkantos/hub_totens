import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { Trophy, Sparkles, CheckCircle2, RotateCcw, ArrowDown, Award } from 'lucide-react';
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

  const { activeLayout, layoutDef, layoutPrimary, layoutSecondary, layoutGlow, isLightMode } = useActiveGamePalette({
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
    boardWidth: 600,
    boardHeight: 800,
  });

  // Sync slots and balls config
  useEffect(() => {
    stateRef.current.slots = slots;
  }, [slots]);

  useEffect(() => {
    stateRef.current.dropperX = dropperX;
  }, [dropperX]);

  // Drop Ball Action
  const dropBall = useCallback(() => {
    if (stateRef.current.isDropping || stateRef.current.ballsRemaining <= 0 || stateRef.current.gameOver) return;

    sound.playClick();
    setIsDropping(true);
    stateRef.current.isDropping = true;

    const width = stateRef.current.boardWidth;
    const startX = width * Math.max(0.12, Math.min(0.88, stateRef.current.dropperX));
    const startY = 85;

    stateRef.current.ball = {
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.2,
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

    // Generate Pins Grid
    const generatePins = (w: number, h: number): Pin[] => {
      const pinsList: Pin[] = [];
      const rows = 9;
      const startY = 130;
      const slotAreaY = h - 140;
      const rowSpacing = (slotAreaY - startY) / (rows - 1);
      const pinRadius = 5.5;

      for (let r = 0; r < rows; r++) {
        const pinCount = 3 + r;
        const py = startY + r * rowSpacing;
        const rowWidth = w * (0.35 + (r / rows) * 0.52);
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
      const slotAreaY = height - 130;

      // ==========================================
      // PHYSICS UPDATE
      // ==========================================
      if (ball && !ball.settled) {
        // Gravity & Air Resistance
        const gravity = 550;
        ball.vy += gravity * dt;
        ball.vx *= 0.995;

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Side Walls Collision
        const wallMargin = 16;
        if (ball.x - ball.radius < wallMargin) {
          ball.x = wallMargin + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.7 + 10;
          sound.playTick();
        } else if (ball.x + ball.radius > width - wallMargin) {
          ball.x = width - wallMargin - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.7 - 10;
          sound.playTick();
        }

        // Pin Collisions
        for (let i = 0; i < pins.length; i++) {
          const pin = pins[i];
          const dx = ball.x - pin.x;
          const dy = ball.y - pin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball.radius + pin.radius;

          if (dist < minDist) {
            // Collision resolution
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            // Separate
            ball.x = pin.x + nx * (minDist + 0.5);
            ball.y = pin.y + ny * (minDist + 0.5);

            // Reflect velocity with bounce damping
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
              const restitution = 0.62;
              ball.vx = ball.vx - (1 + restitution) * dot * nx + (Math.random() - 0.5) * 20;
              ball.vy = ball.vy - (1 + restitution) * dot * ny;
            }

            // Pin Glow effect & Sound
            pin.glowTime = now + 250;
            sound.playTick();
          }
        }

        // Slot Entry Check
        if (ball.y + ball.radius >= slotAreaY) {
          const slotWidth = width / currentSlots.length;
          const slotIdx = Math.max(0, Math.min(currentSlots.length - 1, Math.floor(ball.x / slotWidth)));
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
      // CANVAS RENDERING
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // Background Gradient (Danone Royal Blue or Theme)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#004799');
      bgGrad.addColorStop(0.5, '#005BBF');
      bgGrad.addColorStop(1, '#003A7D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Dots Pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let bx = 20; bx < width; bx += 40) {
        for (let by = 20; by < height; by += 40) {
          ctx.beginPath();
          ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top White Brand Arch (inspired by Danone logo curve)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI / 2);
      ctx.lineTo(0, 0);
      ctx.fill();

      // Brand Logo Text inside Arch
      ctx.fillStyle = '#004799';
      ctx.font = 'black 16px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(clientName || campaignName || 'PLINKO', 16, 45);
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.fillStyle = '#005BBF';
      ctx.fillText('ONE PLANET. ONE HEALTH', 16, 60);

      // Top Dropper Indicator Track
      const trackY = 85;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.12, trackY);
      ctx.lineTo(width * 0.88, trackY);
      ctx.stroke();

      // Dropper Funnel Cursor
      const dropCurX = width * Math.max(0.12, Math.min(0.88, stateRef.current.dropperX));
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(dropCurX, trackY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner shine on dropper
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(dropCurX - 4, trackY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pins
      pins.forEach((pin) => {
        const isGlowing = now < pin.glowTime;

        if (isGlowing) {
          ctx.fillStyle = '#FBBF24';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, pin.radius + 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // White Pin with soft 3D shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.arc(pin.x + 1.5, pin.y + 1.5, pin.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Bottom Slots (Canaletas)
      const slotCount = currentSlots.length;
      const slotW = width / slotCount;
      const slotH = height - slotAreaY;

      // Curved Divider Bridge right above slots
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.ellipse(width / 2, slotAreaY - 6, width * 0.45, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < slotCount; s++) {
        const sItem = currentSlots[s];
        const sx = s * slotW;
        const isHit = activeSlotHighlight === s;

        // Slot Background (Alternating White and Blue like in reference image)
        const isWhiteSlot = s % 2 === 0;
        ctx.fillStyle = isHit
          ? '#F59E0B'
          : isWhiteSlot
          ? '#FFFFFF'
          : '#005BBF';

        ctx.fillRect(sx, slotAreaY, slotW - 2, slotH);

        // Slot Dividers Pegs
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sx, slotAreaY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Slot Vertical Text (PERDEU / GANHOU / 500 PTS)
        ctx.save();
        ctx.translate(sx + slotW / 2 - 1, slotAreaY + slotH / 2);
        ctx.rotate(Math.PI / 2); // Vertical orientation
        ctx.fillStyle = isHit
          ? '#FFFFFF'
          : isWhiteSlot
          ? '#005BBF'
          : '#FFFFFF';
        ctx.font = 'black 14px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sItem.label.toUpperCase(), 0, 0);
        ctx.restore();
      }

      // Draw Falling Ball
      if (ball) {
        // Ball Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(ball.x + 3, ball.y + 4, ball.radius, ball.radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red Ball Body (Glossy Vibrant Red like Danone reference)
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

        // White Specular Highlight
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
  }, [totalBalls, slots, activeSlotHighlight]);

  // Touch and Drag handlers for dropper aim
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (isDropping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relX = (clientX - rect.left) / rect.width;
    setDropperX(Math.max(0.12, Math.min(0.88, relX)));
  };

  const restart = () => {
    setBallsRemaining(totalBalls);
    setCurrentScore(0);
    setBallHistory([]);
    setIsDropping(false);
    setActiveSlotHighlight(null);
    setFloatingToast(null);
    setGameOver(false);
    setGameWon(false);

    stateRef.current.ball = null;
    stateRef.current.isDropping = false;
    stateRef.current.ballsRemaining = totalBalls;
    stateRef.current.score = 0;
    stateRef.current.history = [];
    stateRef.current.gameOver = false;
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
      <div className="relative w-full h-full flex flex-col justify-between items-center overflow-hidden select-none p-2 sm:p-4">
        {/* Top Floating Header: Ball Indicators */}
        <div className="absolute top-4 right-6 z-20 flex items-center gap-2">
          {Array.from({ length: totalBalls }).map((_, idx) => {
            const isAvailable = idx < ballsRemaining;
            return (
              <div
                key={idx}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  isAvailable
                    ? 'bg-red-500 border-white shadow-lg scale-105'
                    : 'bg-transparent border-white/40 scale-95'
                }`}
              >
                {isAvailable && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Canvas Board */}
        <div
          className="relative w-full max-w-lg aspect-[3/4] sm:aspect-[4/5] max-h-[78vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 touch-none my-auto"
          onMouseMove={handleTouchMove}
          onTouchMove={handleTouchMove}
          onClick={handleTouchMove}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={800}
            className="w-full h-full object-cover"
          />

          {/* Floating Toast upon Landing */}
          {floatingToast && (
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-bounce px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-2xl flex items-center gap-1.5"
              style={{
                left: `${(floatingToast.x / 600) * 100}%`,
                top: `${(floatingToast.y / 800) * 100}%`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{floatingToast.text}</span>
            </div>
          )}
        </div>

        {/* Bottom CTA Button: Drop Ball */}
        <div className="w-full max-w-md pb-2 px-4 z-20">
          <button
            type="button"
            onClick={dropBall}
            disabled={isDropping || ballsRemaining <= 0 || gameOver}
            className={`w-full py-4 sm:py-5 px-6 rounded-3xl font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
              layoutDef.buttonClass
            } ${
              isDropping || ballsRemaining <= 0
                ? 'opacity-50 pointer-events-none bg-slate-700 text-slate-400'
                : 'text-white border-2 border-white/30 hover:scale-[1.02]'
            }`}
            style={
              !isDropping && ballsRemaining > 0
                ? {
                    background: `linear-gradient(135deg, #DC2626, #EF4444)`,
                    boxShadow: '0 8px 30px rgba(220, 38, 38, 0.5)',
                  }
                : undefined
            }
          >
            <ArrowDown className="w-6 h-6 stroke-[3] animate-bounce" />
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
