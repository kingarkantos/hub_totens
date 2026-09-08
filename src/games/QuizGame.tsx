import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle } from 'lucide-react';

import { BaseGameProps } from '../types';
import { QuizQuestionItem } from '../types/gameContent';

interface QuizGameProps extends BaseGameProps {
  customContent?: QuizQuestionItem[];
  orderMode?: 'random' | 'ordered';
  timeLimit?: number; // 0 = sem tempo, or seconds (default 15)
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

interface ShuffledOption {
  text: string;
  isCorrect: boolean;
}

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
  isLight,
  themeMode,
  orderMode = 'random',
  timeLimit,
}) => {
  const isLightMode = isLight ?? (themeMode === 'light' || theme?.textColor?.includes('text-slate-900') || theme?.bgGradient?.includes('slate-100'));
  const isUnlimitedTime = timeLimit === 0;
  const questionSeconds = timeLimit && timeLimit > 0 ? timeLimit : 15;

  const rawQuestions = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_QUESTIONS;
  }, [customContent]);

  // Questions in random or sequential order
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(() => {
    if (orderMode === 'ordered') return [...rawQuestions];
    return [...rawQuestions].sort(() => Math.random() - 0.5);
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questionSeconds);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Dynamic Shuffled Options for each question so A, B, C, D are NEVER in the same position
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);

  useEffect(() => {
    if (!questions[currentIdx]) return;
    const q = questions[currentIdx];
    const opts: ShuffledOption[] = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correct,
    }));

    // Fisher-Yates shuffle options
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }

    setShuffledOptions(opts);
  }, [currentIdx, questions]);

  const handleTimeout = useCallback(() => {
    if (isUnlimitedTime) return;
    setAnswered(true);
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
        setTimeLeft(questionSeconds);
      } else {
        setGameOver(true);
      }
    }, 1400);
  }, [currentIdx, questions.length, isUnlimitedTime, questionSeconds]);

  useEffect(() => {
    if (gameOver || answered || isUnlimitedTime) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, answered, isUnlimitedTime, handleTimeout]);

  const handleSelect = (idx: number) => {
    if (answered || gameOver) return;
    setSelectedOption(idx);
    setAnswered(true);

    const isCorrect = shuffledOptions[idx]?.isCorrect;
    if (isCorrect) {
      sound.playSuccess();
      const points = isUnlimitedTime ? 100 : 100 + timeLeft * 10;
      setScore((s) => s + points);
    } else {
      sound.playError();
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
        setTimeLeft(questionSeconds);
      } else {
        setGameOver(true);
      }
    }, 1400);
  };

  const restart = () => {
    if (orderMode === 'ordered') {
      setQuestions([...rawQuestions]);
    } else {
      setQuestions([...rawQuestions].sort(() => Math.random() - 0.5));
    }
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(questionSeconds);
    setSelectedOption(null);
    setAnswered(false);
    setGameOver(false);
  };

  const currentQ = questions[currentIdx] || rawQuestions[0];

  return (
    <GameContainer
      title="Quiz da Marca"
      category="Conhecimento"
      score={score}
      timeRemaining={isUnlimitedTime ? undefined : timeLeft}
      gameOver={gameOver}
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
      <div className="w-full max-w-3xl lg:max-w-4xl flex-1 flex flex-col justify-between py-4 sm:py-8 px-2 sm:px-6 gap-4 sm:gap-6 animate-in fade-in duration-300">
        {/* Top Progress & Status */}
        <div className={`w-full flex items-center justify-between px-2 text-sm sm:text-base font-black ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            Questão {currentIdx + 1} de {questions.length}
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  i === currentIdx
                    ? 'bg-amber-500 w-8 sm:w-12 shadow-md shadow-amber-500/40'
                    : i < currentIdx
                    ? 'bg-emerald-500 w-4 sm:w-6'
                    : isLightMode
                    ? 'bg-slate-300 w-4 sm:w-6'
                    : 'bg-white/20 w-4 sm:w-6'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Large Prominent Question Card */}
        <div
          className={`w-full p-6 sm:p-10 rounded-3xl backdrop-blur-xl border-2 text-center shadow-2xl transition-all ${
            isLightMode 
              ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60' 
              : 'bg-slate-900/85 border-white/20 shadow-black/40'
          }`}
          style={{
            borderColor: isLightMode 
              ? (themePrimary ? `${themePrimary}60` : undefined)
              : (themePrimary ? `${themePrimary}80` : undefined),
            boxShadow: themePrimary 
              ? `0 20px 50px -15px ${themePrimary}25` 
              : undefined,
          }}
        >
          <span 
            style={{ color: themePrimary }}
            className={`inline-block text-xs sm:text-sm font-black uppercase tracking-widest mb-3 ${!themePrimary && (isLightMode ? 'text-red-600' : 'text-amber-300/90')}`}
          >
            Selecione a resposta correta:
          </span>
          <h3 className={`text-xl sm:text-3xl md:text-4xl font-black leading-snug sm:leading-normal tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            {currentQ.question}
          </h3>
        </div>

        {/* Large Tactile Option Buttons (Randomized A, B, C, D) */}
        <div className="w-full flex flex-col gap-3.5 sm:gap-5 flex-1 justify-center">
          {shuffledOptions.map((opt, idx) => {
            let btnStyle = isLightMode
              ? 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-900 shadow-md'
              : 'bg-slate-900/85 border-white/15 hover:bg-slate-800/90 hover:border-white/40 text-white';
            let icon = null;

            if (answered) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-950/60 scale-[1.01]';
                icon = <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />;
              } else if (idx === selectedOption) {
                btnStyle = 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-950/60';
                icon = <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />;
              } else {
                btnStyle = isLightMode
                  ? 'bg-slate-100/60 border-slate-200/50 text-slate-400 opacity-40'
                  : 'bg-slate-950/50 border-white/5 text-slate-500 opacity-40';
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
                  <span className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-mono text-lg sm:text-2xl font-black flex-shrink-0 ${
                    isLightMode && !answered
                      ? 'bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                      : 'bg-white/10 text-white shadow-inner'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt.text}</span>
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
