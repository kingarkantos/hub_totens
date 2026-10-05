import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { AlertTriangle, Check, ShieldAlert, Sparkles, CheckCircle2, XCircle, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { BaseGameProps } from '../types';
import { SpotErrorCustomItem, SpotHazardItem } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface SpotErrorGameProps extends BaseGameProps {
  customContent?: SpotErrorCustomItem;
}

interface InspectionCard {
  id: string;
  name: string;
  description: string;
  isError: boolean;
  icon: string;
}

const DEFAULT_SCENARIO: SpotErrorCustomItem = {
  scenarioTitle: 'Inspeção na Linha Operacional',
  hazards: [
    { name: 'Trabalhador sem óculos de proteção', description: 'Risco de estilhaços e partículas nos olhos', isError: true, icon: '🥽' },
    { name: 'Cabo elétrico exposto e desencapado', description: 'Risco grave de choque elétrico e curto-circuito', isError: true, icon: '⚡' },
    { name: 'Extintor de incêndio obstruído por caixas', description: 'Impede o acesso rápido em caso de emergência', isError: true, icon: '🧯' },
    { name: 'Líquido inflamável derramado no piso', description: 'Risco de escorregamento e combustão imediata', isError: true, icon: '💧' },
  ],
  safePractices: [
    { name: 'Uso de capacete com jugular ajustada', description: 'Item 100% conforme com as normas de proteção', isError: false, icon: '⛑️' },
    { name: 'Piso limpo, seco e bem sinalizado', description: 'Área de trânsito segura e desobstruída', isError: false, icon: '🧹' },
    { name: 'Saída de emergência livre de obstáculos', description: 'Rota de fuga acessível e sinalizada', isError: false, icon: '🚪' },
    { name: 'Botão de parada de emergência acessível', description: 'Dispositivo operacional para desligamento rápido', isError: false, icon: '🛑' },
  ],
};

const FALLBACK_SAFE_ITEMS: SpotHazardItem[] = [
  { name: 'Uso de capacete com jugular ajustada', description: 'Item em conformidade com as normas de proteção', isError: false, icon: '⛑️' },
  { name: 'Piso limpo, seco e bem sinalizado', description: 'Área de circulação segura e sem risco de quedas', isError: false, icon: '🧹' },
  { name: 'Saída de emergência livre de obstáculos', description: 'Rota de fuga acessível e sinalizada', isError: false, icon: '🚪' },
  { name: 'Botão de parada de emergência acessível', description: 'Dispositivo operacional para desligamento rápido', isError: false, icon: '🛑' },
  { name: 'Luvas de segurança adequadas em uso', description: 'Proteção contra corte e abrasão conforme procedimento', isError: false, icon: '🧤' },
  { name: 'Extintor com inspeção válida e lacrado', description: 'Equipamento pronto e desobstruído para emergência', isError: false, icon: '🧯' },
];

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

  const scenario = useMemo<SpotErrorCustomItem>(() => {
    if (customContent && typeof customContent === 'object' && Array.isArray(customContent.hazards) && customContent.hazards.length > 0) {
      return customContent;
    }
    return DEFAULT_SCENARIO;
  }, [customContent]);

  // Deck of inspection cards (Hazards + Safe Distractors)
  const [cards, setCards] = useState<InspectionCard[]>([]);
  const [foundErrorIds, setFoundErrorIds] = useState<string[]>([]);
  const [conformingMistakeIds, setConformingMistakeIds] = useState<string[]>([]);
  const [shakingCardId, setShakingCardId] = useState<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<{
    type: 'success' | 'warning';
    title: string;
    description: string;
  } | null>(null);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Total errors in current scenario
  const totalErrors = useMemo(() => {
    return cards.filter((c) => c.isError).length || 1;
  }, [cards]);

  const initGame = useCallback(() => {
    const rawHazards: SpotHazardItem[] = (scenario.hazards || []).map((h, i) => ({
      ...h,
      isError: true,
      icon: h.icon || ['⚠️', '⚡', '🥽', '💧', '🔌', '💥'][i % 6],
    }));

    const rawSafe: SpotHazardItem[] = (
      Array.isArray(scenario.safePractices) && scenario.safePractices.length > 0
        ? scenario.safePractices
        : FALLBACK_SAFE_ITEMS
    ).map((s, i) => ({
      ...s,
      isError: false,
      icon: s.icon || ['⛑️', '🧯', '🧹', '🛑', '🧤', '🚪'][i % 6],
    }));

    // Select safe items to balance with hazards (roughly equal amount)
    const neededSafeCount = Math.max(2, Math.min(rawHazards.length, rawSafe.length));
    const selectedSafe = [...rawSafe].sort(() => Math.random() - 0.5).slice(0, neededSafeCount);

    const combined: InspectionCard[] = [
      ...rawHazards.map((h, idx) => ({
        id: h.id || `hazard-${idx}`,
        name: h.name,
        description: h.description,
        isError: true,
        icon: h.icon || '⚠️',
      })),
      ...selectedSafe.map((s, idx) => ({
        id: s.id || `safe-${idx}`,
        name: s.name,
        description: s.description,
        isError: false,
        icon: s.icon || '✅',
      })),
    ].sort(() => Math.random() - 0.5);

    setCards(combined);
    setFoundErrorIds([]);
    setConformingMistakeIds([]);
    setShakingCardId(null);
    setActiveFeedback(null);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameWon(false);
  }, [scenario]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(foundErrorIds.length === totalErrors);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, foundErrorIds.length, totalErrors]);

  const handleCardTap = (card: InspectionCard) => {
    if (gameOver || foundErrorIds.includes(card.id)) return;

    if (card.isError) {
      // SUCCESS: Found an error!
      sound.playSuccess();
      const updated = [...foundErrorIds, card.id];
      setFoundErrorIds(updated);
      setScore((prev) => prev + 300 + Math.max(0, timeLeft * 5));
      setActiveFeedback({
        type: 'success',
        title: '🚨 IRREGULARIDADE DETECTADA!',
        description: `${card.name}: ${card.description}`,
      });

      if (updated.length === totalErrors) {
        setTimeout(() => {
          sound.playFanfare();
          setGameOver(true);
          setGameWon(true);
        }, 700);
      }
    } else {
      // MISTAKE: Tapped a safe practice!
      sound.playError();
      setShakingCardId(card.id);
      setTimeout(() => setShakingCardId(null), 600);

      if (!conformingMistakeIds.includes(card.id)) {
        setConformingMistakeIds((prev) => [...prev, card.id]);
      }

      // Penalties: subtract points & 3 seconds
      setScore((prev) => Math.max(0, prev - 100));
      setTimeLeft((prev) => Math.max(1, prev - 3));

      setActiveFeedback({
        type: 'warning',
        title: '✅ PRÁTICA SEGURA / CONFORME',
        description: `"${card.name}" está correto e seguro. Toque apenas nos erros e perigos! (-100 pts / -3s)`,
      });
    }
  };

  return (
    <GameContainer
      title="Encontre o Erro"
      category="Auditoria & Percepção"
      score={score}
      correctAnswers={foundErrorIds.length}
      totalQuestions={totalErrors}
      correctAnswersLabel="Erros Encontrados"
      totalMetricLabel="erros"
      gameType="puzzle"
      customFeedbackTitle={foundErrorIds.length === totalErrors ? 'Olhos de Lince!' : 'Boa Percepção!'}
      customFeedbackSubtitle={
        foundErrorIds.length === totalErrors
          ? `Incrível! Você localizou todos os ${totalErrors} erros e conquistou ${score} pontos!`
          : `Você localizou ${foundErrorIds.length} de ${totalErrors} erros e marcou ${score} pontos. Jogue de novo para encontrar todos!`
      }
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={foundErrorIds.length === totalErrors}
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
      <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto justify-between py-3 sm:py-6 px-2 sm:px-6 gap-4 sm:gap-6 select-none animate-in fade-in duration-300">
        
        {/* Scenario Header with Audit Title & Progress */}
        <div 
          className={`rounded-2xl p-4 sm:p-5 shadow-lg border-2 backdrop-blur-xl ${
            isLightMode
              ? 'bg-slate-50/95 text-slate-900'
              : 'bg-slate-900/90 text-white'
          }`}
          style={{ borderColor: `${layoutPrimary}55` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})` }}
                >
                  PAINEL DE AUDITORIA
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Inspeção Visual
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black flex items-center gap-2">
                <Search className="w-5 h-5 shrink-0" style={{ color: layoutPrimary }} />
                <span>{scenario.scenarioTitle || 'Inspeção Operacional'}</span>
              </h2>
            </div>

            {/* Error Progress Counter Badge */}
            <div className="flex items-center gap-3">
              <div 
                className="px-4 py-2 rounded-2xl border-2 flex items-center gap-2.5 shadow-sm"
                style={{
                  backgroundColor: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                  borderColor: `${layoutPrimary}77`,
                }}
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Irregularidades</div>
                  <div className="text-base sm:text-lg font-black text-amber-500">
                    {foundErrorIds.length} <span className="text-xs text-slate-400 font-bold">/ {totalErrors}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{ 
                width: `${(foundErrorIds.length / totalErrors) * 100}%`,
                background: `linear-gradient(90deg, ${layoutPrimary}, #10B981)`,
              }}
            />
          </div>

          {/* Quick Instruction Line */}
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mt-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Toque <strong>apenas nos itens com irregularidade ou risco</strong>. Não toque nas situações que estiverem conformes!</span>
          </p>
        </div>

        {/* Live Feedback Toast Bar */}
        {activeFeedback && (
          <div 
            className={`p-3 rounded-2xl border-2 flex items-start gap-3 shadow-xl transition-all animate-in slide-in-from-top-2 duration-200 ${
              activeFeedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                : 'bg-amber-950/90 border-amber-500 text-amber-100'
            }`}
          >
            {activeFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-tight">
              <span className="font-black uppercase tracking-wider block mb-0.5">
                {activeFeedback.title}
              </span>
              <span className="text-slate-200 font-medium">
                {activeFeedback.description}
              </span>
            </div>
          </div>
        )}

        {/* Grid of Inspection Cards */}
        <div className="my-auto py-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-h-[58vh] overflow-y-auto pr-1">
          {cards.map((card, idx) => {
            const isFoundError = foundErrorIds.includes(card.id);
            const isConformingMistake = conformingMistakeIds.includes(card.id);
            const isShaking = shakingCardId === card.id;

            return (
              <button
                key={card.id}
                type="button"
                disabled={isFoundError}
                onClick={() => handleCardTap(card)}
                style={
                  isFoundError
                    ? {
                        borderColor: '#10B981',
                        boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                      }
                    : isConformingMistake
                    ? {
                        borderColor: '#3B82F6',
                      }
                    : {
                        borderColor: `${layoutPrimary}44`,
                      }
                }
                className={`p-4 sm:p-5 rounded-3xl border-2 sm:border-3 text-left transition-all relative flex flex-col justify-between min-h-[135px] sm:min-h-[155px] ${
                  isShaking ? 'animate-wiggle ring-4 ring-rose-500' : ''
                } ${
                  isFoundError
                    ? isLightMode
                      ? 'bg-emerald-50 text-emerald-950 opacity-95'
                      : 'bg-emerald-950/80 text-emerald-100 opacity-95'
                    : isConformingMistake
                    ? isLightMode
                      ? 'bg-blue-50 text-blue-950 border-blue-400'
                      : 'bg-blue-950/70 text-blue-100 border-blue-500'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-50 text-slate-900 shadow-md active:scale-98'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-white shadow-xl active:scale-98'
                }`}
              >
                {/* Card Top: Number badge and Icon */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>ITEM DE AUDITORIA</span>
                  </span>

                  <span className="text-2xl sm:text-3xl drop-shadow-sm select-none">
                    {card.icon}
                  </span>
                </div>

                {/* Card Title */}
                <div className="font-black text-sm sm:text-base leading-snug line-clamp-2">
                  {card.name}
                </div>

                {/* Card Bottom Status */}
                <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                  {isFoundError ? (
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Irregularidade Identificada!</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        +300 pts
                      </span>
                    </div>
                  ) : isConformingMistake ? (
                    <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Procedimento Correto (Conforme)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        Toque para inspecionar
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Pendente
                      </span>
                    </div>
                  )}

                  {/* Hazard Description when found */}
                  {isFoundError && card.description && (
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 italic">
                      ⚠️ Consequência: {card.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
};
