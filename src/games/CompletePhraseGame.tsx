import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { BaseGameProps } from '../types';
import { CompletePhraseCustomItem } from '../types/gameContent';

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

export const CompletePhraseGame: React.FC<CompletePhraseGameProps> = ({
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
}) => {
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
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="flex flex-col w-full max-w-3xl lg:max-w-4xl mx-auto my-auto py-2 sm:py-4 px-2 sm:px-4 gap-3 sm:gap-5 select-none animate-in fade-in duration-300">
        {/* Step indicator */}
        <div className="flex items-center justify-between bg-black/40 border-2 border-white/20 rounded-2xl px-4 py-2.5 shadow-sm backdrop-blur-md">
          <span className="text-xs sm:text-base font-black uppercase text-amber-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Frase {currentIdx + 1} de {phrases.length}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Selecione o termo correto
          </span>
        </div>

        {/* Phrase Sentence Box */}
        <div className="my-auto py-1">
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border-2 border-white/20 shadow-xl text-center">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-300/90 mb-2 sm:mb-3 block">
              Complete a lacuna com a opção ideal:
            </span>
            <p className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-relaxed sm:leading-relaxed">
              {parts[0]}
              <span
                className={`inline-block px-5 sm:px-7 py-2 sm:py-3 mx-2 sm:mx-3 rounded-2xl sm:rounded-3xl border-b-4 font-black transition-all ${
                  answered
                    ? selectedOpt === activePhrase.missingWord
                      ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg shadow-emerald-950/50'
                      : 'bg-rose-600 text-white border-rose-400'
                    : 'bg-amber-400 text-slate-950 border-amber-600 animate-pulse'
                }`}
              >
                {selectedOpt || '[ ____________ ]'}
              </span>
              {parts[1]}
            </p>
          </div>
        </div>

        {/* 4 Large Choice Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {activePhrase.options.map((opt) => {
            const isChosen = selectedOpt === opt;
            const isCorrectAnswer = opt === activePhrase.missingWord;

            let btnStyle = 'bg-slate-900/85 text-white border-2 border-white/20 hover:border-amber-400 hover:bg-slate-800/90';
            if (answered) {
              if (isCorrectAnswer) {
                btnStyle = 'bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-950/60 scale-[1.02]';
              } else if (isChosen && !isCorrectAnswer) {
                btnStyle = 'bg-rose-600 text-white border-rose-400 shadow-xl shadow-rose-950/60';
              } else {
                btnStyle = 'bg-slate-950/40 text-slate-500 border-white/5 opacity-40';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(opt)}
                className={`p-6 sm:p-8 min-h-[90px] sm:min-h-[110px] rounded-2xl sm:rounded-3xl font-black text-xl sm:text-2xl text-left flex items-center justify-between transition-all active:scale-95 shadow-lg ${btnStyle}`}
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
              className="w-full py-6 sm:py-7 min-h-[85px] sm:min-h-[95px] bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-3xl font-black text-xl sm:text-2xl shadow-xl shadow-fuchsia-950/50 flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-fuchsia-800"
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
