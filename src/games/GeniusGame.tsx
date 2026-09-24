import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';

interface GeniusGameProps extends BaseGameProps {
  customContent?: any;
}

const PADS = [
  { id: 0, color: 'bg-emerald-500', activeColor: 'bg-emerald-300', border: 'border-emerald-400', label: 'Verde' },
  { id: 1, color: 'bg-rose-600', activeColor: 'bg-rose-300', border: 'border-rose-400', label: 'Vermelho' },
  { id: 2, color: 'bg-amber-400', activeColor: 'bg-amber-100', border: 'border-amber-300', label: 'Amarelo' },
  { id: 3, color: 'bg-blue-600', activeColor: 'bg-blue-300', border: 'border-blue-400', label: 'Azul' },
];

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const GeniusGame: React.FC<GeniusGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#06B6D4',
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
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const startNewRound = (currentSeq: number[]) => {
    setIsPlayingSeq(true);
    setPlayerIndex(0);
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);

    // Play sequence animation
    let i = 0;
    const interval = setInterval(() => {
      if (i >= newSeq.length) {
        clearInterval(interval);
        setActivePad(null);
        setIsPlayingSeq(false);
        return;
      }
      const padId = newSeq[i];
      setActivePad(padId);
      sound.playClick();
      setTimeout(() => {
        setActivePad(null);
      }, 350);
      i++;
    }, 650);
  };

  const initGame = () => {
    setSequence([]);
    setPlayerIndex(0);
    setRound(1);
    setScore(0);
    setGameOver(false);
    startNewRound([]);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handlePadPress = (padId: number) => {
    if (isPlayingSeq || gameOver) return;

    sound.playClick();
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 250);

    if (sequence[playerIndex] === padId) {
      // Correct pad
      if (playerIndex + 1 === sequence.length) {
        // Finished sequence of round!
        sound.playSuccess();
        const newScore = score + round * 150;
        setScore(newScore);
        setRound((r) => r + 1);

        setTimeout(() => {
          startNewRound(sequence);
        }, 800);
      } else {
        setPlayerIndex((p) => p + 1);
      }
    } else {
      // Wrong pad
      sound.playError();
      setGameOver(true);
    }
  };

  return (
    <GameContainer
      title="Sequência Luminosa"
      category="Memória"
      score={score}
      gameOver={gameOver}
      gameWon={round > 4}
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
      <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl flex-1 flex flex-col items-center justify-between py-4 sm:py-8 px-2 sm:px-6 my-auto gap-6 sm:gap-8 select-none animate-in fade-in duration-300">
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`w-full flex items-center justify-between text-sm sm:text-lg font-black px-5 py-3.5 rounded-2xl border-2 ${
            isLightMode
              ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
              : 'bg-slate-900/85 border-white/20 text-slate-300 backdrop-blur-xl'
          }`}
        >
          <span>Rodada: <strong style={{ color: layoutPrimary }} className="font-mono text-base sm:text-xl">{round}</strong></span>
          <span style={isPlayingSeq ? { color: layoutPrimary } : undefined} className={isPlayingSeq ? 'animate-pulse font-black' : 'text-emerald-400'}>
            {isPlayingSeq ? 'Observe a sequência...' : 'Sua vez de repetir!'}
          </span>
        </div>

        {/* 2x2 Genius Grid - Large Touch Pads */}
        <div 
          style={{ borderColor: `${layoutPrimary}44`, boxShadow: `0 0 35px ${layoutGlow}33` }}
          className="grid grid-cols-2 gap-5 sm:gap-8 w-full max-w-[520px] sm:max-w-[600px] aspect-square p-5 sm:p-8 bg-slate-900/90 backdrop-blur-xl rounded-3xl border-4 shadow-2xl my-auto"
        >
          {PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadPress(pad.id)}
                disabled={isPlayingSeq}
                className={`rounded-3xl border-4 sm:border-8 transition-all duration-150 active:scale-90 flex items-center justify-center ${
                  isActive
                    ? `${pad.activeColor} ${pad.border} shadow-2xl scale-[0.98] brightness-125`
                    : `${pad.color} border-white/20 opacity-80 hover:opacity-100 shadow-lg`
                }`}
              />
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
