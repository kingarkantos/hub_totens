import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Palette } from 'lucide-react';
import { GameDefinition, ThemeDefinition } from '../types';
import { GameLayoutId, GAME_LAYOUTS } from '../types/gameLayouts';
import { GameLayoutProvider } from '../context/GameLayoutContext';
import { getFontFamilyById } from '../lib/fonts';
import { LayoutColorPalette, generateLayoutPalette, getDefaultHueForLayout } from '../lib/colorHarmony';
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
import { MathBlitzGame } from './MathBlitzGame';
import { HigherLowerGame } from './HigherLowerGame';
import { ReactionTimeGame } from './ReactionTimeGame';
import { BullseyeGame } from './BullseyeGame';

interface GamePreviewModalProps {
  game: GameDefinition | null;
  onClose: () => void;
  customContent?: any;
  gameLayout?: GameLayoutId;
  onLayoutChange?: (layout: GameLayoutId) => void;
  orderMode?: 'random' | 'ordered';
  questionsCount?: number;
  theme?: ThemeDefinition;
  themePrimary?: string;
  themeMode?: 'light' | 'dark';
  isLight?: boolean;
  fontId?: string;
  fontFamily?: string;
  palette?: LayoutColorPalette;
  layoutColorHue?: number;
}

export const GamePreviewModal: React.FC<GamePreviewModalProps> = ({
  game,
  onClose,
  customContent,
  gameLayout = 'modern_glass',
  onLayoutChange,
  orderMode = 'random',
  questionsCount,
  theme,
  themePrimary,
  themeMode,
  isLight,
  fontId,
  fontFamily,
  palette,
  layoutColorHue,
}) => {
  if (!game) return null;

  const [activeLayout, setActiveLayout] = useState<GameLayoutId>(gameLayout);

  useEffect(() => {
    if (gameLayout) {
      setActiveLayout(gameLayout);
    }
  }, [gameLayout]);

  const handleSelectLayout = (layoutId: GameLayoutId) => {
    setActiveLayout(layoutId);
    if (onLayoutChange) {
      onLayoutChange(layoutId);
    }
  };

  const activePalette = useMemo(() => {
    if (palette && (layoutColorHue === undefined || palette.hue === layoutColorHue)) {
      return palette;
    }
    const hueToUse = layoutColorHue !== undefined ? layoutColorHue : getDefaultHueForLayout(activeLayout);
    return generateLayoutPalette(hueToUse, isLight);
  }, [palette, layoutColorHue, activeLayout, isLight]);

  const activeFontFamily = fontFamily || getFontFamilyById(fontId);

  const mergedTheme: ThemeDefinition | undefined = theme ? {
    ...theme,
    primary: activePalette.primary,
    secondary: activePalette.secondary,
    accent: activePalette.accent,
    glowColor: activePalette.glowColor,
  } : undefined;

  const commonProps = {
    onExit: onClose,
    customContent,
    gameLayout: activeLayout,
    orderMode,
    questionsCount,
    theme: mergedTheme,
    themePrimary: activePalette.primary,
    themeMode,
    isLight,
    fontId,
    fontFamily: activeFontFamily,
    palette: activePalette,
    layoutColorHue: activePalette.hue,
  };

  const renderGame = () => {
    switch (game.id) {
      case 'wheel':
        return <WheelGame {...commonProps} />;
      case 'quiz':
        return <QuizGame {...commonProps} />;
      case 'target':
        return <TargetGame {...commonProps} />;
      case 'memory':
        return <MemoryGame {...commonProps} />;
      case 'catcher':
        return <CatcherGame {...commonProps} />;
      case 'speed':
        return <SpeedGame {...commonProps} />;
      case 'safe':
        return <SafeGame {...commonProps} />;
      case 'genius':
        return <GeniusGame {...commonProps} />;
      case 'puzzle':
        return <PuzzleGame {...commonProps} />;
      case 'balloon':
        return <BalloonGame {...commonProps} />;
      case 'wordsearch':
        return <WordSearchGame {...commonProps} />;
      case 'hangman':
        return <HangmanGame {...commonProps} />;
      case 'truefalse':
        return <TrueFalseGame {...commonProps} />;
      case 'complete_phrase':
        return <CompletePhraseGame {...commonProps} />;
      case 'correct_order':
        return <CorrectOrderGame {...commonProps} />;
      case 'connect_pairs':
        return <ConnectPairsGame {...commonProps} />;
      case 'speed_trivia':
        return <SpeedTriviaGame {...commonProps} />;
      case 'spot_error':
        return <SpotErrorGame {...commonProps} />;
      case 'map_epi':
        return <MapEpiGame {...commonProps} />;
      case 'math_blitz':
        return <MathBlitzGame {...commonProps} />;
      case 'higher_lower':
        return <HigherLowerGame {...commonProps} />;
      case 'reaction_time':
        return <ReactionTimeGame {...commonProps} />;
      case 'bullseye':
        return <BullseyeGame {...commonProps} />;
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
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{game.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {game.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs">{game.description}</p>
            </div>
          </div>

          {/* Interactive Layout Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-white/15 overflow-x-auto shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1.5 shrink-0">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Layout:</span>
            </span>
            {GAME_LAYOUTS.map((l) => {
              const isSelected = l.id === activeLayout;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleSelectLayout(l.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`${l.name} — ${l.tagline}`}
                >
                  <span>{l.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white transition-all ml-auto sm:ml-0"
            title="Fechar Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game Canvas Container with dynamic layout context */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
          <GameLayoutProvider layout={activeLayout} hue={activePalette.hue} isLight={isLight} onLayoutChange={handleSelectLayout}>
            {renderGame()}
          </GameLayoutProvider>
        </div>
      </div>
    </div>
  );
};
