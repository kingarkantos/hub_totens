import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Check, X, ThumbsUp, ThumbsDown, Zap, ArrowRight } from 'lucide-react';
import { TrueFalseCustomItem } from '../types/gameContent';

interface TrueFalseGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
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
  customContent,
}) => {
  const statements = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_STATEMENTS;
  }, [customContent]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const currentItem = statements[currentIdx % statements.length];

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(score >= 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, score]);

  const handleAnswer = (answer: boolean) => {
    if (answered || gameOver) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const isCorrect = answer === currentItem.isTrue;
    if (isCorrect) {
      sound.playSuccess();
      const comboBonus = streak * 50;
      const points = 200 + comboBonus;
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
    } else {
      sound.playFanfare();
      setGameOver(true);
      setGameWon(score >= 600);
    }
  };

  return (
    <GameContainer
      title="Verdadeiro ou Falso"
      category="Julgamento"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setCurrentIdx(0);
        setScore(0);
        setStreak(0);
        setTimeLeft(45);
        setSelectedAnswer(null);
        setAnswered(false);
        setGameOver(false);
        setGameWon(false);
      }}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
    >
      <div className="flex flex-col h-full max-w-xl mx-auto justify-between select-none">
        {/* Progress & Streak Header */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="text-xs font-black uppercase text-blue-800">
            Afirmação {currentIdx + 1} de {statements.length}
          </span>
          {streak > 1 && (
            <span className="text-xs font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              Combo x{streak}!
            </span>
          )}
        </div>

        {/* Statement Card */}
        <div className="my-auto py-2">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl text-center backdrop-blur-sm">
            <span className="inline-block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Julgue a afirmação abaixo:
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
              "{currentItem.statement}"
            </h3>

            {/* Explanation reveal */}
            {answered && (
              <div
                className={`mt-5 p-4 rounded-2xl border text-left transition-all animate-fadeIn ${
                  selectedAnswer === currentItem.isTrue
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm mb-1">
                  {selectedAnswer === currentItem.isTrue ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Você acertou!
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                      Resposta incorreta!
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {currentItem.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!answered ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="py-6 sm:py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-lg sm:text-xl shadow-lg shadow-emerald-600/30 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 border-b-4 border-emerald-800"
            >
              <ThumbsUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              VERDADEIRO
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="py-6 sm:py-7 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black text-lg sm:text-xl shadow-lg shadow-rose-600/30 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 border-b-4 border-rose-800"
            >
              <ThumbsDown className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              FALSO
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Próxima Pergunta
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
