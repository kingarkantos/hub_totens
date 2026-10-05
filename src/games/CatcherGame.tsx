import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';

interface CatcherGameProps extends BaseGameProps {
  customContent?: any;
}

import { CatcherCustomItem } from '../types/gameContent';

interface FallingItem {
  id: number;
  x: number; // percentage 5 - 90
  y: number; // in px
  speed: number;
  type: 'gift' | 'star' | 'hazard';
  symbol: string;
  name: string;
  points: number;
}

const DEFAULT_CATCHER_ITEMS: CatcherCustomItem[] = [
  { name: 'Kit Brinde', symbol: '🎁', points: 150, type: 'gift' },
  { name: 'Estrela Bônus', symbol: '⭐', points: 300, type: 'star' },
  { name: 'Obstáculo / Bomba', symbol: '💣', points: -200, type: 'hazard' },
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

  const catcherItems: CatcherCustomItem[] = React.useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(customContent) && customContent.length > 0) {
      rawList = customContent;
    } else if (customContent?.items && Array.isArray(customContent.items) && customContent.items.length > 0) {
      rawList = customContent.items;
    } else if (typeof customContent === 'string') {
      try {
        const parsed = JSON.parse(customContent);
        if (Array.isArray(parsed)) rawList = parsed;
        else if (Array.isArray(parsed?.items)) rawList = parsed.items;
      } catch {}
    }

    if (!rawList || rawList.length === 0) {
      return DEFAULT_CATCHER_ITEMS;
    }

    return rawList.map((item, idx) => {
      let type: 'gift' | 'star' | 'hazard' = item.type || 'gift';
      const parsedPoints = Number(item.points);
      if (item.isHazard || item.is_hazard || item.isNegative || parsedPoints < 0) {
        type = 'hazard';
      }
      const points = !isNaN(parsedPoints) && parsedPoints !== 0
        ? parsedPoints
        : (type === 'hazard' ? -200 : type === 'star' ? 300 : 150);

      return {
        name: item.name || (type === 'hazard' ? `Obstáculo ${idx + 1}` : type === 'star' ? `Estrela ${idx + 1}` : `Brinde ${idx + 1}`),
        symbol: (item.symbol !== undefined && item.symbol !== null && String(item.symbol).trim() !== '')
          ? String(item.symbol).trim()
          : (type === 'hazard' ? '💣' : type === 'star' ? '⭐' : '🎁'),
        points,
        type,
      };
    });
  }, [customContent]);

  const [basketX, setBasketX] = useState(50); // percentage 10 - 90
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [gameOver, setGameOver] = useState(false);
  const [caughtStats, setCaughtStats] = useState<{ [name: string]: { count: number; points: number; symbol: string; type: string } }>({});
  const [totalCaught, setTotalCaught] = useState(0);
  const [totalHazards, setTotalHazards] = useState(0);

  const registerCatch = (item: FallingItem) => {
    setCaughtStats((prev) => {
      const existing = prev[item.name] || {
        count: 0,
        points: item.points,
        symbol: item.symbol,
        type: item.type,
      };
      return {
        ...prev,
        [item.name]: {
          ...existing,
          count: existing.count + 1,
        },
      };
    });

    if (item.type === 'hazard' || item.points < 0) {
      sound.playError();
      const penalty = Math.abs(item.points || 200);
      setScore((s) => Math.max(0, s - penalty));
      setTotalHazards((h) => h + 1);
    } else if (item.type === 'star') {
      sound.playSuccess();
      setScore((s) => s + (item.points || 300));
      setTotalCaught((c) => c + 1);
    } else {
      sound.playClick();
      setScore((s) => s + (item.points || 150));
      setTotalCaught((c) => c + 1);
    }
  };

  const itemsRef = useRef<FallingItem[]>([]);
  const nextId = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setRenderTrigger] = useState(0);
  const spawnBagRef = useRef<CatcherCustomItem[]>([]);

  // Reset spawn bag when catcher items change
  useEffect(() => {
    spawnBagRef.current = [];
  }, [catcherItems]);

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
      // Spawn item every 650ms using fair shuffle pool
      if (now - lastSpawn > 650) {
        if (spawnBagRef.current.length === 0) {
          const pool = [...catcherItems];
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          spawnBagRef.current = pool;
        }
        const chosen = spawnBagRef.current.pop() || catcherItems[0];

        itemsRef.current.push({
          id: nextId.current++,
          x: 8 + Math.random() * 84,
          y: 0,
          speed: 3.5 + Math.random() * 3,
          type: chosen.type,
          symbol: chosen.symbol,
          name: chosen.name,
          points: chosen.points,
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
            registerCatch(item);
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
  }, [gameOver, basketX, catcherItems]);

  const restart = () => {
    itemsRef.current = [];
    setCaughtStats({});
    setTotalCaught(0);
    setTotalHazards(0);
    setScore(0);
    setTimeLeft(40);
    setBasketX(50);
    setGameOver(false);
  };

  const feedbackTitle = useMemo(() => {
    if (score >= 4000) return 'Parabéns!';
    if (score >= 2000) return 'Muito bem!';
    if (score >= 800) return 'Bom resultado!';
    if (score > 0) return 'Valeu a tentativa!';
    return 'Não foi dessa vez!';
  }, [score]);

  const feedbackSubtitle = useMemo(() => {
    if (score >= 4000) {
      return `Excelente agilidade com a cesta! Você coletou ${totalCaught} itens e alcançou ${score} pontos.`;
    }
    if (score >= 2000) {
      return `Ótima coordenação! Você pegou ${totalCaught} itens e marcou ${score} pontos.`;
    }
    if (score >= 800) {
      return `Boa partida! Você capturou ${totalCaught} itens. Que tal tentar bater sua pontuação?`;
    }
    if (score > 0) {
      return `Você pegou ${totalCaught} itens e acumulou ${score} pontos. Jogue de novo para melhorar!`;
    }
    return 'Nenhum item coletado na rodada. Deslize a cesta com rapidez e tente de novo!';
  }, [score, totalCaught]);

  const catcherReportContent = (
    <div className={`w-full rounded-2xl border-2 p-3.5 sm:p-5 shadow-lg ${
      isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800/90 border-white/15 text-white'
    }`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs sm:text-sm font-black uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-amber-400">
          <span>🧺</span>
          <span>Itens Coletados</span>
        </span>
        <span className="font-mono text-emerald-400">
          Total: {totalCaught} {totalCaught === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
        {catcherItems.map((type, idx) => {
          const stats = caughtStats[type.name] || { count: 0, points: type.points };
          const isImg = isImageUrl(type.symbol);
          const isNegative = type.type === 'hazard' || type.points < 0;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
                stats.count > 0
                  ? isNegative
                    ? 'bg-rose-950/40 border-rose-500/40'
                    : type.type === 'star'
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : 'bg-white/5 border-white/10'
                  : 'opacity-40 border-dashed border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/10 text-lg">
                  {isImg ? (
                    <img src={type.symbol} alt={type.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <span>{type.symbol}</span>
                  )}
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
          ⚠️ Penalidade: {totalHazards} {totalHazards === 1 ? 'bomba atingida' : 'bombas atingidas'} ({totalHazards * 200} pts perdidos)
        </div>
      )}
    </div>
  );

  return (
    <GameContainer
      title="Chuva de Brindes"
      category="Agilidade"
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
      gameOverCustomContent={catcherReportContent}
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
          Arraste o veículo para coletar os brindes e evite os perigos! 🎁⚠️
        </div>

        {/* Falling items */}
        {itemsRef.current.map((item) => {
          const isImg = isImageUrl(item.symbol);
          const isHazard = item.type === 'hazard' || item.points < 0;

          return (
            <div
              key={item.id}
              style={{
                left: `${item.x}%`,
                top: `${item.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute flex flex-col items-center justify-center pointer-events-none transition-transform drop-shadow-xl select-none"
            >
              {isImg ? (
                <img
                  src={item.symbol}
                  alt={item.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain pointer-events-none drop-shadow-lg"
                />
              ) : (
                <span className="text-5xl sm:text-6xl select-none leading-none">
                  {item.symbol || (item.type === 'gift' ? '🎁' : item.type === 'star' ? '⭐' : '💣')}
                </span>
              )}
              {item.points !== 0 && (
                <span
                  className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full mt-1 leading-tight shadow-md ${
                    isHazard
                      ? 'bg-rose-950/80 text-rose-200 border border-red-500/50'
                      : item.type === 'star'
                      ? 'bg-amber-950/80 text-amber-200 border border-amber-400/50'
                      : 'bg-black/70 text-white border border-white/30'
                  }`}
                >
                  {item.points > 0 ? `+${item.points}` : `${item.points}`}
                </span>
              )}
            </div>
          );
        })}

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
