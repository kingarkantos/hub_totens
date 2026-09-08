import React, { useState, useEffect, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle } from 'lucide-react';

import { QuizQuestionItem } from '../types/gameContent';

interface QuizGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  customContent?: QuizQuestionItem[];
}

const DEFAULT_QUESTIONS: QuizQuestionItem[] = [
  {
    question: 'Qual o compromisso pioneiro da marca para mobilidade do futuro?',
    options: ['Eletrificação e Zero Emissões', 'Mais consumo de combustível', 'Veículos sem revisão', 'Motores apenas a vapor'],
    correct: 0,
  },
  {
    question: 'O que o sistema inteligente de assistência à condução proporciona?',
    options: ['Menor visibilidade', 'Máxima segurança e frenagem autônoma', 'Aumento de ruído', 'Desativação dos freios'],
    correct: 1,
  },
  {
    question: 'Qual a principal vantagem da motorização híbrida avançada?',
    options: ['Maior poluição', 'Eficiência energética e potência instantânea', 'Tanque menor sem autonomia', 'Perda de torque'],
    correct: 1,
  },
  {
    question: 'Qual o atributo mais reconhecido e elogiado pelos clientes em todo o Brasil?',
    options: ['Durabilidade, confiabilidade e revenda', 'Peças descartáveis', 'Falta de peças', 'Pneus sem aderência'],
    correct: 0,
  },
  {
    question: 'No painel digital touchscreen do veículo, o que você pode conectar?',
    options: ['Somente fita K7', 'Apple CarPlay e Android Auto sem fio', 'Disquete de computador', 'Rádio AM apenas'],
    correct: 1,
  },
];

export const QuizGame: React.FC<QuizGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#2563EB',
  customContent,
}) => {
  const QUESTIONS = customContent && customContent.length > 0 ? customContent : DEFAULT_QUESTIONS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleTimeout = useCallback(() => {
    sound.playError();
    setAnswered(true);
    setTimeout(() => {
      if (currentIdx + 1 < QUESTIONS.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
        setTimeLeft(15);
      } else {
        setGameOver(true);
      }
    }, 1400);
  }, [currentIdx]);

  useEffect(() => {
    if (gameOver || answered) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, answered, handleTimeout]);

  const handleSelect = (idx: number) => {
    if (answered || gameOver) return;
    setSelectedOption(idx);
    setAnswered(true);

    const isCorrect = idx === QUESTIONS[currentIdx].correct;
    if (isCorrect) {
      sound.playSuccess();
      const points = 100 + timeLeft * 10;
      setScore((s) => s + points);
    } else {
      sound.playError();
    }

    setTimeout(() => {
      if (currentIdx + 1 < QUESTIONS.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
        setTimeLeft(15);
      } else {
        setGameOver(true);
      }
    }, 1400);
  };

  const restart = () => {
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setAnswered(false);
    setGameOver(false);
  };

  const currentQ = QUESTIONS[currentIdx];

  return (
    <GameContainer
      title="Quiz da Marca"
      category="Conhecimento"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
    >
      <div className="w-full max-w-lg flex flex-col items-center gap-3 sm:gap-4 my-auto animate-in fade-in duration-200">
        {/* Progress indicator */}
        <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
          <span>Questão {currentIdx + 1} de {QUESTIONS.length}</span>
          <div className="flex gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`w-4 sm:w-5 h-1.5 sm:h-2 rounded-full transition-all ${
                  i === currentIdx ? 'bg-amber-400 w-6 sm:w-8' : i < currentIdx ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-white/15 text-center shadow-xl">
          <h3 className="text-base sm:text-xl font-black text-white leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Options Grid */}
        <div className="w-full flex flex-col gap-2.5 sm:gap-3">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = 'bg-slate-800/90 border-white/15 hover:bg-slate-800 text-white';
            let icon = null;

            if (answered) {
              if (idx === currentQ.correct) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/50 scale-[1.01]';
                icon = <CheckCircle2 className="w-5 h-5 text-white" />;
              } else if (idx === selectedOption) {
                btnStyle = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/50';
                icon = <XCircle className="w-5 h-5 text-white" />;
              } else {
                btnStyle = 'bg-slate-900/50 border-white/5 text-slate-500 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-base flex items-center justify-between transition-all active:scale-98 ${btnStyle}`}
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs sm:text-sm flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
