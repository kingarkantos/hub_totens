import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Link, Check, Sparkles, Zap, Layers, MousePointerClick } from 'lucide-react';
import { BaseGameProps } from '../types';
import { ConnectPairCustomItem, ConnectPairsCustomConfig, ConnectPairsInteractionMode } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface ConnectPairsGameProps extends BaseGameProps {
  customContent?: ConnectPairCustomItem[] | ConnectPairsCustomConfig;
  orderMode?: 'random' | 'ordered';
  questionsCount?: number;
  interactionMode?: ConnectPairsInteractionMode;
}

const DEFAULT_PAIRS: ConnectPairCustomItem[] = [
  { left: 'Ruído industrial contínuo', right: 'Protetor Auricular Tipo Concha' },
  { left: 'Respingo de produtos químicos', right: 'Óculos de Ampla Visão' },
  { left: 'Queda de peças pesadas', right: 'Bota com Biqueira de Aço' },
  { left: 'Inalação de poeiras e fumos', right: 'Máscara com Filtro PFF2' },
];

interface WireCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

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
    orderMode = 'random',
    questionsCount,
    gameLayout,
    palette,
    layoutColorHue,
  } = props;

  const { activeLayout, layoutPrimary, layoutSecondary, layoutGlow, isLightMode } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

  // Extract raw pairs from array or config object
  const rawPairs = useMemo(() => {
    if (!customContent) return DEFAULT_PAIRS;
    if (Array.isArray(customContent) && customContent.length >= 2) return customContent;
    if (typeof customContent === 'object' && Array.isArray((customContent as any).pairs) && (customContent as any).pairs.length >= 2) {
      return (customContent as any).pairs;
    }
    return DEFAULT_PAIRS;
  }, [customContent]);

  // Extract configured interaction mode ('tap' | 'drag_line' | 'drag_card')
  const configuredMode: ConnectPairsInteractionMode = useMemo(() => {
    if (props.interactionMode) return props.interactionMode;
    if (customContent && !Array.isArray(customContent) && (customContent as any).mode) {
      return (customContent as any).mode;
    }
    return 'tap';
  }, [props.interactionMode, customContent]);

  // Allow switching mode or playing with configured mode
  const [activeMode, setActiveMode] = useState<ConnectPairsInteractionMode>(configuredMode);

  useEffect(() => {
    setActiveMode(configuredMode);
  }, [configuredMode]);

  const targetCount = useMemo(() => {
    if (questionsCount && questionsCount >= 2) {
      return Math.min(questionsCount, rawPairs.length);
    }
    return Math.min(4, rawPairs.length);
  }, [questionsCount, rawPairs.length]);

  const pickPairs = useCallback(() => {
    let list = [...rawPairs];
    if (orderMode !== 'ordered') {
      list = list.sort(() => Math.random() - 0.5);
    }
    return list.slice(0, targetCount);
  }, [rawPairs, orderMode, targetCount]);

  const [basePairs, setBasePairs] = useState<ConnectPairCustomItem[]>(() => pickPairs());

  useEffect(() => {
    setBasePairs(pickPairs());
  }, [pickPairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // list of left keys matched
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // References and DOM positions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Mode 2 (Fio Conector) State
  const [activeWire, setActiveWire] = useState<{
    fromLeft: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [wireHoverRight, setWireHoverRight] = useState<string | null>(null);
  const [persistentWires, setPersistentWires] = useState<Map<string, WireCoords>>(new Map());

  // Mode 3 (Drag Card into Target) State
  const [draggingCard, setDraggingCard] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredTargetRight, setHoveredTargetRight] = useState<string | null>(null);
  const [snappingBackCard, setSnappingBackCard] = useState<string | null>(null);
  const [absorbedCards, setAbsorbedCards] = useState<string[]>([]);
  const [errorFeedbackRight, setErrorFeedbackRight] = useState<string | null>(null);

  // Re-shuffle on pairs change
  useEffect(() => {
    const rights = basePairs.map((p) => p.right).sort(() => Math.random() - 0.5);
    setShuffledRights(rights);
    setMatchedPairs([]);
    setAbsorbedCards([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setActiveWire(null);
    setPersistentWires(new Map());
    setDraggingCard(null);
    setDragOffset({ x: 0, y: 0 });
    setScore(0);
    setTimeLeft(50);
    setGameOver(false);
    setGameWon(false);
  }, [basePairs]);

  // Recalculate persistent wires positions for Mode 2
  const updatePersistentWires = useCallback(() => {
    if (activeMode !== 'drag_line' || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWires = new Map<string, WireCoords>();

    matchedPairs.forEach((leftKey) => {
      const pair = basePairs.find((p) => p.left === leftKey);
      if (!pair) return;

      const leftEl = leftItemRefs.current.get(leftKey);
      const rightEl = rightItemRefs.current.get(pair.right);

      if (leftEl && rightEl) {
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();

        newWires.set(leftKey, {
          x1: lRect.right - containerRect.left,
          y1: lRect.top + lRect.height / 2 - containerRect.top,
          x2: rRect.left - containerRect.left,
          y2: rRect.top + rRect.height / 2 - containerRect.top,
        });
      }
    });

    setPersistentWires(newWires);
  }, [activeMode, matchedPairs, basePairs]);

  useEffect(() => {
    updatePersistentWires();
    window.addEventListener('resize', updatePersistentWires);
    return () => window.removeEventListener('resize', updatePersistentWires);
  }, [updatePersistentWires]);

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

  // Core Match Logic
  const handleMatchSuccess = (leftText: string, rightText: string) => {
    sound.playSuccess();
    const updated = [...matchedPairs, leftText];
    setMatchedPairs(updated);
    setSelectedLeft(null);
    setSelectedRight(null);
    setActiveWire(null);
    setWireHoverRight(null);
    setHoveredTargetRight(null);
    setScore((prev) => prev + 250 + timeLeft * 5);

    if (activeMode === 'drag_card') {
      setAbsorbedCards((prev) => [...prev, leftText]);
    }

    if (updated.length === basePairs.length) {
      sound.playFanfare();
      setGameOver(true);
      setGameWon(true);
    }
  };

  const handleMatchFailure = (rightText?: string) => {
    sound.playError();
    if (rightText) {
      setErrorFeedbackRight(rightText);
      setTimeout(() => setErrorFeedbackRight(null), 500);
    }
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
      setActiveWire(null);
      setWireHoverRight(null);
      setHoveredTargetRight(null);
    }, 350);
  };

  // =========================================================================
  // MODE 1: TOQUE SEQUENCIAL (TAP)
  // =========================================================================
  const handleLeftClick = (leftText: string) => {
    if (activeMode !== 'tap' || matchedPairs.includes(leftText) || gameOver) return;
    sound.playTap();
    setSelectedLeft(leftText);

    if (selectedRight) {
      const pair = basePairs.find((p) => p.left === leftText);
      if (pair && pair.right === selectedRight) {
        handleMatchSuccess(leftText, selectedRight);
      } else {
        handleMatchFailure(selectedRight);
      }
    }
  };

  const handleRightClick = (rightText: string) => {
    if (activeMode !== 'tap') return;
    const alreadyMatched = basePairs.some((p) => p.right === rightText && matchedPairs.includes(p.left));
    if (alreadyMatched || gameOver) return;

    sound.playTap();
    setSelectedRight(rightText);

    if (selectedLeft) {
      const pair = basePairs.find((p) => p.left === selectedLeft);
      if (pair && pair.right === rightText) {
        handleMatchSuccess(selectedLeft, rightText);
      } else {
        handleMatchFailure(rightText);
      }
    }
  };

  // Helper to find right card element under coordinates
  const findRightCardUnderPoint = (clientX: number, clientY: number): string | null => {
    for (const [rText, el] of rightItemRefs.current.entries()) {
      const isAlreadyMatched = basePairs.some((p) => p.right === rText && matchedPairs.includes(p.left));
      if (isAlreadyMatched) continue;

      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left - 15 &&
        clientX <= rect.right + 15 &&
        clientY >= rect.top - 15 &&
        clientY <= rect.bottom + 15
      ) {
        return rText;
      }
    }
    return null;
  };

  // =========================================================================
  // MODE 2: FIO CONECTOR (DRAG LINE)
  // =========================================================================
  const handleWirePointerDown = (e: React.PointerEvent, leftText: string) => {
    if (activeMode !== 'drag_line' || matchedPairs.includes(leftText) || gameOver) return;
    if (!containerRef.current) return;

    sound.playTap();
    const containerRect = containerRef.current.getBoundingClientRect();
    const leftEl = leftItemRefs.current.get(leftText);
    const startX = leftEl
      ? leftEl.getBoundingClientRect().right - containerRect.left
      : e.clientX - containerRect.left;
    const startY = leftEl
      ? leftEl.getBoundingClientRect().top + leftEl.getBoundingClientRect().height / 2 - containerRect.top
      : e.clientY - containerRect.top;

    setActiveWire({
      fromLeft: leftText,
      startX,
      startY,
      currentX: e.clientX - containerRect.left,
      currentY: e.clientY - containerRect.top,
    });
    setWireHoverRight(null);

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const curX = moveEv.clientX - cRect.left;
      const curY = moveEv.clientY - cRect.top;

      setActiveWire((prev) => (prev ? { ...prev, currentX: curX, currentY: curY } : null));

      const hoveredRight = findRightCardUnderPoint(moveEv.clientX, moveEv.clientY);
      setWireHoverRight(hoveredRight);
    };

    const onPointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const targetRight = findRightCardUnderPoint(upEv.clientX, upEv.clientY);
      if (targetRight) {
        const pair = basePairs.find((p) => p.left === leftText);
        if (pair && pair.right === targetRight) {
          handleMatchSuccess(leftText, targetRight);
        } else {
          handleMatchFailure(targetRight);
        }
      } else {
        setActiveWire(null);
        setWireHoverRight(null);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // =========================================================================
  // MODE 3: ARRASTAR & ENCAIXAR CARD (DRAG CARD INTO TARGET)
  // =========================================================================
  const handleCardDragStart = (e: React.PointerEvent, leftText: string) => {
    if (activeMode !== 'drag_card' || matchedPairs.includes(leftText) || gameOver) return;

    sound.playTap();
    setDraggingCard(leftText);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
    setHoveredTargetRight(null);
    setSnappingBackCard(null);

    const onPointerMove = (moveEv: PointerEvent) => {
      const dx = moveEv.clientX - e.clientX;
      const dy = moveEv.clientY - e.clientY;
      setDragOffset({ x: dx, y: dy });

      const targetRight = findRightCardUnderPoint(moveEv.clientX, moveEv.clientY);
      setHoveredTargetRight(targetRight);
    };

    const onPointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const targetRight = findRightCardUnderPoint(upEv.clientX, upEv.clientY);

      if (targetRight) {
        const pair = basePairs.find((p) => p.left === leftText);
        if (pair && pair.right === targetRight) {
          // Success: Absorbs card into target right card!
          handleMatchSuccess(leftText, targetRight);
          setDraggingCard(null);
          setDragOffset({ x: 0, y: 0 });
        } else {
          // Incorrect: Spring back animation to original slot!
          handleMatchFailure(targetRight);
          setSnappingBackCard(leftText);
          setDragOffset({ x: 0, y: 0 });
          setTimeout(() => {
            setSnappingBackCard(null);
            setDraggingCard(null);
          }, 350);
        }
      } else {
        // Dropped on empty space: Snap back to original slot
        setSnappingBackCard(leftText);
        setDragOffset({ x: 0, y: 0 });
        setTimeout(() => {
          setSnappingBackCard(null);
          setDraggingCard(null);
        }, 300);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const restartGame = () => {
    const nextPairs = pickPairs();
    setBasePairs(nextPairs);
    const rights = nextPairs.map((p) => p.right).sort(() => Math.random() - 0.5);
    setShuffledRights(rights);
    setMatchedPairs([]);
    setAbsorbedCards([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setActiveWire(null);
    setPersistentWires(new Map());
    setDraggingCard(null);
    setDragOffset({ x: 0, y: 0 });
    setScore(0);
    setTimeLeft(50);
    setGameOver(false);
    setGameWon(false);
  };

  return (
    <GameContainer
      title="Conecte os Pares"
      category="Associação &amp; Raciocínio"
      score={score}
      correctAnswers={matchedPairs.length}
      totalQuestions={basePairs.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={matchedPairs.length === basePairs.length}
      onRestart={restartGame}
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
      gameType="puzzle"
    >
      <div 
        ref={containerRef}
        className="relative flex flex-col flex-1 w-full max-w-4xl lg:max-w-5xl mx-auto justify-between py-3 sm:py-6 px-2 sm:px-6 gap-4 sm:gap-6 select-none animate-in fade-in duration-300"
      >
        {/* Dynamic Instruction Header according to Active Mode */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`rounded-2xl px-4 sm:px-6 py-3 shadow-md border-2 flex items-center justify-between flex-wrap gap-2 ${
            isLightMode 
              ? 'bg-white/95 text-slate-900 shadow-slate-200/50' 
              : 'bg-slate-900/90 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {activeMode === 'tap' && <MousePointerClick className="w-5 h-5 text-blue-500 animate-pulse" />}
            {activeMode === 'drag_line' && <Zap className="w-5 h-5 text-amber-400 animate-pulse" />}
            {activeMode === 'drag_card' && <Layers className="w-5 h-5 text-emerald-500 animate-bounce" />}

            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              {activeMode === 'tap' && 'Toque em um item da esquerda e depois no par correspondente'}
              {activeMode === 'drag_line' && 'Toque e arraste o fio até o par correspondente na direita'}
              {activeMode === 'drag_card' && 'Puxe o card da esquerda e solte dentro do par na direita'}
            </span>
          </div>

          {/* Quick Mode Indicator Badge */}
          <div className="flex items-center gap-1">
            <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shadow-2xs ${
              activeMode === 'tap'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : activeMode === 'drag_line'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {activeMode === 'tap' && '👆 Modo Toque'}
              {activeMode === 'drag_line' && '⚡ Modo Fio'}
              {activeMode === 'drag_card' && '🧲 Modo Encaixe'}
            </span>
          </div>
        </div>

        {/* SVG Overlay for Mode 2 (Fio Conector) */}
        {activeMode === 'drag_line' && (
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
            {/* Draw matched persistent wires */}
            {Array.from(persistentWires.entries()).map(([leftKey, coords]) => {
              const dx = coords.x2 - coords.x1;
              const pathD = `M ${coords.x1} ${coords.y1} C ${coords.x1 + dx * 0.45} ${coords.y1}, ${coords.x2 - dx * 0.45} ${coords.y2}, ${coords.x2} ${coords.y2}`;
              return (
                <g key={leftKey}>
                  {/* Outer Glow */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                  />
                  {/* Core Wire */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Connection Node Left */}
                  <circle cx={coords.x1} cy={coords.y1} r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                  {/* Connection Node Right */}
                  <circle cx={coords.x2} cy={coords.y2} r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                </g>
              );
            })}

            {/* Draw active dragging wire */}
            {activeWire && (
              <g>
                {(() => {
                  const dx = activeWire.currentX - activeWire.startX;
                  const pathD = `M ${activeWire.startX} ${activeWire.startY} C ${activeWire.startX + dx * 0.45} ${activeWire.startY}, ${activeWire.currentX - dx * 0.45} ${activeWire.currentY}, ${activeWire.currentX} ${activeWire.currentY}`;
                  return (
                    <>
                      {/* Wire Glow */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={layoutPrimary}
                        strokeWidth="9"
                        strokeOpacity="0.35"
                        strokeLinecap="round"
                      />
                      {/* Core Wire */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={layoutPrimary}
                        strokeWidth="4"
                        strokeDasharray="6 3"
                        strokeLinecap="round"
                      />
                      {/* Start Node */}
                      <circle cx={activeWire.startX} cy={activeWire.startY} r="6" fill={layoutPrimary} stroke="#ffffff" strokeWidth="2" />
                      {/* End Terminal Follower */}
                      <circle cx={activeWire.currentX} cy={activeWire.currentY} r="7" fill="#ffffff" stroke={layoutPrimary} strokeWidth="3" />
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
        )}

        {/* Two Columns Grid */}
        <div className="my-auto py-2 grid grid-cols-2 gap-4 sm:gap-6 relative z-10">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 text-center mb-1">
              Situação / Risco
            </div>
            {basePairs.map((pair) => {
              const isMatched = matchedPairs.includes(pair.left);
              const isSelected = selectedLeft === pair.left;
              const isDraggingThis = draggingCard === pair.left;
              const isSnapping = snappingBackCard === pair.left;
              const isAbsorbed = absorbedCards.includes(pair.left);

              // Mode 3: Absorbed cards disappear cleanly
              if (activeMode === 'drag_card' && isAbsorbed) {
                return (
                  <div
                    key={pair.left}
                    className="w-full min-h-[85px] sm:min-h-[105px] rounded-2xl sm:rounded-3xl border-2 border-dashed border-emerald-400/40 bg-emerald-500/5 flex items-center justify-center text-emerald-500 font-bold text-xs uppercase tracking-wider"
                  >
                    <Check className="w-5 h-5 mr-1" />
                    <span>Encaixado ✓</span>
                  </div>
                );
              }

              // Transform for dragging card in Mode 3
              const dragTransformStyle: React.CSSProperties = isDraggingThis
                ? {
                    transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04) rotate(${dragOffset.x * 0.03}deg)`,
                    zIndex: 50,
                    boxShadow: '0 20px 35px -5px rgba(0,0,0,0.4)',
                    cursor: 'grabbing',
                    touchAction: 'none',
                    transition: isSnapping ? 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                  }
                : isSnapping
                ? {
                    transform: 'translate3d(0, 0, 0)',
                    transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }
                : {};

              return (
                <div
                  key={pair.left}
                  ref={(el) => {
                    if (el) leftItemRefs.current.set(pair.left, el);
                    else leftItemRefs.current.delete(pair.left);
                  }}
                  onPointerDown={(e) => {
                    if (activeMode === 'drag_line') {
                      handleWirePointerDown(e, pair.left);
                    } else if (activeMode === 'drag_card') {
                      handleCardDragStart(e, pair.left);
                    }
                  }}
                  onClick={() => {
                    if (activeMode === 'tap') handleLeftClick(pair.left);
                  }}
                  style={{
                    ...dragTransformStyle,
                    ...(isSelected
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
                      : {}),
                  }}
                  className={`relative w-full min-h-[85px] sm:min-h-[105px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-base sm:text-xl text-left border-2 flex items-center justify-between gap-3 shadow-lg select-none transition-all ${
                    isMatched
                      ? isLightMode
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-400 opacity-80'
                        : 'bg-emerald-950/60 text-emerald-200 border-emerald-500 opacity-70'
                      : isDraggingThis
                      ? 'ring-4 ring-blue-400 opacity-95 bg-white text-slate-900 border-blue-500'
                      : isSelected
                      ? 'scale-[1.02] ring-4 ring-white'
                      : isLightMode
                      ? 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900/85 text-white hover:border-white/30'
                  } ${activeMode === 'tap' && !isMatched ? 'cursor-pointer active:scale-95' : ''} ${
                    activeMode !== 'tap' && !isMatched ? 'cursor-grab active:cursor-grabbing touch-none' : ''
                  }`}
                >
                  <span className="leading-snug">{pair.left}</span>

                  {/* Mode 2 (Fio): Terminal Pin Anchor */}
                  {activeMode === 'drag_line' && !isMatched && (
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-white bg-blue-500 shadow-md flex items-center justify-center flex-shrink-0 animate-pulse"
                      title="Puxe o fio daqui"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}

                  {/* Mode 3 (Arrastar Card): Grip indicator */}
                  {activeMode === 'drag_card' && !isMatched && (
                    <div className="flex flex-col gap-1 opacity-50 flex-shrink-0">
                      <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
                      <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
                      <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
                    </div>
                  )}

                  {isMatched && <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 stroke-[3] flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 text-center mb-1">
              Proteção / Solução
            </div>
            {shuffledRights.map((rightText) => {
              const matchedLeft = basePairs.find((p) => p.right === rightText && matchedPairs.includes(p.left))?.left;
              const isMatched = Boolean(matchedLeft);
              const isSelected = selectedRight === rightText;
              const isWireHovered = wireHoverRight === rightText;
              const isCardDropHovered = hoveredTargetRight === rightText;
              const isError = errorFeedbackRight === rightText;

              return (
                <div
                  key={rightText}
                  ref={(el) => {
                    if (el) rightItemRefs.current.set(rightText, el);
                    else rightItemRefs.current.delete(rightText);
                  }}
                  onClick={() => {
                    if (activeMode === 'tap') handleRightClick(rightText);
                  }}
                  style={
                    isSelected
                      ? {
                          backgroundColor: layoutPrimary,
                          color: '#020617',
                          boxShadow: `0 0 20px ${layoutGlow}`,
                          borderColor: '#ffffff',
                        }
                      : isWireHovered || isCardDropHovered
                      ? {
                          borderColor: '#10B981',
                          boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
                        }
                      : isError
                      ? {
                          borderColor: '#EF4444',
                          boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                        }
                      : !isMatched
                      ? {
                          borderColor: `${layoutPrimary}33`,
                        }
                      : {}
                  }
                  className={`relative w-full min-h-[85px] sm:min-h-[105px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-base sm:text-xl text-left border-2 flex items-center justify-between gap-3 shadow-lg select-none transition-all ${
                    isMatched
                      ? isLightMode
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-400 opacity-80'
                        : 'bg-emerald-950/60 text-emerald-200 border-emerald-500 opacity-70'
                      : isCardDropHovered || isWireHovered
                      ? 'scale-[1.03] ring-4 ring-emerald-400 bg-emerald-50 text-slate-900 border-emerald-500'
                      : isError
                      ? 'scale-[0.98] ring-4 ring-rose-400 bg-rose-50 text-rose-950 border-rose-500 animate-shake'
                      : isSelected
                      ? 'scale-[1.02] ring-4 ring-white'
                      : isLightMode
                      ? 'bg-white text-slate-900 border-slate-200'
                      : 'bg-slate-900/85 text-white'
                  } ${activeMode === 'tap' && !isMatched ? 'cursor-pointer active:scale-95' : ''}`}
                >
                  {/* Mode 2 (Fio): Receiver Terminal Pin */}
                  {activeMode === 'drag_line' && !isMatched && (
                    <div 
                      className={`w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center flex-shrink-0 transition-transform ${
                        isWireHovered ? 'scale-125 bg-emerald-500 animate-ping' : 'bg-slate-400'
                      }`}
                      title="Conecte o fio aqui"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}

                  <div className="flex-1">
                    <span className="leading-snug block">{rightText}</span>
                    {/* Mode 3: Display absorbed pair connection text when completed */}
                    {activeMode === 'drag_card' && isMatched && matchedLeft && (
                      <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center gap-1">
                        <span>↳ Associado a:</span>
                        <em>"{matchedLeft}"</em>
                      </span>
                    )}
                  </div>

                  {isMatched && <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 stroke-[3] flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & In-Game Mode Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200/40 text-xs sm:text-sm font-bold">
          <div className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>
            {matchedPairs.length} de {basePairs.length} pares conectados com sucesso
          </div>

          {/* Quick Interaction Mode Switch Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveMode('tap');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMode === 'tap'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Toque Sequencial"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Toque</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveMode('drag_line');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMode === 'drag_line'
                  ? 'bg-white text-indigo-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Fio / Linha Conectora"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveMode('drag_card');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMode === 'drag_card'
                  ? 'bg-white text-emerald-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Arrastar e Encaixar Card"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Encaixe</span>
            </button>
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
