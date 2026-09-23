import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Volume2, VolumeX, Trophy, RotateCcw, Keyboard, 
  Sparkles, CheckCircle2, Gamepad2, LayoutGrid, Gem, Box, Palette, X, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../lib/audio';
import { TouchVirtualKeyboard } from '../components/TouchVirtualKeyboard';
import { ThemeDefinition } from '../types';
import { GameLayoutId, GAME_LAYOUTS, GameLayoutDefinition } from '../types/gameLayouts';
import { GameLayoutProvider } from '../context/GameLayoutContext';

interface GameContainerProps {
  title: string;
  category: string;
  score: number;
  timeRemaining?: number;
  gameOver: boolean;
  gameWon?: boolean;
  onRestart: () => void;
  onExit: () => void;
  children: React.ReactNode;
  rankingEnabled?: boolean;
  onSubmitScore?: (playerName: string) => void;
  customScoreLabel?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  themePrimary?: string;
  theme?: ThemeDefinition;
  customBgStyle?: React.CSSProperties;
  campaignName?: string;
  clientName?: string;
  splashImageUrl?: string;
  isLight?: boolean;
  themeMode?: 'light' | 'dark';
  gameLayout?: GameLayoutId;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  title,
  category,
  score,
  timeRemaining,
  gameOver,
  gameWon = true,
  onRestart,
  onExit,
  children,
  rankingEnabled = false,
  onSubmitScore,
  customScoreLabel = 'Pontos',
  correctAnswers,
  totalQuestions,
  themePrimary = '#DC2626',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  isLight,
  themeMode,
  gameLayout,
}) => {
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const [playerName, setPlayerName] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<GameLayoutId>(gameLayout || 'modern_glass');
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  // Sync if prop changes externally
  useEffect(() => {
    if (gameLayout) {
      setCurrentLayout(gameLayout);
    }
  }, [gameLayout]);

  const currentLayoutDef: GameLayoutDefinition = 
    GAME_LAYOUTS.find((l) => l.id === currentLayout) || GAME_LAYOUTS[0];

  const isLightMode = isLight ?? (themeMode === 'light' || theme?.textColor?.includes('text-slate-900') || theme?.bgGradient?.includes('slate-100'));

  useEffect(() => {
    if (gameOver && gameWon) {
      sound.playFanfare();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#F59E0B', '#10B981', '#38BDF8', '#EC4899'],
      });
    }
  }, [gameOver, gameWon]);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundOn(sound.enabled);
  };

  const handleSaveScore = (nameToSave: string) => {
    if (!nameToSave.trim() || !onSubmitScore) return;
    onSubmitScore(nameToSave.trim());
    setScoreSubmitted(true);
    setShowKeyboard(false);
    sound.playSuccess();
  };

  const renderLayoutIcon = (id: GameLayoutId, sizeClass = "w-4 h-4 sm:w-5 sm:h-5") => {
    switch (id) {
      case 'neon_arcade':
        return <Gamepad2 className={sizeClass} />;
      case 'bento_tech':
        return <LayoutGrid className={sizeClass} />;
      case 'neumorphic_luxe':
        return <Gem className={sizeClass} />;
      case 'spatial_3d':
        return <Box className={sizeClass} />;
      case 'modern_glass':
      default:
        return <Sparkles className={sizeClass} />;
    }
  };

  return (
    <GameLayoutProvider layout={currentLayout} onLayoutChange={setCurrentLayout}>
      <div
        style={{
          '--glow-color': theme?.glowColor || themePrimary,
          ...customBgStyle,
        } as React.CSSProperties}
        className={`fixed inset-0 w-full h-full flex flex-col bg-gradient-to-b ${
          theme?.bgGradient || (isLightMode ? 'from-slate-100 via-slate-50 to-slate-200' : 'from-slate-950 via-slate-900 to-black')
        } ${theme?.textColor || (isLightMode ? 'text-slate-900' : 'text-white')} ${theme?.fontClass || ''} select-none overflow-hidden z-40 transition-colors duration-500`}
      >
        {/* Dynamic Backgrounds According to 5 Layouts */}
        {currentLayout === 'modern_glass' && (
          <>
            <div
              className={`absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl ${isLightMode ? 'opacity-15' : 'opacity-30'} pointer-events-none transition-all duration-700`}
              style={{ background: themePrimary || theme?.primary || '#DC2626' }}
            />
            <div
              className={`absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl ${isLightMode ? 'opacity-15' : 'opacity-25'} pointer-events-none transition-all duration-700`}
              style={{ background: theme?.secondary || '#F59E0B' }}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${isLightMode ? 'opacity-5' : 'opacity-10'} pointer-events-none`}
              style={{ background: theme?.glowColor || themePrimary || '#DC2626' }}
            />
          </>
        )}

        {currentLayout === 'neon_arcade' && (
          <>
            {/* Retro-futuristic scanlines overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-25 z-10" />
            {/* Pulsing Neon Cyan / Magenta corner ambient glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-[130px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-[130px] pointer-events-none animate-pulse delay-700" />
          </>
        )}

        {currentLayout === 'bento_tech' && (
          <>
            {/* Technical Micro-Dot Grid */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
            {/* Precision corner telemetry markers */}
            <div className="absolute top-12 left-4 text-[9px] font-mono text-slate-500 opacity-60 uppercase pointer-events-none hidden sm:block">
              SYS::NODE_HUB_01 // LATENCY: 0.1ms
            </div>
            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-500 opacity-60 uppercase pointer-events-none hidden sm:block">
              RESOLUTION: KIOSK_TOUCH_4K // 120HZ
            </div>
          </>
        )}

        {currentLayout === 'neumorphic_luxe' && (
          <>
            {/* Warm Velvet Luxury Lighting */}
            <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-transparent blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-700/15 via-yellow-600/10 to-transparent blur-[130px] pointer-events-none" />
          </>
        )}

        {currentLayout === 'spatial_3d' && (
          <>
            {/* Holographic Stardust Floating Particles */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950/60 to-black" />
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full blur-xs animate-ping opacity-30 pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full blur-xs animate-ping opacity-40 delay-500 pointer-events-none" />
            <div className="absolute -top-24 right-1/3 w-96 h-96 bg-purple-600/20 blur-[140px] pointer-events-none" />
          </>
        )}

        {/* Top Campaign Brand Ribbon with Logo and Client Name */}
        {(splashImageUrl || clientName || campaignName) && (
          <div className={`w-full flex items-center justify-center py-2 px-4 flex-shrink-0 z-30 ${isLightMode ? 'bg-white/85 border-b border-slate-200/80 shadow-xs' : 'bg-black/40 border-b border-white/10'} backdrop-blur-md`}>
            <div className={`flex items-center gap-3 px-4 sm:px-6 py-1.5 rounded-full ${isLightMode ? 'bg-slate-100/90 border border-slate-200 shadow-xs' : 'bg-white/10 border border-white/20 shadow-lg'} backdrop-blur-md`}>
              {splashImageUrl && (
                <img
                  src={splashImageUrl}
                  alt={clientName || 'Logo da Campanha'}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 ${isLightMode ? 'border-slate-300' : 'border-white/40'} shadow-sm flex-shrink-0`}
                />
              )}
              <div className="flex items-center gap-2">
                {clientName && (
                  <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {clientName}
                  </span>
                )}
                {campaignName && (
                  <>
                    <span className={`${isLightMode ? 'text-slate-400' : 'text-white/40'} text-xs`}>•</span>
                    <span 
                      style={{ color: isLightMode ? (themePrimary || '#DC2626') : undefined }}
                      className={`text-xs sm:text-sm font-bold ${!isLightMode ? 'text-amber-300' : ''} truncate max-w-[200px] sm:max-w-[320px]`}
                    >
                      {campaignName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Bar Header */}
        <header className={`flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-30 transition-all ${
          currentLayout === 'neon_arcade' 
            ? 'bg-black/80 border-b-2 border-cyan-500/40 shadow-[0_4px_25px_rgba(6,182,212,0.2)]' 
            : currentLayout === 'bento_tech'
            ? 'bg-slate-900/95 border-b-2 border-slate-700/80 shadow-md font-mono'
            : currentLayout === 'neumorphic_luxe'
            ? 'bg-black/30 border-b border-white/10 backdrop-blur-2xl'
            : currentLayout === 'spatial_3d'
            ? 'bg-slate-950/85 border-b border-purple-500/30 backdrop-blur-2xl shadow-xl'
            : isLightMode 
            ? 'bg-white/95 border-b border-slate-200/80 shadow-xs text-slate-900 backdrop-blur-md' 
            : 'bg-black/40 border-b border-white/10 text-white backdrop-blur-md'
        }`}>
          {/* Left: Exit button & Live Layout Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onExit();
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 ${currentLayoutDef.buttonClass} ${
                currentLayout === 'neon_arcade'
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : currentLayout === 'bento_tech'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                  : currentLayout === 'neumorphic_luxe'
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  : currentLayout === 'spatial_3d'
                  ? 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-400/40'
                  : isLightMode
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              } active:scale-95 transition-all text-xs sm:text-sm font-black tracking-wide`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Sair</span>
            </button>

            {/* Quick 5-Layout Switcher Pill */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowLayoutPicker(true);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 ${currentLayoutDef.buttonClass} ${
                currentLayoutDef.badgeBg
              } active:scale-95 transition-all text-xs font-black`}
              title="Trocar Layout (5 Estilos Disponíveis)"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Layout:</span>
              <span>{currentLayoutDef.name}</span>
            </button>
          </div>

          {/* Center: Title & Category */}
          <div className="flex flex-col items-center text-center">
            <span className={`text-[10px] sm:text-xs uppercase tracking-widest ${
              currentLayout === 'neon_arcade' ? 'text-cyan-400 font-black' : isLightMode ? 'text-slate-500 font-black' : 'text-slate-300 font-black'
            }`}>
              {category}
            </span>
            <h2 className={`text-base sm:text-2xl font-black tracking-tight ${
              currentLayout === 'neon_arcade' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-400' : ''
            }`}>
              {title}
            </h2>
          </div>

          {/* Right: Timer, Score, Sound */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {timeRemaining !== undefined && timeRemaining > 0 && (
              <div className={`px-3 sm:px-4 py-1.5 sm:py-2 ${currentLayoutDef.buttonClass} ${
                currentLayout === 'neon_arcade'
                  ? 'bg-black border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : currentLayout === 'bento_tech'
                  ? 'bg-slate-800 border border-amber-500/40 text-amber-400'
                  : isLightMode 
                  ? 'bg-amber-50 border border-amber-200 text-amber-800' 
                  : 'bg-slate-800/95 border border-white/15 text-amber-400'
              } flex items-center gap-1.5 font-mono text-sm sm:text-base font-black shadow-sm`}>
                <span>⏱️</span>
                <span>{timeRemaining}s</span>
              </div>
            )}

            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 ${currentLayoutDef.buttonClass} ${
              currentLayout === 'neon_arcade'
                ? 'bg-black border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : currentLayout === 'bento_tech'
                ? 'bg-slate-800 border border-slate-700 text-white'
                : isLightMode 
                ? 'bg-slate-100 border border-slate-200 text-slate-800' 
                : 'bg-white/10 border border-white/15 text-white'
            } flex items-center gap-1.5 font-black text-sm sm:text-base shadow-sm`}>
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span>{score}</span>
              <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-300/80'} hidden sm:inline`}>{customScoreLabel}</span>
            </div>

            <button
              onClick={toggleSound}
              className={`p-2 sm:p-2.5 ${currentLayoutDef.buttonClass} ${
                isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
              } active:scale-95 transition-all`}
              title={soundOn ? 'Desativar Som' : 'Ativar Som'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
            </button>
          </div>
        </header>

        {/* Main Game Play Area - Styled dynamically per layout */}
        <main className={`relative flex-1 w-full min-h-0 flex flex-col items-center justify-center p-3 sm:p-8 overflow-y-auto no-scrollbar z-20`}>
          {/* Neon Arcade HUD Brackets */}
          {currentLayout === 'neon_arcade' && (
            <div className="absolute inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div className="absolute top-1 left-12 text-[8px] font-mono uppercase text-cyan-400/70 tracking-widest">
                [ ARCADE HUD TOUCH MATRIX ]
              </div>
            </div>
          )}

          {/* Spatial 3D Shimmer Border Wrapper */}
          {currentLayout === 'spatial_3d' && (
            <div className="absolute inset-6 pointer-events-none rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)]" />
          )}

          {children}
        </main>

        {/* Game Over / Victory Modal */}
        {gameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
            <div className={`w-full max-w-md sm:max-w-xl my-auto ${
              isLightMode ? 'bg-white border-4 border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-4 border-white/20 text-white shadow-2xl'
            } ${currentLayoutDef.containerClass} p-6 sm:p-10 flex flex-col items-center text-center max-h-[94vh] max-h-[94dvh] overflow-y-auto no-scrollbar`}>
              <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mb-3 shadow-xl shadow-amber-500/40 animate-bounce-subtle flex-shrink-0">
                <Trophy className="w-8 h-8 sm:w-11 sm:h-11 text-slate-950" />
              </div>

              <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-1">
                {gameWon ? 'Parabéns!' : 'Fim de Jogo!'}
              </h3>
              
              <p className={`${isLightMode ? 'text-slate-600' : 'text-slate-300'} text-sm sm:text-lg mb-4 sm:mb-6`}>
                Você completou o desafio <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>{title}</strong>.
              </p>

              <div className={`w-full ${isLightMode ? 'bg-slate-50 border-2 border-slate-200' : 'bg-slate-800/95 border-2 border-white/15'} ${currentLayoutDef.cardClass} p-4 sm:p-6 mb-4 sm:mb-5 flex-shrink-0 shadow-inner`}>
                <span className={`text-xs sm:text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'} font-black uppercase tracking-widest`}>Pontuação Final</span>
                <div className="text-4xl sm:text-6xl font-black text-amber-500 tracking-tight mt-1 font-mono drop-shadow-sm">
                  {score} <span className={`text-sm sm:text-lg ${isLightMode ? 'text-slate-500' : 'text-slate-400'} font-normal`}>{customScoreLabel}</span>
                </div>
              </div>

              {/* Accuracy / Correct Answers for Question & Trivia Games */}
              {correctAnswers !== undefined && totalQuestions !== undefined && totalQuestions > 0 && (
                <div className={`w-full ${isLightMode ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950' : 'bg-emerald-950/50 border-2 border-emerald-500/50 text-white'} ${currentLayoutDef.cardClass} p-4 sm:p-5 mb-4 sm:mb-5 flex items-center justify-between shadow-md flex-shrink-0`}>
                  <div className="text-left">
                    <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isLightMode ? 'text-emerald-800' : 'text-emerald-300'} flex items-center gap-1.5`}>
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      <span>Respostas Corretas</span>
                    </span>
                    <p className={`text-[11px] sm:text-xs ${isLightMode ? 'text-emerald-700/80' : 'text-slate-300'} mt-0.5`}>
                      Aproveitamento total no desafio
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-500 tracking-tight">
                      {correctAnswers} <span className={`text-sm sm:text-xl ${isLightMode ? 'text-slate-600' : 'text-slate-400'} font-normal`}>de {totalQuestions}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-mono">
                      {Math.round((correctAnswers / totalQuestions) * 100)}% de acertos
                    </span>
                  </div>
                </div>
              )}

              {/* Ranking Action */}
              {rankingEnabled && onSubmitScore && !scoreSubmitted && (
                <div className="w-full mb-4 sm:mb-6 flex flex-col items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowKeyboard(true);
                    }}
                    className={`w-full py-4 sm:py-5 px-6 ${currentLayoutDef.buttonClass} bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/35 hover:to-yellow-500/35 border-2 border-amber-400/50 text-amber-300 font-black text-base sm:text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg`}
                  >
                    <Keyboard className="w-6 h-6 text-amber-400" />
                    <span>Gravar Recorde no Ranking</span>
                  </button>
                </div>
              )}

              {scoreSubmitted && (
                <div className={`w-full py-3.5 sm:py-4 mb-4 sm:mb-6 bg-emerald-500/20 border-2 border-emerald-500/40 ${currentLayoutDef.buttonClass} text-emerald-300 text-sm sm:text-base font-black flex items-center justify-center gap-2 flex-shrink-0 shadow-sm`}>
                  <span>✓</span> Recorde de {playerName || 'Jogador'} registrado!
                </div>
              )}

              <div className="flex w-full gap-3 sm:gap-4 mt-auto pt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setScoreSubmitted(false);
                    setPlayerName('');
                    onRestart();
                  }}
                  className={`flex-1 py-4 sm:py-5 px-4 ${currentLayoutDef.buttonClass} bg-white/10 hover:bg-white/20 active:scale-95 transition-all font-black text-sm sm:text-lg flex items-center justify-center gap-2 border-2 border-white/15`}
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Jogar Novamente</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onExit();
                  }}
                  style={{ backgroundColor: themePrimary }}
                  className={`flex-1 py-4 sm:py-5 px-4 ${currentLayoutDef.buttonClass} font-black text-sm sm:text-lg text-white active:scale-95 transition-all shadow-xl hover:brightness-110 border-2 border-white/20`}
                >
                  Menu Principal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5 Layouts Interactive Selector Modal */}
        {showLayoutPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-white/20 rounded-[32px] p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 text-white shadow-md">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black">Escolha o Layout do Jogo</h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      5 layouts e designs visuais exclusivos com formatos, animações e efeitos únicos.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLayoutPicker(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 5 Layout Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {GAME_LAYOUTS.map((layoutDef) => {
                  const isSelected = layoutDef.id === currentLayout;
                  return (
                    <button
                      key={layoutDef.id}
                      type="button"
                      onClick={() => {
                        sound.playSuccess();
                        setCurrentLayout(layoutDef.id);
                        setShowLayoutPicker(false);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 active:scale-98 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${layoutDef.previewBg} text-white shadow-md`}>
                            {renderLayoutIcon(layoutDef.id, "w-5 h-5")}
                          </div>
                          <div>
                            <h4 className="text-base font-black text-white flex items-center gap-2">
                              {layoutDef.name}
                              {isSelected && (
                                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" /> Ativo
                                </span>
                              )}
                            </h4>
                            <span className="text-[11px] font-bold text-amber-300">{layoutDef.tagline}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {layoutDef.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLayoutPicker(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-sm text-white"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Touch Virtual Keyboard */}
        <TouchVirtualKeyboard
          isOpen={showKeyboard}
          value={playerName}
          onChange={setPlayerName}
          onConfirm={() => handleSaveScore(playerName)}
          onClose={() => setShowKeyboard(false)}
          title="Gravar Recorde no Ranking"
          placeholder="DIGITE SEU NOME / APELIDO"
        />
      </div>
    </GameLayoutProvider>
  );
};
