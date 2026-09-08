import React from 'react';
import { X, Play } from 'lucide-react';
import { GameDefinition } from '../types';
import { WheelGame } from './WheelGame';
import { QuizGame } from './QuizGame';
import { TargetGame } from './TargetGame';
import { MemoryGame } from './MemoryGame';
import { CatcherGame } from './CatcherGame';
import { SpeedGame } from './SpeedGame';
import { SafeGame } from './SafeGame';
import { GeniusGame } from './GeniusGame';
import { PuzzleGame } from './PuzzleGame';
import { BalloonGame } from './BalloonGame';
import { WordSearchGame } from './WordSearchGame';
import { HangmanGame } from './HangmanGame';
import { TrueFalseGame } from './TrueFalseGame';
import { CompletePhraseGame } from './CompletePhraseGame';
import { CorrectOrderGame } from './CorrectOrderGame';
import { ConnectPairsGame } from './ConnectPairsGame';
import { SpeedTriviaGame } from './SpeedTriviaGame';
import { SpotErrorGame } from './SpotErrorGame';
import { MapEpiGame } from './MapEpiGame';

interface GamePreviewModalProps {
  game: GameDefinition | null;
  onClose: () => void;
  customContent?: any;
}

export const GamePreviewModal: React.FC<GamePreviewModalProps> = ({ game, onClose, customContent }) => {
  if (!game) return null;

  const renderGame = () => {
    switch (game.id) {
      case 'wheel':
        return <WheelGame onExit={onClose} customContent={customContent} />;
      case 'quiz':
        return <QuizGame onExit={onClose} customContent={customContent} />;
      case 'target':
        return <TargetGame onExit={onClose} customContent={customContent} />;
      case 'memory':
        return <MemoryGame onExit={onClose} customContent={customContent} />;
      case 'catcher':
        return <CatcherGame onExit={onClose} customContent={customContent} />;
      case 'speed':
        return <SpeedGame onExit={onClose} customContent={customContent} />;
      case 'safe':
        return <SafeGame onExit={onClose} customContent={customContent} />;
      case 'genius':
        return <GeniusGame onExit={onClose} customContent={customContent} />;
      case 'puzzle':
        return <PuzzleGame onExit={onClose} customContent={customContent} />;
      case 'balloon':
        return <BalloonGame onExit={onClose} customContent={customContent} />;
      case 'wordsearch':
        return <WordSearchGame onExit={onClose} customContent={customContent} />;
      case 'hangman':
        return <HangmanGame onExit={onClose} customContent={customContent} />;
      case 'truefalse':
        return <TrueFalseGame onExit={onClose} customContent={customContent} />;
      case 'complete_phrase':
        return <CompletePhraseGame onExit={onClose} customContent={customContent} />;
      case 'correct_order':
        return <CorrectOrderGame onExit={onClose} customContent={customContent} />;
      case 'connect_pairs':
        return <ConnectPairsGame onExit={onClose} customContent={customContent} />;
      case 'speed_trivia':
        return <SpeedTriviaGame onExit={onClose} customContent={customContent} />;
      case 'spot_error':
        return <SpotErrorGame onExit={onClose} customContent={customContent} />;
      case 'map_epi':
        return <MapEpiGame onExit={onClose} />;
      default:
        return (
          <div className="p-12 text-center text-slate-400">
            Preview em carregamento...
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-950 border-2 border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Play className="w-5 h-5 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{game.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {game.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{game.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Canvas Container */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {renderGame()}
        </div>
      </div>
    </div>
  );
};
