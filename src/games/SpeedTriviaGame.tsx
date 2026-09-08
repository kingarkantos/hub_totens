import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Zap, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { BaseGameProps } from '../types';
import { SpeedTriviaCustomItem } from '../types/gameContent';

interface SpeedTriviaGameProps extends BaseGameProps {
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
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
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
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="flex flex-col flex-1 w-full max-w-2xl sm:max-w-3xl mx-auto justify-between py-2 sm:py-4 select-none">
        {/* Speed Bar & Multiplier Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
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
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                questionTime > 4
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="my-auto py-2">
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border-2 border-white/20 shadow-2xl text-center">
            <h3 className="text-xl sm:text-3xl font-black text-white leading-snug">
              {activeQ.question}
            </h3>
          </div>
        </div>

        {/* 4 Lightning Options - Large Touch Friendly Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
          {activeQ.options.map((opt, i) => {
            const isChosen = selectedOpt === i;
            const isCorrectAnswer = i === activeQ.correct;

            let btnClass = 'bg-slate-900/80 text-white border-2 border-white/20 hover:border-amber-400';
            if (answered) {
              if (isCorrectAnswer) {
                btnClass = 'bg-emerald-600 text-white border-emerald-400 shadow-lg scale-102';
              } else if (isChosen && !isCorrectAnswer) {
                btnClass = 'bg-rose-600 text-white border-rose-400';
              } else {
                btnClass = 'bg-slate-950/40 text-slate-500 border-white/5 opacity-40';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleAnswer(i)}
                className={`p-5 sm:p-6 min-h-[75px] sm:min-h-[85px] rounded-2xl sm:rounded-3xl font-black text-base sm:text-xl text-left flex items-center justify-between transition-all active:scale-95 shadow-md ${btnClass}`}
              >
                <span>{opt}</span>
                {answered && isCorrectAnswer && <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />}
                {answered && isChosen && !isCorrectAnswer && <XCircle className="w-6 h-6 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
