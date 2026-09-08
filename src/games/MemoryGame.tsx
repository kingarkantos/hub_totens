import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';
import { MemoryCustomPair } from '../types/gameContent';

interface MemoryGameProps extends BaseGameProps {
  customContent?: MemoryCustomPair[];
}

interface Card {
  id: number;
  icon: string;
  label: string;
  matched: boolean;
}

const DEFAULT_ICONS: MemoryCustomPair[] = [
  { symbol: '🚗', label: 'Sedan Turbo' },
  { symbol: '🚙', label: 'SUV Híbrido' },
  { symbol: '🏍️', label: 'Moto Sport' },
  { symbol: '⚡', label: 'Bateria Elétrica' },
  { symbol: '🛡️', label: 'Segurança Sensing' },
  { symbol: '🏁', label: 'Performance R' },
];

export const MemoryGame: React.FC<MemoryGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#059669',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
}) => {
  const ICONS = customContent && customContent.length >= 4 ? customContent : DEFAULT_ICONS;
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = () => {
    const pairs = [...ICONS, ...ICONS];
    const shuffled = pairs
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        icon: item.symbol || (item as any).icon || '🚗',
        label: item.label,
        matched: false,
      }));
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setWon(false);
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || cards[id].matched) return;

    sound.playClick();
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        sound.playSuccess();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true } : c))
          );
          setFlipped([]);

          // Check if all matched
          setCards((current) => {
            const allMatched = current.every((c) => (c.id === first || c.id === second ? true : c.matched));
            if (allMatched) {
              const finalScore = Math.max(100, 1000 - moves * 25 + timeLeft * 15);
              setScore(finalScore);
              setWon(true);
              setGameOver(true);
            }
            return current;
          });
        }, 500);
      } else {
        sound.playError();
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  return (
    <GameContainer
      title="Jogo da Memória"
      category="Raciocínio"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={won}
      onRestart={initGame}
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
      <div className="w-full max-w-xl sm:max-w-2xl flex-1 flex flex-col items-center justify-center gap-4 py-2 my-auto">
        <div className="w-full flex justify-between text-xs sm:text-sm font-black text-slate-300 px-3">
          <span>Movimentos: <strong className="text-white font-mono">{moves}</strong></span>
          <span>Pares Encontrados: <strong className="text-emerald-400 font-mono">{cards.filter(c => c.matched).length / 2} / {ICONS.length}</strong></span>
        </div>

        {/* 4x3 Grid - Larger cards for totem kiosks */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full p-4 sm:p-6 bg-slate-900/85 backdrop-blur-xl rounded-3xl border-2 border-white/20 shadow-2xl">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isFlipped}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-2xl md:text-3xl font-black border-2 transition-all duration-300 active:scale-95 ${
                  isFlipped
                    ? card.matched
                      ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-800 border-amber-400 text-white shadow-md'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-white/15 hover:border-white/40 text-slate-500'
                }`}
              >
                {isFlipped ? (
                  <>
                    <span className="scale-110 mb-1">{card.icon}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter truncate max-w-full">
                      {card.label}
                    </span>
                  </>
                ) : (
                  <span className="text-xl text-slate-600 font-mono">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
