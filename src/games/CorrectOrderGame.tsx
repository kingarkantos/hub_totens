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
}) => {
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
    >
      <div className="flex flex-col flex-1 w-full max-w-2xl sm:max-w-3xl mx-auto justify-between py-2 select-none">
        {/* Procedure Title */}
        <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3 text-center shadow-sm">
          <span className="text-xs font-black uppercase text-teal-800 flex items-center justify-center gap-1.5 mb-0.5">
            <ListOrdered className="w-4 h-4 text-teal-600" />
            Organize os passos na sequência ideal:
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
            {procedure.title}
          </h3>
        </div>

        {/* Steps List */}
        <div className="my-auto py-2 space-y-2.5">
          {currentSteps.map((step, idx) => {
            const isCorrectPosition = validated && step === correctSteps[idx];
            const isWrongPosition = validated && step !== correctSteps[idx];

            return (
              <div
                key={step}
                className={`flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl border-2 transition-all shadow-sm ${
                  isCorrectPosition
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : isWrongPosition
                    ? 'bg-rose-50 border-rose-400 text-rose-950'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Step number badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    isCorrectPosition
                      ? 'bg-emerald-600 text-white'
                      : isWrongPosition
                      ? 'bg-rose-600 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isCorrectPosition ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
                </div>

                {/* Step text */}
                <div className="flex-1 text-xs sm:text-sm font-bold leading-tight">
                  {step}
                </div>

                {/* Up/Down buttons for touch totens */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, 'up')}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-20 flex items-center justify-center text-slate-700 transition-all active:scale-90"
                  >
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentSteps.length - 1}
                    onClick={() => moveStep(idx, 'down')}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-20 flex items-center justify-center text-slate-700 transition-all active:scale-90"
                  >
                    <ArrowDown className="w-5 h-5 stroke-[2.5]" />
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
            className="w-full py-4.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 border-b-4 border-teal-800"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            Verificar Ordem
          </button>
        </div>
      </div>
    </GameContainer>
  );
};
