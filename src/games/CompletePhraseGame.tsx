import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Award } from 'lucide-react';
import { BaseGameProps } from '../types';
import { CompletePhraseCustomItem } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';
import { GameLayoutId } from '../types/gameLayouts';

interface CompletePhraseGameProps extends BaseGameProps {
  customContent?: CompletePhraseCustomItem[];
}

const DEFAULT_PHRASES: CompletePhraseCustomItem[] = [
  {
    sentence: 'Antes de operar máquinas pesadas, a verificação e uso de ___ é indispensável.',
    missingWord: 'EPIs Homologados',
    options: ['EPIs Homologados', 'Fone de Ouvido', 'Roupas Folgadas', 'Telefone Celular'],
  },
  {
    sentence: 'Em áreas com piso molhado ou escorregadio, o calçado deve possuir solado ___.',
    missingWord: 'Antiderrapante',
    options: ['Antiderrapante', 'Liso e Rígido', 'Com Rodinhas', 'De Pano Comum'],
  },
  {
    sentence: 'Ao perceber qualquer anomalia no equipamento, o operador deve acionar o botão de ___.',
    missingWord: 'Parada de Emergência',
    options: ['Parada de Emergência', 'Aceleração Máxima', 'Música Ambiente', 'Revisão Posterior'],
  },
  {
    sentence: 'A sinalização de perigo com cor amarela alerta para a necessidade de ___.',
    missingWord: 'Atenção e Cuidado',
    options: ['Atenção e Cuidado', 'Velocidade Livre', 'Acesso Restrito Proibido', 'Área de Lazer'],
  },
];

export const CompletePhraseGame: React.FC<CompletePhraseGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#A21CAF',
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
  const rawPhrases = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_PHRASES;
  }, [customContent]);

  const preparePhrases = useCallback(() => {
    let list = [...rawPhrases];
    if (orderMode !== 'ordered') {
      list = list.sort(() => Math.random() - 0.5);
    }
    if (questionsCount && questionsCount > 0 && questionsCount < list.length) {
      list = list.slice(0, questionsCount);
    }
    return list;
  }, [rawPhrases, orderMode, questionsCount]);

  const [phrases, setPhrases] = useState<CompletePhraseCustomItem[]>(() => preparePhrases());

  useEffect(() => {
    setPhrases(preparePhrases());
  }, [preparePhrases]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const activePhrase = phrases[currentIdx % phrases.length];

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(score >= 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, score]);

  const handleSelectOption = (opt: string) => {
    if (answered || gameOver) return;

    setSelectedOpt(opt);
    setAnswered(true);

    const isCorrect = opt === activePhrase.missingWord;
    if (isCorrect) {
      sound.playSuccess();
      setCorrectCount((prev) => prev + 1);
      const points = 250 + timeLeft * 3;
      setScore((prev) => prev + points);
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (currentIdx + 1 < phrases.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      sound.playFanfare();
      setGameOver(true);
      setGameWon(score >= 500);
    }
  };

  // Replace ___ with highlighted word or placeholder
  const parts = activePhrase.sentence.split('___');

  return (
    <GameContainer
      title="Complete a Frase"
      category="Linguagem"
      score={score}
      correctAnswers={correctCount}
      totalQuestions={phrases.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setPhrases(preparePhrases());
        setCurrentIdx(0);
        setScore(0);
        setCorrectCount(0);
        setTimeLeft(50);
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
      gameLayout={activeLayout}
      palette={palette}
      layoutColorHue={layoutColorHue}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
    >
      <div className="flex flex-col w-full max-w-3xl lg:max-w-4xl mx-auto my-auto py-2 sm:py-4 px-2 sm:px-4 gap-4 sm:gap-5 select-none animate-in fade-in duration-300">
        {/* Step indicator */}
        <div
          style={{
            ...(activeLayout === 'cartoon_pop' || activeLayout === 'neon_arcade'
              ? { borderColor: layoutPrimary, color: layoutPrimary, backgroundColor: `${layoutPrimary}15` }
              : {}),
          }}
          className={`flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-sm border-2 ${
          activeLayout === 'cartoon_pop'
            ? 'backdrop-blur-md'
            : activeLayout === 'cartoon_comic'
            ? 'bg-sky-400/20 border-black text-white shadow-[3px_3px_0_#000]'
            : activeLayout === 'neon_arcade'
            ? 'font-mono'
            : activeLayout === 'bento_tech'
            ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-mono'
            : 'bg-black/40 border-white/20 text-amber-300 backdrop-blur-md'
        }`}>
          <span className="text-xs sm:text-base font-black uppercase flex items-center gap-2">
            <span
              style={{ backgroundColor: layoutPrimary }}
              className="w-2.5 h-2.5 rounded-full animate-pulse"
            />
            {activeLayout === 'bento_tech' ? `SENTENCE [0${currentIdx + 1}/0${phrases.length}]` : `Frase ${currentIdx + 1} de ${phrases.length}`}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" style={{ color: layoutPrimary }} />
            Selecione o termo correto
          </span>
        </div>

        {/* Phrase Sentence Box */}
        <div className="relative w-full my-auto py-2">
          {/* Layout 1: CARTOON 3D POP - Floating 3D Coin Badge */}
          {activeLayout === 'cartoon_pop' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div
                style={{
                  background: `linear-gradient(to bottom, ${layoutPrimary}, ${layoutSecondary})`,
                  borderColor: '#FFFFFF',
                  boxShadow: `0 6px 0 ${darkPrimary}, 0 12px 24px rgba(0,0,0,0.5)`,
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform"
              >
                <span className="text-3xl sm:text-4xl font-black text-white select-none drop-shadow-sm">✏️</span>
              </div>
            </div>
          )}

          {/* Layout 2: CARTOON COMIC - Slanted Comic Badge */}
          {activeLayout === 'cartoon_comic' && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 border-4 border-white shadow-[4px_4px_0_#000] flex items-center justify-center rotate-6 text-white font-black text-3xl select-none">
                ✏️
              </div>
            </div>
          )}

          {/* Layout 4: GAME SHOW VIP - Floating Gold Trophy Ribbon */}
          {activeLayout === 'neumorphic_luxe' && (
            <div 
              style={{
                background: `linear-gradient(to right, ${layoutPrimary}, ${layoutSecondary}, ${layoutPrimary})`,
                boxShadow: `0 4px 16px ${layoutGlow}`,
              }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-1 rounded-full border-2 border-white/40 text-slate-950 font-black text-xs uppercase tracking-widest pointer-events-none"
            >
              <Award className="w-3.5 h-3.5 fill-current" />
              <span>Desafio VIP</span>
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
              className="text-[11px] sm:text-xs font-black uppercase tracking-widest mb-2 sm:mb-3 block"
            >
              {activeLayout === 'bento_tech' ? '[ COMPLETE SENTENCE // FILL THE BLANK ]' : 'Complete a lacuna com a opção ideal:'}
            </span>
            <p className={`text-xl sm:text-3xl md:text-4xl font-black leading-relaxed sm:leading-relaxed ${
              activeLayout === 'cartoon_comic'
                ? 'text-white drop-shadow-[2px_2px_0_#000]'
                : activeLayout === 'neon_arcade'
                ? 'text-cyan-50 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : activeLayout === 'bento_tech'
                ? 'text-emerald-100 font-mono'
                : 'text-white'
            }`}>
              {parts[0]}
              <span
                style={
                  !answered
                    ? activeLayout === 'neon_arcade'
                      ? {
                          backgroundColor: `${layoutPrimary}33`,
                          borderColor: layoutPrimary,
                          color: '#FFFFFF',
                          boxShadow: `0 0 15px ${layoutGlow}`,
                        }
                      : activeLayout === 'cartoon_comic'
                      ? {
                          backgroundColor: layoutPrimary,
                          color: '#000000',
                        }
                      : {
                          backgroundColor: layoutPrimary,
                          borderColor: darkPrimary,
                          color: '#020617',
                        }
                    : undefined
                }
                className={`inline-block px-5 sm:px-7 py-2 sm:py-3 mx-2 sm:mx-3 rounded-2xl sm:rounded-3xl border-b-4 font-black transition-all ${
                  answered
                    ? selectedOpt === activePhrase.missingWord
                      ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg shadow-emerald-950/50'
                      : 'bg-rose-600 text-white border-rose-400'
                    : activeLayout === 'cartoon_comic'
                    ? 'border-4 border-black shadow-[3px_3px_0_#000]'
                    : activeLayout === 'neon_arcade'
                    ? 'border-2'
                    : 'animate-pulse'
                }`}
              >
                {selectedOpt || '[ ____________ ]'}
              </span>
              {parts[1]}
            </p>
          </div>
        </div>

        {/* 4 Large Choice Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {activePhrase.options.map((opt, idx) => {
            const isChosen = selectedOpt === opt;
            const isCorrectAnswer = opt === activePhrase.missingWord;

            let btnStyle = '';
            let btnInlineStyle: React.CSSProperties = {};

            if (activeLayout === 'cartoon_pop') {
              btnStyle =
                'border-4 bg-gradient-to-b from-slate-800 to-slate-900 active:translate-y-1.5 text-white rounded-2xl hover:brightness-110';
              btnInlineStyle = {
                borderColor: `${layoutPrimary}E6`,
                boxShadow: `0 6px 0 ${darkPrimary}, 0 8px 16px rgba(0,0,0,0.4)`,
              };
              if (answered) {
                if (isCorrectAnswer) {
                  btnStyle =
                    'border-4 border-emerald-300 bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-[0_6px_0_#065f46] text-white rounded-2xl scale-[1.01]';
                  btnInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnStyle =
                    'border-4 border-rose-400 bg-gradient-to-b from-rose-600 to-rose-800 shadow-[0_6px_0_#881337] text-white rounded-2xl';
                  btnInlineStyle = {};
                } else {
                  btnStyle = 'border-2 border-slate-700/50 bg-slate-950/40 text-slate-500 opacity-35 shadow-none rounded-2xl';
                  btnInlineStyle = {};
                }
              }
            } else if (activeLayout === 'cartoon_comic') {
              btnStyle =
                'border-4 border-black bg-slate-900 shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] text-white rounded-2xl hover:bg-slate-800';
              if (answered) {
                if (isCorrectAnswer) {
                  btnStyle =
                    'border-4 border-black bg-emerald-500 shadow-[5px_5px_0_#000] text-slate-950 font-black rounded-2xl';
                } else if (isChosen && !isCorrectAnswer) {
                  btnStyle =
                    'border-4 border-black bg-rose-500 shadow-[5px_5px_0_#000] text-white font-black rounded-2xl';
                } else {
                  btnStyle = 'border-2 border-slate-700 bg-slate-950/40 text-slate-500 opacity-30 shadow-none rounded-2xl';
                }
              }
            } else if (activeLayout === 'neon_arcade') {
              btnStyle =
                'rounded-full border-2 bg-slate-950/85 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-cyan-50 px-6 py-4';
              btnInlineStyle = {
                borderColor: `${layoutPrimary}CC`,
                boxShadow: `0 0 14px ${layoutGlow}`,
              };
              if (answered) {
                if (isCorrectAnswer) {
                  btnStyle =
                    'rounded-full border-2 border-emerald-400 bg-emerald-950/90 text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.6)] px-6 py-4 scale-[1.01]';
                  btnInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnStyle =
                    'rounded-full border-2 border-rose-500 bg-rose-950/90 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.6)] px-6 py-4';
                  btnInlineStyle = {};
                } else {
                  btnStyle = 'rounded-full border border-slate-800 bg-slate-950/40 text-slate-600 opacity-30 px-6 py-4 shadow-none';
                  btnInlineStyle = {};
                }
              }
            } else {
              btnStyle =
                'bg-slate-900/85 text-white border-2 hover:bg-slate-800/90 rounded-2xl sm:rounded-3xl shadow-lg';
              btnInlineStyle = {
                borderColor: `${layoutPrimary}66`,
              };
              if (answered) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-950/60 scale-[1.02] rounded-2xl sm:rounded-3xl';
                  btnInlineStyle = {};
                } else if (isChosen && !isCorrectAnswer) {
                  btnStyle = 'bg-rose-600 text-white border-rose-400 shadow-xl shadow-rose-950/60 rounded-2xl sm:rounded-3xl';
                  btnInlineStyle = {};
                } else {
                  btnStyle = 'bg-slate-950/40 text-slate-500 border-white/5 opacity-40 rounded-2xl sm:rounded-3xl';
                  btnInlineStyle = {};
                }
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(opt)}
                style={btnInlineStyle}
                className={`p-5 sm:p-7 min-h-[80px] sm:min-h-[100px] font-black text-lg sm:text-2xl text-left flex items-center justify-between transition-all active:scale-95 ${btnStyle}`}
              >
                <span className="leading-snug">{opt}</span>
                {answered && isCorrectAnswer && <CheckCircle2 className="w-8 h-8 text-white flex-shrink-0" />}
                {answered && isChosen && !isCorrectAnswer && <XCircle className="w-8 h-8 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Next Button after answering */}
        {answered && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              style={
                activeLayout === 'cartoon_pop'
                  ? {
                      background: `linear-gradient(to bottom, ${layoutPrimary}, ${layoutSecondary})`,
                      borderColor: '#FFFFFF66',
                      boxShadow: `0 8px 0 ${darkPrimary}`,
                      color: '#020617',
                    }
                  : activeLayout === 'neon_arcade'
                  ? {
                      borderColor: layoutPrimary,
                      color: layoutPrimary,
                      boxShadow: `0 0 25px ${layoutGlow}`,
                    }
                  : activeLayout === 'cartoon_comic'
                  ? {
                      backgroundColor: layoutPrimary,
                      color: '#000000',
                    }
                  : {
                      background: `linear-gradient(to right, ${layoutPrimary}, ${layoutSecondary})`,
                      borderColor: darkPrimary,
                    }
              }
              className={`w-full py-6 sm:py-7 min-h-[85px] sm:min-h-[95px] font-black text-xl sm:text-2xl flex items-center justify-center gap-3 transition-all ${
                activeLayout === 'cartoon_pop'
                  ? 'border-4 rounded-3xl active:translate-y-1'
                  : activeLayout === 'cartoon_comic'
                  ? 'border-4 border-black shadow-[6px_6px_0_#000] rounded-3xl active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000]'
                  : activeLayout === 'neon_arcade'
                  ? 'rounded-full border-2 bg-slate-950/85 active:scale-95'
                  : 'text-white rounded-3xl shadow-xl border-b-4 active:scale-95'
              }`}
            >
              <span>Continuar</span>
              <ArrowRight className="w-7 h-7 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
