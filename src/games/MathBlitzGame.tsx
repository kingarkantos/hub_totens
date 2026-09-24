import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { Calculator, Zap, Flame, Award, CheckCircle2, XCircle } from 'lucide-react';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface MathBlitzGameProps extends BaseGameProps {
  customContent?: any;
}

interface Question {
  text: string;
  options: number[];
  correct: number;
  label?: string;
}

const generateQuestion = (level: number): Question => {
  const operations = ['+', '-', '×'];
  if (level > 3) operations.push('÷');

  const op = operations[Math.floor(Math.random() * operations.length)];
  let a = 0;
  let b = 0;
  let correct = 0;

  if (op === '+') {
    a = Math.floor(Math.random() * 40) + 10;
    b = Math.floor(Math.random() * 40) + 10;
    correct = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 30;
    b = Math.floor(Math.random() * (a - 10)) + 5;
    correct = a - b;
  } else if (op === '×') {
    a = Math.floor(Math.random() * 11) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    correct = a * b;
  } else {
    b = Math.floor(Math.random() * 8) + 2;
    correct = Math.floor(Math.random() * 12) + 2;
    a = b * correct;
  }

  // Generate 3 unique wrong options near the correct answer
  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 3) {
    const delta = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 10) + 1);
    const candidate = correct + delta;
    if (candidate !== correct && candidate >= 0) {
      wrongOptions.add(candidate);
    }
  }

  const allOptions = [correct, ...Array.from(wrongOptions)];
  // Shuffle options
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }

  return {
    text: `${a} ${op} ${b} = ?`,
    options: allOptions,
    correct,
  };
};

export const MathBlitzGame: React.FC<MathBlitzGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#6366F1',
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
  } = props;

  const { activeLayout, layoutPrimary, layoutSecondary, darkPrimary, layoutGlow, isLightMode } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

  const initialTime = totalTimeLimit !== undefined && totalTimeLimit > 0 ? totalTimeLimit : 30;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestion(1));
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Countdown timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const handleSelect = (option: number) => {
    if (gameOver || feedback !== null) return;
    setSelectedAnswer(option);

    const isCorrect = option === currentQuestion.correct;
    setAnsweredCount((c) => c + 1);

    if (isCorrect) {
      sound.playSuccess();
      const points = 100 * combo;
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
      setCombo((prev) => {
        const next = Math.min(prev + 1, 5);
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setFeedback('correct');
    } else {
      sound.playError();
      setCombo(1);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      setCurrentQuestion(generateQuestion(correctCount + 1));
    }, 450);
  };

  const restart = () => {
    setTimeLeft(initialTime);
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setAnsweredCount(0);
    setCorrectCount(0);
    setGameOver(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setCurrentQuestion(generateQuestion(1));
  };

  return (
    <GameContainer
      title="Cálculo Turbo"
      category="Cálculo & Lógica Numérica"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={correctCount > 0}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      correctAnswers={correctCount}
      totalQuestions={answeredCount}
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
      <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Top HUD: Combo and Stats */}
        <div className="w-full flex items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border"
            style={{ borderColor: `${layoutPrimary}44` }}
          >
            <Calculator className="w-5 h-5" style={{ color: layoutPrimary }} />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              Acertos: <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>{correctCount}</strong>
            </span>
          </div>

          {/* Multiplier Badge */}
          <div
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl transition-all duration-300 ${
              combo > 1
                ? 'text-white shadow-lg scale-105 animate-pulse'
                : 'bg-white/10 text-slate-300 border border-white/10'
            }`}
            style={
              combo > 1
                ? {
                    background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                    boxShadow: `0 4px 20px ${layoutGlow}`
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

        {/* Central Display: Equation Card */}
        <div className="relative my-auto w-full max-w-2xl flex flex-col items-center">
          <div
            style={
              feedback === null
                ? {
                    borderColor: `${layoutPrimary}66`,
                    boxShadow: `0 0 35px ${layoutGlow}`
                  }
                : undefined
            }
            className={`w-full p-8 sm:p-12 rounded-3xl border-2 transition-all duration-300 shadow-2xl flex flex-col items-center justify-center text-center ${
              feedback === 'correct'
                ? 'bg-emerald-500/20 border-emerald-400 scale-[1.02]'
                : feedback === 'wrong'
                ? 'bg-rose-500/20 border-rose-400 animate-shake'
                : isLightMode
                ? 'bg-white/95 text-slate-900'
                : 'bg-slate-900/90 text-white backdrop-blur-xl'
            }`}
          >
            <span 
              className="text-[11px] sm:text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-1.5"
              style={{ color: layoutPrimary }}
            >
              <Zap className="w-4 h-4 fill-current" />
              Operação Rápida
            </span>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight my-2">
              {currentQuestion.text}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">
              Toque no resultado correto antes que o tempo esgote
            </p>
          </div>

          {/* 4 Touch Options Grid */}
          <div className="w-full grid grid-cols-2 gap-4 mt-6">
            {currentQuestion.options.map((option, idx) => {
              const isChosen = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correct;
              const showSuccess = isChosen && feedback === 'correct';
              const showFail = isChosen && feedback === 'wrong';

              return (
                <button
                  key={`${option}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={feedback !== null}
                  style={
                    !showSuccess && !showFail
                      ? { borderColor: `${layoutPrimary}44` }
                      : {}
                  }
                  className={`py-6 sm:py-8 px-6 rounded-2xl sm:rounded-3xl border-2 font-mono font-black text-3xl sm:text-4xl sm:text-5xl transition-all duration-150 active:scale-95 shadow-xl flex items-center justify-center gap-3 relative select-none ${
                    showSuccess
                      ? 'bg-emerald-600 border-emerald-400 text-white scale-[1.03]'
                      : showFail
                      ? 'bg-rose-600 border-rose-400 text-white scale-[0.98]'
                      : isLightMode
                      ? 'bg-white hover:bg-slate-50 text-slate-900 shadow-sm'
                      : 'bg-slate-800/90 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{option}</span>
                  {showSuccess && <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 absolute right-4 text-white" />}
                  {showFail && <XCircle className="w-6 h-6 sm:w-8 sm:h-8 absolute right-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="w-full text-center text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider py-2">
          ⚡ Responda rápido para acumular multiplicadores de pontos de até 5x!
        </div>
      </div>
    </GameContainer>
  );
};
