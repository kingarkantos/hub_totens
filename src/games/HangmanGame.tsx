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

export const HangmanGame: React.FC<HangmanGameProps> = ({
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
}) => {
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
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
    >
      <div className="flex flex-col flex-1 w-full max-w-2xl sm:max-w-3xl mx-auto justify-between py-2 select-none">
        {/* Header with Category and Lives */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
              {activeItem.category || 'Segurança'}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Palavra {currentWordIdx + 1} de {wordsList.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-all ${
                  i < remainingLives
                    ? 'fill-rose-500 text-rose-500 scale-100'
                    : 'fill-slate-200 text-slate-300 scale-90'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Clue Box */}
        <div className="my-2 bg-white/90 border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-700 uppercase mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            Dica
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-700 leading-snug">
            "{activeItem.clue}"
          </p>
        </div>

        {/* Target Word Slots */}
        <div className="my-auto py-4 flex flex-wrap items-center justify-center gap-2">
          {targetWord.split('').map((char, idx) => {
            const isRevealed = guessedLetters.includes(char) || gameOver;
            return (
              <div
                key={idx}
                className={`w-11 h-13 sm:w-13 sm:h-16 flex items-center justify-center rounded-2xl text-2xl sm:text-3xl font-black transition-all ${
                  isRevealed
                    ? guessedLetters.includes(char)
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                      : 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-100 border-2 border-slate-300 text-transparent'
                }`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* On-Screen Touch Alphabet Keyboard */}
        <div className="bg-slate-900/90 rounded-3xl p-3 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
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
                  className={`h-11 sm:h-12 rounded-xl font-black text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center ${
                    isCorrect
                      ? 'bg-emerald-500 text-white opacity-80 ring-1 ring-emerald-300'
                      : isWrong
                      ? 'bg-slate-800 text-slate-600 opacity-40 line-through'
                      : 'bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm'
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
