import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { MapPin, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

import { BaseGameProps } from '../types';
import { useActiveGamePalette } from '../context/GameLayoutContext';

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

export const MapEpiGame: React.FC<MapEpiGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#E11D48',
    theme,
    customBgStyle,
    campaignName,
    clientName,
    splashImageUrl,
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
      correctAnswers={matchedIds.length}
      totalQuestions={SECTORS.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={matchedIds.length === SECTORS.length}
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
          className={`rounded-2xl px-6 py-3.5 shadow-sm border-2 text-center ${
            isLightMode
              ? 'bg-slate-50/90 text-slate-900'
              : 'bg-slate-900/90 text-white'
          }`}
          style={{ borderColor: `${layoutPrimary}55` }}
        >
          <span className="text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: layoutPrimary }} />
            Toque no EPI abaixo e depois toque no Setor correspondente no mapa
          </span>
        </div>

        {/* Sectors on the Map */}
        <div className="my-auto py-2 grid grid-cols-2 gap-4 sm:gap-6">
          {SECTORS.map((sector) => {
            const isMatched = matchedIds.includes(sector.id);

            return (
              <button
                key={sector.id}
                type="button"
                disabled={isMatched}
                onClick={() => handleSelectSector(sector.id)}
                style={
                  !isMatched && selectedEpiId
                    ? { borderColor: layoutPrimary, boxShadow: `0 0 25px ${layoutGlow}` }
                    : !isMatched
                    ? { borderColor: `${layoutPrimary}44` }
                    : undefined
                }
                className={`p-5 sm:p-7 rounded-3xl border-2 sm:border-4 transition-all active:scale-95 text-left flex flex-col justify-between min-h-[140px] sm:min-h-[160px] shadow-xl ${
                  isMatched
                    ? isLightMode
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 opacity-90'
                      : 'bg-emerald-950/70 border-emerald-500 text-emerald-200 opacity-90'
                    : selectedEpiId
                    ? isLightMode ? 'bg-white ring-4 ring-offset-2' : 'bg-slate-900 ring-4 ring-offset-2 ring-offset-black'
                    : isLightMode
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-900/85 text-white shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
                    SETOR DE RISCO
                  </span>
                  {isMatched ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </span>
                  ) : (
                    <MapPin className="w-6 h-6" style={{ color: layoutPrimary }} />
                  )}
                </div>

                <div className="font-black text-base sm:text-xl leading-snug">
                  {sector.sectorName}
                </div>

                {isMatched && (
                  <div className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2">
                    <span className="text-xl sm:text-2xl">{sector.epiEmoji}</span>
                    <span>{sector.requiredEpi}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Available EPIs row */}
        <div 
          className="bg-slate-900/90 rounded-3xl p-4 sm:p-6 border-2 shadow-2xl backdrop-blur-xl"
          style={{ borderColor: `${layoutPrimary}44` }}
        >
          <div className="text-xs sm:text-sm font-black uppercase text-slate-400 text-center mb-3">
            EPIs Disponíveis (Toque para selecionar)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {shuffledEpis.map((epi) => {
              const isMatched = matchedIds.includes(epi.id);
              const isSelected = selectedEpiId === epi.id;

              return (
                <button
                  key={epi.id}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleSelectEpi(epi.id)}
                  style={
                    isSelected
                      ? {
                          background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                          borderColor: '#ffffff',
                          boxShadow: `0 0 25px ${layoutGlow}`
                        }
                      : isMatched
                      ? undefined
                      : { borderColor: `${layoutPrimary}33` }
                  }
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-2 ${
                    isMatched
                      ? 'bg-slate-800/40 opacity-30 text-slate-500 line-through border-transparent'
                      : isSelected
                      ? 'text-white scale-105 ring-4 ring-white'
                      : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl">{epi.epiEmoji}</span>
                  <span className="text-xs sm:text-sm font-black text-center leading-tight">
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
