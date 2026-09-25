import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { AlertTriangle, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { BaseGameProps } from '../types';
import { SpotErrorCustomItem } from '../types/gameContent';

interface SpotErrorGameProps extends BaseGameProps {
  customContent?: SpotErrorCustomItem;
}

interface HazardHotspot {
  id: string;
  name: string;
  description: string;
  xPercent: number;
  yPercent: number;
  icon: string;
}

const DEFAULT_SCENARIO: SpotErrorCustomItem = {
  scenarioTitle: 'Inspeção na Linha de Produção e Manutenção',
  hazards: [
    { name: 'Trabalhador sem óculos de proteção', description: 'Risco de estilhaços e partículas nos olhos' },
    { name: 'Cabo elétrico exposto e desencapado', description: 'Risco grave de choque elétrico e curto-circuito' },
    { name: 'Extintor de incêndio obstruído por caixas', description: 'Impede o acesso rápido em caso de emergência' },
    { name: 'Líquido inflamável derramado no piso', description: 'Risco de escorregamento e combustão' },
  ],
};

const HOTSPOTS_LAYOUT = [
  { xPercent: 24, yPercent: 32, icon: '⚠️' },
  { xPercent: 76, yPercent: 28, icon: '⚡' },
  { xPercent: 30, yPercent: 72, icon: '🧯' },
  { xPercent: 70, yPercent: 68, icon: '💧' },
];

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const SpotErrorGame: React.FC<SpotErrorGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#EA580C',
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
  const scenario = customContent || DEFAULT_SCENARIO;

  const hazards: HazardHotspot[] = scenario.hazards.map((h, i) => ({
    id: `hazard-${i}`,
    name: h.name,
    description: h.description,
    xPercent: HOTSPOTS_LAYOUT[i % HOTSPOTS_LAYOUT.length].xPercent,
    yPercent: HOTSPOTS_LAYOUT[i % HOTSPOTS_LAYOUT.length].yPercent,
    icon: HOTSPOTS_LAYOUT[i % HOTSPOTS_LAYOUT.length].icon,
  }));

  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [activeHazardInfo, setActiveHazardInfo] = useState<HazardHotspot | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(foundIds.length === hazards.length);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, foundIds.length, hazards.length]);

  const handleTouchHotspot = (hazard: HazardHotspot) => {
    if (foundIds.includes(hazard.id) || gameOver) return;

    sound.playSuccess();
    const updated = [...foundIds, hazard.id];
    setFoundIds(updated);
    setActiveHazardInfo(hazard);
    setScore((prev) => prev + 300 + timeLeft * 5);

    if (updated.length === hazards.length) {
      setTimeout(() => {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }, 800);
    }
  };

  return (
    <GameContainer
      title="Encontre o Erro"
      category="Percepção"
      score={score}
      correctAnswers={foundIds.length}
      totalQuestions={hazards.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={foundIds.length === hazards.length}
      onRestart={() => {
        setFoundIds([]);
        setActiveHazardInfo(null);
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
        {/* Header with Title and Count */}
        <div 
          className={`rounded-2xl px-6 py-3.5 shadow-sm border-2 flex items-center justify-between ${
            isLightMode
              ? 'bg-slate-50/90 text-slate-900'
              : 'bg-slate-900/90 text-white'
          }`}
          style={{ borderColor: `${layoutPrimary}55` }}
        >
          <div>
            <span className="text-sm sm:text-base font-black uppercase flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: layoutPrimary }} />
              {scenario.scenarioTitle}
            </span>
          </div>
          <span 
            className="text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-xs"
            style={{ 
              backgroundColor: `${layoutPrimary}25`, 
              borderColor: `${layoutPrimary}66`,
              color: isLightMode ? darkPrimary : '#ffffff',
              borderWidth: 1 
            }}
          >
            {foundIds.length} / {hazards.length} irregularidades
          </span>
        </div>

        {/* Interactive Scenario Area with Hotspots */}
        <div className="my-auto py-2">
          <div 
            className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[440px] sm:min-h-[520px] rounded-3xl overflow-hidden border-4 shadow-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950 flex items-center justify-center backdrop-blur-xl"
            style={{ borderColor: `${layoutPrimary}66`, boxShadow: `0 0 35px ${layoutGlow}` }}
          >
            {/* Visual Floor & Background Graphics */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(${layoutPrimary} 2px, transparent 2px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Industrial Plant / Kiosk Visual Mock Layout */}
            <div className="absolute inset-8 rounded-3xl border-2 border-dashed border-slate-700/60 flex flex-col justify-between p-6 pointer-events-none">
              <div className="flex justify-between text-slate-400 font-mono text-xs sm:text-sm font-bold">
                <span>SETOR OPERACIONAL 01</span>
                <span>ZONA CRÍTICA DE RISCO</span>
              </div>
              <div className="text-center font-black text-slate-300 text-sm sm:text-lg">
                Toque nos pontos de irregularidade de segurança
              </div>
              <div className="flex justify-between text-slate-400 font-mono text-xs sm:text-sm font-bold">
                <span>NR-12 / NR-10 AUDIT</span>
                <span>INSPEÇÃO TOTEM</span>
              </div>
            </div>

            {/* Hotspots - Large Tactile Touch Buttons */}
            {hazards.map((hazard) => {
              const isFound = foundIds.includes(hazard.id);

              return (
                <button
                  key={hazard.id}
                  type="button"
                  onClick={() => handleTouchHotspot(hazard)}
                  style={{
                    left: `${hazard.xPercent}%`,
                    top: `${hazard.yPercent}%`,
                    ...(isFound
                      ? {
                          backgroundColor: '#10B981',
                          borderColor: '#ffffff',
                          boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)'
                        }
                      : {
                          background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                          borderColor: '#ffffff',
                          boxShadow: `0 0 30px ${layoutGlow}`
                        })
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-18 h-18 sm:w-22 sm:h-22 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl transition-all active:scale-95 shadow-2xl border-4 ${
                    isFound
                      ? 'text-white scale-105'
                      : 'text-white animate-bounce'
                  }`}
                >
                  {isFound ? <Check className="w-9 h-9 stroke-[3] text-white" /> : hazard.icon}
                  {!isFound && (
                    <span 
                      className="absolute -inset-2 rounded-3xl border-2 animate-ping opacity-60 pointer-events-none" 
                      style={{ borderColor: layoutPrimary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hazard Found Info Banner or Checklist */}
        <div 
          className={`rounded-3xl p-4 sm:p-6 shadow-xl min-h-[80px] sm:min-h-[90px] flex items-center justify-between gap-4 border-2 ${
            isLightMode 
              ? 'bg-white/95 text-slate-900' 
              : 'bg-slate-900/90 text-white backdrop-blur-xl'
          }`}
          style={{ borderColor: `${layoutPrimary}44` }}
        >
          {activeHazardInfo ? (
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold border"
                style={{ 
                  backgroundColor: `${layoutPrimary}22`, 
                  borderColor: `${layoutPrimary}66`,
                  color: layoutPrimary 
                }}
              >
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className={`text-base sm:text-xl font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {activeHazardInfo.name}
                </div>
                <div className={`text-xs sm:text-base font-bold ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                  {activeHazardInfo.description}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm sm:text-base font-black text-slate-400 text-center w-full">
              Observe o cenário industrial e toque nas irregularidades identificadas
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
