import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { MapPin, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

import { BaseGameProps } from '../types';

interface MapEpiGameProps extends BaseGameProps {}

interface SectorMatch {
  id: string;
  sectorName: string;
  requiredEpi: string;
  epiEmoji: string;
  color: string;
}

const SECTORS: SectorMatch[] = [
  { id: 'civil', sectorName: 'Canteiro de Obras & Altura', requiredEpi: 'Capacete com Jugular', epiEmoji: '⛑️', color: 'bg-amber-500' },
  { id: 'noise', sectorName: 'Área com Prensas e Compressores', requiredEpi: 'Protetor Auricular Concha', epiEmoji: '🎧', color: 'bg-blue-500' },
  { id: 'electric', sectorName: 'Subestação Elétrica 13.8kV', requiredEpi: 'Luvas de Alta Tensão 10kV', epiEmoji: '🧤', color: 'bg-purple-500' },
  { id: 'weld', sectorName: 'Cabine de Soldagem Mig/Mag', requiredEpi: 'Máscara de Escurecimento', epiEmoji: '🥽', color: 'bg-rose-500' },
];

export const MapEpiGame: React.FC<MapEpiGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#E11D48',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
}) => {
  const [selectedEpiId, setSelectedEpiId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Randomize EPI order
  const [shuffledEpis, setShuffledEpis] = useState<SectorMatch[]>([]);

  useEffect(() => {
    setShuffledEpis([...SECTORS].sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setSelectedEpiId(null);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameWon(false);
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(matchedIds.length === SECTORS.length);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, matchedIds.length]);

  const handleSelectEpi = (id: string) => {
    if (matchedIds.includes(id) || gameOver) return;
    sound.playTap();
    setSelectedEpiId(id);
  };

  const handleSelectSector = (sectorId: string) => {
    if (!selectedEpiId || matchedIds.includes(sectorId) || gameOver) return;

    if (selectedEpiId === sectorId) {
      sound.playSuccess();
      const updated = [...matchedIds, sectorId];
      setMatchedIds(updated);
      setSelectedEpiId(null);
      setScore((prev) => prev + 250 + timeLeft * 5);

      if (updated.length === SECTORS.length) {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }
    } else {
      sound.playError();
      setSelectedEpiId(null);
    }
  };

  return (
    <GameContainer
      title="Mapa + EPI"
      category="EPIs"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setShuffledEpis([...SECTORS].sort(() => Math.random() - 0.5));
        setMatchedIds([]);
        setSelectedEpiId(null);
        setScore(0);
        setTimeLeft(60);
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
      <div className="flex flex-col flex-1 w-full max-w-2xl sm:max-w-3xl mx-auto justify-between py-2 select-none">
        {/* Instruction Header */}
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl px-4 py-2.5 shadow-sm text-center">
          <span className="text-xs font-black uppercase text-rose-800 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            Toque no EPI abaixo e depois toque no Setor correspondente no mapa
          </span>
        </div>

        {/* Sectors on the Map */}
        <div className="my-auto py-2 grid grid-cols-2 gap-2.5 sm:gap-3">
          {SECTORS.map((sector) => {
            const isMatched = matchedIds.includes(sector.id);

            return (
              <button
                key={sector.id}
                type="button"
                disabled={isMatched}
                onClick={() => handleSelectSector(sector.id)}
                className={`p-3.5 sm:p-4 rounded-3xl border-2 transition-all active:scale-95 text-left flex flex-col justify-between min-h-[110px] sm:min-h-[120px] shadow-sm ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 opacity-90'
                    : selectedEpiId
                    ? 'bg-white border-rose-300 hover:border-rose-500 ring-2 ring-rose-100 hover:bg-rose-50/50'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    SETOR DE RISCO
                  </span>
                  {isMatched ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <MapPin className="w-4 h-4 text-rose-500" />
                  )}
                </div>

                <div className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug">
                  {sector.sectorName}
                </div>

                {isMatched && (
                  <div className="text-[11px] font-black text-emerald-700 flex items-center gap-1 mt-1">
                    <span>{sector.epiEmoji}</span>
                    <span>{sector.requiredEpi}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Available EPIs row */}
        <div className="bg-slate-900/90 rounded-3xl p-3 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="text-[10px] font-black uppercase text-slate-400 text-center mb-2">
            EPIs Disponíveis (Toque para selecionar)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shuffledEpis.map((epi) => {
              const isMatched = matchedIds.includes(epi.id);
              const isSelected = selectedEpiId === epi.id;

              return (
                <button
                  key={epi.id}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleSelectEpi(epi.id)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    isMatched
                      ? 'bg-slate-800/40 opacity-30 text-slate-500 line-through'
                      : isSelected
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 scale-105 ring-2 ring-white'
                      : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{epi.epiEmoji}</span>
                  <span className="text-[10px] font-bold text-center leading-tight">
                    {epi.requiredEpi}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
