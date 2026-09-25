import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Check, Sparkles } from 'lucide-react';
import { BaseGameProps } from '../types';
import { WordSearchCustomConfig } from '../types/gameContent';

interface WordSearchGameProps extends BaseGameProps {
  customContent?: WordSearchCustomConfig;
}

const DEFAULT_WORDS = ['CAPACETE', 'LUVAS', 'OCULOS', 'BOTA', 'EXTINTOR'];
const GRID_SIZE = 9;

import { useActiveGamePalette } from '../context/GameLayoutContext';

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
      correctAnswers={foundWords.length}
      totalQuestions={targetWords.length}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={foundWords.length === targetWords.length}
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
        {/* Words Checklist */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`rounded-3xl p-5 sm:p-6 border-2 shadow-xl backdrop-blur-xl ${
            isLightMode
              ? 'bg-amber-50/90 shadow-amber-950/5'
              : 'bg-slate-900/85 shadow-black/40'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span 
              style={{ color: layoutPrimary }}
              className="text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2"
            >
              <Sparkles style={{ color: layoutPrimary }} className="w-5 h-5" />
              Palavras a Encontrar ({foundWords.length}/{targetWords.length})
            </span>
            {currentSelectionWord && (
              <span 
                style={{ 
                  backgroundColor: `${layoutPrimary}33`, 
                  borderColor: layoutPrimary,
                  color: isLightMode ? '#020617' : '#FFFFFF',
                }}
                className="text-xs sm:text-sm font-black border px-3.5 py-1 rounded-full shadow-xs"
              >
                Formando: {currentSelectionWord}
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

        {/* 9x9 Grid - Large Totem Touch Grid */}
        <div className="my-auto py-2 flex justify-center w-full">
          <div 
            style={{ borderColor: `${layoutPrimary}55`, boxShadow: `0 0 35px ${layoutGlow}33` }}
            className="grid grid-cols-9 gap-2 sm:gap-3 p-3 sm:p-5 bg-slate-900/90 rounded-3xl shadow-2xl border-4 max-w-[580px] sm:max-w-[650px] lg:max-w-[700px] w-full aspect-square backdrop-blur-xl"
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: layoutPrimary,
                            color: '#020617',
                            boxShadow: `0 0 15px ${layoutGlow}`,
                          }
                        : undefined
                    }
                    className={`flex items-center justify-center rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl md:text-3xl transition-all active:scale-95 ${
                      isSelected
                        ? 'scale-105 shadow-lg ring-4 ring-white'
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

        {/* Clear selection & helper action */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={selectedCells.length === 0}
            className="flex-1 py-4 sm:py-5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-40 text-slate-800 dark:text-white font-black text-base sm:text-lg rounded-2xl sm:rounded-3xl transition-all shadow-md active:scale-95"
          >
            Limpar Seleção
          </button>
          <div className="text-xs sm:text-sm font-bold text-slate-400 px-3 text-right">
            Toque nas letras em sequência para formar a palavra
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
