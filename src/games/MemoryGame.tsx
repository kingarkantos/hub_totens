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

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const MemoryGame: React.FC<MemoryGameProps> = (props) => {
  const {
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
    isLight,
    themeMode,
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
      <div className="w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl flex-1 flex flex-col items-center justify-between gap-6 py-4 sm:py-8 px-2 sm:px-6 my-auto select-none animate-in fade-in duration-300">
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`w-full flex justify-between text-sm sm:text-lg font-black px-4 py-3 rounded-2xl border-2 ${
            isLightMode 
              ? 'bg-white/90 text-slate-800 shadow-sm' 
              : 'bg-slate-900/80 text-slate-300 backdrop-blur-md'
          }`}
        >
          <span>Movimentos: <strong className={isLightMode ? 'text-slate-950 font-mono' : 'text-white font-mono'}>{moves}</strong></span>
          <span>Pares Encontrados: <strong style={{ color: layoutPrimary }} className="font-mono">{cards.filter(c => c.matched).length / 2} / {ICONS.length}</strong></span>
        </div>

        {/* 4x3 Grid - Super tactile, large touch cards for totems */}
        <div 
          style={{ borderColor: `${layoutPrimary}44`, boxShadow: `0 0 35px ${layoutGlow}33` }}
          className="grid grid-cols-4 gap-3.5 sm:gap-6 w-full p-5 sm:p-10 bg-slate-900/85 backdrop-blur-xl rounded-3xl border-4 shadow-2xl my-auto"
        >
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isFlipped}
                style={
                  isFlipped
                    ? card.matched
                      ? {
                          borderColor: '#10b981',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                        }
                      : {
                          borderColor: layoutPrimary,
                          boxShadow: `0 0 20px ${layoutGlow}`,
                          backgroundColor: `${layoutPrimary}22`,
                        }
                    : {
                        borderColor: `${layoutPrimary}33`,
                      }
                }
                className={`aspect-square rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-2 sm:p-4 font-black border-2 sm:border-4 transition-all duration-300 active:scale-95 shadow-lg ${
                  isFlipped
                    ? card.matched
                      ? 'bg-emerald-600/40 text-white scale-[1.02]'
                      : 'text-white scale-[1.02]'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 hover:brightness-110 text-slate-500'
                }`}
              >
                {isFlipped ? (
                  <>
                    <span className="text-4xl sm:text-6xl md:text-7xl mb-1 sm:mb-2 transition-transform scale-110 drop-shadow-md">
                      {card.icon}
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm font-black text-slate-200 uppercase tracking-tight truncate max-w-full text-center">
                      {card.label}
                    </span>
                  </>
                ) : (
                  <span 
                    style={{ color: `${layoutPrimary}aa` }}
                    className="text-3xl sm:text-5xl md:text-6xl font-mono font-black"
                  >
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
