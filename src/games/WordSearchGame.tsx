import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Check, Sparkles, Hand, MousePointerClick } from 'lucide-react';
import { BaseGameProps } from '../types';
import { WordSearchCustomConfig } from '../types/gameContent';
import { useActiveGamePalette } from '../context/GameLayoutContext';

interface WordSearchGameProps extends BaseGameProps {
  customContent?: WordSearchCustomConfig;
  orderMode?: 'random' | 'ordered';
  questionsCount?: number;
}

const DEFAULT_WORDS = ['CAPACETE', 'LUVAS', 'OCULOS', 'BOTA', 'EXTINTOR'];
const GRID_SIZE = 9;

export const WordSearchGame: React.FC<WordSearchGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#D97706',
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

  const { activeLayout, layoutPrimary, layoutSecondary, darkPrimary, layoutGlow, isLightMode } = useActiveGamePalette({
    palette,
    layoutColorHue,
    isLight,
    themeMode,
    theme,
    themePrimary,
    gameLayout,
  });

  const rawWords = useMemo(() => {
    if (customContent?.words && customContent.words.length > 0) {
      return customContent.words
        .map((w) => w.toUpperCase().trim().replace(/[^A-Z]/g, ''))
        .filter((w) => w.length >= 2 && w.length <= GRID_SIZE);
    }
    return DEFAULT_WORDS;
  }, [customContent]);

  const prepareWords = React.useCallback(() => {
    let list = [...rawWords];
    if (orderMode !== 'ordered') {
      list = list.sort(() => Math.random() - 0.5);
    }
    if (questionsCount && questionsCount >= 2 && questionsCount < list.length) {
      list = list.slice(0, questionsCount);
    } else if (list.length > 5 && (!questionsCount || questionsCount === 0)) {
      list = list.slice(0, 5);
    }
    return list;
  }, [rawWords, orderMode, questionsCount]);

  const [targetWords, setTargetWords] = useState<string[]>(() => prepareWords());

  useEffect(() => {
    setTargetWords(prepareWords());
  }, [prepareWords]);

  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<{ r: number; c: number }[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Selection mode: 'drag' (click and drag) vs 'tap' (free tap in any order)
  const [selectionMode, setSelectionMode] = useState<'drag' | 'tap'>('drag');
  const isDraggingRef = useRef(false);
  const dragStartCellRef = useRef<{ r: number; c: number } | null>(null);

  // Generate grid with hidden words
  const initBoard = (wordsToUse: string[] = targetWords) => {
    const newGrid: string[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(''));

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Place each word either horizontally or vertically
    wordsToUse.forEach((word) => {
      const len = word.length;
      if (len > GRID_SIZE) return;

      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 150) {
        attempts++;
        const isHorizontal = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE : GRID_SIZE - len));
        const c = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE - len : GRID_SIZE));

        let canPlace = true;
        for (let i = 0; i < len; i++) {
          const checkR = isHorizontal ? r : r + i;
          const checkC = isHorizontal ? c + i : c;
          if (newGrid[checkR][checkC] !== '' && newGrid[checkR][checkC] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < len; i++) {
            const placeR = isHorizontal ? r : r + i;
            const placeC = isHorizontal ? c + i : c;
            newGrid[placeR][placeC] = word[i];
          }
          placed = true;
        }
      }
    });

    // Fill remaining empty cells with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setFoundWords([]);
    setFoundCells([]);
    setSelectedCells([]);
    setScore(0);
    setTimeLeft(75);
    setGameOver(false);
    setGameWon(false);
  };

  useEffect(() => {
    initBoard();
  }, [targetWords]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(foundWords.length >= Math.ceil(targetWords.length * 0.6));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, foundWords.length, targetWords.length]);

  /**
   * Helper that checks if a set of cells forms any target word,
   * REGARDLESS of the order the user clicked the letters,
   * provided the letters are connected / aligned.
   */
  const findMatchingWord = (cells: { r: number; c: number }[]): string | null => {
    if (cells.length < 2 || grid.length === 0) return null;

    for (const targetWord of targetWords) {
      if (foundWords.includes(targetWord)) continue;
      if (cells.length !== targetWord.length) continue;

      // 1. Direct arrival order
      const arrivalStr = cells.map((cell) => grid[cell.r]?.[cell.c] || '').join('');
      if (arrivalStr === targetWord || arrivalStr.split('').reverse().join('') === targetWord) {
        return targetWord;
      }

      // 2. Collinear: Vertical line (same column)
      const allSameCol = cells.every((c) => c.c === cells[0].c);
      if (allSameCol) {
        const sorted = [...cells].sort((a, b) => a.r - b.r);
        const isContiguous = sorted.every((c, idx) => idx === 0 || c.r === sorted[idx - 1].r + 1);
        if (isContiguous) {
          const colStr = sorted.map((c) => grid[c.r][c.c]).join('');
          if (colStr === targetWord || colStr.split('').reverse().join('') === targetWord) {
            return targetWord;
          }
        }
      }

      // Collinear: Horizontal line (same row)
      const allSameRow = cells.every((c) => c.r === cells[0].r);
      if (allSameRow) {
        const sorted = [...cells].sort((a, b) => a.c - b.c);
        const isContiguous = sorted.every((c, idx) => idx === 0 || c.c === sorted[idx - 1].c + 1);
        if (isContiguous) {
          const rowStr = sorted.map((c) => grid[c.r][c.c]).join('');
          if (rowStr === targetWord || rowStr.split('').reverse().join('') === targetWord) {
            return targetWord;
          }
        }
      }

      // Collinear: Diagonal line
      const sortedByR = [...cells].sort((a, b) => a.r - b.r);
      if (sortedByR.length >= 2) {
        const dc = sortedByR[1].c - sortedByR[0].c;
        if (Math.abs(dc) === 1) {
          const isDiag = sortedByR.every(
            (c, idx) => idx === 0 || (c.r === sortedByR[idx - 1].r + 1 && c.c === sortedByR[idx - 1].c + dc)
          );
          if (isDiag) {
            const diagStr = sortedByR.map((c) => grid[c.r][c.c]).join('');
            if (diagStr === targetWord || diagStr.split('').reverse().join('') === targetWord) {
              return targetWord;
            }
          }
        }
      }

      // 3. Connected Path DFS:
      // Checks if the multiset of letters matches, and a connected adjacent path exists
      const lettersInCells = cells.map((c) => grid[c.r]?.[c.c] || '').sort().join('');
      const lettersInWord = targetWord.split('').sort().join('');
      if (lettersInCells === lettersInWord) {
        const hasPath = (wordToSpell: string) => {
          const search = (currentIdx: number, visited: boolean[], currentCell: { r: number; c: number }): boolean => {
            if (currentIdx === wordToSpell.length) return true;
            for (let i = 0; i < cells.length; i++) {
              if (!visited[i] && grid[cells[i].r][cells[i].c] === wordToSpell[currentIdx]) {
                const isAdjacent = Math.max(Math.abs(cells[i].r - currentCell.r), Math.abs(cells[i].c - currentCell.c)) <= 1;
                if (isAdjacent) {
                  visited[i] = true;
                  if (search(currentIdx + 1, visited, cells[i])) return true;
                  visited[i] = false;
                }
              }
            }
            return false;
          };

          for (let i = 0; i < cells.length; i++) {
            if (grid[cells[i].r][cells[i].c] === wordToSpell[0]) {
              const visited = new Array(cells.length).fill(false);
              visited[i] = true;
              if (search(1, visited, cells[i])) return true;
            }
          }
          return false;
        };

        if (hasPath(targetWord) || hasPath(targetWord.split('').reverse().join(''))) {
          return targetWord;
        }
      }
    }

    return null;
  };

  /**
   * Process a match if found
   */
  const evaluateSelection = (cells: { r: number; c: number }[]): boolean => {
    const matchedWord = findMatchingWord(cells);
    if (matchedWord) {
      sound.playSuccess();
      const updatedFound = [...foundWords, matchedWord];
      setFoundWords(updatedFound);
      setFoundCells((prev) => [...prev, ...cells]);
      setScore((prev) => prev + 250 + timeLeft * 5);
      setSelectedCells([]);

      if (updatedFound.length === targetWords.length) {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }
      return true;
    }
    return false;
  };

  /**
   * Pointer Down - Start tap or drag
   */
  const handlePointerDown = (r: number, c: number) => {
    if (gameOver) return;
    sound.playTap();
    isDraggingRef.current = true;
    dragStartCellRef.current = { r, c };

    if (selectionMode === 'drag') {
      // In drag mode, clicking starts a fresh line selection
      const newSel = [{ r, c }];
      setSelectedCells(newSel);
      evaluateSelection(newSel);
    } else {
      // In tap mode, toggle cell
      const isAlreadySelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
      const newSel = isAlreadySelected
        ? selectedCells.filter((cell) => !(cell.r === r && cell.c === c))
        : [...selectedCells, { r, c }];
      setSelectedCells(newSel);
      evaluateSelection(newSel);
    }
  };

  /**
   * Pointer Move - Track cell dragging across totens and desktop
   */
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || gameOver) return;

    // Use elementFromPoint to work seamlessly on touch screens and mouse
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const cellEl = element?.closest('[data-cell-pos]');
    if (cellEl) {
      const pos = cellEl.getAttribute('data-cell-pos');
      if (pos) {
        const [rStr, cStr] = pos.split('-');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);

        if (!isNaN(r) && !isNaN(c)) {
          setSelectedCells((prev) => {
            const alreadyIn = prev.some((cell) => cell.r === r && cell.c === c);
            if (!alreadyIn) {
              sound.playTap();
              const next = [...prev, { r, c }];
              evaluateSelection(next);
              return next;
            }
            return prev;
          });
        }
      }
    }
  };

  /**
   * Pointer Up - End drag
   */
  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    dragStartCellRef.current = null;

    // If dragged selection matches a word, it was handled;
    // If in drag mode and selection doesn't match any word, clear after multi-letter drag
    if (selectionMode === 'drag') {
      const isMatch = findMatchingWord(selectedCells);
      if (isMatch) {
        evaluateSelection(selectedCells);
      } else if (selectedCells.length > 1) {
        // Clear non-matching drag after brief delay
        setTimeout(() => {
          setSelectedCells([]);
        }, 200);
      }
    }
  };

  const handleClearSelection = () => {
    sound.playTap();
    setSelectedCells([]);
  };

  // Compute what word is currently being formed to display nicely
  const displayFormingWord = useMemo(() => {
    if (selectedCells.length === 0 || grid.length === 0) return '';
    
    // Check if matched
    const matched = findMatchingWord(selectedCells);
    if (matched) return matched;

    // If all cells in same column, display in top-down order
    const allSameCol = selectedCells.every((c) => c.c === selectedCells[0].c);
    if (allSameCol) {
      const sorted = [...selectedCells].sort((a, b) => a.r - b.r);
      return sorted.map((c) => grid[c.r]?.[c.c] || '').join('');
    }

    // If all cells in same row, display in left-right order
    const allSameRow = selectedCells.every((c) => c.r === selectedCells[0].r);
    if (allSameRow) {
      const sorted = [...selectedCells].sort((a, b) => a.c - b.c);
      return sorted.map((c) => grid[c.r]?.[c.c] || '').join('');
    }

    // Otherwise show in selected sequence
    return selectedCells.map((cell) => grid[cell.r]?.[cell.c] || '').join('');
  }, [selectedCells, grid, foundWords]);

  return (
    <GameContainer
      title="Caça-Palavras"
      category="Atenção"
      score={score}
      correctAnswers={foundWords.length}
      totalQuestions={targetWords.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={foundWords.length === targetWords.length}
      onRestart={() => {
        const nextWords = prepareWords();
        setTargetWords(nextWords);
        initBoard(nextWords);
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
      <div 
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex flex-col flex-1 w-full max-w-4xl lg:max-w-5xl mx-auto justify-between py-2 sm:py-6 px-2 sm:px-6 gap-3 sm:gap-6 select-none animate-in fade-in duration-300 touch-none"
      >
        {/* Words Checklist & Mode Switcher */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`rounded-3xl p-4 sm:p-5 border-2 shadow-xl backdrop-blur-xl ${
            isLightMode
              ? 'bg-amber-50/90 shadow-amber-950/5'
              : 'bg-slate-900/85 shadow-black/40'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span 
                style={{ color: layoutPrimary }}
                className="text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Sparkles style={{ color: layoutPrimary }} className="w-4 h-4 sm:w-5 sm:h-5" />
                Palavras a Encontrar ({foundWords.length}/{targetWords.length})
              </span>

              {/* Mode Toggle */}
              <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectionMode('drag')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    selectionMode === 'drag'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Clique ou toque e arraste o dedo sobre a palavra"
                >
                  <Hand className="w-3 h-3" />
                  <span>Arrastar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('tap')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    selectionMode === 'tap'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toque nas letras em qualquer ordem para formar a palavra"
                >
                  <MousePointerClick className="w-3 h-3" />
                  <span>Toque Livre</span>
                </button>
              </div>
            </div>

            {displayFormingWord && (
              <span 
                style={{ 
                  backgroundColor: `${layoutPrimary}33`, 
                  borderColor: layoutPrimary,
                  color: isLightMode ? '#020617' : '#FFFFFF',
                }}
                className="text-xs sm:text-sm font-black border px-3.5 py-1 rounded-full shadow-xs animate-in fade-in"
              >
                Formando: {displayFormingWord}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {targetWords.map((word) => {
              const isFound = foundWords.includes(word);
              return (
                <span
                  key={word}
                  style={
                    isFound
                      ? undefined
                      : {
                          borderColor: `${layoutPrimary}33`,
                        }
                  }
                  className={`text-xs sm:text-base font-extrabold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl transition-all flex items-center gap-1.5 shadow-sm ${
                    isFound
                      ? 'bg-emerald-600 text-white shadow-emerald-950/40 scale-105'
                      : isLightMode
                      ? 'bg-white text-slate-800 border-2'
                      : 'bg-slate-800 text-slate-200 border-2'
                  }`}
                >
                  {isFound && <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />}
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* 9x9 Grid - Interactive Touch & Drag Grid */}
        <div 
          onPointerMove={handlePointerMove}
          className="my-auto py-1 sm:py-2 flex justify-center w-full touch-none select-none"
        >
          <div 
            style={{ borderColor: `${layoutPrimary}55`, boxShadow: `0 0 35px ${layoutGlow}33` }}
            className="grid grid-cols-9 gap-1.5 sm:gap-3 p-2.5 sm:p-5 bg-slate-900/90 rounded-3xl shadow-2xl border-4 max-w-[560px] sm:max-w-[650px] lg:max-w-[700px] w-full aspect-square backdrop-blur-xl touch-none select-none"
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
                const isFound = foundCells.some((cell) => cell.r === r && cell.c === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    data-cell-pos={`${r}-${c}`}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handlePointerDown(r, c);
                    }}
                    style={
                      isSelected
                        ? {
                            backgroundColor: layoutPrimary,
                            color: '#020617',
                            boxShadow: `0 0 15px ${layoutGlow}`,
                          }
                        : isFound
                        ? {
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            boxShadow: '0 0 10px rgba(5, 150, 105, 0.4)',
                          }
                        : undefined
                    }
                    className={`flex items-center justify-center rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl md:text-3xl transition-all cursor-pointer select-none touch-none active:scale-95 ${
                      isSelected
                        ? 'scale-105 shadow-lg ring-4 ring-white z-10'
                        : isFound
                        ? 'border-2 border-emerald-400/70 font-black'
                        : 'bg-slate-800/90 text-white hover:bg-slate-700 border-2 border-slate-700/60 shadow-sm'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Action Bar & Helper Guide */}
        <div className="flex items-center justify-between gap-4 pt-1 sm:pt-2">
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={selectedCells.length === 0}
            className="flex-1 py-3.5 sm:py-4 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-40 text-slate-800 dark:text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-md active:scale-95"
          >
            Limpar Seleção
          </button>
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 px-2 text-right">
            {selectionMode === 'drag' 
              ? 'Arraste o dedo ou mouse sobre as letras para selecionar' 
              : 'Toque nas letras em qualquer ordem (contanto que estejam ligadas)'}
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
