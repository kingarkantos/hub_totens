import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { TargetCustomItem } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface TargetGameProps extends BaseGameProps {
  customContent?: any;
}

interface TargetItem {
  id: number;
  x: number; // percentage 10 - 90
  y: number; // percentage 10 - 90
  size: number; // in px
  isBonus: boolean;
  isHazard: boolean;
  spawnTime: number;
  symbol: string;
  name: string;
  points: number;
}

const DEFAULT_TARGETS: TargetCustomItem[] = [
  { name: 'Alvo Padrão', symbol: '◎', points: 100, isBonus: false, isHazard: false },
  { name: 'Estrela Dourada', symbol: '★', points: 250, isBonus: true, isHazard: false },
  { name: 'Logotipo Marca', symbol: '⭐', points: 150, isBonus: false, isHazard: false },
  { name: 'Troféu Relâmpago', symbol: '🏆', points: 300, isBonus: true, isHazard: false },
  { name: 'Perigo / Bomba', symbol: '💣', points: -150, isBonus: false, isHazard: true },
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
    timeLimit,
    totalTimeLimit,
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

  const targetTypes: TargetCustomItem[] = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(customContent) && customContent.length > 0) {
      rawList = customContent;
    } else if (customContent?.targets && Array.isArray(customContent.targets) && customContent.targets.length > 0) {
      rawList = customContent.targets;
    } else if (typeof customContent === 'string') {
      try {
        const parsed = JSON.parse(customContent);
        if (Array.isArray(parsed)) rawList = parsed;
        else if (Array.isArray(parsed?.targets)) rawList = parsed.targets;
      } catch {}
    }

    if (!rawList || rawList.length === 0) {
      return DEFAULT_TARGETS;
    }

    return rawList.map((item, idx) => {
      const isBonus = Boolean(item.isBonus ?? item.is_bonus ?? false);
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
        : (isHazard ? -150 : isBonus ? 250 : 100);

      return {
        name: item.name || (isHazard ? `Perigo ${idx + 1}` : isBonus ? `Bônus ${idx + 1}` : `Alvo ${idx + 1}`),
        symbol: (item.symbol !== undefined && item.symbol !== null && String(item.symbol).trim() !== '')
          ? String(item.symbol).trim()
          : (isHazard ? '💣' : isBonus ? '★' : '◎'),
        points,
        isBonus: !isHazard && isBonus,
        isHazard,
      };
    });
  }, [customContent]);

  const hasHazards = useMemo(() => targetTypes.some((t) => t.isHazard || t.points < 0), [targetTypes]);

  const initialTime = totalTimeLimit || timeLimit || 30;
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const nextId = useRef(1);
  const spawnBagRef = useRef<TargetCustomItem[]>([]);

  // Reset spawn bag when target types change
  useEffect(() => {
    spawnBagRef.current = [];
  }, [targetTypes]);

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

  // Target spawner with fair shuffle bag rotation so ALL configured icons appear
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTargets((prev) => {
        // limit max active targets
        const now = Date.now();
        const filtered = prev.filter((t) => now - t.spawnTime < 1900);
        if (filtered.length >= 4) return filtered;

        // Draw next target from fair shuffle pool
        if (spawnBagRef.current.length === 0) {
          const pool = [...targetTypes];
          // Fisher-Yates shuffle
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          spawnBagRef.current = pool;
        }

        const chosenType = spawnBagRef.current.pop() || targetTypes[0];
        const isBonus = Boolean(chosenType.isBonus);
        const isHazard = Boolean(chosenType.isHazard || chosenType.points < 0);

        const newTarget: TargetItem = {
          id: nextId.current++,
          x: 12 + Math.random() * 76,
          y: 12 + Math.random() * 76,
          size: isHazard ? 88 : isBonus ? 75 : 95,
          isBonus,
          isHazard,
          spawnTime: now,
          symbol: chosenType.symbol,
          name: chosenType.name,
          points: chosenType.points,
        };
        return [...filtered, newTarget];
      });
    }, 550);

    return () => clearInterval(interval);
  }, [gameOver, targetTypes]);

  const handleHit = (target: TargetItem) => {
    if (target.isHazard || target.points < 0) {
      sound.playError();
      const penalty = Math.abs(target.points || 150);
      setScore((s) => Math.max(0, s - penalty));
    } else {
      sound.playClick();
      if (target.isBonus) {
        sound.playSuccess();
      }
      setScore((s) => s + (target.points || (target.isBonus ? 250 : 100)));
    }
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(initialTime);
    setTargets([]);
    spawnBagRef.current = [];
    setGameOver(false);
  };

  return (
    <GameContainer
      title="Caça aos Alvos"
      category="Reflexo"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={score >= 1000}
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
          style={{ 
            borderColor: hasHazards ? '#ef444488' : `${layoutPrimary}55`, 
            color: hasHazards ? '#fca5a5' : layoutPrimary 
          }}
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-black/70 border-2 text-sm sm:text-lg font-black pointer-events-none z-10 shadow-2xl flex items-center gap-2"
        >
          {hasHazards ? (
            <>Toque nos alvos certos e evite os alvos perigosos! 🎯⚠️</>
          ) : (
            <>Toque nos alvos o mais rápido possível! 🎯</>
          )}
        </div>

        {/* Active targets */}
        {targets.map((t) => {
          const isImg = isImageUrl(t.symbol);
          const isHazard = t.isHazard || t.points < 0;

          return (
            <button
              key={t.id}
              onPointerDown={(e) => {
                e.preventDefault();
                handleHit(t);
              }}
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                width: `${t.size}px`,
                height: `${t.size}px`,
                transform: 'translate(-50%, -50%)',
                ...(isHazard
                  ? {
                      background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #ef4444 100%)',
                      boxShadow: '0 0 25px rgba(239, 68, 68, 0.85)',
                      borderColor: '#fca5a5',
                      color: '#ffffff',
                    }
                  : t.isBonus
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
              className={`absolute rounded-full flex flex-col items-center justify-center font-black transition-all active:scale-75 border-4 cursor-pointer select-none ${
                isHazard ? 'animate-pulse' : 'animate-totem-pulse'
              }`}
              title={`${t.name} (${t.points > 0 ? `+${t.points}` : t.points} pts)`}
            >
              <span className="text-2xl sm:text-4xl drop-shadow-md select-none leading-none flex items-center justify-center">
                {isImg ? (
                  <img
                    src={t.symbol}
                    alt={t.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 object-contain pointer-events-none drop-shadow-md"
                  />
                ) : (
                  t.symbol
                )}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full mt-0.5 leading-tight ${
                  isHazard
                    ? 'bg-black/60 text-rose-200 border border-red-400/40'
                    : t.isBonus
                    ? 'bg-amber-950/20 text-amber-950'
                    : 'bg-black/30 text-white'
                }`}
              >
                {t.points > 0 ? `+${t.points}` : `${t.points}`}
              </span>
            </button>
          );
        })}
      </div>
    </GameContainer>
  );
};
