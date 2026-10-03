import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { Zap, Flame, Award, CheckCircle2, AlertTriangle, RotateCcw, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface HigherLowerGameProps extends BaseGameProps {
  customContent?: {
    gridMax?: number;
    title?: string;
    errorPenaltySeconds?: number;
    bonusPoints?: number;
  };
}

interface NumberTile {
  id: number;
  value: number;
  completed: boolean;
}

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createTiles = (count: number): NumberTile[] => {
  const base = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    value: i + 1,
    completed: false,
  }));
  return shuffleArray(base);
};

export const HigherLowerGame: React.FC<HigherLowerGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#F59E0B',
    theme,
    customBgStyle,
    campaignName,
    clientName,
    splashImageUrl,
    isLight,
    themeMode,
    totalTimeLimit,
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

  const gridMax = customContent?.gridMax && [16, 20, 25].includes(customContent.gridMax) ? customContent.gridMax : 16;
  const initialTime = totalTimeLimit !== undefined && totalTimeLimit > 0 ? totalTimeLimit : 35;
  const errorPenalty = customContent?.errorPenaltySeconds ?? 1;
  const roundBonusBase = customContent?.bonusPoints ?? 1000;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [tiles, setTiles] = useState<NumberTile[]>(() => createTiles(gridMax));
  const [nextTarget, setNextTarget] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [round, setRound] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [errorTileId, setErrorTileId] = useState<number | null>(null);
  const [recentPenalty, setRecentPenalty] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [roundCompletedModal, setRoundCompletedModal] = useState(false);

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const penaltyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    if (gameOver || roundCompletedModal) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, roundCompletedModal]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (penaltyTimeoutRef.current) clearTimeout(penaltyTimeoutRef.current);
    };
  }, []);

  const handleTileClick = (tile: NumberTile) => {
    if (gameOver || roundCompletedModal || tile.completed) return;

    if (tile.value === nextTarget) {
      // Correct number in sequence!
      sound.playSuccess();
      const pointsGained = 100 * combo;
      setScore((s) => s + pointsGained);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const newCompleted = completedCount + 1;
      setCompletedCount(newCompleted);

      // Update tile status
      setTiles((prev) =>
        prev.map((t) => (t.id === tile.id ? { ...t, completed: true } : t))
      );

      if (nextTarget >= gridMax) {
        // Round Finished! All numbers cleared!
        sound.playFanfare();
        const timeBonus = timeLeft * 40;
        const totalRoundBonus = roundBonusBase + timeBonus;
        setScore((s) => s + totalRoundBonus);

        // Check if there is still substantial time left or finish as speedrun victory
        setGameWon(true);
        setRoundCompletedModal(true);
      } else {
        setNextTarget((n) => n + 1);
      }
    } else {
      // Wrong number clicked!
      sound.playError();
      setCombo(1);
      setErrorTileId(tile.id);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setErrorTileId(null);
      }, 500);

      if (errorPenalty > 0) {
        setTimeLeft((t) => Math.max(0, t - errorPenalty));
        setRecentPenalty(true);
        if (penaltyTimeoutRef.current) clearTimeout(penaltyTimeoutRef.current);
        penaltyTimeoutRef.current = setTimeout(() => {
          setRecentPenalty(false);
        }, 800);
      }
    }
  };

  const startNextRound = () => {
    setRound((r) => r + 1);
    setNextTarget(1);
    setCompletedCount(0);
    setTiles(createTiles(gridMax));
    setRoundCompletedModal(false);
    // Add extra time for the next round
    setTimeLeft((t) => t + 25);
  };

  const finishGameAsChampion = () => {
    setRoundCompletedModal(false);
    setGameOver(true);
  };

  const restart = () => {
    setTimeLeft(initialTime);
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setRound(1);
    setNextTarget(1);
    setCompletedCount(0);
    setGameOver(false);
    setGameWon(false);
    setRoundCompletedModal(false);
    setErrorTileId(null);
    setRecentPenalty(false);
    setTiles(createTiles(gridMax));
  };

  const progressPercent = Math.min(100, Math.round(((nextTarget - 1) / gridMax) * 100));

  return (
    <GameContainer
      title={customContent?.title || 'Ordem Numérica Relâmpago'}
      category="Cálculo & Lógica Numérica"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon || score > 800}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      correctAnswers={completedCount}
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
      <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto select-none">
        {/* Top HUD: Target Indicator, Progress & Combo */}
        <div className="w-full flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Target Indicator Card */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${layoutDef.cardClass} border shadow-lg transition-all`}
            style={{
              borderColor: `${layoutPrimary}88`,
              boxShadow: `0 0 20px ${layoutGlow}`,
            }}
          >
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                Toque no Número:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-2xl sm:text-3xl font-black font-mono tracking-tight drop-shadow animate-pulse"
                  style={{ color: layoutPrimary }}
                >
                  {nextTarget <= gridMax ? nextTarget : '✓'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  de {gridMax}
                </span>
              </div>
            </div>
          </div>

          {/* Penalty Toast Indicator */}
          {recentPenalty && (
            <div className="animate-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-600/50">
              <AlertTriangle className="w-4 h-4" />
              <span>-{errorPenalty}s Penalidade!</span>
            </div>
          )}

          {/* Right Stats: Round & Multiplier Combo */}
          <div className="flex items-center gap-2 ml-auto">
            <div
              className="px-3 py-1.5 rounded-xl border text-[11px] font-bold text-slate-300 bg-white/5"
              style={{ borderColor: `${layoutPrimary}33` }}
            >
              Rodada <strong className="text-white">{round}</strong>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all duration-300 ${
                combo > 1
                  ? 'text-white shadow-lg scale-105 animate-pulse'
                  : 'bg-white/10 text-slate-300 border border-white/10'
              }`}
              style={
                combo > 1
                  ? {
                      background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                      boxShadow: `0 4px 15px ${layoutGlow}`,
                    }
                  : undefined
              }
            >
              <Flame className="w-4 h-4 fill-current" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                {combo}x Combo
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xl my-2">
          <div className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${layoutPrimary}, ${layoutSecondary})`,
                boxShadow: `0 0 10px ${layoutGlow}`,
              }}
            />
          </div>
        </div>

        {/* Number Grid (4x4 = 16 or 4x5 = 20 or 5x5 = 25) */}
        <div className="my-auto w-full max-w-lg sm:max-w-xl flex items-center justify-center p-2">
          <div
            className={`w-full grid gap-2.5 sm:gap-3.5 ${
              gridMax === 25
                ? 'grid-cols-5'
                : gridMax === 20
                ? 'grid-cols-4 sm:grid-cols-5'
                : 'grid-cols-4'
            }`}
          >
            {tiles.map((tile) => {
              const isTarget = tile.value === nextTarget;
              const isError = errorTileId === tile.id;

              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.completed || gameOver || roundCompletedModal}
                  style={
                    tile.completed
                      ? undefined
                      : isError
                      ? {
                          borderColor: '#EF4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.25)',
                          boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                        }
                      : {
                          borderColor: isTarget ? `${layoutPrimary}` : `${layoutPrimary}44`,
                          boxShadow: isTarget ? `0 0 25px ${layoutGlow}` : undefined,
                        }
                  }
                  className={`relative aspect-square rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center font-black font-mono transition-all duration-150 active:scale-90 select-none ${
                    layoutDef.buttonClass
                  } ${
                    tile.completed
                      ? 'opacity-20 scale-95 pointer-events-none bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isError
                      ? 'animate-pulse text-white scale-95'
                      : isLightMode
                      ? 'bg-white/90 text-slate-900 hover:border-slate-400 shadow-md hover:scale-[1.02]'
                      : 'bg-slate-900/80 text-white hover:border-white/50 shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  {tile.completed ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl sm:text-2xl line-through text-slate-500">
                        {tile.value}
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute" />
                    </div>
                  ) : (
                    <span className="text-2xl sm:text-4xl lg:text-5xl font-black drop-shadow tracking-tighter">
                      {tile.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Hint Bar */}
        <div className="w-full text-center pb-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-400">
            Toque nos números em ordem crescente de <strong>1 a {gridMax}</strong> sem errar!
          </p>
        </div>

        {/* Round Complete Modal Overlay */}
        {roundCompletedModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
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
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" /> Sequência Perfeita!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Rodada {round} Concluída!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Você completou todos os {gridMax} números em tempo recorde!
                </p>
              </div>

              {/* Stats Box */}
              <div className="w-full grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/10 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tempo Restante:</span>
                  <p className="text-lg font-black text-amber-400 font-mono">{timeLeft}s</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pontuação Atual:</span>
                  <p className="text-lg font-black text-emerald-400 font-mono">{score}</p>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={startNextRound}
                  className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${layoutDef.buttonClass}`}
                  style={{
                    background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                    boxShadow: `0 4px 20px ${layoutGlow}`,
                  }}
                >
                  <span>Próxima Rodada</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={finishGameAsChampion}
                  className="py-3.5 px-4 rounded-2xl font-bold text-sm bg-white/15 hover:bg-white/20 active:scale-95 text-slate-200 border border-white/10 transition-all"
                >
                  Finalizar & Salvar Recorde
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
