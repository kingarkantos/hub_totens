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

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const ConnectPairsGame: React.FC<ConnectPairsGameProps> = (props) => {
  const {
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
      correctAnswers={matchedPairs.length}
      totalQuestions={basePairs.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={matchedPairs.length === basePairs.length}
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
      <div className="flex flex-col flex-1 w-full max-w-4xl lg:max-w-5xl mx-auto justify-between py-4 sm:py-8 px-2 sm:px-6 gap-5 sm:gap-8 select-none animate-in fade-in duration-300">
        {/* Instruction Header */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`rounded-2xl px-6 py-3.5 shadow-sm border-2 text-center ${
            isLightMode 
              ? 'bg-white/95 text-slate-900 shadow-slate-200/50' 
              : 'bg-slate-900/90 text-white'
          }`}
        >
          <span 
            style={{ color: layoutPrimary }}
            className="text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Link className="w-5 h-5" />
            Toque em um item da esquerda e no correspondente da direita
          </span>
        </div>

        {/* Two Columns Grid */}
        <div className="my-auto py-2 grid grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 text-center mb-2">
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
                  style={
                    isSelected
                      ? {
                          backgroundColor: layoutPrimary,
                          color: '#020617',
                          boxShadow: `0 0 20px ${layoutGlow}`,
                          borderColor: '#ffffff',
                        }
                      : !isMatched
                      ? {
                          borderColor: `${layoutPrimary}33`,
                        }
                      : undefined
                  }
                  className={`w-full min-h-[85px] sm:min-h-[105px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-base sm:text-xl text-left transition-all active:scale-95 border-2 flex items-center justify-between gap-3 shadow-lg ${
                    isMatched
                      ? isLightMode 
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-400 opacity-80' 
                        : 'bg-emerald-950/60 text-emerald-200 border-emerald-500 opacity-70'
                      : isSelected
                      ? 'scale-[1.02] ring-4 ring-white'
                      : isLightMode
                      ? 'bg-white text-slate-900 border-slate-200 shadow-md'
                      : 'bg-slate-900/85 text-white shadow-md'
                  }`}
                >
                  <span className="leading-snug">{pair.left}</span>
                  {isMatched && <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 stroke-[3] flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 text-center mb-2">
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
                  style={
                    isSelected
                      ? {
                          backgroundColor: layoutPrimary,
                          color: '#020617',
                          boxShadow: `0 0 20px ${layoutGlow}`,
                          borderColor: '#ffffff',
                        }
                      : !isMatched
                      ? {
                          borderColor: `${layoutPrimary}33`,
                        }
                      : undefined
                  }
                  className={`w-full min-h-[85px] sm:min-h-[105px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-base sm:text-xl text-left transition-all active:scale-95 border-2 flex items-center justify-between gap-3 shadow-lg ${
                    isMatched
                      ? isLightMode 
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-400 opacity-80' 
                        : 'bg-emerald-950/60 text-emerald-200 border-emerald-500 opacity-70'
                      : isSelected
                      ? 'scale-[1.02] ring-4 ring-white'
                      : isLightMode
                      ? 'bg-white text-slate-900 border-slate-200 shadow-md'
                      : 'bg-slate-900/85 text-white shadow-md'
                  }`}
                >
                  <span className="leading-snug">{rightText}</span>
                  {isMatched && <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 stroke-[3] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className={`text-center text-sm sm:text-base font-black pb-1 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
          {matchedPairs.length} de {basePairs.length} pares conectados com sucesso
        </div>
      </div>
    </GameContainer>
  );
};
