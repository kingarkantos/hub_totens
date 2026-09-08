import React, { useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Trophy, RotateCcw, Keyboard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../lib/audio';
import { TouchVirtualKeyboard } from '../components/TouchVirtualKeyboard';

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
}) => {
  const [soundOn, setSoundOn] = React.useState(sound.enabled);
  const [playerName, setPlayerName] = React.useState('');
  const [showKeyboard, setShowKeyboard] = React.useState(false);
  const [scoreSubmitted, setScoreSubmitted] = React.useState(false);

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
    <div className="fixed inset-0 w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden z-40">
      {/* Top Bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-white/10 backdrop-blur-md z-30">
        <button
          onClick={() => {
            sound.playClick();
            onExit();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs sm:text-sm font-semibold tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Sair</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{category}</span>
          <h2 className="text-base sm:text-xl font-black tracking-tight">{title}</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {timeRemaining !== undefined && (
            <div className="px-2.5 sm:px-3.5 py-1 rounded-xl bg-slate-800/90 border border-white/10 flex items-center gap-1 font-mono text-xs sm:text-base font-bold text-amber-400">
              <span>⏱️</span>
              <span>{timeRemaining}s</span>
            </div>
          )}

          <div className="px-2.5 sm:px-3.5 py-1 rounded-xl bg-white/10 border border-white/15 flex items-center gap-1 font-bold text-xs sm:text-base">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>{score}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">{customScoreLabel}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-300"
            title={soundOn ? 'Desativar Som' : 'Ativar Som'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Main Game Play Area - Flex and Scroll-Safe */}
      <main className="relative flex-1 w-full min-h-0 flex flex-col items-center justify-center p-2 sm:p-6 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Game Over / Victory Modal - Always fully scrollable & visible without clipping */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
          <div className="w-full max-w-sm my-auto bg-slate-900 border-2 border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center text-center max-h-[94vh] max-h-[94dvh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/30 animate-bounce-subtle flex-shrink-0">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950" />
            </div>

            <h3 className="text-lg sm:text-2xl font-black tracking-tight mb-0.5">
              {gameWon ? 'Parabéns!' : 'Fim de Jogo!'}
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-sm mb-3">
              Você completou o desafio <strong className="text-white">{title}</strong>.
            </p>

            <div className="w-full bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 border border-white/10 mb-3 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pontuação Final</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-0.5 font-mono">
                {score} <span className="text-xs text-slate-400 font-normal">{customScoreLabel}</span>
              </div>
            </div>

            {/* Ranking Action - Touch Virtual Keyboard Only */}
            {rankingEnabled && onSubmitScore && !scoreSubmitted && (
              <div className="w-full mb-3 flex flex-col items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowKeyboard(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <Keyboard className="w-4 h-4 text-amber-400" />
                  <span>Gravar Recorde no Ranking</span>
                </button>
              </div>
            )}

            {scoreSubmitted && (
              <div className="w-full py-2 mb-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 flex-shrink-0">
                <span>✓</span> Recorde de {playerName || 'Jogador'} registrado!
              </div>
            )}

            <div className="flex w-full gap-2 mt-auto pt-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setScoreSubmitted(false);
                  setPlayerName('');
                  onRestart();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Jogar Novamente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onExit();
                }}
                style={{ backgroundColor: themePrimary }}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white active:scale-95 transition-all shadow-lg hover:brightness-110"
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
