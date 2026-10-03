import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Lock, Unlock, Lightbulb, RotateCcw, CheckCircle2, Sparkles, Gift } from 'lucide-react';

import { BaseGameProps } from '../types';
import { SafeCustomConfig } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface SafeGameProps extends BaseGameProps {
  customContent?: SafeCustomConfig | any;
}

const DEFAULT_SAFE: SafeCustomConfig = {
  secretCode: '375',
  prizeName: 'Kit VIP da Marca',
  hints: [
    'Dica 1: Número ímpar menor que 5',
    'Dica 2: Maior que 6',
    'Dica 3: Número central entre 4 e 6',
  ],
};

export const SafeGame: React.FC<SafeGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#D97706',
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

  const safeConfig = useMemo<SafeCustomConfig>(() => {
    if (customContent && typeof customContent === 'object') {
      if ('secretCode' in customContent) return customContent as SafeCustomConfig;
    }
    if (typeof customContent === 'string') {
      try {
        const parsed = JSON.parse(customContent);
        if (parsed && typeof parsed === 'object' && 'secretCode' in parsed) {
          return parsed as SafeCustomConfig;
        }
      } catch {}
    }
    return DEFAULT_SAFE;
  }, [customContent]);

  const targetDigits = useMemo(() => {
    const rawCode = (safeConfig.secretCode || '375').replace(/\D/g, '');
    const padded = (rawCode + '000').slice(0, 3);
    return [
      parseInt(padded[0], 10) || 0,
      parseInt(padded[1], 10) || 0,
      parseInt(padded[2], 10) || 0,
    ];
  }, [safeConfig.secretCode]);

  const [currentDials, setCurrentDials] = useState<number[]>([0, 0, 0]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameOver, setGameOver] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState<string | null>(null);

  const initGame = () => {
    setCurrentDials([0, 0, 0]);
    setTimeLeft(45);
    setGameOver(false);
    setUnlocked(false);
    setAttemptFeedback(null);
  };

  useEffect(() => {
    initGame();
  }, [safeConfig]);

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

  const changeDial = (index: number, delta: number) => {
    sound.playClick();
    setAttemptFeedback(null);
    setCurrentDials((prev) => {
      const next = [...prev];
      next[index] = (next[index] + delta + 10) % 10;
      return next;
    });
  };

  const testUnlock = () => {
    const match =
      currentDials[0] === targetDigits[0] &&
      currentDials[1] === targetDigits[1] &&
      currentDials[2] === targetDigits[2];

    if (match) {
      sound.playSuccess();
      sound.playFanfare();
      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.55 },
        colors: [layoutPrimary, '#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#FFFFFF'],
      });
      setUnlocked(true);
      setGameOver(true);
    } else {
      sound.playError();
      setAttemptFeedback('Combinação incorreta! Analise as dicas de cada disco e tente novamente.');
    }
  };

  return (
    <GameContainer
      title="Desafio do Cofre"
      category="Mistério"
      score={0}
      hideScore={true}
      prizeWon={safeConfig.prizeName ? { label: safeConfig.prizeName, color: layoutPrimary } : undefined}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={unlocked}
      onRestart={initGame}
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
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl flex-1 flex flex-col items-center justify-between py-3 sm:py-6 px-2 sm:px-6 my-auto gap-4 sm:gap-6 select-none animate-in fade-in duration-300">
        {/* Safe Vault Graphic Header */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
          <div 
            style={{ 
              borderColor: unlocked ? '#10B981' : layoutPrimary, 
              boxShadow: unlocked ? '0 0 40px rgba(16, 185, 129, 0.5)' : `0 0 30px ${layoutGlow}` 
            }}
            className="w-24 h-24 sm:w-32 sm:h-32 p-4 sm:p-6 rounded-full bg-slate-900/90 border-4 shadow-2xl flex items-center justify-center backdrop-blur-xl transition-all duration-500"
          >
            {unlocked ? (
              <Unlock className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 animate-bounce" />
            ) : (
              <Lock style={{ color: layoutPrimary }} className="w-12 h-12 sm:w-16 sm:h-16" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-2xl font-black text-white tracking-tight">
              {unlocked ? '🔓 Cofre Aberto com Sucesso!' : 'Ajuste os 3 discos numéricos usando as dicas! 🔐'}
            </h3>
            {safeConfig.prizeName && (
              <p className="text-xs sm:text-sm font-bold text-amber-300 mt-1 flex items-center justify-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Prêmio do Cofre: <strong className="text-white underline decoration-amber-400">{safeConfig.prizeName}</strong></span>
              </p>
            )}
          </div>
        </div>

        {/* 3 Dials Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-6 w-full max-w-2xl sm:max-w-3xl">
          {[0, 1, 2].map((idx) => {
            const hintText = safeConfig.hints?.[idx] || `Dica para o disco ${idx + 1}`;
            return (
              <div
                key={idx}
                style={{ borderColor: `${layoutPrimary}44` }}
                className="flex flex-col items-center p-3 sm:p-5 rounded-3xl bg-slate-900/90 border-2 sm:border-4 backdrop-blur-xl shadow-2xl relative"
              >
                {/* Disc Header / Number Identifier */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-amber-500/30">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                    Disco {idx + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => changeDial(idx, 1)}
                  disabled={unlocked}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-2xl sm:text-3xl font-black text-white mb-2 transition-all shadow-md cursor-pointer select-none disabled:opacity-50"
                  aria-label={`Aumentar disco ${idx + 1}`}
                >
                  ▲
                </button>

                <div 
                  style={{ color: layoutPrimary, borderColor: `${layoutPrimary}55` }}
                  className="w-18 h-22 sm:w-28 sm:h-32 rounded-2xl sm:rounded-3xl bg-slate-950 border-2 sm:border-4 flex items-center justify-center text-5xl sm:text-7xl md:text-8xl font-mono font-black shadow-inner my-1"
                >
                  {currentDials[idx]}
                </div>

                <button
                  type="button"
                  onClick={() => changeDial(idx, -1)}
                  disabled={unlocked}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-2xl sm:text-3xl font-black text-white mt-2 transition-all shadow-md cursor-pointer select-none disabled:opacity-50"
                  aria-label={`Diminuir disco ${idx + 1}`}
                >
                  ▼
                </button>

                {/* Dica Real Configurada (sem MAIOR / MENOR) */}
                <div className="w-full mt-2.5 sm:mt-3 min-h-[58px] sm:min-h-[64px] p-2 sm:p-3 rounded-2xl bg-slate-950/80 border border-amber-400/30 flex items-center justify-center text-center shadow-inner">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-amber-200 leading-snug break-words">
                      {hintText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback de tentativa incorreta */}
        {attemptFeedback && !unlocked && (
          <div className="w-full max-w-xl p-3 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-200 text-xs sm:text-sm font-bold text-center animate-shake shadow-lg">
            ⚠️ {attemptFeedback}
          </div>
        )}

        {/* Large Unlock Button */}
        {!unlocked && (
          <button
            type="button"
            onClick={testUnlock}
            style={{ 
              backgroundColor: layoutPrimary,
              boxShadow: `0 10px 30px ${layoutGlow}`,
              borderColor: `${darkPrimary}88`,
            }}
            className="w-full max-w-xl py-5 sm:py-7 px-8 rounded-3xl text-white font-black text-xl sm:text-2xl uppercase tracking-wider shadow-2xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-3 border-4 cursor-pointer"
          >
            <Unlock className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>DESTRANCAR COFRE</span>
          </button>
        )}
      </div>
    </GameContainer>
  );
};
