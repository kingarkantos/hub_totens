import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { Gauge, Zap, Flame, Trophy, AlertTriangle, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ReactionTimeGameProps extends BaseGameProps {
  customContent?: any;
}

type Stage = 'idle' | 'arming' | 'counting' | 'ready' | 'go' | 'early' | 'round_complete' | 'finished';

export const ReactionTimeGame: React.FC<ReactionTimeGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#EF4444',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  isLight,
  themeMode,
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [litCount, setLitCount] = useState(0); // 0 to 5 lights
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const startTimeRef = useRef<number>(0);
  const lightsTimerRef = useRef<NodeJS.Timeout[]>([]);
  const randomGoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLightMode = isLight ?? (themeMode === 'light');

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      lightsTimerRef.current.forEach(clearTimeout);
      if (randomGoTimerRef.current) clearTimeout(randomGoTimerRef.current);
    };
  }, []);

  const clearAllTimers = () => {
    lightsTimerRef.current.forEach(clearTimeout);
    lightsTimerRef.current = [];
    if (randomGoTimerRef.current) clearTimeout(randomGoTimerRef.current);
  };

  const startRound = () => {
    clearAllTimers();
    setStage('counting');
    setLitCount(0);
    setLastReactionTime(null);
    sound.playClick();

    // Turn on lights 1 by 1 each 800ms
    for (let i = 1; i <= 5; i++) {
      const t = setTimeout(() => {
        setLitCount(i);
        sound.playClick();
      }, i * 800);
      lightsTimerRef.current.push(t);
    }

    // After all 5 are lit (at 4000ms), wait random 1000ms - 3200ms, then GO (turn off all lights)
    const afterAllLit = 5 * 800;
    const randomDelay = Math.floor(Math.random() * 2200) + 1000;

    const readyTimer = setTimeout(() => {
      setStage('ready');

      randomGoTimerRef.current = setTimeout(() => {
        setLitCount(0);
        setStage('go');
        startTimeRef.current = Date.now();
        sound.playFanfare();
      }, randomDelay);
    }, afterAllLit);

    lightsTimerRef.current.push(readyTimer);
  };

  const handleTouch = () => {
    if (stage === 'idle') {
      startRound();
      return;
    }

    if (stage === 'counting' || stage === 'ready') {
      // Early tap - False Start!
      clearAllTimers();
      sound.playError();
      setStage('early');
      return;
    }

    if (stage === 'go') {
      // Valid reaction hit!
      const timeMs = Date.now() - startTimeRef.current;
      sound.playSuccess();
      setLastReactionTime(timeMs);

      // Score formula: faster = more points
      // <= 200ms -> 1000pts, 300ms -> 700pts, 500ms -> 300pts
      const points = Math.max(100, Math.round(1200 - timeMs * 2));
      const updatedTimes = [...reactionTimes, timeMs];
      setReactionTimes(updatedTimes);
      setScore((s) => s + points);

      if (currentRound >= totalRounds) {
        setStage('finished');
        setGameOver(true);
      } else {
        setStage('round_complete');
      }
    }
  };

  const nextRound = () => {
    setCurrentRound((r) => r + 1);
    startRound();
  };

  const restart = () => {
    clearAllTimers();
    setStage('idle');
    setLitCount(0);
    setCurrentRound(1);
    setReactionTimes([]);
    setLastReactionTime(null);
    setScore(0);
    setGameOver(false);
  };

  const bestTime = reactionTimes.length > 0 ? Math.min(...reactionTimes) : null;
  const avgTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
    : null;

  const getRankBadge = (ms: number) => {
    if (ms < 220) return { label: 'Piloto Lendário ⚡', color: 'text-amber-400' };
    if (ms < 280) return { label: 'Profissional 🏎️', color: 'text-emerald-400' };
    if (ms < 350) return { label: 'Excelente Reflexo 🔥', color: 'text-blue-400' };
    return { label: 'Bom Tempo 👍', color: 'text-slate-300' };
  };

  return (
    <GameContainer
      title="Reflexo do Semáforo"
      category="Precisão & Coordenação"
      score={score}
      gameOver={gameOver}
      gameWon={reactionTimes.length > 0}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      customScoreLabel="Pontos"
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
      isLight={isLight}
      themeMode={themeMode}
    >
      <div 
        onClick={handleTouch}
        className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto cursor-pointer select-none"
      >
        {/* Top Round Indicator & Best Time */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <Gauge className="w-5 h-5 text-red-500" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              Largada: <strong className="text-white">{currentRound} de {totalRounds}</strong>
            </span>
          </div>

          {bestTime !== null && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Trophy className="w-4 h-4 fill-current" />
              <span className="text-xs sm:text-sm font-mono font-black">
                Melhor: {bestTime} ms
              </span>
            </div>
          )}
        </div>

        {/* Central Display: Formula 1 Gantt Light Matrix */}
        <div className="my-auto w-full flex flex-col items-center">
          {/* 5 Light Columns */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center gap-3 sm:gap-6 max-w-2xl w-full">
            {[1, 2, 3, 4, 5].map((lightIdx) => {
              const isLit = litCount >= lightIdx;
              return (
                <div
                  key={lightIdx}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-2 rounded-2xl bg-black/60 border border-white/10"
                >
                  {/* Pair of vertical red lamps */}
                  <div
                    className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-100 ${
                      isLit
                        ? 'bg-red-600 border-red-400 shadow-[0_0_35px_#EF4444]'
                        : 'bg-red-950/40 border-red-900/60 opacity-30'
                    }`}
                  />
                  <div
                    className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-100 ${
                      isLit
                        ? 'bg-red-600 border-red-400 shadow-[0_0_35px_#EF4444]'
                        : 'bg-red-950/40 border-red-900/60 opacity-30'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Status Message / Prompt */}
          <div className="mt-8 text-center">
            {stage === 'idle' && (
              <div className="animate-pulse">
                <span className="text-2xl sm:text-3xl font-black uppercase text-white drop-shadow">
                  TOQUE NA TELA PARA INICIAR O SEMÁFORO
                </span>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">
                  As luzes vermelhas vão acender uma a uma. Quando todas se apagarem, toque instantaneamente!
                </p>
              </div>
            )}

            {(stage === 'counting' || stage === 'ready') && (
              <div>
                <span className="text-xl sm:text-2xl font-black uppercase text-amber-400 tracking-widest animate-pulse">
                  ATENÇÃO... AGUARDE AS LUZES APAGAREM
                </span>
                <p className="text-xs text-rose-400 font-bold mt-1">
                  Não toque antes ou queimará a largada!
                </p>
              </div>
            )}

            {stage === 'go' && (
              <div className="animate-totem-pulse">
                <span className="text-4xl sm:text-6xl font-black uppercase text-emerald-400 tracking-wider drop-shadow-[0_0_40px_#10B981]">
                  LARGADA! TOQUE AGORA! 🏁
                </span>
              </div>
            )}

            {stage === 'early' && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                  <AlertTriangle className="w-8 h-8" />
                  <span className="text-2xl sm:text-3xl font-black uppercase">
                    QUEIMA DE LARGADA!
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Você tocou antes das luzes se apagarem.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startRound();
                  }}
                  className="mt-4 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-sm uppercase flex items-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tentar Novamente Esta Largada</span>
                </button>
              </div>
            )}

            {stage === 'round_complete' && lastReactionTime !== null && (
              <div className="flex flex-col items-center animate-in zoom-in duration-200">
                <span className="text-5xl sm:text-6xl font-mono font-black text-white">
                  {lastReactionTime} <span className="text-2xl text-slate-400">ms</span>
                </span>
                <span className={`text-sm sm:text-base font-black uppercase tracking-wider mt-2 ${getRankBadge(lastReactionTime).color}`}>
                  {getRankBadge(lastReactionTime).label}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextRound();
                  }}
                  className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-base uppercase tracking-wider shadow-xl flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Próxima Largada ({currentRound + 1}/{totalRounds})</span>
                </button>
              </div>
            )}

            {stage === 'finished' && (
              <div className="flex flex-col items-center animate-in zoom-in duration-200">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-widest mb-1">
                  Resultado dos 3 Desafios
                </span>
                <div className="flex items-center gap-6 my-2">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Melhor Tempo</span>
                    <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
                      {bestTime} ms
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Tempo Médio</span>
                    <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                      {avgTime} ms
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="w-full text-center text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider py-2">
          🏎️ Pilotos de alta performance reagem abaixo de 250 milissegundos!
        </div>
      </div>
    </GameContainer>
  );
};
