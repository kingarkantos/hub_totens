import React, { useState, useEffect, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle } from 'lucide-react';

import { ThemeDefinition } from '../types';
import { QuizQuestionItem } from '../types/gameContent';

interface QuizGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  theme?: ThemeDefinition;
  customBgStyle?: React.CSSProperties;
  campaignName?: string;
  clientName?: string;
  splashImageUrl?: string;
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
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
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
  }, [currentIdx, QUESTIONS.length]);

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
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="w-full max-w-3xl lg:max-w-4xl flex-1 flex flex-col justify-between py-4 sm:py-8 px-2 sm:px-6 gap-4 sm:gap-6 animate-in fade-in duration-300">
        {/* Top Progress & Status */}
        <div className="w-full flex items-center justify-between px-2 text-sm sm:text-base font-black text-slate-300">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Questão {currentIdx + 1} de {QUESTIONS.length}
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  i === currentIdx
                    ? 'bg-amber-400 w-8 sm:w-12 shadow-md shadow-amber-400/40'
                    : i < currentIdx
                    ? 'bg-emerald-500 w-4 sm:w-6'
                    : 'bg-white/20 w-4 sm:w-6'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Large Prominent Question Card */}
        <div
          className="w-full p-6 sm:p-10 rounded-3xl bg-slate-900/85 backdrop-blur-xl border-2 text-center shadow-2xl transition-all"
          style={{
            borderColor: themePrimary ? `${themePrimary}80` : 'rgba(255, 255, 255, 0.2)',
            boxShadow: themePrimary ? `0 20px 50px -15px ${themePrimary}30` : undefined,
          }}
        >
          <span className="inline-block text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300/90 mb-3">
            Selecione a resposta correta:
          </span>
          <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-snug sm:leading-normal tracking-tight">
            {currentQ.question}
          </h3>
        </div>

        {/* Large Tactile Option Buttons */}
        <div className="w-full flex flex-col gap-3.5 sm:gap-5 flex-1 justify-center">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = 'bg-slate-900/85 border-white/15 hover:bg-slate-800/90 hover:border-white/40 text-white';
            let icon = null;

            if (answered) {
              if (idx === currentQ.correct) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-950/60 scale-[1.01]';
                icon = <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />;
              } else if (idx === selectedOption) {
                btnStyle = 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-950/60';
                icon = <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />;
              } else {
                btnStyle = 'bg-slate-950/50 border-white/5 text-slate-500 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full p-5 sm:p-7 min-h-[85px] sm:min-h-[105px] rounded-2xl sm:rounded-3xl border-2 font-black text-lg sm:text-2xl flex items-center justify-between gap-4 transition-all active:scale-[0.98] shadow-lg ${btnStyle}`}
              >
                <div className="flex items-center gap-4 sm:gap-6 text-left flex-1">
                  <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center font-mono text-lg sm:text-2xl font-black flex-shrink-0 shadow-inner">
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
