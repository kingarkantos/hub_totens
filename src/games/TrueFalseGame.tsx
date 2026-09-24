import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Check, X, ThumbsUp, ThumbsDown, Zap, ArrowRight, Award } from 'lucide-react';
import { BaseGameProps } from '../types';
import { TrueFalseCustomItem } from '../types/gameContent';
import { useGameLayout, useActiveGamePalette } from '../context/GameLayoutContext';
import { GameLayoutId } from '../types/gameLayouts';
import { LayoutColorPalette, generateLayoutPalette, getDefaultHueForLayout } from '../lib/colorHarmony';

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

export const TrueFalseGame: React.FC<TrueFalseGameProps> = (props) => {
  const {
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
    questionsCount,
    timeLimit,
    totalTimeLimit,
    customContent,
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
  const rawStatements = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_STATEMENTS;
  }, [customContent]);

  const prepareStatements = useCallback(() => {
    let list = [...rawStatements];
    if (orderMode !== 'ordered') {
      list = list.sort(() => Math.random() - 0.5);
    }
    if (questionsCount && questionsCount > 0 && questionsCount < list.length) {
      list = list.slice(0, questionsCount);
    }
    return list;
  }, [rawStatements, orderMode, questionsCount]);

  const [statements, setStatements] = useState<TrueFalseCustomItem[]>(() => prepareStatements());

  useEffect(() => {
    setStatements(prepareStatements());
  }, [prepareStatements]);

  const isUnlimitedQuestionTime = timeLimit === 0;
  const questionSeconds = timeLimit !== undefined && timeLimit > 0 ? timeLimit : (timeLimit === 0 ? 0 : 15);
  const hasTotalTime = totalTimeLimit !== undefined && totalTimeLimit > 0;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
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
      setCorrectCount((prev) => prev + 1);
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
    setCorrectCount(0);
    setStreak(0);
    setTimeLeft(questionSeconds);
    if (hasTotalTime) setTotalTimeLeft(totalTimeLimit || 0);
    setSelectedAnswer(null);
    setAnswered(false);
    setGameOver(false);
    setGameWon(false);
    setStatements(prepareStatements());
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
      correctAnswers={correctCount}
      totalQuestions={statements.length}
      timeRemaining={activeTimeDisplay}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={layoutPrimary}
      theme={theme ? {
        ...theme,
        primary: layoutPrimary,
        secondary: layoutSecondary,
        glowColor: layoutGlow,
      } : undefined}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      gameLayout={activeLayout}
      palette={palette}
      layoutColorHue={palette?.hue ?? layoutColorHue}
    >
      <div className="flex flex-col w-full max-w-3xl lg:max-w-4xl mx-auto my-auto py-2 sm:py-4 px-2 sm:px-4 gap-4 sm:gap-5 select-none animate-in fade-in duration-300">
        {/* Progress & Streak Header */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-sm border-2 ${
          activeLayout === 'cartoon_pop'
            ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
            : activeLayout === 'cartoon_comic'
            ? 'bg-sky-400/20 border-black text-white shadow-[3px_3px_0_#000]'
            : activeLayout === 'neon_arcade'
            ? 'bg-black/80 border-cyan-500/50 text-cyan-300 font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : activeLayout === 'bento_tech'
            ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-mono'
            : isLightMode 
            ? 'bg-blue-50 border-blue-200/80 text-blue-900' 
            : 'bg-slate-900/90 border-blue-500/30 text-blue-300'
        }`}>
          <span className="text-xs sm:text-base font-black uppercase tracking-wider flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              activeLayout === 'cartoon_comic' ? 'bg-sky-400' : activeLayout === 'neon_arcade' ? 'bg-cyan-400' : activeLayout === 'bento_tech' ? 'bg-emerald-400' : 'bg-amber-500'
            }`} />
            {activeLayout === 'bento_tech' ? `STATUS [0${currentIdx + 1}/0${statements.length}]` : `Afirmação ${currentIdx + 1} de ${statements.length}`}
          </span>
          {streak > 1 && (
            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600/50 px-3 py-1 rounded-full flex items-center gap-1.5 animate-bounce shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              Combo x{streak}!
            </span>
          )}
        </div>

        {/* Statement Card by Layout */}
        <div className="relative w-full my-auto py-2">
          {/* Layout 1: CARTOON 3D POP - Floating 3D Coin Badge */}
          {activeLayout === 'cartoon_pop' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${layoutPrimary}, ${layoutSecondary})`,
                  boxShadow: `0 6px 0 ${darkPrimary}, 0 12px 24px rgba(0,0,0,0.5)`,
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-white/90 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform"
              >
                <span className="text-3xl sm:text-4xl font-black text-white select-none drop-shadow-md">?</span>
              </div>
            </div>
          )}

          {/* Layout 2: CARTOON COMIC - Slanted Comic Badge */}
          {activeLayout === 'cartoon_comic' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div
                style={{
                  backgroundColor: layoutPrimary,
                  boxShadow: '4px 4px 0 #000000',
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-black flex items-center justify-center rotate-6 text-black font-black text-3xl select-none"
              >
                POP!
              </div>
            </div>
          )}

          {/* Neon Arcade Horizontal Glowing Tubes */}
          {activeLayout === 'neon_arcade' && (
            <>
              <div
                style={{ background: layoutPrimary, boxShadow: `0 0 10px ${layoutPrimary}` }}
                className="hidden sm:block absolute -left-5 top-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full pointer-events-none"
              />
              <div
                style={{ background: layoutPrimary, boxShadow: `0 0 10px ${layoutPrimary}` }}
                className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full pointer-events-none"
              />
            </>
          )}

          <div
            style={{
              ...(activeLayout === 'cartoon_pop'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 10px 0 ${darkPrimary}, 0 20px 45px rgba(0,0,0,0.7)`,
                  }
                : activeLayout === 'cartoon_comic'
                ? {
                    borderColor: '#000000',
                    boxShadow: '8px 8px 0 #000000',
                  }
                : activeLayout === 'neon_arcade'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 0 35px ${layoutGlow}, inset 0 0 20px ${layoutGlow}25`,
                  }
                : activeLayout === 'bento_tech'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 0 25px ${layoutGlow}`,
                    clipPath:
                      'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)',
                  }
                : activeLayout === 'neumorphic_luxe'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 15px 40px ${layoutGlow}`,
                  }
                : activeLayout === 'spatial_3d'
                ? {
                    borderColor: layoutPrimary,
                    boxShadow: `0 0 30px ${layoutGlow}`,
                  }
                : {}),
            }}
            className={`w-full text-center transition-all ${
              activeLayout === 'cartoon_pop'
                ? 'rounded-3xl border-4 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 pt-9 pb-6 px-6 sm:px-10'
                : activeLayout === 'cartoon_comic'
                ? 'rounded-3xl border-4 border-black bg-gradient-to-b from-slate-900 via-sky-950/60 to-slate-900 shadow-[8px_8px_0_#000] pt-9 pb-6 px-6 sm:px-10'
                : activeLayout === 'neon_arcade'
                ? 'rounded-[32px] sm:rounded-[40px] border-2 bg-slate-950/90 py-7 px-6 sm:px-12'
                : activeLayout === 'bento_tech'
                ? 'border-2 bg-slate-950/95 p-6 sm:p-10 font-mono'
                : activeLayout === 'neumorphic_luxe'
                ? 'rounded-[36px] border-4 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 pt-8 pb-6 px-6 sm:px-10'
                : activeLayout === 'spatial_3d'
                ? 'rounded-3xl border-2 bg-gradient-to-b from-slate-900/90 via-purple-950/30 to-slate-900/90 p-6 sm:p-10'
                : isLightMode
                ? 'rounded-3xl bg-white/95 border-2 border-slate-200 shadow-xl p-5 sm:p-8 md:p-10'
                : 'rounded-3xl bg-slate-900/85 backdrop-blur-xl border-2 border-white/20 shadow-xl p-5 sm:p-8 md:p-10'
            }`}
          >
            {/* Bento Tech Louvers */}
            {activeLayout === 'bento_tech' && (
              <div className="flex justify-center items-center gap-1.5 mb-3">
                <div className="w-6 h-1 bg-emerald-500/60 rounded-full" />
                <div className="w-12 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]" />
                <div className="w-6 h-1 bg-emerald-500/60 rounded-full" />
              </div>
            )}

            <span className={`inline-block text-[11px] sm:text-xs font-black uppercase tracking-widest mb-2 sm:mb-3 ${
              activeLayout === 'cartoon_pop' ? 'text-amber-300' : activeLayout === 'cartoon_comic' ? 'text-sky-300' : activeLayout === 'bento_tech' ? 'text-emerald-400/80' : isLightMode ? 'text-slate-400' : 'text-slate-400'
            }`}>
              {activeLayout === 'bento_tech' ? '[ EVALUATE STATEMENT TRUE/FALSE ]' : 'Julgue a afirmação abaixo:'}
            </span>
            <h3 className={`text-xl sm:text-3xl md:text-4xl font-black leading-snug sm:leading-normal tracking-tight ${
              activeLayout === 'cartoon_comic'
                ? 'text-white drop-shadow-[2px_2px_0_#000]'
                : activeLayout === 'neon_arcade'
                ? 'text-cyan-50 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : activeLayout === 'bento_tech'
                ? 'text-emerald-100 font-mono'
                : activeLayout === 'neumorphic_luxe'
                ? 'text-amber-100'
                : isLightMode
                ? 'text-slate-900'
                : 'text-white'
            }`}>
              "{currentItem.statement}"
            </h3>

            {/* Explanation reveal */}
            {answered && (
              <div
                className={`mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all animate-fadeIn ${
                  selectedAnswer === currentItem.isTrue
                    ? isLightMode ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                    : isLightMode ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-rose-950/70 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm sm:text-lg mb-1.5">
                  {selectedAnswer === currentItem.isTrue ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-500 stroke-[3]" />
                      Você acertou!
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-rose-500 stroke-[3]" />
                      Resposta incorreta!
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-base font-bold leading-relaxed">
                  {currentItem.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!answered ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 pt-1">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className={`py-5 sm:py-7 min-h-[75px] sm:min-h-[90px] font-black text-lg sm:text-2xl flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                activeLayout === 'cartoon_pop'
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-4 border-emerald-300 shadow-[0_8px_0_#065f46,0_12px_24px_rgba(0,0,0,0.5)] active:translate-y-2 active:shadow-[0_2px_0_#065f46] rounded-3xl text-white'
                  : activeLayout === 'cartoon_comic'
                  ? 'bg-emerald-400 border-4 border-black shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-3xl text-black'
                  : activeLayout === 'neon_arcade'
                  ? 'rounded-full border-2 border-emerald-400 bg-slate-950/85 hover:border-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.5)] text-emerald-300 active:scale-95'
                  : activeLayout === 'bento_tech'
                  ? 'border-2 border-emerald-500 bg-slate-950 hover:bg-emerald-950/40 text-emerald-300 font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-lg active:scale-95'
                  : activeLayout === 'neumorphic_luxe'
                  ? 'rounded-full border-2 border-emerald-400 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-emerald-200 shadow-xl active:scale-95'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl sm:rounded-3xl shadow-lg border-b-4 border-emerald-800 active:scale-95'
              }`}
            >
              <ThumbsUp className="w-7 h-7 sm:w-9 sm:h-9 stroke-[2.5]" />
              VERDADEIRO
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className={`py-5 sm:py-7 min-h-[75px] sm:min-h-[90px] font-black text-lg sm:text-2xl flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                activeLayout === 'cartoon_pop'
                  ? 'bg-gradient-to-b from-rose-500 to-rose-700 border-4 border-rose-300 shadow-[0_8px_0_#881337,0_12px_24px_rgba(0,0,0,0.5)] active:translate-y-2 active:shadow-[0_2px_0_#881337] rounded-3xl text-white'
                  : activeLayout === 'cartoon_comic'
                  ? 'bg-rose-500 border-4 border-black shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-3xl text-white'
                  : activeLayout === 'neon_arcade'
                  ? 'rounded-full border-2 border-rose-400 bg-slate-950/85 hover:border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.5)] text-rose-300 active:scale-95'
                  : activeLayout === 'bento_tech'
                  ? 'border-2 border-rose-500 bg-slate-950 hover:bg-rose-950/40 text-rose-300 font-mono shadow-[0_0_15px_rgba(244,63,94,0.3)] rounded-lg active:scale-95'
                  : activeLayout === 'neumorphic_luxe'
                  ? 'rounded-full border-2 border-rose-400 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-rose-200 shadow-xl active:scale-95'
                  : 'bg-rose-600 hover:bg-rose-500 text-white rounded-2xl sm:rounded-3xl shadow-lg border-b-4 border-rose-800 active:scale-95'
              }`}
            >
              <ThumbsDown className="w-7 h-7 sm:w-9 sm:h-9 stroke-[2.5]" />
              FALSO
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className={`w-full py-6 sm:py-7 min-h-[85px] sm:min-h-[95px] font-black text-xl sm:text-2xl flex items-center justify-center gap-3 transition-all ${
                activeLayout === 'cartoon_pop'
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 shadow-[0_8px_0_#92400e] text-amber-950 rounded-3xl active:translate-y-1 active:shadow-[0_2px_0_#92400e]'
                  : activeLayout === 'cartoon_comic'
                  ? 'bg-sky-400 border-4 border-black shadow-[6px_6px_0_#000] text-black rounded-3xl active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000]'
                  : activeLayout === 'neon_arcade'
                  ? 'rounded-full border-2 border-cyan-400 bg-slate-950/85 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95'
                  : activeLayout === 'bento_tech'
                  ? 'border-2 border-emerald-400 bg-emerald-950/60 text-emerald-200 font-mono rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'
                  : 'bg-blue-600 hover:bg-blue-500 text-white rounded-3xl shadow-xl border-b-4 border-blue-800 active:scale-95'
              }`}
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
