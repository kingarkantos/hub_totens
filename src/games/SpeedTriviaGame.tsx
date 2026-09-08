import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Zap, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { SpeedTriviaCustomItem } from '../types/gameContent';

interface SpeedTriviaGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  customContent?: SpeedTriviaCustomItem[];
}

const DEFAULT_QUESTIONS: SpeedTriviaCustomItem[] = [
  {
    question: 'Qual a cor padrão de segurança para indicação de rotas de emergência?',
    options: ['Verde', 'Vermelho', 'Amarelo', 'Azul'],
    correct: 0,
  },
  {
    question: 'Qual norma regulamentadora rege os trabalhos em Altura?',
    options: ['NR-35', 'NR-10', 'NR-12', 'NR-6'],
    correct: 0,
  },
  {
    question: 'Em caso de princípio de incêndio elétrico, qual extintor é indicado?',
    options: ['Gás Carbônico (CO2)', 'Água Pressurizada', 'Espuma Mecânica', 'Areia Molhada'],
    correct: 0,
  },
  {
    question: 'Qual a primeira atitude ao se deparar com um acidente de trabalho?',
    options: ['Sinalizar o local e acionar a Brigada', 'Remover a vítima às pressas', 'Filmar para relatar', 'Ignorar e continuar'],
    correct: 0,
  },
  {
    question: 'O protetor auricular tipo concha protege principalmente contra:',
    options: ['Ruídos excessivos', 'Impacto de objetos', 'Gases asfixiantes', 'Luz intensa'],
    correct: 0,
  },
];

const QUESTION_TIME_LIMIT = 8; // 8 seconds per question

export const SpeedTriviaGame: React.FC<SpeedTriviaGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#EAB308',
  customContent,
}) => {
  const questions = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_QUESTIONS;
  }, [customContent]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionTime, setQuestionTime] = useState(QUESTION_TIME_LIMIT);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const activeQ = questions[currentIdx % questions.length];

  // Fast countdown timer
  useEffect(() => {
    if (answered || gameOver) return;

    const timer = setInterval(() => {
      setQuestionTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(-1); // timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, gameOver, currentIdx]);

  const handleAnswer = (optionIdx: number) => {
    if (answered || gameOver) return;

    setSelectedOpt(optionIdx);
    setAnswered(true);

    const isCorrect = optionIdx === activeQ.correct;
    if (isCorrect) {
      sound.playSuccess();
      const speedBonus = questionTime * 40;
      const streakBonus = streak * 60;
      const earned = 250 + speedBonus + streakBonus;
      setScore((prev) => prev + earned);
      setStreak((prev) => prev + 1);
    } else {
      sound.playError();
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOpt(null);
        setAnswered(false);
        setQuestionTime(QUESTION_TIME_LIMIT);
      } else {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(score >= 600);
      }
    }, 900);
  };

  const progressPercent = (questionTime / QUESTION_TIME_LIMIT) * 100;

  return (
    <GameContainer
      title="Trivia Rápida"
      category="Agilidade"
      score={score}
      timeRemaining={questionTime}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setCurrentIdx(0);
        setScore(0);
        setStreak(0);
        setQuestionTime(QUESTION_TIME_LIMIT);
        setSelectedOpt(null);
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
        {/* Speed Bar & Multiplier Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-amber-700 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              Pergunta {currentIdx + 1} de {questions.length}
            </span>

            {streak > 1 && (
              <span className="text-xs font-black text-white bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-yellow-300" />
                Multiplicador x{streak}!
              </span>
            )}
          </div>

          {/* High voltage animated progress bar */}
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                questionTime > 4
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="my-auto py-2">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl backdrop-blur-sm text-center">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
              {activeQ.question}
            </h3>
          </div>
        </div>

        {/* 4 Lightning Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {activeQ.options.map((opt, i) => {
            const isChosen = selectedOpt === i;
            const isCorrectAnswer = i === activeQ.correct;

            let btnClass = 'bg-white text-slate-800 border-2 border-slate-200 hover:border-amber-400';
            if (answered) {
              if (isCorrectAnswer) {
                btnClass = 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102';
              } else if (isChosen && !isCorrectAnswer) {
                btnClass = 'bg-rose-600 text-white border-rose-700';
              } else {
                btnClass = 'bg-slate-100 text-slate-400 opacity-50';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleAnswer(i)}
                className={`p-4 sm:p-5 rounded-2xl font-black text-sm sm:text-base text-left flex items-center justify-between transition-all active:scale-95 shadow-sm ${btnClass}`}
              >
                <span>{opt}</span>
                {answered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />}
                {answered && isChosen && !isCorrectAnswer && <XCircle className="w-5 h-5 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
