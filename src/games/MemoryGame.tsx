import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';
import { MemoryCustomPair } from '../types/gameContent';

interface MemoryGameProps extends BaseGameProps {
  customContent?: MemoryCustomPair[];
  orderMode?: 'random' | 'ordered';
  questionsCount?: number;
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

const isImageUrl = (val: string) => {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/') ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(s)
  );
};

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
    orderMode = 'random',
    questionsCount,
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

  const rawIcons = React.useMemo(() => {
    let list: MemoryCustomPair[] = [];
    if (Array.isArray(customContent) && customContent.length >= 3) {
      list = customContent;
    } else if (typeof customContent === 'string') {
      try {
        const parsed = JSON.parse(customContent);
        if (Array.isArray(parsed) && parsed.length >= 3) list = parsed;
        else if (Array.isArray(parsed?.pairs) && parsed.pairs.length >= 3) list = parsed.pairs;
      } catch {}
    } else if (Array.isArray((customContent as any)?.pairs) && (customContent as any).pairs.length >= 3) {
      list = (customContent as any).pairs;
    }
    return list.length >= 3 ? list : DEFAULT_ICONS;
  }, [customContent]);

  const targetPairCount = React.useMemo(() => {
    if (questionsCount && questionsCount >= 3) {
      return Math.min(questionsCount, rawIcons.length);
    }
    return Math.min(6, rawIcons.length);
  }, [questionsCount, rawIcons.length]);

  const pickActivePairs = React.useCallback(() => {
    let list = [...rawIcons];
    if (orderMode !== 'ordered') {
      list = list.sort(() => Math.random() - 0.5);
    }
    return list.slice(0, targetPairCount);
  }, [rawIcons, orderMode, targetPairCount]);

  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = React.useCallback(() => {
    const activePairs = pickActivePairs();
    const pairs = [...activePairs, ...activePairs];
    const shuffled = pairs
      .sort(() => Math.random() - 0.5)
      .map((item, index) => {
        const img = item.image_url || item.imageUrl || (isImageUrl(item.symbol) ? item.symbol : undefined);
        return {
          id: index,
          icon: img || item.symbol || (item as any).icon || '🚗',
          label: item.label,
          matched: false,
        };
      });
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setWon(false);
  }, [pickActivePairs]);

  useEffect(() => {
    initGame();
  }, [initGame]);

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
      correctAnswers={cards.filter((c) => c.matched).length / 2}
      totalQuestions={cards.length / 2}
      correctAnswersLabel="Pares Encontrados"
      totalMetricLabel="pares"
      gameType="memory"
      customFeedbackTitle={won ? 'Memória Extraordinária!' : 'Valeu o Treino!'}
      customFeedbackSubtitle={
        won
          ? `Fantástico! Você encontrou todos os ${cards.length / 2} pares e completou o jogo com ${score} pontos!`
          : `Você encontrou ${cards.filter((c) => c.matched).length / 2} de ${cards.length / 2} pares e somou ${score} pontos. Jogue novamente para completar a tempo!`
      }
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
          <span>Pares Encontrados: <strong style={{ color: layoutPrimary }} className="font-mono">{cards.filter(c => c.matched).length / 2} / {cards.length / 2}</strong></span>
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
                className={`aspect-square rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-1.5 sm:p-2.5 md:p-3 font-black border-2 sm:border-4 transition-all duration-300 active:scale-95 shadow-lg overflow-hidden ${
                  isFlipped
                    ? card.matched
                      ? 'bg-emerald-600/40 text-white scale-[1.02]'
                      : 'text-white scale-[1.02]'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 hover:brightness-110 text-slate-500'
                }`}
              >
                {isFlipped ? (
                  <div className="flex flex-col items-center justify-center w-full h-full max-h-full overflow-hidden select-none">
                    <span className="mb-1 sm:mb-1.5 transition-transform scale-105 drop-shadow-md flex items-center justify-center shrink-0">
                      {isImageUrl(card.icon) ? (
                        <img
                          src={card.icon}
                          alt={card.label}
                          className="w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain pointer-events-none drop-shadow-md"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex items-center justify-center">
                          {card.icon}
                        </span>
                      )}
                    </span>
                    <span 
                      className={`font-black text-slate-200 uppercase tracking-tight text-center w-full break-words leading-tight line-clamp-2 px-0.5 ${
                        card.label.length > 20
                          ? 'text-[8px] sm:text-[9px] md:text-[10px]'
                          : card.label.length > 13
                          ? 'text-[9px] sm:text-[10px] md:text-xs'
                          : 'text-[10px] sm:text-xs md:text-sm'
                      }`}
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                      title={card.label}
                    >
                      {card.label}
                    </span>
                  </div>
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
