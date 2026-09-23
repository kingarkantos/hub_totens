import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { ArrowUp, ArrowDown, Check, ListOrdered, Sparkles, CheckCircle2 } from 'lucide-react';
import { BaseGameProps } from '../types';
import { CorrectOrderCustomItem } from '../types/gameContent';

interface CorrectOrderGameProps extends BaseGameProps {
  customContent?: CorrectOrderCustomItem;
}

const DEFAULT_PROCEDURE: CorrectOrderCustomItem = {
  title: 'Procedimento Seguro de Trabalho em Altura',
  steps: [
    'Inspecionar visualmente o cinto paraquedista e os mosquetões',
    'Isolar e sinalizar a área no solo abaixo da estrutura',
    'Conectar o talabarte duplo na linha de vida homologada',
    'Iniciar a atividade mantendo 100% do tempo ancorado',
  ],
};

export const CorrectOrderGame: React.FC<CorrectOrderGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#0D9488',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
  isLight,
  themeMode,
  gameLayout,
}) => {
  const isLightMode = isLight ?? (themeMode === 'light' || theme?.textColor?.includes('text-slate-900') || theme?.bgGradient?.includes('slate-100'));
  const procedure = useMemo(() => {
    return customContent?.steps && customContent.steps.length >= 3 ? customContent : DEFAULT_PROCEDURE;
  }, [customContent]);

  const correctSteps = procedure.steps;

  // Shuffle steps initially
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    // Shuffle steps ensuring it's not accidentally already solved
    let shuffled = [...correctSteps].sort(() => Math.random() - 0.5);
    while (shuffled.every((s, i) => s === correctSteps[i]) && correctSteps.length > 1) {
      shuffled = [...correctSteps].sort(() => Math.random() - 0.5);
    }
    setCurrentSteps(shuffled);
    setValidated(false);
    setScore(0);
    setAttempts(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameWon(false);
  }, [correctSteps]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  const moveStep = (index: number, direction: 'up' | 'down') => {
    sound.playTap();
    setValidated(false);

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSteps.length) return;

    const updated = [...currentSteps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setCurrentSteps(updated);
  };

  const handleValidateOrder = () => {
    setAttempts((prev) => prev + 1);
    setValidated(true);

    const isAllCorrect = currentSteps.every((step, i) => step === correctSteps[i]);

    if (isAllCorrect) {
      sound.playSuccess();
      const points = 500 + timeLeft * 10 - attempts * 50;
      setScore(Math.max(200, points));
      setTimeout(() => {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }, 600);
    } else {
      sound.playError();
    }
  };

  return (
    <GameContainer
      title="Ordem Correta"
      category="Processos"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        const shuffled = [...correctSteps].sort(() => Math.random() - 0.5);
        setCurrentSteps(shuffled);
        setValidated(false);
        setScore(0);
        setAttempts(0);
        setTimeLeft(60);
        setGameOver(false);
        setGameWon(false);
      }}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
      gameLayout={gameLayout}
    >
      <div className="flex flex-col flex-1 w-full max-w-3xl lg:max-w-4xl mx-auto justify-between py-4 sm:py-8 px-2 sm:px-6 gap-5 sm:gap-8 select-none animate-in fade-in duration-300">
        {/* Procedure Title */}
        <div className={`rounded-3xl p-6 sm:p-8 border-2 text-center shadow-xl backdrop-blur-xl ${
          isLightMode
            ? 'bg-teal-50/90 border-teal-200 text-teal-950'
            : 'bg-slate-900/85 border-teal-500/30 text-white'
        }`}>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center justify-center gap-2 mb-2">
            <ListOrdered className="w-5 h-5 text-teal-500" />
            Organize os passos na sequência ideal:
          </span>
          <h3 className="text-xl sm:text-3xl font-black leading-snug tracking-tight">
            {procedure.title}
          </h3>
        </div>

        {/* Steps List */}
        <div className="my-auto py-2 space-y-3 sm:space-y-4">
          {currentSteps.map((step, idx) => {
            const isCorrectPosition = validated && step === correctSteps[idx];
            const isWrongPosition = validated && step !== correctSteps[idx];

            return (
              <div
                key={step}
                className={`flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all shadow-lg ${
                  isCorrectPosition
                    ? isLightMode ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : isWrongPosition
                    ? isLightMode ? 'bg-rose-50 border-rose-400 text-rose-950' : 'bg-rose-950/60 border-rose-500 text-rose-200'
                    : isLightMode ? 'bg-white border-slate-200 text-slate-900 shadow-md' : 'bg-slate-900/85 border-white/20 text-white shadow-md'
                }`}
              >
                {/* Step number badge */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl flex-shrink-0 shadow-md ${
                    isCorrectPosition
                      ? 'bg-emerald-600 text-white'
                      : isWrongPosition
                      ? 'bg-rose-600 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isCorrectPosition ? <Check className="w-7 h-7 stroke-[3]" /> : idx + 1}
                </div>

                {/* Step text */}
                <div className="flex-1 text-base sm:text-xl font-black leading-snug">
                  {step}
                </div>

                {/* Up/Down buttons for touch totens */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, 'up')}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 active:scale-90 disabled:opacity-20 flex items-center justify-center text-slate-800 dark:text-white transition-all shadow-sm"
                  >
                    <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentSteps.length - 1}
                    onClick={() => moveStep(idx, 'down')}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 active:scale-90 disabled:opacity-20 flex items-center justify-center text-slate-800 dark:text-white transition-all shadow-sm"
                  >
                    <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validate Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleValidateOrder}
            className="w-full py-6 sm:py-7 min-h-[85px] sm:min-h-[95px] bg-teal-600 hover:bg-teal-500 text-white rounded-3xl font-black text-xl sm:text-2xl shadow-xl shadow-teal-950/50 flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-teal-800"
          >
            <CheckCircle2 className="w-7 h-7 stroke-[3]" />
            <span>Verificar Ordem</span>
          </button>
        </div>
      </div>
    </GameContainer>
  );
};
