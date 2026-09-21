import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Check, X, ThumbsUp, ThumbsDown, Zap, ArrowRight } from 'lucide-react';
import { BaseGameProps } from '../types';
import { TrueFalseCustomItem } from '../types/gameContent';

interface TrueFalseGameProps extends BaseGameProps {
  customContent?: TrueFalseCustomItem[];
}

const DEFAULT_STATEMENTS: TrueFalseCustomItem[] = [
  {
    statement: 'O protetor auditivo só é necessário quando o ruído for desconfortável.',
    isTrue: false,
    explanation: 'Falso! O ruído causa perda auditiva cumulativa e irreversível mesmo sem incômodo imediato.',
  },
  {
    statement: 'As rotas de fuga e saídas de emergência devem permanecer sempre 100% desobstruídas.',
    isTrue: true,
    explanation: 'Verdadeiro! Qualquer obstrução pode custar vidas preciosas em uma evacuação emergencial.',
  },
  {
    statement: 'Se o EPI apresentar trincas leves, pode continuar sendo usado até o fim da semana.',
    isTrue: false,
    explanation: 'Falso! Qualquer dano ou trinca compromete a resistência do EPI e exige troca imediata.',
  },
  {
    statement: 'Antes de realizar manutenções em máquinas elétricas, o bloqueio e etiquetagem (LOTO) são vitais.',
    isTrue: true,
    explanation: 'Verdadeiro! O bloqueio impede a energização acidental durante o trabalho.',
  },
  {
    statement: 'Trabalhos em altura acima de 2 metros exigem cinto de segurança tipo paraquedista com talabarte.',
    isTrue: true,
    explanation: 'Verdadeiro! A NR-35 exige sistema de proteção contra quedas para atividades acima de 2m.',
  },
];

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#3B82F6',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  isLight,
  themeMode,
  orderMode = 'random',
  timeLimit,
  totalTimeLimit,
  customContent,
}) => {
  const isLightMode = isLight ?? (themeMode === 'light' || theme?.textColor?.includes('text-slate-900') || theme?.bgGradient?.includes('slate-100'));
  const rawStatements = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_STATEMENTS;
  }, [customContent]);

  const [statements, setStatements] = useState<TrueFalseCustomItem[]>(() => {
    if (orderMode === 'ordered') return [...rawStatements];
    return [...rawStatements].sort(() => Math.random() - 0.5);
  });

  const isUnlimitedQuestionTime = timeLimit === 0;
  const questionSeconds = timeLimit !== undefined && timeLimit > 0 ? timeLimit : (timeLimit === 0 ? 0 : 15);
  const hasTotalTime = totalTimeLimit !== undefined && totalTimeLimit > 0;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questionSeconds);
  const [totalTimeLeft, setTotalTimeLeft] = useState(totalTimeLimit || 0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const currentItem = statements[currentIdx % statements.length];

  // Question Timer (counts down each statement if configured)
  useEffect(() => {
    if (gameOver || answered || isUnlimitedQuestionTime) return;
    if (timeLeft <= 0) {
      sound.playError();
      setAnswered(true);
      setStreak(0);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, answered, isUnlimitedQuestionTime]);

  // Overall Total Game Timer (if configured)
  useEffect(() => {
    if (gameOver || !hasTotalTime) return;
    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(score >= 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, hasTotalTime, score]);

  const handleAnswer = (answer: boolean) => {
    if (answered || gameOver) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const isCorrect = answer === currentItem.isTrue;
    if (isCorrect) {
      sound.playSuccess();
      const comboBonus = streak * 50;
      const timeBonus = !isUnlimitedQuestionTime && timeLeft > 0 ? timeLeft * 10 : 0;
      const points = 200 + comboBonus + timeBonus;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
    } else {
      sound.playError();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (currentIdx + 1 < statements.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(questionSeconds);
    } else {
      sound.playFanfare();
      setGameOver(true);
      setGameWon(score >= 400);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(questionSeconds);
    if (hasTotalTime) setTotalTimeLeft(totalTimeLimit || 0);
    setSelectedAnswer(null);
    setAnswered(false);
    setGameOver(false);
    setGameWon(false);
    if (orderMode !== 'ordered') {
      setStatements([...rawStatements].sort(() => Math.random() - 0.5));
    }
  };

  const activeTimeDisplay = !isUnlimitedQuestionTime
    ? timeLeft
    : hasTotalTime
    ? totalTimeLeft
    : undefined;

  return (
    <GameContainer
      title="Verdadeiro ou Falso"
      category="Julgamento"
      score={score}
      timeRemaining={activeTimeDisplay}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
      theme={theme}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="flex flex-col flex-1 w-full max-w-3xl lg:max-w-4xl mx-auto justify-between py-4 sm:py-8 px-2 sm:px-6 gap-5 sm:gap-8 select-none animate-in fade-in duration-300">
        {/* Progress & Streak Header */}
        <div className={`flex items-center justify-between rounded-2xl px-5 py-3.5 shadow-sm border-2 ${
          isLightMode 
            ? 'bg-blue-50 border-blue-200/80 text-blue-900' 
            : 'bg-slate-900/90 border-blue-500/30 text-blue-300'
        }`}>
          <span className="text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Afirmação {currentIdx + 1} de {statements.length}
          </span>
          {streak > 1 && (
            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600/50 px-4 py-1.5 rounded-full flex items-center gap-1.5 animate-bounce shadow-xs">
              <Zap className="w-4 h-4 fill-amber-500" />
              Combo x{streak}!
            </span>
          )}
        </div>

        {/* Statement Card */}
        <div className="my-auto py-2">
          <div className={`rounded-3xl p-8 sm:p-12 md:p-14 border-2 shadow-2xl text-center backdrop-blur-xl transition-all ${
            isLightMode
              ? 'bg-white/95 border-slate-200 shadow-slate-200/60'
              : 'bg-slate-900/85 border-white/20 shadow-black/50'
          }`}>
            <span className={`inline-block text-xs sm:text-sm font-black uppercase tracking-widest mb-4 ${
              isLightMode ? 'text-slate-400' : 'text-slate-400'
            }`}>
              Julgue a afirmação abaixo:
            </span>
            <h3 className={`text-2xl sm:text-4xl md:text-5xl font-black leading-snug sm:leading-normal tracking-tight ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              "{currentItem.statement}"
            </h3>

            {/* Explanation reveal */}
            {answered && (
              <div
                className={`mt-6 sm:mt-8 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-2 text-left transition-all animate-fadeIn ${
                  selectedAnswer === currentItem.isTrue
                    ? isLightMode ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                    : isLightMode ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-rose-950/70 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5 font-black text-base sm:text-xl mb-2">
                  {selectedAnswer === currentItem.isTrue ? (
                    <>
                      <Check className="w-6 h-6 text-emerald-500 stroke-[3]" />
                      Você acertou!
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6 text-rose-500 stroke-[3]" />
                      Resposta incorreta!
                    </>
                  )}
                </div>
                <p className="text-sm sm:text-lg font-bold leading-relaxed">
                  {currentItem.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!answered ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="py-8 sm:py-10 min-h-[110px] sm:min-h-[135px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-xl sm:text-3xl shadow-xl shadow-emerald-900/40 flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 border-b-4 border-emerald-800"
            >
              <ThumbsUp className="w-9 h-9 sm:w-12 sm:h-12 stroke-[2.5]" />
              VERDADEIRO
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="py-8 sm:py-10 min-h-[110px] sm:min-h-[135px] bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black text-xl sm:text-3xl shadow-xl shadow-rose-900/40 flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 border-b-4 border-rose-800"
            >
              <ThumbsDown className="w-9 h-9 sm:w-12 sm:h-12 stroke-[2.5]" />
              FALSO
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-6 sm:py-7 min-h-[85px] sm:min-h-[95px] bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xl sm:text-2xl shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-blue-800"
            >
              <span>Próxima Pergunta</span>
              <ArrowRight className="w-7 h-7 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
