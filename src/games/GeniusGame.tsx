import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

interface GeniusGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  customContent?: any;
}

const PADS = [
  { id: 0, color: 'bg-emerald-500', activeColor: 'bg-emerald-300', border: 'border-emerald-400', label: 'Verde' },
  { id: 1, color: 'bg-rose-600', activeColor: 'bg-rose-300', border: 'border-rose-400', label: 'Vermelho' },
  { id: 2, color: 'bg-amber-400', activeColor: 'bg-amber-100', border: 'border-amber-300', label: 'Amarelo' },
  { id: 3, color: 'bg-blue-600', activeColor: 'bg-blue-300', border: 'border-blue-400', label: 'Azul' },
];

export const GeniusGame: React.FC<GeniusGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#06B6D4',
  customContent,
}) => {
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
      themePrimary={themePrimary}
    >
      <div className="w-full max-w-[290px] sm:max-w-sm flex flex-col items-center gap-3 sm:gap-4 my-auto">
        <div className="flex items-center justify-between w-full text-xs font-bold text-slate-400 px-2">
          <span>Rodada: <strong className="text-white text-sm">{round}</strong></span>
          <span className={isPlayingSeq ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}>
            {isPlayingSeq ? 'Observe a sequência...' : 'Sua vez de repetir!'}
          </span>
        </div>

        {/* 2x2 Genius Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full aspect-square p-3 sm:p-4 bg-slate-900 rounded-3xl border-4 border-slate-700 shadow-2xl">
          {PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadPress(pad.id)}
                disabled={isPlayingSeq}
                className={`rounded-2xl border-4 transition-all duration-150 active:scale-90 flex items-center justify-center ${
                  isActive
                    ? `${pad.activeColor} ${pad.border} shadow-2xl scale-98 brightness-125`
                    : `${pad.color} border-white/20 opacity-80 hover:opacity-100`
                }`}
              />
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
