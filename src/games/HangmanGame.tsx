import React, { useState, useEffect, useMemo } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { Heart, HelpCircle, Lightbulb } from 'lucide-react';
import { BaseGameProps } from '../types';
import { HangmanCustomItem } from '../types/gameContent';

interface HangmanGameProps extends BaseGameProps {
  customContent?: HangmanCustomItem[];
}

const DEFAULT_WORDS: HangmanCustomItem[] = [
  { word: 'EXTINTOR', clue: 'Equipamento essencial contra princípio de fogo', category: 'Segurança' },
  { word: 'ISOLAMENTO', clue: 'Procedimento indispensável em manutenção elétrica', category: 'Normas' },
  { word: 'ERGONOMIA', clue: 'Ajuste do posto de trabalho e postura correta', category: 'Saúde' },
  { word: 'CAPACETE', clue: 'Proteção individual primordial para a cabeça', category: 'EPIs' },
  { word: 'SINALIZACAO', clue: 'Avisos visuais sobre áreas de perigo e rotas', category: 'Prevenção' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_MISTAKES = 6;

import { useActiveGamePalette } from '../context/GameLayoutContext';

export const HangmanGame: React.FC<HangmanGameProps> = (props) => {
  const {
    onExit,
    rankingEnabled,
    onSubmitScore,
    themePrimary = '#10B981',
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
  const wordsList = useMemo(() => {
    return customContent && customContent.length > 0 ? customContent : DEFAULT_WORDS;
  }, [customContent]);

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const activeItem = wordsList[currentWordIdx % wordsList.length];
  const targetWord = activeItem.word.toUpperCase().replace(/[^A-Z]/g, '');

  const mistakes = guessedLetters.filter((letter) => !targetWord.includes(letter)).length;
  const isWordGuessed = targetWord.split('').every((char) => guessedLetters.includes(char));

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameWon(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Check win or lose on current word
  useEffect(() => {
    if (gameOver) return;

    if (mistakes >= MAX_MISTAKES) {
      sound.playError();
      setGameOver(true);
      setGameWon(false);
    } else if (isWordGuessed && targetWord.length > 0) {
      sound.playSuccess();
      const pointsGained = 300 + (MAX_MISTAKES - mistakes) * 50 + timeLeft * 5;
      setScore((prev) => prev + pointsGained);

      if (currentWordIdx + 1 < wordsList.length) {
        setTimeout(() => {
          setCurrentWordIdx((prev) => prev + 1);
          setGuessedLetters([]);
        }, 800);
      } else {
        sound.playFanfare();
        setGameOver(true);
        setGameWon(true);
      }
    }
  }, [mistakes, isWordGuessed, targetWord, currentWordIdx, wordsList.length, gameOver, timeLeft]);

  const handleLetterClick = (letter: string) => {
    if (gameOver || guessedLetters.includes(letter)) return;

    sound.playTap();
    setGuessedLetters((prev) => [...prev, letter]);
  };

  const remainingLives = MAX_MISTAKES - mistakes;

  return (
    <GameContainer
      title="Jogo da Forca"
      category="Palavras"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={gameWon}
      onRestart={() => {
        setCurrentWordIdx(0);
        setGuessedLetters([]);
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
      <div className="flex flex-col flex-1 w-full max-w-3xl lg:max-w-4xl mx-auto justify-between py-4 sm:py-8 px-2 sm:px-6 gap-5 sm:gap-8 select-none animate-in fade-in duration-300">
        {/* Header with Category and Lives */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`flex items-center justify-between rounded-2xl px-5 py-3.5 shadow-sm border-2 ${
            isLightMode
              ? 'bg-white/95 text-slate-900'
              : 'bg-slate-900/90 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span 
              style={{
                backgroundColor: `${layoutPrimary}22`,
                borderColor: `${layoutPrimary}66`,
                color: layoutPrimary,
              }}
              className="text-xs sm:text-sm font-black uppercase border px-3.5 py-1.5 rounded-xl"
            >
              {activeItem.category || 'Segurança'}
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-500 dark:text-slate-300">
              Palavra {currentWordIdx + 1} de {wordsList.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 sm:w-8 sm:h-8 transition-all ${
                  i < remainingLives
                    ? 'fill-rose-500 text-rose-500 scale-100 drop-shadow-md'
                    : 'fill-slate-300 text-slate-400 opacity-40 scale-90'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Clue Box */}
        <div 
          style={{ borderColor: `${layoutPrimary}44` }}
          className={`my-auto rounded-3xl p-6 sm:p-8 border-2 shadow-xl text-center backdrop-blur-xl ${
            isLightMode
              ? 'bg-white/95 shadow-slate-200/50'
              : 'bg-slate-900/85 shadow-black/40'
          }`}
        >
          <div 
            style={{ color: layoutPrimary }}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider mb-2"
          >
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Dica do Desafio
          </div>
          <p className={`text-lg sm:text-2xl font-black leading-snug ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
            "{activeItem.clue}"
          </p>
        </div>

        {/* Target Word Slots */}
        <div className="my-auto py-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {targetWord.split('').map((char, idx) => {
            const isRevealed = guessedLetters.includes(char) || gameOver;
            return (
              <div
                key={idx}
                style={
                  isRevealed && guessedLetters.includes(char)
                    ? {
                        background: `linear-gradient(135deg, ${layoutPrimary}, ${layoutSecondary})`,
                        borderColor: `${darkPrimary}88`,
                        boxShadow: `0 0 20px ${layoutGlow}`,
                      }
                    : undefined
                }
                className={`w-14 h-18 sm:w-20 sm:h-24 flex items-center justify-center rounded-2xl sm:rounded-3xl text-3xl sm:text-5xl font-black transition-all shadow-lg border-2 ${
                  isRevealed
                    ? guessedLetters.includes(char)
                      ? 'text-white scale-105'
                      : 'bg-rose-500 text-white border-rose-300 animate-pulse'
                    : isLightMode
                    ? 'bg-slate-100 border-slate-300 text-transparent'
                    : 'bg-slate-800 border-slate-600 text-transparent'
                }`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* On-Screen Touch Alphabet Keyboard */}
        <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-6 border-2 border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 sm:gap-2.5">
            {ALPHABET.map((letter) => {
              const isUsed = guessedLetters.includes(letter);
              const isCorrect = isUsed && targetWord.includes(letter);
              const isWrong = isUsed && !targetWord.includes(letter);

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isUsed || gameOver}
                  onClick={() => handleLetterClick(letter)}
                  className={`h-13 sm:h-16 rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl transition-all active:scale-95 flex items-center justify-center shadow-md ${
                    isCorrect
                      ? 'bg-emerald-500 text-white opacity-90 ring-2 ring-emerald-300'
                      : isWrong
                      ? 'bg-slate-800 text-slate-600 opacity-40 line-through'
                      : 'bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
