import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { AlertTriangle, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { SpotErrorCustomItem } from '../types/gameContent';

interface SpotErrorGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
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
  customContent,
}) => {
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
    >
      <div className="flex flex-col h-full max-w-xl mx-auto justify-between select-none">
        {/* Header with Title and Count */}
        <div className="bg-orange-50 border border-orange-200/80 rounded-2xl px-4 py-2.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase text-orange-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
              {scenario.scenarioTitle}
            </span>
          </div>
          <span className="text-xs font-black text-orange-900 bg-orange-200/70 px-2.5 py-1 rounded-xl">
            {foundIds.length} / {hazards.length} irregularidades
          </span>
        </div>

        {/* Interactive Scenario Area with Hotspots */}
        <div className="my-auto py-2">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-300 shadow-xl bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950 flex items-center justify-center">
            {/* Visual Floor & Background Graphics */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Industrial Plant / Kiosk Visual Mock Layout */}
            <div className="absolute inset-8 rounded-2xl border-2 border-dashed border-slate-700/60 flex flex-col justify-between p-4 pointer-events-none">
              <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                <span>SETOR OPERACIONAL 01</span>
                <span>ZONA CRÍTICA DE RISCO</span>
              </div>
              <div className="text-center font-bold text-slate-600 text-xs">
                Toque nos pontos de irregularidade de segurança
              </div>
              <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                <span>NR-12 / NR-10 AUDIT</span>
                <span>INSPEÇÃO TOTEM</span>
              </div>
            </div>

            {/* Hotspots */}
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
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-95 shadow-lg ${
                    isFound
                      ? 'bg-emerald-500 text-white shadow-emerald-500/50 scale-105 border-2 border-white'
                      : 'bg-orange-500/90 hover:bg-orange-400 text-white animate-bounce shadow-orange-500/50 border-2 border-amber-300'
                  }`}
                >
                  {isFound ? <Check className="w-7 h-7 stroke-[3] text-white" /> : hazard.icon}
                  {!isFound && (
                    <span className="absolute -inset-1 rounded-2xl border-2 border-amber-400 animate-ping opacity-40 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hazard Found Info Banner or Checklist */}
        <div className="bg-white/95 border border-slate-200 rounded-2xl p-3 shadow-sm min-h-[64px] flex items-center justify-between gap-3">
          {activeHazardInfo ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">
                  {activeHazardInfo.name}
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  {activeHazardInfo.description}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400 text-center w-full">
              Observe o cenário industrial e toque nas irregularidades identificadas
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
