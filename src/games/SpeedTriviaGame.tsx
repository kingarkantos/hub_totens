import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Zap, CheckCircle2, XCircle, Flame, Award } from 'lucide-react';
import { BaseGameProps } from '../types';
import { SpeedTriviaCustomItem } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';
import { GameLayoutId } from '../types/gameLayouts';

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

export const SpeedTriviaGame: React.FC<SpeedTriviaGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#EAB308',
    theme,
    customBgStyle,
    campaignName,
    clientName,
    splashImageUrl,
    orderMode = 'random',
    questionsCount,
    customContent,
    gameLayout,
    palette,
    layoutColorHue,
    isLight,
    themeMode,
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
  const rawQuestions = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_QUESTIONS;
  }, [customContent]);

  const prepareQuestions = useCallback(() => {
    let list = [...rawQuestions];
    if (orderMode !== 'ordered') {
      list = list.sort(() => Math.random() - 0.5);
    }
    if (questionsCount && questionsCount > 0 && questionsCount < list.length) {
      list = list.slice(0, questionsCount);
    }
    return list;
  }, [rawQuestions, orderMode, questionsCount]);

  const [questions, setQuestions] = useState<SpeedTriviaCustomItem[]>(() => prepareQuestions());

  useEffect(() => {
    setQuestions(prepareQuestions());
  }, [prepareQuestions]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
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
      setCorrectCount((prev) => prev + 1);
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
      correctAnswers={correctCount}
      totalQuestions={questions.length}
      timeRemaining={questionTime}
      gameOver={gameOver}
      gameWon={correctCount === questions.length}
      onRestart={() => {
        setQuestions(prepareQuestions());
        setCurrentIdx(0);
        setScore(0);
        setCorrectCount(0);
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
      <div className="flex flex-col w-full max-w-3xl lg:max-w-4xl mx-auto my-auto py-2 sm:py-4 px-2 sm:px-4 gap-4 sm:gap-5 select-none animate-in fade-in duration-300">
        {/* Speed Bar & Multiplier Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span 
              style={{ color: layoutPrimary }}
              className="text-xs sm:text-base font-black uppercase flex items-center gap-2"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current animate-pulse" />
              Pergunta {currentIdx + 1} de {questions.length}
            </span>

            {streak > 1 && (
              <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse ${
                activeLayout === 'cartoon_comic'
                  ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0_#000]'
                  : 'text-white bg-gradient-to-r from-amber-500 to-red-500'
              }`}>
                <Flame className="w-3.5 h-3.5 fill-yellow-300" />
                Multiplicador x{streak}!
              </span>
            )}
          </div>

          {/* High voltage animated progress bar */}
          <div className="h-3 sm:h-4 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border-2 border-white/20 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                questionTime > 4
                  ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 shadow-md'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card by Layout */}
        <div className="relative w-full my-auto py-2">
          {/* Layout 1: CARTOON 3D POP - Floating 3D Coin Badge */}
          {activeLayout === 'cartoon_pop' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div 
                style={{
                  background: `linear-gradient(to bottom, ${layoutPrimary}, ${layoutSecondary})`,
                  borderColor: '#ffffff88',
                  boxShadow: `0 6px 0 ${darkPrimary}, 0 12px 24px rgba(0,0,0,0.5)`,
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform"
              >
                <span className="text-3xl sm:text-4xl font-black text-slate-950 select-none drop-shadow-sm">⚡</span>
              </div>
            </div>
          )}

          {/* Layout 2: CARTOON COMIC - Slanted Comic Badge */}
          {activeLayout === 'cartoon_comic' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div 
                style={{ backgroundColor: layoutPrimary }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] flex items-center justify-center rotate-6 text-black font-black text-3xl select-none"
              >
                ⚡
              </div>
            </div>
          )}

          {/* Neon Arcade Horizontal Glowing Tubes */}
          {activeLayout === 'neon_arcade' && (
            <>
              <div 
                style={{
                  background: `linear-gradient(to right, transparent, ${layoutPrimary})`,
                  boxShadow: `0 0 10px ${layoutPrimary}`,
                }}
                className="hidden sm:block absolute -left-5 top-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full pointer-events-none" 
              />
              <div 
                style={{
                  background: `linear-gradient(to left, transparent, ${layoutPrimary})`,
                  boxShadow: `0 0 10px ${layoutPrimary}`,
                }}
                className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full pointer-events-none" 
              />
            </>
          )}

          <div
            style={{
              ...(activeLayout === 'bento_tech'
                ? {
                    clipPath:
                      'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)',
                    borderColor: `${layoutPrimary}CC`,
                    boxShadow: `0 0 30px ${layoutGlow}`,
                  }
                : activeLayout === 'cartoon_pop'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 10px 0 ${darkPrimary}, 0 20px 45px rgba(0,0,0,0.7)`,
                  }
                : activeLayout === 'neon_arcade'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 0 35px ${layoutGlow}, inset 0 0 20px ${layoutPrimary}33`,
                  }
                : activeLayout === 'neumorphic_luxe'
                ? {
                    borderColor: `${layoutPrimary}CC`,
                    boxShadow: `0 20px 50px ${layoutGlow}`,
                  }
                : {}),
            }}
            className={`w-full text-center transition-all ${
              activeLayout === 'cartoon_pop'
                ? 'rounded-3xl border-4 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950/80 pt-9 pb-6 px-6 sm:px-10'
                : activeLayout === 'cartoon_comic'
                ? 'rounded-3xl border-4 border-black bg-gradient-to-b from-slate-900 via-sky-950/60 to-slate-900 shadow-[8px_8px_0_#000] pt-9 pb-6 px-6 sm:px-10'
                : activeLayout === 'neon_arcade'
                ? 'rounded-[32px] sm:rounded-[40px] border-2 bg-slate-950/90 py-7 px-6 sm:px-12'
                : activeLayout === 'bento_tech'
                ? 'border-2 bg-slate-950/95 p-6 sm:p-10 font-mono'
                : activeLayout === 'neumorphic_luxe'
                ? 'rounded-[36px] border-4 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950/80 pt-8 pb-6 px-6 sm:px-10'
                : 'bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border-2 border-white/20 shadow-xl'
            }`}
          >
            {/* Bento Tech Louvers */}
            {activeLayout === 'bento_tech' && (
              <div className="flex justify-center items-center gap-1.5 mb-3">
                <div style={{ backgroundColor: `${layoutPrimary}99` }} className="w-6 h-1 rounded-full" />
                <div style={{ backgroundColor: layoutPrimary, boxShadow: `0 0 8px ${layoutPrimary}` }} className="w-12 h-1.5 rounded-full" />
                <div style={{ backgroundColor: `${layoutPrimary}99` }} className="w-6 h-1 rounded-full" />
              </div>
            )}

            <span 
              style={{ color: layoutPrimary }}
              className="inline-block text-[11px] sm:text-xs font-black uppercase tracking-widest mb-2 sm:mb-3"
            >
              {activeLayout === 'bento_tech' ? '[ SPEED TRIVIA // CHOOSE FAST ]' : 'Responda rápido para pontuar mais:'}
            </span>
            <h3 className={`text-xl sm:text-3xl md:text-4xl font-black leading-snug sm:leading-normal tracking-tight ${
              activeLayout === 'cartoon_comic'
                ? 'text-white drop-shadow-[2px_2px_0_#000]'
                : activeLayout === 'neon_arcade'
                ? 'text-cyan-50 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : activeLayout === 'bento_tech'
                ? 'text-emerald-100 font-mono'
                : 'text-white'
            }`}>
              {activeQ.question}
            </h3>
          </div>
        </div>

        {/* 4 Lightning Options - Large Touch Friendly Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {activeQ.options.map((opt, i) => {
            const isChosen = selectedOpt === i;
            const isCorrectAnswer = i === activeQ.correct;

            let btnClass = '';
            let btnInlineStyle: React.CSSProperties = {};
            let badgeClass = '';
            let badgeInlineStyle: React.CSSProperties = {};

            if (activeLayout === 'cartoon_pop') {
              btnClass =
                'border-4 bg-gradient-to-b from-slate-800 to-slate-900 active:translate-y-1.5 text-white rounded-2xl hover:brightness-110';
              btnInlineStyle = {
                borderColor: `${layoutPrimary}E6`,
                boxShadow: `0 6px 0 ${darkPrimary}, 0 8px 16px rgba(0,0,0,0.4)`,
              };
              badgeClass = 'border-2 text-slate-950 font-black';
              badgeInlineStyle = {
                backgroundColor: layoutPrimary,
                borderColor: '#FFFFFF',
                boxShadow: `0 3px 0 ${darkPrimary}`,
              };
              if (answered) {
                if (isCorrectAnswer) {
                  btnClass =
                    'border-4 border-emerald-300 bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-[0_6px_0_#065f46] text-white rounded-2xl scale-[1.01]';
                  btnInlineStyle = {};
                  badgeClass = 'bg-white text-emerald-950 border-2 border-emerald-200';
                  badgeInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnClass =
                    'border-4 border-rose-400 bg-gradient-to-b from-rose-600 to-rose-800 shadow-[0_6px_0_#881337] text-white rounded-2xl';
                  btnInlineStyle = {};
                  badgeClass = 'bg-white text-rose-950 border-2 border-rose-200';
                  badgeInlineStyle = {};
                } else {
                  btnClass = 'border-2 border-slate-700/50 bg-slate-950/40 text-slate-500 opacity-35 shadow-none rounded-2xl';
                  btnInlineStyle = {};
                }
              }
            } else if (activeLayout === 'cartoon_comic') {
              btnClass =
                'border-4 border-black bg-slate-900 shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] text-white rounded-2xl hover:bg-slate-800';
              badgeClass = 'border-2 border-black text-black shadow-[2px_2px_0_#000]';
              badgeInlineStyle = { backgroundColor: layoutPrimary };
              if (answered) {
                if (isCorrectAnswer) {
                  btnClass =
                    'border-4 border-black bg-emerald-500 shadow-[5px_5px_0_#000] text-slate-950 font-black rounded-2xl';
                  badgeClass = 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]';
                  badgeInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnClass =
                    'border-4 border-black bg-rose-500 shadow-[5px_5px_0_#000] text-white font-black rounded-2xl';
                  badgeClass = 'bg-white text-rose-950 border-2 border-black shadow-[2px_2px_0_#000]';
                  badgeInlineStyle = {};
                } else {
                  btnClass = 'border-2 border-slate-700 bg-slate-950/40 text-slate-500 opacity-30 shadow-none rounded-2xl';
                }
              }
            } else if (activeLayout === 'neon_arcade') {
              btnClass =
                'rounded-full border-2 bg-slate-950/85 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-cyan-50 px-6 py-4';
              btnInlineStyle = {
                borderColor: `${layoutPrimary}CC`,
                boxShadow: `0 0 14px ${layoutGlow}`,
              };
              badgeClass = 'rounded-full border-2 font-mono font-black';
              badgeInlineStyle = {
                borderColor: layoutPrimary,
                color: layoutPrimary,
                boxShadow: `0 0 8px ${layoutGlow}`,
              };
              if (answered) {
                if (isCorrectAnswer) {
                  btnClass =
                    'rounded-full border-2 border-emerald-400 bg-emerald-950/90 text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.6)] px-6 py-4 scale-[1.01]';
                  btnInlineStyle = {};
                  badgeClass = 'rounded-full border-2 border-emerald-400 bg-emerald-500 text-slate-950 font-black';
                  badgeInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnClass =
                    'rounded-full border-2 border-rose-500 bg-rose-950/90 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.6)] px-6 py-4';
                  btnInlineStyle = {};
                  badgeClass = 'rounded-full border-2 border-rose-400 bg-rose-500 text-white font-black';
                  badgeInlineStyle = {};
                } else {
                  btnClass = 'rounded-full border border-slate-800 bg-slate-950/40 text-slate-600 opacity-30 px-6 py-4 shadow-none';
                  btnInlineStyle = {};
                }
              }
            } else {
              btnClass =
                'bg-slate-900/85 text-white border-2 hover:bg-slate-800/90 rounded-2xl sm:rounded-3xl shadow-lg';
              btnInlineStyle = {
                borderColor: `${layoutPrimary}44`,
              };
              badgeClass = 'text-white rounded-xl';
              badgeInlineStyle = {
                backgroundColor: `${layoutPrimary}33`,
                borderColor: `${layoutPrimary}66`,
              };
              if (answered) {
                if (isCorrectAnswer) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-950/60 scale-[1.02] rounded-2xl sm:rounded-3xl';
                  btnInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnClass = 'bg-rose-600 text-white border-rose-400 shadow-xl shadow-rose-950/60 rounded-2xl sm:rounded-3xl';
                  btnInlineStyle = {};
                } else {
                  btnClass = 'bg-slate-950/40 text-slate-500 border-white/5 opacity-40 rounded-2xl sm:rounded-3xl';
                  btnInlineStyle = {};
                }
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleAnswer(i)}
                style={btnInlineStyle}
                className={`p-5 sm:p-7 min-h-[85px] sm:min-h-[105px] font-black text-lg sm:text-2xl text-left flex items-center justify-between transition-all active:scale-95 ${btnClass}`}
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  <span 
                    style={badgeInlineStyle}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-mono text-base sm:text-xl font-black flex-shrink-0 ${badgeClass}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>
                {answered && isCorrectAnswer && <CheckCircle2 className="w-8 h-8 text-white flex-shrink-0" />}
                {answered && isChosen && !isCorrectAnswer && <XCircle className="w-8 h-8 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
