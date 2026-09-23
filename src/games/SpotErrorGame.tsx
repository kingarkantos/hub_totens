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

export const SpotErrorGame: React.FC<SpotErrorGameProps> = ({
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
}) => {
  const isLightMode = isLight ?? (themeMode === 'light' || theme?.textColor?.includes('text-slate-900') || theme?.bgGradient?.includes('slate-100'));
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
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
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
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
      isLight={isLightMode}
      themeMode={isLightMode ? 'light' : 'dark'}
      gameLayout={gameLayout}
    >
      <div className="flex flex-col flex-1 w-full max-w-4xl lg:max-w-5xl mx-auto justify-between py-4 sm:py-8 px-2 sm:px-6 gap-5 sm:gap-8 select-none animate-in fade-in duration-300">
        {/* Header with Title and Count */}
        <div className={`rounded-2xl px-6 py-3.5 shadow-sm border-2 flex items-center justify-between ${
          isLightMode
            ? 'bg-orange-50 border-orange-200/80 text-orange-950'
            : 'bg-slate-900/90 border-orange-500/30 text-orange-300'
        }`}>
          <div>
            <span className="text-sm sm:text-base font-black uppercase flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {scenario.scenarioTitle}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-black text-orange-950 bg-orange-200/80 border border-orange-300 px-3.5 py-1.5 rounded-xl shadow-xs">
            {foundIds.length} / {hazards.length} irregularidades
          </span>
        </div>

        {/* Interactive Scenario Area with Hotspots */}
        <div className="my-auto py-2">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[440px] sm:min-h-[520px] rounded-3xl overflow-hidden border-4 border-slate-300 dark:border-white/20 shadow-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950 flex items-center justify-center backdrop-blur-xl">
            {/* Visual Floor & Background Graphics */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_2px,transparent_2px)] [background-size:24px_24px]" />

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
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-18 h-18 sm:w-22 sm:h-22 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl transition-all active:scale-95 shadow-2xl ${
                    isFound
                      ? 'bg-emerald-500 text-white shadow-emerald-500/50 scale-105 border-4 border-white'
                      : 'bg-orange-500/95 hover:bg-orange-400 text-white animate-bounce shadow-orange-500/50 border-4 border-amber-300'
                  }`}
                >
                  {isFound ? <Check className="w-9 h-9 stroke-[3] text-white" /> : hazard.icon}
                  {!isFound && (
                    <span className="absolute -inset-2 rounded-3xl border-2 border-amber-400 animate-ping opacity-50 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hazard Found Info Banner or Checklist */}
        <div className={`rounded-3xl p-4 sm:p-6 shadow-xl min-h-[80px] sm:min-h-[90px] flex items-center justify-between gap-4 border-2 ${
          isLightMode 
            ? 'bg-white/95 border-slate-200' 
            : 'bg-slate-900/90 border-white/20 backdrop-blur-xl'
        }`}>
          {activeHazardInfo ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0 font-bold border border-orange-300">
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
