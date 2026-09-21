import React, { useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Trophy, RotateCcw, Keyboard, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../lib/audio';
import { TouchVirtualKeyboard } from '../components/TouchVirtualKeyboard';
import { ThemeDefinition } from '../types';

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
  themePrimary?: string;
  theme?: ThemeDefinition;
  customBgStyle?: React.CSSProperties;
  campaignName?: string;
  clientName?: string;
  splashImageUrl?: string;
  isLight?: boolean;
  themeMode?: 'light' | 'dark';
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
  themePrimary = '#DC2626',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  isLight,
  themeMode,
}) => {
  const [soundOn, setSoundOn] = React.useState(sound.enabled);
  const [playerName, setPlayerName] = React.useState('');
  const [showKeyboard, setShowKeyboard] = React.useState(false);
  const [scoreSubmitted, setScoreSubmitted] = React.useState(false);

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

  return (
    <div
      style={{
        '--glow-color': theme?.glowColor || themePrimary,
        ...customBgStyle,
      } as React.CSSProperties}
      className={`fixed inset-0 w-full h-full flex flex-col bg-gradient-to-b ${theme?.bgGradient || (isLightMode ? 'from-slate-100 via-slate-50 to-slate-200' : 'from-slate-950 via-slate-900 to-black')} ${theme?.textColor || (isLightMode ? 'text-slate-900' : 'text-white')} ${theme?.fontClass || ''} select-none overflow-hidden z-40`}
    >
      {/* Dynamic Ambient Background Glows with Project Design System Colors */}
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

      {/* Top Bar */}
      <header className={`flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 ${isLightMode ? 'bg-white/95 border-b border-slate-200/80 shadow-xs text-slate-900' : 'bg-black/40 border-b border-white/10 text-white'} backdrop-blur-md z-30`}>
        <button
          onClick={() => {
            sound.playClick();
            onExit();
          }}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white'} active:scale-95 transition-all text-xs sm:text-base font-black tracking-wide`}
        >
          <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          <span>Sair</span>
        </button>

        <div className="flex flex-col items-center">
          <span className={`text-[10px] sm:text-xs uppercase tracking-widest ${isLightMode ? 'text-slate-500 font-black' : 'text-slate-300 font-black'}`}>{category}</span>
          <h2 className="text-base sm:text-2xl font-black tracking-tight">{title}</h2>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {timeRemaining !== undefined && timeRemaining > 0 && (
            <div className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl ${isLightMode ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-slate-800/95 border border-white/15 text-amber-400'} flex items-center gap-1.5 font-mono text-sm sm:text-lg font-black shadow-sm`}>
              <span>⏱️</span>
              <span>{timeRemaining}s</span>
            </div>
          )}

          <div className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl ${isLightMode ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'bg-white/10 border border-white/15 text-white'} flex items-center gap-1.5 font-black text-sm sm:text-lg shadow-sm`}>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <span>{score}</span>
            <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-300/80'} hidden sm:inline`}>{customScoreLabel}</span>
          </div>

          <button
            onClick={toggleSound}
            className={`p-2.5 sm:p-3 rounded-2xl ${isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-slate-300'} active:scale-95 transition-all`}
            title={soundOn ? 'Desativar Som' : 'Ativar Som'}
          >
            {soundOn ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main Game Play Area - Flex and Scroll-Safe */}
      <main className="relative flex-1 w-full min-h-0 flex flex-col items-center justify-center p-3 sm:p-8 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Game Over / Victory Modal - Enhanced scale for Totem Touch Displays */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
          <div className={`w-full max-w-md sm:max-w-xl my-auto ${isLightMode ? 'bg-white border-4 border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-4 border-white/20 text-white shadow-2xl'} rounded-3xl sm:rounded-[36px] p-6 sm:p-10 flex flex-col items-center text-center max-h-[94vh] max-h-[94dvh] overflow-y-auto no-scrollbar`}>
            <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mb-3 shadow-xl shadow-amber-500/40 animate-bounce-subtle flex-shrink-0">
              <Trophy className="w-8 h-8 sm:w-11 sm:h-11 text-slate-950" />
            </div>

            <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-1">
              {gameWon ? 'Parabéns!' : 'Fim de Jogo!'}
            </h3>
            
            <p className={`${isLightMode ? 'text-slate-600' : 'text-slate-300'} text-sm sm:text-lg mb-4 sm:mb-6`}>
              Você completou o desafio <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>{title}</strong>.
            </p>

            <div className={`w-full ${isLightMode ? 'bg-slate-50 border-2 border-slate-200' : 'bg-slate-800/95 border-2 border-white/15'} rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 flex-shrink-0 shadow-inner`}>
              <span className={`text-xs sm:text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'} font-black uppercase tracking-widest`}>Pontuação Final</span>
              <div className="text-4xl sm:text-6xl font-black text-amber-500 tracking-tight mt-1 font-mono drop-shadow-sm">
                {score} <span className={`text-sm sm:text-lg ${isLightMode ? 'text-slate-500' : 'text-slate-400'} font-normal`}>{customScoreLabel}</span>
              </div>
            </div>

            {/* Ranking Action - Touch Virtual Keyboard Only */}
            {rankingEnabled && onSubmitScore && !scoreSubmitted && (
              <div className="w-full mb-4 sm:mb-6 flex flex-col items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowKeyboard(true);
                  }}
                  className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/35 hover:to-yellow-500/35 border-2 border-amber-400/50 text-amber-300 font-black text-base sm:text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
                >
                  <Keyboard className="w-6 h-6 text-amber-400" />
                  <span>Gravar Recorde no Ranking</span>
                </button>
              </div>
            )}

            {scoreSubmitted && (
              <div className="w-full py-3.5 sm:py-4 mb-4 sm:mb-6 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-2xl text-emerald-300 text-sm sm:text-base font-black flex items-center justify-center gap-2 flex-shrink-0 shadow-sm">
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
                className="flex-1 py-4 sm:py-5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all font-black text-sm sm:text-lg flex items-center justify-center gap-2 border-2 border-white/15"
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
                className="flex-1 py-4 sm:py-5 px-4 rounded-2xl font-black text-sm sm:text-lg text-white active:scale-95 transition-all shadow-xl hover:brightness-110 border-2 border-white/20"
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-Screen Touch Virtual Keyboard for Totem (Zero physical keyboard required) */}
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
  );
};
