import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle, Award, HelpCircle, Sparkles } from 'lucide-react';

import { BaseGameProps } from '../types';
import { QuizQuestionItem } from '../types/gameContent';
import { useGameLayout } from '../context/GameLayoutContext';
import { GameLayoutId } from '../types/gameLayouts';

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
  questionsCount,
  timeLimit,
  totalTimeLimit,
  gameLayout,
}) => {
  const isLightMode = isLight ?? (themeMode === 'light' || theme?.textColor?.includes('text-slate-900') || theme?.bgGradient?.includes('slate-100'));
  const isUnlimitedTime = timeLimit === 0;
  const questionSeconds = timeLimit && timeLimit > 0 ? timeLimit : 15;
  const hasTotalTime = totalTimeLimit !== undefined && totalTimeLimit > 0;

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

  // Questions in random or sequential order with optional subset slice
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(() => prepareQuestions());

  useEffect(() => {
    setQuestions(prepareQuestions());
  }, [prepareQuestions]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questionSeconds);
  const [totalTimeLeft, setTotalTimeLeft] = useState(totalTimeLimit || 0);
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

  // Total challenge countdown timer (if configured)
  useEffect(() => {
    if (gameOver || !hasTotalTime) return;
    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, hasTotalTime]);

  const handleSelect = (idx: number) => {
    if (answered || gameOver) return;
    setSelectedOption(idx);
    setAnswered(true);

    const isCorrect = shuffledOptions[idx]?.isCorrect;
    if (isCorrect) {
      sound.playSuccess();
      setCorrectCount((c) => c + 1);
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
    setQuestions(prepareQuestions());
    setCurrentIdx(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(questionSeconds);
    if (hasTotalTime) setTotalTimeLeft(totalTimeLimit || 0);
    setSelectedOption(null);
    setAnswered(false);
    setGameOver(false);
  };

  const contextLayout = useGameLayout();
  const activeLayout: GameLayoutId = gameLayout || contextLayout?.layout || 'cartoon_pop';

  const activeTimeDisplay = !isUnlimitedTime
    ? timeLeft
    : hasTotalTime
    ? totalTimeLeft
    : undefined;

  const currentQ = questions[currentIdx] || rawQuestions[0];

  return (
    <GameContainer
      title="Quiz"
      category="Conhecimento"
      score={score}
      correctAnswers={correctCount}
      totalQuestions={questions.length}
      timeRemaining={activeTimeDisplay}
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
      gameLayout={activeLayout}
    >
      <div className="w-full max-w-3xl lg:max-w-4xl my-auto flex flex-col py-2 sm:py-4 px-2 sm:px-4 gap-4 sm:gap-5 animate-in fade-in duration-300">
        {/* Top Progress & Status */}
        <div className={`w-full flex items-center justify-between px-2 text-xs sm:text-sm md:text-base font-black ${
          activeLayout === 'cartoon_pop'
            ? 'text-amber-300'
            : activeLayout === 'cartoon_comic'
            ? 'text-sky-300'
            : activeLayout === 'neon_arcade'
            ? 'text-cyan-300 font-mono'
            : activeLayout === 'bento_tech'
            ? 'text-emerald-400 font-mono'
            : isLightMode ? 'text-slate-700' : 'text-slate-300'
        }`}>
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              activeLayout === 'cartoon_comic' ? 'bg-sky-400' : activeLayout === 'neon_arcade' ? 'bg-cyan-400' : activeLayout === 'bento_tech' ? 'bg-emerald-400' : 'bg-amber-500'
            }`} />
            {activeLayout === 'bento_tech' ? `QUERY [0${currentIdx + 1}/0${questions.length}]` : `Questão ${currentIdx + 1} de ${questions.length}`}
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIdx
                    ? activeLayout === 'cartoon_pop'
                      ? 'bg-amber-400 w-7 sm:w-10 shadow-[0_2px_0_#92400e]'
                      : activeLayout === 'cartoon_comic'
                      ? 'bg-sky-400 w-7 sm:w-10 border border-black shadow-[2px_2px_0_#000]'
                      : activeLayout === 'neon_arcade'
                      ? 'bg-cyan-400 w-7 sm:w-10 shadow-[0_0_12px_#22d3ee]'
                      : activeLayout === 'bento_tech'
                      ? 'bg-emerald-400 w-7 sm:w-10 shadow-[0_0_10px_#10b981]'
                      : 'bg-amber-500 w-7 sm:w-10 shadow-md shadow-amber-500/40'
                    : i < currentIdx
                    ? activeLayout === 'cartoon_comic'
                      ? 'bg-emerald-400 w-3.5 sm:w-5 border border-black'
                      : 'bg-emerald-500 w-3.5 sm:w-5'
                    : isLightMode
                    ? 'bg-slate-300 w-3.5 sm:w-5'
                    : 'bg-white/20 w-3.5 sm:w-5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Question Card Shape by Layout */}
        <div className="relative w-full">
          {/* Layout 1: CARTOON 3D POP - Floating 3D Coin Badge */}
          {activeLayout === 'cartoon_pop' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-500 border-4 border-amber-100 shadow-[0_6px_0_#92400e,0_12px_24px_rgba(0,0,0,0.5)] flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
                <span className="text-3xl sm:text-4xl font-black text-amber-950 select-none drop-shadow-sm">?</span>
              </div>
            </div>
          )}

          {/* Layout 2: CARTOON COMIC - Slanted Comic Badge */}
          {activeLayout === 'cartoon_comic' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 border-4 border-white shadow-[4px_4px_0_#000] flex items-center justify-center rotate-6 text-white font-black text-3xl select-none">
                ?
              </div>
            </div>
          )}

          {/* Layout 4: GAME SHOW VIP - Floating Gold Trophy Ribbon */}
          {activeLayout === 'neumorphic_luxe' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-yellow-200 shadow-[0_4px_16px_rgba(245,158,11,0.5)] text-slate-950 font-black text-xs uppercase tracking-widest pointer-events-none">
              <Award className="w-3.5 h-3.5 fill-current" />
              <span>Desafio VIP</span>
            </div>
          )}

          {/* Neon Arcade - Horizontal glowing connector tubes */}
          {activeLayout === 'neon_arcade' && (
            <>
              <div className="hidden sm:block absolute -left-5 top-1/2 -translate-y-1/2 w-6 h-1.5 bg-gradient-to-r from-transparent to-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full pointer-events-none" />
              <div className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-1.5 bg-gradient-to-l from-transparent to-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full pointer-events-none" />
            </>
          )}

          {/* Card Body */}
          <div
            style={
              activeLayout === 'bento_tech'
                ? {
                    clipPath:
                      'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)',
                  }
                : undefined
            }
            className={`w-full text-center transition-all ${
              activeLayout === 'cartoon_pop'
                ? 'rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-slate-900/95 via-slate-900 to-amber-950/40 shadow-[0_10px_0_#92400e,0_20px_45px_rgba(0,0,0,0.7)] pt-9 pb-6 px-6 sm:px-8'
                : activeLayout === 'cartoon_comic'
                ? 'rounded-3xl border-4 border-black bg-gradient-to-b from-slate-900 via-sky-950/60 to-slate-900 shadow-[8px_8px_0_#000] pt-9 pb-6 px-6 sm:px-8'
                : activeLayout === 'neon_arcade'
                ? 'rounded-[32px] sm:rounded-[40px] border-2 border-cyan-400 bg-slate-950/90 shadow-[0_0_35px_rgba(6,182,212,0.45),inset_0_0_20px_rgba(6,182,212,0.2)] py-6 px-6 sm:px-10'
                : activeLayout === 'bento_tech'
                ? 'border-2 border-emerald-500/80 bg-slate-950/95 shadow-[0_0_30px_rgba(16,185,129,0.25)] p-6 sm:p-8 font-mono'
                : activeLayout === 'neumorphic_luxe'
                ? 'rounded-[36px] border-4 border-amber-400/80 bg-gradient-to-b from-slate-900/95 via-slate-900 to-amber-950/30 shadow-[0_20px_50px_rgba(245,158,11,0.3)] pt-8 pb-6 px-6 sm:px-8'
                : activeLayout === 'spatial_3d'
                ? 'rounded-3xl border-2 border-purple-500/40 bg-gradient-to-b from-slate-900/90 via-purple-950/30 to-slate-900/90 shadow-[0_25px_60px_-15px_rgba(147,51,234,0.35)] p-6 sm:p-8'
                : activeLayout === 'pixel_retro'
                ? 'rounded-none border-4 border-yellow-400 bg-black shadow-[6px_6px_0_#ca8a04] p-6 sm:p-8 font-mono'
                : activeLayout === 'cyber_matrix'
                ? 'rounded-xl border-2 border-emerald-400 bg-black/95 shadow-[0_0_25px_rgba(16,185,129,0.3)] p-6 sm:p-8 font-mono'
                : activeLayout === 'synthwave_grid'
                ? 'rounded-3xl border-2 border-pink-500/70 bg-purple-950/85 shadow-[0_0_35px_rgba(244,63,94,0.3)] p-6 sm:p-8'
                : activeLayout === 'golden_casino'
                ? 'rounded-3xl border-4 border-amber-300 bg-stone-950 shadow-[0_15px_40px_rgba(245,158,11,0.3)] p-6 sm:p-8'
                : activeLayout === 'bubble_toon'
                ? 'rounded-[40px] border-4 border-pink-300/80 bg-slate-900/95 shadow-[0_15px_30px_rgba(244,114,182,0.3)] p-6 sm:p-8'
                : isLightMode
                ? 'rounded-3xl bg-white/95 border-2 border-slate-200 shadow-xl p-6 sm:p-8'
                : 'rounded-3xl bg-slate-900/85 backdrop-blur-xl border-2 border-white/20 shadow-xl p-6 sm:p-8'
            }`}
          >
            {/* Bento Tech Louvers / Cooling Gills */}
            {activeLayout === 'bento_tech' && (
              <div className="flex justify-center items-center gap-1.5 mb-3">
                <div className="w-6 h-1 bg-emerald-500/60 rounded-full" />
                <div className="w-12 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]" />
                <div className="w-6 h-1 bg-emerald-500/60 rounded-full" />
              </div>
            )}

            {/* Neon Arcade Matrix Tag */}
            {activeLayout === 'neon_arcade' && (
              <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                ⚡ ARCADE MATRIX ⚡
              </div>
            )}

            {/* Question Label */}
            {activeLayout !== 'neon_arcade' && (
              <span
                className={`inline-block text-[11px] sm:text-xs font-black uppercase tracking-widest mb-1.5 sm:mb-2 ${
                  activeLayout === 'cartoon_pop'
                    ? 'text-amber-300'
                    : activeLayout === 'cartoon_comic'
                    ? 'text-sky-300'
                    : activeLayout === 'bento_tech'
                    ? 'text-emerald-400/90 font-mono'
                    : activeLayout === 'neumorphic_luxe'
                    ? 'text-amber-300'
                    : isLightMode
                    ? 'text-slate-500'
                    : 'text-amber-300/90'
                }`}
              >
                {activeLayout === 'bento_tech' ? '[ INPUT REQUIRED // CHOOSE ONE ]' : 'Selecione a resposta correta:'}
              </span>
            )}

            {/* Question Image (if provided) */}
            {(currentQ.imageUrl || currentQ.image_url) && (
              <div className="w-full max-h-36 sm:max-h-52 rounded-xl overflow-hidden mb-3 border border-white/20 bg-black/20 flex items-center justify-center shadow-md">
                <img
                  src={currentQ.imageUrl || currentQ.image_url}
                  alt="Imagem da Pergunta"
                  className="max-h-36 sm:max-h-52 w-auto object-contain rounded-lg"
                />
              </div>
            )}

            <h3
              className={`text-lg sm:text-2xl md:text-3xl font-black leading-snug tracking-tight ${
                activeLayout === 'cartoon_comic'
                  ? 'text-white drop-shadow-[2px_2px_0_#000]'
                  : activeLayout === 'neon_arcade'
                  ? 'text-cyan-50 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : activeLayout === 'bento_tech'
                  ? 'text-emerald-100 font-mono tracking-wide'
                  : activeLayout === 'neumorphic_luxe'
                  ? 'text-amber-100 drop-shadow-sm'
                  : isLightMode
                  ? 'text-slate-900'
                  : 'text-white'
              }`}
            >
              {currentQ.question}
            </h3>
          </div>
        </div>

        {/* Options Grid (2x2 for Cartoon, Arcade & Game Show; or Flex Stack for Glass) */}
        <div
          className={`w-full ${
            activeLayout === 'modern_glass'
              ? 'flex flex-col gap-2.5 sm:gap-3'
              : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
          }`}
        >
          {shuffledOptions.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            let btnStyle = '';
            let badgeStyle = '';
            let icon = null;

            if (activeLayout === 'cartoon_pop') {
              // 3D Cartoon Tactile Button
              btnStyle =
                'border-4 border-amber-400/90 bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_6px_0_#78350f,0_8px_16px_rgba(0,0,0,0.4)] active:translate-y-1.5 active:shadow-[0_1px_0_#78350f] text-white rounded-2xl hover:brightness-110';
              badgeStyle =
                'bg-amber-400 border-2 border-amber-200 text-amber-950 shadow-[0_3px_0_#92400e]';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'border-4 border-emerald-300 bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-[0_6px_0_#065f46] text-white rounded-2xl scale-[1.01]';
                  badgeStyle =
                    'bg-white text-emerald-950 border-2 border-emerald-200 shadow-[0_3px_0_#065f46]';
                  icon = <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle =
                    'border-4 border-rose-400 bg-gradient-to-b from-rose-600 to-rose-800 shadow-[0_6px_0_#881337] text-white rounded-2xl';
                  badgeStyle =
                    'bg-white text-rose-950 border-2 border-rose-200 shadow-[0_3px_0_#881337]';
                  icon = <XCircle className="w-6 h-6 text-white flex-shrink-0" />;
                } else {
                  btnStyle =
                    'border-2 border-slate-700/50 bg-slate-950/40 text-slate-500 opacity-35 shadow-none rounded-2xl';
                  badgeStyle = 'bg-slate-800 text-slate-500 border-transparent shadow-none';
                }
              }
            } else if (activeLayout === 'cartoon_comic') {
              // Comic Book Thick Stroke Button
              btnStyle =
                'border-4 border-black bg-slate-900 shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] text-white rounded-2xl hover:bg-slate-800';
              badgeStyle = 'bg-sky-400 border-2 border-black text-black shadow-[2px_2px_0_#000]';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'border-4 border-black bg-emerald-500 shadow-[5px_5px_0_#000] text-slate-950 font-black rounded-2xl';
                  badgeStyle = 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]';
                  icon = <CheckCircle2 className="w-6 h-6 text-slate-950 stroke-[3] flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle =
                    'border-4 border-black bg-rose-500 shadow-[5px_5px_0_#000] text-white font-black rounded-2xl';
                  badgeStyle = 'bg-white text-rose-950 border-2 border-black shadow-[2px_2px_0_#000]';
                  icon = <XCircle className="w-6 h-6 text-white stroke-[3] flex-shrink-0" />;
                } else {
                  btnStyle = 'border-2 border-slate-700 bg-slate-950/40 text-slate-500 opacity-30 shadow-none rounded-2xl';
                  badgeStyle = 'bg-slate-800 text-slate-600 border-slate-700 shadow-none';
                }
              }
            } else if (activeLayout === 'neon_arcade') {
              // Neon Capsule Pill Button
              btnStyle =
                'rounded-full border-2 border-cyan-400/80 bg-slate-950/85 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] shadow-[0_0_12px_rgba(6,182,212,0.25)] text-cyan-50 px-5 py-3.5';
              badgeStyle =
                'w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-cyan-400 text-cyan-300 font-mono font-black shadow-[0_0_8px_rgba(6,182,212,0.4)]';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'rounded-full border-2 border-emerald-400 bg-emerald-950/90 text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.6)] px-5 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-400 bg-emerald-500 text-slate-950 font-black';
                  icon = <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle =
                    'rounded-full border-2 border-rose-500 bg-rose-950/90 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.6)] px-5 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-rose-400 bg-rose-500 text-white font-black';
                  icon = <XCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />;
                } else {
                  btnStyle = 'rounded-full border border-slate-800 bg-slate-950/40 text-slate-600 opacity-30 shadow-none px-5 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-800 text-slate-600';
                }
              }
            } else if (activeLayout === 'bento_tech') {
              // Mecha HUD Monospace Chevron Button
              btnStyle =
                'border-2 border-emerald-500/70 bg-slate-950/95 hover:border-emerald-400 hover:bg-emerald-950/30 text-emerald-100 font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-lg px-4 py-3.5';
              badgeStyle =
                'w-9 h-9 sm:w-10 sm:h-10 border border-emerald-400 bg-emerald-950/70 text-emerald-300 font-mono font-black rounded';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'border-2 border-emerald-400 bg-emerald-900/60 text-emerald-200 font-mono shadow-[0_0_25px_rgba(16,185,129,0.5)] rounded-lg px-4 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 border-2 border-emerald-300 bg-emerald-400 text-slate-950 font-black rounded';
                  icon = <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle =
                    'border-2 border-rose-500 bg-rose-950/70 text-rose-200 font-mono shadow-[0_0_20px_rgba(244,63,94,0.4)] rounded-lg px-4 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 border-2 border-rose-400 bg-rose-500 text-white font-black rounded';
                  icon = <XCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />;
                } else {
                  btnStyle = 'border border-slate-800 bg-slate-950/40 text-slate-600 font-mono opacity-30 rounded-lg px-4 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 border border-slate-800 text-slate-600 rounded';
                }
              }
            } else if (activeLayout === 'neumorphic_luxe') {
              // Game Show VIP Gold Pill Button
              btnStyle =
                'rounded-full border-2 border-amber-400/70 bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900 hover:border-amber-300 shadow-[0_6px_20px_rgba(245,158,11,0.25)] text-amber-100 px-5 py-3.5';
              badgeStyle =
                'w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-200 text-slate-950 font-black text-lg';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'rounded-full border-2 border-emerald-400 bg-emerald-900/80 text-emerald-200 shadow-xl px-5 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-10 h-10 rounded-full bg-emerald-400 text-slate-950 font-black';
                  icon = <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle =
                    'rounded-full border-2 border-rose-400 bg-rose-900/80 text-rose-200 shadow-xl px-5 py-3.5';
                  badgeStyle = 'w-10 h-10 rounded-full bg-rose-500 text-white font-black';
                  icon = <XCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />;
                } else {
                  btnStyle = 'rounded-full border border-white/5 bg-slate-950/30 text-slate-600 opacity-30 px-5 py-3.5';
                  badgeStyle = 'w-10 h-10 rounded-full bg-slate-800 text-slate-600';
                }
              }
            } else if (activeLayout === 'pixel_retro') {
              btnStyle =
                'border-4 border-yellow-400 bg-black text-yellow-300 font-mono shadow-[4px_4px_0_#ca8a04] active:translate-x-1 active:translate-y-1 rounded-none px-4 py-3.5 hover:bg-zinc-900';
              badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-yellow-400 text-black border-2 border-black font-mono font-black rounded-none flex items-center justify-center';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle = 'border-4 border-emerald-400 bg-emerald-950 text-emerald-300 font-mono shadow-[4px_4px_0_#10b981] rounded-none px-4 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-emerald-400 text-black border-2 border-black font-mono font-black rounded-none flex items-center justify-center';
                  icon = <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle = 'border-4 border-rose-500 bg-rose-950 text-rose-300 font-mono shadow-[4px_4px_0_#f43f5e] rounded-none px-4 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-rose-500 text-white border-2 border-black font-mono font-black rounded-none flex items-center justify-center';
                  icon = <XCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />;
                } else {
                  btnStyle = 'border-2 border-zinc-800 bg-black text-zinc-600 font-mono opacity-30 rounded-none px-4 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 text-zinc-600 border border-zinc-700 rounded-none flex items-center justify-center';
                }
              }
            } else if (activeLayout === 'cyber_matrix') {
              btnStyle =
                'border-2 border-emerald-400/80 bg-black/90 text-emerald-200 font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl px-4 py-3.5 hover:bg-emerald-950/40';
              badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-mono font-black rounded-lg flex items-center justify-center';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle = 'border-2 border-emerald-400 bg-emerald-900/80 text-white font-mono shadow-[0_0_25px_#10b981] rounded-xl px-4 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-emerald-400 text-black font-mono font-black rounded-lg flex items-center justify-center';
                  icon = <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle = 'border-2 border-rose-500 bg-rose-950/80 text-rose-200 font-mono shadow-[0_0_20px_#f43f5e] rounded-xl px-4 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-rose-500 text-white font-mono font-black rounded-lg flex items-center justify-center';
                  icon = <XCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />;
                } else {
                  btnStyle = 'border border-zinc-800 bg-black text-zinc-600 font-mono opacity-30 rounded-xl px-4 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 text-zinc-600 border border-zinc-800 rounded-lg flex items-center justify-center';
                }
              }
            } else if (activeLayout === 'synthwave_grid') {
              btnStyle =
                'border-2 border-pink-500/70 bg-purple-950/80 text-pink-100 shadow-[0_0_15px_rgba(236,72,153,0.35)] rounded-2xl px-5 py-3.5 hover:border-cyan-400';
              badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-xl flex items-center justify-center';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle = 'border-2 border-cyan-400 bg-cyan-950/90 text-cyan-200 shadow-[0_0_25px_#22d3ee] rounded-2xl px-5 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-cyan-400 text-black font-black rounded-xl flex items-center justify-center';
                  icon = <CheckCircle2 className="w-6 h-6 text-cyan-300 flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle = 'border-2 border-rose-500 bg-rose-950/90 text-rose-200 shadow-[0_0_20px_#f43f5e] rounded-2xl px-5 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-rose-500 text-white font-black rounded-xl flex items-center justify-center';
                  icon = <XCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />;
                } else {
                  btnStyle = 'border border-purple-900 bg-slate-950/40 text-slate-600 opacity-30 rounded-2xl px-5 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 text-slate-600 rounded-xl flex items-center justify-center';
                }
              }
            } else if (activeLayout === 'golden_casino') {
              btnStyle =
                'border-4 border-amber-300 bg-gradient-to-b from-stone-900 to-stone-950 text-amber-100 shadow-[0_6px_0_#78350f,0_8px_20px_rgba(0,0,0,0.5)] active:translate-y-1 rounded-2xl px-5 py-3.5 hover:brightness-110';
              badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 border border-yellow-100 font-black rounded-xl flex items-center justify-center';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle = 'border-4 border-amber-200 bg-gradient-to-b from-emerald-700 to-emerald-900 text-white shadow-xl rounded-2xl px-5 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-white text-emerald-900 font-black rounded-xl flex items-center justify-center';
                  icon = <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle = 'border-4 border-rose-400 bg-gradient-to-b from-rose-700 to-rose-900 text-white shadow-xl rounded-2xl px-5 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-white text-rose-900 font-black rounded-xl flex items-center justify-center';
                  icon = <XCircle className="w-6 h-6 text-white flex-shrink-0" />;
                } else {
                  btnStyle = 'border-2 border-stone-800 bg-stone-950 text-stone-600 opacity-30 rounded-2xl px-5 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-stone-900 text-stone-600 rounded-xl flex items-center justify-center';
                }
              }
            } else if (activeLayout === 'bubble_toon') {
              btnStyle =
                'border-4 border-pink-300/80 bg-slate-900/90 text-pink-100 shadow-[0_8px_20px_rgba(244,114,182,0.3)] rounded-full px-6 py-3.5 hover:scale-102';
              badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-pink-400 text-white border-2 border-pink-200 font-black rounded-full flex items-center justify-center';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle = 'border-4 border-emerald-300 bg-emerald-600 text-white shadow-lg rounded-full px-6 py-3.5 scale-[1.01]';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-white text-emerald-700 font-black rounded-full flex items-center justify-center';
                  icon = <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle = 'border-4 border-rose-300 bg-rose-600 text-white shadow-lg rounded-full px-6 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-white text-rose-700 font-black rounded-full flex items-center justify-center';
                  icon = <XCircle className="w-6 h-6 text-white flex-shrink-0" />;
                } else {
                  btnStyle = 'border-2 border-slate-800 bg-slate-950/40 text-slate-600 opacity-30 rounded-full px-6 py-3.5';
                  badgeStyle = 'w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 text-slate-600 rounded-full flex items-center justify-center';
                }
              }
            } else {
              // Modern Glass & Spatial 3D
              btnStyle = isLightMode
                ? 'bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-900 shadow-sm rounded-2xl'
                : 'bg-slate-900/85 border-2 border-white/15 hover:bg-slate-800/90 hover:border-white/40 text-white shadow-md rounded-2xl';
              badgeStyle = isLightMode
                ? 'w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                : 'w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/10 text-white shadow-inner';
              if (answered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'bg-emerald-600 border-2 border-emerald-400 text-white shadow-xl shadow-emerald-950/60 scale-[1.01] rounded-2xl';
                  icon = <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white flex-shrink-0" />;
                } else if (idx === selectedOption) {
                  btnStyle =
                    'bg-rose-600 border-2 border-rose-400 text-white shadow-xl shadow-rose-950/60 rounded-2xl';
                  icon = <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white flex-shrink-0" />;
                } else {
                  btnStyle = isLightMode
                    ? 'bg-slate-100/60 border-2 border-slate-200/50 text-slate-400 opacity-40 rounded-2xl'
                    : 'bg-slate-950/50 border-2 border-white/5 text-slate-500 opacity-40 rounded-2xl';
                }
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full p-3.5 sm:p-4 md:p-4.5 min-h-[58px] sm:min-h-[68px] font-bold text-base sm:text-lg md:text-xl flex items-center justify-between gap-3 sm:gap-4 transition-all active:scale-[0.98] ${btnStyle}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 text-left flex-1">
                  <span
                    className={`flex items-center justify-center font-black flex-shrink-0 ${
                      badgeStyle.includes('w-') ? badgeStyle : `w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${badgeStyle}`
                    }`}
                  >
                    {letter}
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
