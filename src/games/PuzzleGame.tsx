import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Eye, RotateCcw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { BaseGameProps } from '../types';
import { PuzzleCustomConfig } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface PuzzleGameProps extends BaseGameProps {
  customContent?: any;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

export const PuzzleGame: React.FC<PuzzleGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#0D9488',
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

  // Parse custom config
  const puzzleConfig: PuzzleCustomConfig = useMemo(() => {
    let parsed: any = null;
    if (customContent && typeof customContent === 'object') {
      parsed = customContent;
    } else if (typeof customContent === 'string') {
      try {
        parsed = JSON.parse(customContent);
      } catch {}
    }

    return {
      puzzleTitle: parsed?.puzzleTitle || parsed?.title || 'Quebra-Cabeça da Marca',
      imageUrl: parsed?.imageUrl || parsed?.image_url || DEFAULT_IMAGE,
      showNumbers: parsed?.showNumbers !== false,
    };
  }, [customContent]);

  const imageUrl = puzzleConfig.imageUrl || DEFAULT_IMAGE;
  const showNumbers = puzzleConfig.showNumbers !== false;

  // Board has 9 slots (0 to 8). Each slot holds a pieceId (0 to 8) or null.
  const [board, setBoard] = useState<(number | null)[]>([null, null, null, null, null, null, null, null, null]);
  // Bank holds pieceIds (0 to 8) not yet placed on the board.
  const [bank, setBank] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  // Selected piece for tap-to-place on touch screens
  const [selectedPiece, setSelectedPiece] = useState<{ source: 'bank' | 'board'; pieceId: number; slotIndex?: number } | null>(null);

  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [dragOverBank, setDragOverBank] = useState(false);

  // Initialize and shuffle
  const initGame = () => {
    let pieces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Ensure it's well shuffled
    do {
      pieces = pieces.sort(() => Math.random() - 0.5);
    } while (pieces.every((p, idx) => p === idx));

    setBoard([null, null, null, null, null, null, null, null, null]);
    setBank(pieces);
    setSelectedPiece(null);
    setMoves(0);
    setTimeLeft(120);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, [imageUrl]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setWon(false);
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  // Check board validation whenever board changes and is completely filled
  const isBoardFull = useMemo(() => board.every((p) => p !== null), [board]);
  const isSolved = useMemo(() => isBoardFull && board.every((p, idx) => p === idx), [isBoardFull, board]);
  const wrongCount = useMemo(() => {
    if (!isBoardFull) return 0;
    return board.filter((p, idx) => p !== idx).length;
  }, [isBoardFull, board]);

  useEffect(() => {
    if (isBoardFull && !gameOver) {
      if (isSolved) {
        sound.playSuccess();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        const finalScore = Math.max(200, 1500 - moves * 15 + timeLeft * 10);
        setScore(finalScore);
        setWon(true);
        setGameOver(true);
      } else {
        sound.playError();
      }
    }
  }, [isBoardFull, isSolved, moves, timeLeft, gameOver]);

  // Place piece into a slot
  const placePiece = (source: 'bank' | 'board', pieceId: number, targetSlot: number, fromSlot?: number) => {
    if (gameOver) return;
    sound.playClick();
    setMoves((m) => m + 1);

    setBoard((prevBoard) => {
      const nextBoard = [...prevBoard];
      const existingPiece = nextBoard[targetSlot];

      if (source === 'bank') {
        // Remove pieceId from bank
        setBank((prevBank) => {
          const nextBank = prevBank.filter((id) => id !== pieceId);
          // If the slot already had a piece, return it to bank
          if (existingPiece !== null) {
            nextBank.push(existingPiece);
          }
          return nextBank;
        });
        nextBoard[targetSlot] = pieceId;
      } else if (source === 'board' && fromSlot !== undefined) {
        // Swap pieces on board
        nextBoard[targetSlot] = pieceId;
        nextBoard[fromSlot] = existingPiece;
      }

      return nextBoard;
    });

    setSelectedPiece(null);
  };

  // Return a piece from the board back to the bank
  const returnToBank = (slotIndex: number) => {
    if (gameOver) return;
    const pieceId = board[slotIndex];
    if (pieceId === null) return;

    sound.playClick();
    setMoves((m) => m + 1);

    setBoard((prev) => {
      const copy = [...prev];
      copy[slotIndex] = null;
      return copy;
    });

    setBank((prev) => [...prev, pieceId]);
    setSelectedPiece(null);
  };

  // Tap handler for slots
  const handleSlotClick = (slotIndex: number) => {
    if (gameOver) return;

    if (selectedPiece) {
      // Place selected piece into this slot
      placePiece(selectedPiece.source, selectedPiece.pieceId, slotIndex, selectedPiece.slotIndex);
    } else {
      // If slot has a piece and nothing selected, select it or return to bank if clicked again
      const currentPiece = board[slotIndex];
      if (currentPiece !== null) {
        // Quick action: if it's already on the board, tapping it selects it to move or returns to bank
        returnToBank(slotIndex);
      }
    }
  };

  // Tap handler for bank pieces
  const handleBankPieceClick = (pieceId: number) => {
    if (gameOver) return;
    sound.playClick();

    if (selectedPiece?.source === 'board' && selectedPiece.slotIndex !== undefined) {
      // If a board piece was selected and player clicks bank, return that piece to bank!
      returnToBank(selectedPiece.slotIndex);
    } else if (selectedPiece?.pieceId === pieceId) {
      // Deselect
      setSelectedPiece(null);
    } else {
      // Select piece from bank
      setSelectedPiece({ source: 'bank', pieceId });
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, source: 'bank' | 'board', pieceId: number, slotIndex?: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source, pieceId, slotIndex }));
    setSelectedPiece({ source, pieceId, slotIndex });
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && typeof data.pieceId === 'number') {
        placePiece(data.source, data.pieceId, targetSlot, data.slotIndex);
      }
    } catch {}
  };

  const handleDropOnBank = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBank(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.source === 'board' && typeof data.slotIndex === 'number') {
        returnToBank(data.slotIndex);
      }
    } catch {}
  };

  // Helper to get 3x3 background slice for a piece
  const getPieceBackgroundStyle = (pieceId: number) => {
    const col = pieceId % 3;
    const row = Math.floor(pieceId / 3);
    return {
      backgroundImage: `url("${imageUrl}")`,
      backgroundSize: '300% 300%',
      backgroundPosition: `${col * 50}% ${row * 50}%`,
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <GameContainer
      title={puzzleConfig.puzzleTitle}
      category="Lógica"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={won}
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
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-between py-2 sm:py-4 px-2 sm:px-6 my-auto select-none gap-3 sm:gap-4 animate-in fade-in duration-300">
        
        {/* Top Control & Status Bar */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`w-full flex items-center justify-between text-xs sm:text-base font-black px-4 py-2.5 rounded-2xl border-2 shadow-md ${
            isLightMode
              ? 'bg-white/95 text-slate-800'
              : 'bg-slate-900/90 text-slate-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-4">
            <span>Movimentos: <strong className="font-mono text-white bg-black/40 px-2 py-0.5 rounded-lg">{moves}</strong></span>
            <span>Colocadas: <strong style={{ color: layoutPrimary }} className="font-mono">{board.filter(Boolean).length}/9</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Imagem</span>
            </button>
            <button
              type="button"
              onClick={initGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recomeçar</span>
            </button>
          </div>
        </div>

        {/* Validation / Helper Banner */}
        {isBoardFull && !isSolved ? (
          <div className="w-full max-w-xl py-2 px-4 rounded-xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{wrongCount} peça(s) no lugar errado! Toque nas peças vermelhas para tirar para baixo e consertar.</span>
            </div>
            <button
              type="button"
              onClick={initGame}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black rounded-lg shrink-0 shadow-xs"
            >
              Recomeçar
            </button>
          </div>
        ) : selectedPiece ? (
          <div className="w-full max-w-xl py-1.5 px-4 rounded-xl bg-teal-950/70 border border-teal-500/50 text-teal-200 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
            <span>Peça #{selectedPiece.pieceId + 1} selecionada! Toque no tabuleiro acima para encaixar.</span>
            <button
              type="button"
              onClick={() => setSelectedPiece(null)}
              className="text-xs text-teal-400 hover:text-white underline font-normal"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="text-[11px] sm:text-xs font-medium text-slate-400 text-center">
            Arraste ou toque nas peças abaixo para montar no tabuleiro acima. Toque numa peça colocada para devolvê-la ao banco.
          </div>
        )}

        {/* 3x3 Target Board (Tabuleiro Superior) */}
        <div 
          style={{ 
            borderColor: `${layoutPrimary}55`, 
            boxShadow: `0 0 30px ${layoutGlow}44`,
          }}
          className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[430px] aspect-square p-2.5 sm:p-3.5 bg-slate-900/95 backdrop-blur-2xl rounded-3xl border-4 shadow-2xl flex flex-col justify-center"
        >
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full h-full">
            {board.map((placedPieceId, slotIdx) => {
              const col = slotIdx % 3;
              const row = Math.floor(slotIdx / 3);
              const isOver = dragOverSlot === slotIdx;
              const isPlaced = placedPieceId !== null;
              const isCorrectSlot = isPlaced && placedPieceId === slotIdx;
              const isWrongSlot = isPlaced && isBoardFull && !isCorrectSlot;

              return (
                <div
                  key={slotIdx}
                  onClick={() => handleSlotClick(slotIdx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlot(slotIdx);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleDropOnSlot(e, slotIdx)}
                  className={`relative rounded-xl sm:rounded-2xl border-2 sm:border-3 overflow-hidden cursor-pointer transition-all flex items-center justify-center select-none ${
                    isOver
                      ? 'border-teal-400 bg-teal-500/20 scale-102 ring-4 ring-teal-400/40'
                      : isWrongSlot
                      ? 'border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                      : isCorrectSlot && isBoardFull
                      ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                      : isPlaced
                      ? 'border-white/30 hover:border-teal-400'
                      : 'border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/60'
                  }`}
                  title={isPlaced ? `Peça #${placedPieceId + 1} (Toque para tirar para baixo)` : `Espaço #${slotIdx + 1}`}
                >
                  {isPlaced ? (
                    <div
                      draggable={!gameOver}
                      onDragStart={(e) => handleDragStart(e, 'board', placedPieceId, slotIdx)}
                      style={getPieceBackgroundStyle(placedPieceId)}
                      className="w-full h-full relative flex items-center justify-center active:scale-95 transition-transform"
                    >
                      {/* Optional Number badge */}
                      {showNumbers && (
                        <span className="absolute top-1 left-1 text-[9px] sm:text-[10px] font-mono font-black text-white/90 bg-black/60 px-1 rounded shadow-xs pointer-events-none">
                          {placedPieceId + 1}
                        </span>
                      )}

                      {/* Correct / Incorrect Indicator */}
                      {isBoardFull && (
                        <div className="absolute top-1 right-1 pointer-events-none">
                          {isCorrectSlot ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 bg-black/70 rounded-full" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400 bg-black/70 rounded-full" />
                          )}
                        </div>
                      )}

                      {/* Tap to return helper icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          returnToBank(slotIdx);
                        }}
                        className="absolute bottom-1 right-1 p-1 rounded-md bg-black/70 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors shadow-xs"
                        title="Tirar peça de volta para baixo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    // Empty Slot with faint watermark & slot number guide
                    <div 
                      style={{
                        backgroundImage: `url("${imageUrl}")`,
                        backgroundSize: '300% 300%',
                        backgroundPosition: `${col * 50}% ${row * 50}%`,
                        opacity: 0.18,
                      }}
                      className="w-full h-full flex flex-col items-center justify-center relative pointer-events-none"
                    >
                      <span className="text-xs sm:text-sm font-mono font-bold text-slate-500 opacity-60">
                        {slotIdx + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Piece Bank (9 pedaços espalhados na parte de baixo) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverBank(true);
          }}
          onDragLeave={() => setDragOverBank(false)}
          onDrop={handleDropOnBank}
          style={{ borderColor: `${layoutPrimary}33` }}
          className={`w-full max-w-4xl p-3 sm:p-4 rounded-3xl border-2 transition-all ${
            dragOverBank
              ? 'bg-rose-950/40 border-rose-400 ring-4 ring-rose-400/30'
              : 'bg-slate-900/80 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] sm:text-xs font-black uppercase text-slate-300 tracking-wide flex items-center gap-1.5">
              <span>Peças Disponíveis ({bank.length})</span>
              {bank.length > 0 && <span className="text-[10px] text-teal-400 font-bold">• Toque ou arraste para subir</span>}
            </span>
            {bank.length === 0 && (
              <span className="text-[11px] font-bold text-emerald-400">
                ✓ Todas as 9 peças foram colocadas!
              </span>
            )}
          </div>

          {bank.length > 0 ? (
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 sm:gap-2.5">
              {bank.map((pieceId) => {
                const isSelected = selectedPiece?.source === 'bank' && selectedPiece.pieceId === pieceId;

                return (
                  <button
                    key={pieceId}
                    type="button"
                    draggable={!gameOver}
                    onDragStart={(e) => handleDragStart(e, 'bank', pieceId)}
                    onClick={() => handleBankPieceClick(pieceId)}
                    style={getPieceBackgroundStyle(pieceId)}
                    className={`aspect-square rounded-xl sm:rounded-2xl border-2 relative overflow-hidden transition-all duration-150 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 shadow-md flex items-center justify-center ${
                      isSelected
                        ? 'ring-4 ring-teal-400 scale-105 border-white shadow-[0_0_20px_rgba(20,184,166,0.8)]'
                        : 'border-white/30 hover:border-teal-400'
                    }`}
                    title={`Peça #${pieceId + 1} (Toque para selecionar)`}
                  >
                    {showNumbers && (
                      <span className="absolute top-1 left-1 text-[9px] font-mono font-black text-white/90 bg-black/60 px-1 rounded shadow-xs pointer-events-none">
                        {pieceId + 1}
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-teal-500/20 pointer-events-none border-2 border-teal-400 rounded-xl" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-3 text-center text-slate-400 text-xs font-medium">
              Todas as peças estão no tabuleiro. Se quiser consertar, toque em uma peça acima para devolvê-la para cá!
            </div>
          )}
        </div>
      </div>

      {/* Reference Image Modal / Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-base font-black text-white">{puzzleConfig.puzzleTitle}</h3>
              <p className="text-xs text-slate-400">Imagem original completa de referência</p>
            </div>
            <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-black">
              <img
                src={imageUrl}
                alt="Imagem de Referência"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Entendi, Voltar ao Jogo
            </button>
          </div>
        </div>
      )}
    </GameContainer>
  );
};
