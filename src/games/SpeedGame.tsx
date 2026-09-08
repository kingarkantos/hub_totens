import React, { useState, useEffect, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';

import { BaseGameProps } from '../types';

interface SpeedGameProps extends BaseGameProps {
  customContent?: any;
}

export const SpeedGame: React.FC<SpeedGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#DC2626',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  customContent,
}) => {
  const [stage, setStage] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [trafficLights, setTrafficLights] = useState<number>(1); // 1 = red, 2 = yellow, 3 = green
  const [speed, setSpeed] = useState(0);
  const [taps, setTaps] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef<number>(0);

  // Traffic light sequence
  useEffect(() => {
    if (stage !== 'countdown') return;

    sound.playTick();
    const t1 = setTimeout(() => {
      setTrafficLights(2);
      sound.playTick();
    }, 1000);

    const t2 = setTimeout(() => {
      setTrafficLights(3);
      sound.playSuccess();
      setStage('racing');
      startTimeRef.current = performance.now();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage]);

  // Race timer
  useEffect(() => {
    if (stage !== 'racing') return;
    const interval = setInterval(() => {
      const now = performance.now();
      const seconds = (now - startTimeRef.current) / 1000;
      setElapsedTime(parseFloat(seconds.toFixed(2)));
    }, 50);
    return () => clearInterval(interval);
  }, [stage]);

  const handlePedalTap = () => {
    if (stage !== 'racing') return;
    sound.playEngineRev();
    const newSpeed = Math.min(100, speed + 4);
    const newTaps = taps + 1;
    setSpeed(newSpeed);
    setTaps(newTaps);

    if (newSpeed >= 100) {
      // Finished race!
      const totalTime = (performance.now() - startTimeRef.current) / 1000;
      const finalScore = Math.max(100, Math.round(10000 / totalTime));
      setScore(finalScore);
      setStage('finished');
    }
  };

  const restart = () => {
    setStage('countdown');
    setTrafficLights(1);
    setSpeed(0);
    setTaps(0);
    setElapsedTime(0);
    setScore(0);
  };

  return (
    <GameContainer
      title="Arrancada Turbo"
      category="Ação"
      score={score}
      gameOver={stage === 'finished'}
      gameWon={true}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      customScoreLabel="Pts"
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="w-full max-w-md sm:max-w-lg flex-1 flex flex-col items-center justify-between py-6 my-auto gap-6">
        {/* Traffic Light */}
        <div className="flex items-center gap-4 p-3 sm:p-4 bg-slate-900/90 border-2 border-white/20 rounded-3xl shadow-xl backdrop-blur-md">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all ${
              trafficLights === 1 ? 'bg-rose-600 border-rose-400 shadow-lg shadow-rose-600/60 scale-110' : 'bg-rose-950 border-rose-900 opacity-40'
            }`}
          />
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all ${
              trafficLights === 2 ? 'bg-amber-500 border-amber-300 shadow-lg shadow-amber-500/60 scale-110' : 'bg-amber-950 border-amber-900 opacity-40'
            }`}
          />
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all ${
              trafficLights === 3 ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/60 scale-110' : 'bg-emerald-950 border-emerald-900 opacity-40'
            }`}
          />
        </div>

        {/* Speedometer Gauge Display */}
        <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-slate-900/90 border-4 border-white/20 shadow-2xl flex flex-col items-center justify-center backdrop-blur-md">
          {/* Progress circle */}
          <div
            className="absolute inset-2 rounded-full border-4 border-dashed border-red-500/40 animate-spin-slow pointer-events-none"
          />
          <span className="text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-widest">Velocímetro</span>
          <div className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tighter my-1">
            {speed}
          </div>
          <span className="text-sm sm:text-base font-bold text-red-400">KM/H</span>

          <div className="mt-2 px-3.5 py-1 rounded-full bg-slate-800 text-xs sm:text-sm font-mono text-amber-400 font-bold border border-white/10">
            ⏱️ {elapsedTime}s
          </div>
        </div>

        {/* Touch Pedal Button */}
        <button
          onClick={handlePedalTap}
          disabled={stage !== 'racing'}
          style={{ backgroundColor: stage === 'racing' ? themePrimary : '#334155' }}
          className="w-full h-24 sm:h-32 rounded-3xl border-2 sm:border-4 border-white/25 flex flex-col items-center justify-center font-black text-xl sm:text-3xl uppercase tracking-wider text-white shadow-2xl active:scale-95 transition-all disabled:opacity-40 select-none animate-totem-pulse"
        >
          <span>🏎️ ACELERAR!</span>
          <span className="text-xs sm:text-sm font-normal tracking-normal text-slate-200 mt-0.5">Toque freneticamente no totem!</span>
        </button>
      </div>
    </GameContainer>
  );
};
