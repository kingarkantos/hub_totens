import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { BalloonCustomItem } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

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
  isHazard: boolean;
  size: number;
  name: string;
  points: number;
  symbol?: string;
}

const DEFAULT_BALLOONS: BalloonCustomItem[] = [
  { name: 'Balão Vermelho', color: '#EF4444', points: 100, isGold: false, isHazard: false },
  { name: 'Balão Azul', color: '#3B82F6', points: 100, isGold: false, isHazard: false },
  { name: 'Balão Verde', color: '#10B981', points: 100, isGold: false, isHazard: false },
  { name: 'Balão Roxo', color: '#8B5CF6', points: 100, isGold: false, isHazard: false },
  { name: 'Balão Dourado', color: '#F59E0B', points: 250, isGold: true, isHazard: false, symbol: '★' },
  { name: 'Balão Perigo', color: '#1F2937', points: -150, isGold: false, isHazard: true, symbol: '💣' },
];

const isImageUrl = (val: string) => {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/') ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(s)
  );
};

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

  const balloonTypes: BalloonCustomItem[] = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(customContent) && customContent.length > 0) {
      rawList = customContent;
    } else if (customContent?.balloons && Array.isArray(customContent.balloons) && customContent.balloons.length > 0) {
      rawList = customContent.balloons;
    } else if (typeof customContent === 'string') {
      try {
        const parsed = JSON.parse(customContent);
        if (Array.isArray(parsed)) rawList = parsed;
        else if (Array.isArray(parsed?.balloons)) rawList = parsed.balloons;
      } catch {}
    }

    if (!rawList || rawList.length === 0) {
      return DEFAULT_BALLOONS;
    }

    return rawList.map((item, idx) => {
      const isGold = Boolean(item.isGold ?? item.is_gold ?? false);
      const isHazard = Boolean(
        item.isHazard ??
        item.is_hazard ??
        item.isNegative ??
        item.is_negative ??
        (Number(item.points) < 0)
      );
      const parsedPoints = Number(item.points);
      const points = !isNaN(parsedPoints) && parsedPoints !== 0
        ? parsedPoints
        : (isHazard ? -150 : isGold ? 250 : 100);

      return {
        name: item.name || (isHazard ? `Perigo ${idx + 1}` : isGold ? `Bônus ${idx + 1}` : `Balão ${idx + 1}`),
        color: item.color || (isHazard ? '#1F2937' : isGold ? '#F59E0B' : '#EF4444'),
        points,
        isGold: !isHazard && isGold,
        isHazard,
        symbol: item.symbol || (isHazard ? '💣' : isGold ? '★' : undefined),
      };
    });
  }, [customContent]);

  const hasHazards = useMemo(() => balloonTypes.some((b) => b.isHazard || b.points < 0), [balloonTypes]);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const balloonsRef = useRef<Balloon[]>([]);
  const nextId = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setTick] = useState(0);
  const spawnBagRef = useRef<BalloonCustomItem[]>([]);

  // Reset spawn bag when balloon types change
  useEffect(() => {
    spawnBagRef.current = [];
  }, [balloonTypes]);

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

      // Spawn every 450ms with fair shuffle rotation
      if (now - lastSpawn > 450) {
        if (spawnBagRef.current.length === 0) {
          const pool = [...balloonTypes];
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          spawnBagRef.current = pool;
        }
        const chosen = spawnBagRef.current.pop() || balloonTypes[0];
        const isGold = Boolean(chosen.isGold);
        const isHazard = Boolean(chosen.isHazard || chosen.points < 0);

        balloonsRef.current.push({
          id: nextId.current++,
          x: 10 + Math.random() * 80,
          y: contHeight + 20, // starts just below bottom
          speed: isHazard ? 3.0 + Math.random() * 2 : 2.5 + Math.random() * 2.5,
          color: chosen.color,
          isGold,
          isHazard,
          size: isHazard ? 80 : isGold ? 72 : 88,
          name: chosen.name,
          points: chosen.points,
          symbol: chosen.symbol,
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
  }, [gameOver, balloonTypes]);

  const [popStats, setPopStats] = useState<{ [name: string]: { count: number; points: number; isGold: boolean; isHazard: boolean; symbol?: string; color: string } }>({});
  const [totalPopped, setTotalPopped] = useState(0);
  const [totalHazards, setTotalHazards] = useState(0);

  const popBalloon = (balloon: Balloon) => {
    setPopStats((prev) => {
      const existing = prev[balloon.name] || {
        count: 0,
        points: balloon.points,
        isGold: balloon.isGold,
        isHazard: balloon.isHazard,
        symbol: balloon.symbol,
        color: balloon.color,
      };
      return {
        ...prev,
        [balloon.name]: {
          ...existing,
          count: existing.count + 1,
        },
      };
    });

    if (balloon.isHazard || balloon.points < 0) {
      sound.playError();
      const penalty = Math.abs(balloon.points || 150);
      setScore((s) => Math.max(0, s - penalty));
      setTotalHazards((h) => h + 1);
    } else {
      sound.playClick();
      if (balloon.isGold) {
        sound.playSuccess();
      }
      setScore((s) => s + (balloon.points || (balloon.isGold ? 250 : 100)));
      setTotalPopped((p) => p + 1);
    }
    balloonsRef.current = balloonsRef.current.filter((b) => b.id !== balloon.id);
  };

  const restart = () => {
    balloonsRef.current = [];
    spawnBagRef.current = [];
    setPopStats({});
    setTotalPopped(0);
    setTotalHazards(0);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
  };

  const feedbackTitle = useMemo(() => {
    if (score >= 3500) return 'Parabéns!';
    if (score >= 1800) return 'Muito bem!';
    if (score >= 800) return 'Bom resultado!';
    if (score > 0) return 'Valeu a tentativa!';
    return 'Não foi dessa vez!';
  }, [score]);

  const feedbackSubtitle = useMemo(() => {
    if (score >= 3500) {
      return `Dedos supersônicos! Você estourou ${totalPopped} balões e marcou ${score} pontos.`;
    }
    if (score >= 1800) {
      return `Excelente agilidade! Você estourou ${totalPopped} balões e garantiu ${score} pontos.`;
    }
    if (score >= 800) {
      return `Boa rodada! Você estourou ${totalPopped} balões. Que tal jogar mais uma vez para bater sua pontuação?`;
    }
    if (score > 0) {
      return `Você estourou ${totalPopped} balões e somou ${score} pontos. Pratique mais para acelerar seu ritmo!`;
    }
    return 'Nenhum balão estourado desta vez. Jogue novamente e mostre seus reflexos!';
  }, [score, totalPopped]);

  const balloonReportContent = (
    <div className={`w-full rounded-2xl border-2 p-3.5 sm:p-5 shadow-lg ${
      isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800/90 border-white/15 text-white'
    }`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs sm:text-sm font-black uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-amber-400">
          <span>🎈</span>
          <span>Balões Estourados</span>
        </span>
        <span className="font-mono text-emerald-400">
          Total: {totalPopped} {totalPopped === 1 ? 'balão' : 'balões'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
        {balloonTypes.map((type, idx) => {
          const stats = popStats[type.name] || { count: 0, points: type.points };
          const isNegative = type.isHazard || type.points < 0;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
                stats.count > 0
                  ? isNegative
                    ? 'bg-rose-950/40 border-rose-500/40'
                    : type.isGold
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : 'bg-white/5 border-white/10'
                  : 'opacity-40 border-dashed border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div 
                  style={{ backgroundColor: type.color || '#3B82F6' }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/40 shadow-sm text-xs"
                >
                  {type.symbol || '🎈'}
                </div>
                <div className="truncate">
                  <span className="font-bold text-xs sm:text-sm block truncate">{type.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {type.points > 0 ? `+${type.points} pts` : `${type.points} pts`}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className={`font-mono font-black text-sm sm:text-base ${
                  stats.count > 0 ? (isNegative ? 'text-rose-400' : 'text-emerald-400') : 'text-slate-500'
                }`}>
                  {stats.count}x
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {totalHazards > 0 && (
        <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-rose-300 text-xs font-bold text-center">
          ⚠️ Penalidade: {totalHazards} {totalHazards === 1 ? 'balão bomba atingido' : 'balões bomba atingidos'} ({totalHazards * 150} pts perdidos)
        </div>
      )}
    </div>
  );

  return (
    <GameContainer
      title="Estoura Balões"
      category="Casual"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={score >= 1000}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      gameType="action"
      customFeedbackTitle={feedbackTitle}
      customFeedbackSubtitle={feedbackSubtitle}
      gameOverCustomContent={balloonReportContent}
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
          style={{ 
            borderColor: hasHazards ? '#ef444488' : `${layoutPrimary}55`, 
            color: hasHazards ? '#fca5a5' : layoutPrimary 
          }}
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-black/70 border-2 text-sm sm:text-lg font-black pointer-events-none z-10 shadow-2xl flex items-center gap-2"
        >
          {hasHazards ? (
            <>Estoure os balões certos e desvie dos balões de perigo! 🎈⚠️</>
          ) : (
            <>Toque para estourar os balões! Balões dourados valem mais! 🎈</>
          )}
        </div>

        {/* Floating Balloons */}
        {balloonsRef.current.map((b) => {
          const isImg = b.symbol && isImageUrl(b.symbol);

          return (
            <button
              key={b.id}
              onPointerDown={(e) => {
                e.preventDefault();
                popBalloon(b);
              }}
              style={{
                left: `${b.x}%`,
                top: `${b.y}px`,
                width: `${b.size}px`,
                height: `${b.size * 1.25}px`,
                backgroundColor: b.color,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-2xl active:scale-125 border-4 flex flex-col items-center justify-center font-black text-white transition-transform cursor-pointer select-none ${
                b.isHazard
                  ? 'border-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                  : b.isGold
                  ? 'border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.7)]'
                  : 'border-white/40'
              }`}
              title={`${b.name} (${b.points > 0 ? `+${b.points}` : b.points} pts)`}
            >
              {isImg ? (
                <img
                  src={b.symbol}
                  alt={b.name}
                  className="w-7 h-7 sm:w-10 sm:h-10 object-contain pointer-events-none drop-shadow-md"
                />
              ) : b.symbol ? (
                <span className="text-xl sm:text-2xl drop-shadow-md">{b.symbol}</span>
              ) : b.isGold ? (
                <span className="text-xl sm:text-2xl drop-shadow-md">★</span>
              ) : null}

              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-0.5 leading-tight ${
                  b.isHazard
                    ? 'bg-black/70 text-rose-200 border border-red-500/50'
                    : b.isGold
                    ? 'bg-amber-950/40 text-amber-100'
                    : 'bg-black/30 text-white'
                }`}
              >
                {b.points > 0 ? `+${b.points}` : `${b.points}`}
              </span>
            </button>
          );
        })}
      </div>
    </GameContainer>
  );
};
