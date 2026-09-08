import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Check, Sparkles } from 'lucide-react';
import { WordSearchCustomConfig } from '../types/gameContent';

interface WordSearchGameProps {
  onExit: () => void;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string, score: number) => void;
  themePrimary?: string;
  customContent?: WordSearchCustomConfig;
}

const DEFAULT_WORDS = ['CAPACETE', 'LUVAS', 'OCULOS', 'BOTA', 'EXTINTOR'];
const GRID_SIZE = 9;

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#D97706',
  customContent,
}) => {
  const targetWords = useMemo(() => {
    if (customContent?.words && customContent.words.length > 0) {
      return customContent.words.map((w) => w.toUpperCase().trim().replace(/[^A-Z]/g, ''));
    }
    return DEFAULT_WORDS;
  }, [customContent]);

  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Generate grid with hidden words
  useEffect(() => {
    const newGrid: string[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(''));

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Place each word either horizontally or vertically
    targetWords.forEach((word) => {
      const len = word.length;
      if (len > GRID_SIZE) return;

      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
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
    setSelectedCells([]);
    setScore(0);
    setTimeLeft(75);
    setGameOver(false);
    setGameWon(false);
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

  const handleCellClick = (r: number, c: number) => {
    if (gameOver) return;

    sound.playTap();
    const isAlreadySelected = selectedCells.some((cell) => cell.r === r && cell.c === c);

    let newSelected: { r: number; c: number }[];
    if (isAlreadySelected) {
      newSelected = selectedCells.filter((cell) => !(cell.r === r && cell.c === c));
    } else {
      newSelected = [...selectedCells, { r, c }];
    }

    setSelectedCells(newSelected);

    // Check if formed string matches any target word
    const formed = newSelected.map((cell) => grid[cell.r][cell.c]).join('');
    const matchedWord = targetWords.find(
      (w) => !foundWords.includes(w) && (w === formed || w === formed.split('').reverse().join(''))
    );

    if (matchedWord) {
      sound.playSuccess();
      const updatedFound = [...foundWords, matchedWord];
      setFoundWords(updatedFound);
      setScore((prev) => prev + 250 + timeLeft * 5);
      setSelectedCells([]);

      if (updatedFound.length === targetWords.length) {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }
    }
  };

  const handleClearSelection = () => {
    sound.playTap();
    setSelectedCells([]);
  };

  const currentSelectionWord = selectedCells.map((cell) => grid[cell.r]?.[cell.c] || '').join('');

  return (
    <GameContainer
      title="Caça-Palavras"
      category="Atenção"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setFoundWords([]);
        setSelectedCells([]);
        setScore(0);
        setTimeLeft(75);
        setGameOver(false);
        setGameWon(false);
      }}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      themePrimary={themePrimary}
    >
      <div className="flex flex-col h-full max-w-xl mx-auto justify-between select-none">
        {/* Words Checklist */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Palavras a Encontrar ({foundWords.length}/{targetWords.length})
            </span>
            {currentSelectionWord && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Formando: {currentSelectionWord}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {targetWords.map((word) => {
              const isFound = foundWords.includes(word);
              return (
                <span
                  key={word}
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                    isFound
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'bg-white text-slate-700 border border-amber-200'
                  }`}
                >
                  {isFound && <Check className="w-3 h-3 stroke-[3]" />}
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* 9x9 Grid */}
        <div className="my-auto py-2 flex justify-center">
          <div className="grid grid-cols-9 gap-1.5 p-2.5 bg-slate-900/90 rounded-3xl shadow-xl border-2 border-amber-500/30 max-w-[420px] w-full aspect-square">
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className={`flex items-center justify-center rounded-xl font-black text-base sm:text-lg transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-400/50 ring-2 ring-white'
                        : 'bg-slate-800/80 text-white hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Clear selection & helper action */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={selectedCells.length === 0}
            className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-black text-sm rounded-2xl transition-all shadow-sm active:scale-95"
          >
            Limpar Seleção
          </button>
          <div className="text-xs font-medium text-slate-500 px-3 text-right">
            Toque nas letras em sequência para formar a palavra
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
