import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { CompletePhraseCustomItem } from '../types/gameContent';

interface CompletePhraseGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
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
  customContent,
}) => {
  const phrases = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_PHRASES;
  }, [customContent]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
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
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setCurrentIdx(0);
        setScore(0);
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
    >
      <div className="flex flex-col h-full max-w-xl mx-auto justify-between select-none">
        {/* Step indicator */}
        <div className="flex items-center justify-between bg-fuchsia-50 border border-fuchsia-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="text-xs font-black uppercase text-fuchsia-800">
            Frase {currentIdx + 1} de {phrases.length}
          </span>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-fuchsia-600" />
            Selecione o termo correto
          </span>
        </div>

        {/* Phrase Sentence Box */}
        <div className="my-auto py-3">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl backdrop-blur-sm text-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">
              Complete a lacuna com a opção ideal:
            </span>
            <p className="text-lg sm:text-2xl font-extrabold text-slate-800 leading-relaxed">
              {parts[0]}
              <span
                className={`inline-block px-3 py-1 mx-1.5 rounded-xl border-b-2 font-black transition-all ${
                  answered
                    ? selectedOpt === activePhrase.missingWord
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-500 scale-105'
                      : 'bg-rose-100 text-rose-800 border-rose-500'
                    : 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                }`}
              >
                {selectedOpt || '[ ____________ ]'}
              </span>
              {parts[1]}
            </p>
          </div>
        </div>

        {/* 4 Large Choice Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {activePhrase.options.map((opt) => {
            const isChosen = selectedOpt === opt;
            const isCorrectAnswer = opt === activePhrase.missingWord;

            let btnStyle = 'bg-white text-slate-800 border-2 border-slate-200 hover:border-fuchsia-400';
            if (answered) {
              if (isCorrectAnswer) {
                btnStyle = 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md shadow-emerald-600/30';
              } else if (isChosen && !isCorrectAnswer) {
                btnStyle = 'bg-rose-600 text-white border-2 border-rose-700';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 sm:p-5 rounded-2xl font-black text-sm sm:text-base text-left flex items-center justify-between transition-all active:scale-98 shadow-sm ${btnStyle}`}
              >
                <span>{opt}</span>
                {answered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />}
                {answered && isChosen && !isCorrectAnswer && <XCircle className="w-5 h-5 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Next Button after answering */}
        {answered && (
          <div className="pt-3">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black text-base shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Continuar
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
};
