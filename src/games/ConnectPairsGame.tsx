import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Link, Check, Sparkles } from 'lucide-react';
import { BaseGameProps } from '../types';
import { ConnectPairCustomItem } from '../types/gameContent';

interface ConnectPairsGameProps extends BaseGameProps {
  customContent?: ConnectPairCustomItem[];
}

const DEFAULT_PAIRS: ConnectPairCustomItem[] = [
  { left: 'Ruído industrial contínuo', right: 'Protetor Auricular Tipo Concha' },
  { left: 'Respingo de produtos químicos', right: 'Óculos de Ampla Visão' },
  { left: 'Queda de peças pesadas', right: 'Bota com Biqueira de Aço' },
  { left: 'Inalação de poeiras e fumos', right: 'Máscara com Filtro PFF2' },
];

export const ConnectPairsGame: React.FC<ConnectPairsGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#0284C7',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
}) => {
  const basePairs = useMemo(() => {
    return customContent && customContent.length >= 3 ? customContent.slice(0, 4) : DEFAULT_PAIRS;
  }, [customContent]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // list of left keys matched
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    const rights = basePairs.map((p) => p.right).sort(() => Math.random() - 0.5);
    setShuffledRights(rights);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setScore(0);
    setTimeLeft(50);
    setGameOver(false);
    setGameWon(false);
  }, [basePairs]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(matchedPairs.length === basePairs.length);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, matchedPairs.length, basePairs.length]);

  const handleLeftClick = (leftText: string) => {
    if (matchedPairs.includes(leftText) || gameOver) return;
    sound.playTap();
    setSelectedLeft(leftText);

    if (selectedRight) {
      checkMatch(leftText, selectedRight);
    }
  };

  const handleRightClick = (rightText: string) => {
    // If this rightText is already matched, ignore
    const alreadyMatched = basePairs.some(
      (p) => p.right === rightText && matchedPairs.includes(p.left)
    );
    if (alreadyMatched || gameOver) return;

    sound.playTap();
    setSelectedRight(rightText);

    if (selectedLeft) {
      checkMatch(selectedLeft, rightText);
    }
  };

  const checkMatch = (leftText: string, rightText: string) => {
    const pair = basePairs.find((p) => p.left === leftText);
    if (pair && pair.right === rightText) {
      sound.playSuccess();
      const updated = [...matchedPairs, leftText];
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setSelectedRight(null);
      setScore((prev) => prev + 250 + timeLeft * 5);

      if (updated.length === basePairs.length) {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }
    } else {
      sound.playError();
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 400);
    }
  };

  return (
    <GameContainer
      title="Conecte os Pares"
      category="Associação"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        const rights = basePairs.map((p) => p.right).sort(() => Math.random() - 0.5);
        setShuffledRights(rights);
        setMatchedPairs([]);
        setSelectedLeft(null);
        setSelectedRight(null);
        setScore(0);
        setTimeLeft(50);
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
      <div className="flex flex-col flex-1 w-full max-w-2xl sm:max-w-4xl mx-auto justify-between py-2 select-none">
        {/* Instruction Header */}
        <div className="bg-sky-50 border border-sky-200/80 rounded-2xl px-4 py-2.5 shadow-sm text-center">
          <span className="text-xs font-black uppercase text-sky-800 flex items-center justify-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-sky-600" />
            Toque em um item da esquerda e no correspondente da direita
          </span>
        </div>

        {/* Two Columns Grid */}
        <div className="my-auto py-3 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Left Column */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 text-center mb-1">
              Situação / Risco
            </div>
            {basePairs.map((pair) => {
              const isMatched = matchedPairs.includes(pair.left);
              const isSelected = selectedLeft === pair.left;

              return (
                <button
                  key={pair.left}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleLeftClick(pair.left)}
                  className={`w-full min-h-[72px] p-3 rounded-2xl font-black text-xs sm:text-sm text-left transition-all active:scale-95 border-2 flex items-center justify-between gap-2 shadow-sm ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-400 opacity-80'
                      : isSelected
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-102 ring-2 ring-sky-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <span className="leading-snug">{pair.left}</span>
                  {isMatched && <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 text-center mb-1">
              Proteção / Solução
            </div>
            {shuffledRights.map((rightText) => {
              const isMatched = basePairs.some(
                (p) => p.right === rightText && matchedPairs.includes(p.left)
              );
              const isSelected = selectedRight === rightText;

              return (
                <button
                  key={rightText}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleRightClick(rightText)}
                  className={`w-full min-h-[72px] p-3 rounded-2xl font-black text-xs sm:text-sm text-left transition-all active:scale-95 border-2 flex items-center justify-between gap-2 shadow-sm ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-400 opacity-80'
                      : isSelected
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-102 ring-2 ring-sky-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <span className="leading-snug">{rightText}</span>
                  {isMatched && <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs font-bold text-slate-400 pb-1">
          {matchedPairs.length} de {basePairs.length} pares conectados com sucesso
        </div>
      </div>
    </GameContainer>
  );
};
