import React, { useState, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { sound } from '../lib/audio';
import { BaseGameProps } from '../types';
import { ArrowUp, ArrowDown, Heart, Flame, Sparkles, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

interface HigherLowerGameProps extends BaseGameProps {
  customContent?: any;
}

interface MetricCard {
  title: string;
  value: number;
  unit: string;
  category: string;
}

const METRIC_CARDS_POOL: MetricCard[] = [
  { title: 'Potência Máxima', value: 182, unit: 'cv', category: 'Desempenho' },
  { title: 'Torque do Motor', value: 240, unit: 'Nm', category: 'Força' },
  { title: 'Velocidade Final', value: 210, unit: 'km/h', category: 'Pista' },
  { title: 'Autonomia Total', value: 650, unit: 'km', category: 'Eficiência' },
  { title: 'Capacidade do Porta-Malas', value: 519, unit: 'litros', category: 'Espaço' },
  { title: 'Eficiência Energética', value: 92, unit: '%', category: 'Sustentável' },
  { title: 'Aceleração 0-100', value: 85, unit: 'décimos', category: 'Arrancada' },
  { title: 'Nota de Segurança Teste', value: 98, unit: 'pontos', category: 'Proteção' },
  { title: 'Garantia de Fábrica', value: 60, unit: 'meses', category: 'Confiança' },
  { title: 'Economia Urbana', value: 16, unit: 'km/l', category: 'Consumo' },
  { title: 'Pressão dos Pneus Recomendada', value: 32, unit: 'psi', category: 'Manutenção' },
  { title: 'Tempo de Resposta dos Freios', value: 45, unit: 'ms', category: 'Precisão' },
  { title: 'Tela Touch do Painel', value: 12, unit: 'pol', category: 'Tecnologia' },
  { title: 'Airbags de Série', value: 8, unit: 'unid', category: 'Segurança' },
  { title: 'Satisfação dos Clientes', value: 96, unit: '%', category: 'Avaliação' },
  { title: 'Autonomia no Modo Elétrico', value: 110, unit: 'km', category: 'Bateria' },
  { title: 'Potência Combinada Híbrida', value: 215, unit: 'cv', category: 'Inovação' },
  { title: 'Ângulo de Visão da Câmera', value: 180, unit: 'graus', category: 'Assistente' },
];

const getRandomCard = (excludeValue?: number): MetricCard => {
  const available = METRIC_CARDS_POOL.filter((c) => c.value !== excludeValue);
  const selected = available[Math.floor(Math.random() * available.length)];
  // Add a slight random variance to ensure dynamic values
  const variance = Math.floor(Math.random() * 11) - 5;
  const finalValue = Math.max(5, selected.value + variance);
  return { ...selected, value: finalValue };
};

export const HigherLowerGame: React.FC<HigherLowerGameProps> = ({
  onExit,
  rankingEnabled,
  onSubmitScore,
  themePrimary = '#3B82F6',
  theme,
  customBgStyle,
  campaignName,
  clientName,
  splashImageUrl,
  isLight,
  themeMode,
  totalTimeLimit,
  gameLayout,
}) => {
  const initialTime = totalTimeLimit !== undefined && totalTimeLimit > 0 ? totalTimeLimit : 45;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentCard, setCurrentCard] = useState<MetricCard>(() => getRandomCard());
  const [nextCard, setNextCard] = useState<MetricCard | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const isLightMode = isLight ?? (themeMode === 'light');

  // Countdown timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (gameOver || feedback !== null) return;

    const drawnCard = getRandomCard(currentCard.value);
    setNextCard(drawnCard);

    const isHigher = drawnCard.value > currentCard.value;
    const isLower = drawnCard.value < currentCard.value;
    const isTie = drawnCard.value === currentCard.value;

    const isCorrect = (guess === 'higher' && isHigher) || (guess === 'lower' && isLower) || isTie;

    if (isCorrect) {
      sound.playSuccess();
      const earned = 150 + streak * 50;
      setScore((s) => s + earned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setFeedback('correct');
    } else {
      sound.playError();
      setStreak(0);
      setFeedback('wrong');
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 900);
      }
    }

    setTimeout(() => {
      setCurrentCard(drawnCard);
      setNextCard(null);
      setFeedback(null);
    }, 950);
  };

  const restart = () => {
    setTimeLeft(initialTime);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setGameOver(false);
    setFeedback(null);
    setNextCard(null);
    setCurrentCard(getRandomCard());
  };

  return (
    <GameContainer
      title="Maior ou Menor"
      category="Cálculo & Lógica Numérica"
      score={score}
      timeRemaining={timeLeft}
      gameOver={gameOver}
      gameWon={score > 300}
      onRestart={restart}
      onExit={onExit}
      rankingEnabled={rankingEnabled}
      onSubmitScore={(name) => onSubmitScore && onSubmitScore(name, score)}
      correctAnswers={maxStreak}
      customScoreLabel="Pontos"
      themePrimary={themePrimary}
      theme={theme}
      customBgStyle={customBgStyle}
      campaignName={campaignName}
      clientName={clientName}
      splashImageUrl={splashImageUrl}
      isLight={isLight}
      themeMode={themeMode}
      gameLayout={gameLayout}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Top HUD: Lives & Streak */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* Lives hearts */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-xs font-bold uppercase text-slate-300 mr-1">Vidas:</span>
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-5 h-5 transition-transform ${
                  heart <= lives
                    ? 'text-rose-500 fill-rose-500 scale-110'
                    : 'text-slate-600 scale-90 opacity-40'
                }`}
              />
            ))}
          </div>

          {/* Current Streak with fire */}
          <div
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl transition-all ${
              streak > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 scale-105 animate-pulse'
                : 'bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              Sequência: {streak}
            </span>
          </div>
        </div>

        {/* Center Cards Comparison Display */}
        <div className="w-full max-w-2xl my-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
          {/* Card 1: Reference Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 transition-all shadow-2xl flex flex-col items-center text-center select-none ${
              isLightMode
                ? 'bg-white/95 border-slate-200 text-slate-900'
                : 'bg-slate-900/90 border-white/20 text-white'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-3">
              {currentCard.category}
            </span>

            <h3 className="text-base sm:text-lg font-bold text-slate-400 mb-2">
              {currentCard.title}
            </h3>

            <div className="my-2">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow">
                {currentCard.value}
              </span>
              <span className="text-lg font-bold text-blue-400 ml-2 font-mono">
                {currentCard.unit}
              </span>
            </div>

            <span className="text-xs text-slate-500 mt-2 font-semibold">
              Valor de Referência
            </span>
          </div>

          {/* Card 2: Next Card / Prediction Target */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 transition-all shadow-2xl flex flex-col items-center justify-center text-center relative select-none overflow-hidden ${
              feedback === 'correct'
                ? 'bg-emerald-500/20 border-emerald-400 scale-[1.02]'
                : feedback === 'wrong'
                ? 'bg-rose-500/20 border-rose-400 scale-[0.98]'
                : isLightMode
                ? 'bg-slate-50/90 border-dashed border-slate-300 text-slate-800'
                : 'bg-slate-900/60 border-dashed border-white/20 text-white'
            }`}
          >
            {nextCard ? (
              <div className="animate-in zoom-in duration-200 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-3">
                  {nextCard.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-400 mb-2">
                  {nextCard.title}
                </h3>
                <div className="my-2">
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow">
                    {nextCard.value}
                  </span>
                  <span className="text-lg font-bold text-indigo-400 ml-2 font-mono">
                    {nextCard.unit}
                  </span>
                </div>
                {feedback === 'correct' ? (
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-4 h-4" /> Acertou!
                  </span>
                ) : (
                  <span className="text-xs font-black text-rose-400 flex items-center gap-1 mt-2">
                    <XCircle className="w-4 h-4" /> Errou!
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 animate-pulse">
                  <TrendingUp className="w-8 h-8 text-amber-400" />
                </div>
                <h4 className="text-lg font-black tracking-wide">Próximo Valor</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Será <strong>MAIOR</strong> ou <strong>MENOR</strong> que {currentCard.value} {currentCard.unit}?
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Big Touch CTA Buttons: HIGHER / LOWER */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 pb-2">
          {/* HIGHER BUTTON */}
          <button
            type="button"
            onClick={() => handleGuess('higher')}
            disabled={feedback !== null || gameOver}
            className="py-6 sm:py-8 px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xl sm:text-2xl tracking-wider uppercase shadow-xl shadow-emerald-600/30 border-2 border-emerald-400/50 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowUp className="w-6 h-6 stroke-[3]" />
            </div>
            <span>MAIOR ⬆️</span>
          </button>

          {/* LOWER BUTTON */}
          <button
            type="button"
            onClick={() => handleGuess('lower')}
            disabled={feedback !== null || gameOver}
            className="py-6 sm:py-8 px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-95 text-white font-black text-xl sm:text-2xl tracking-wider uppercase shadow-xl shadow-rose-600/30 border-2 border-rose-400/50 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowDown className="w-6 h-6 stroke-[3]" />
            </div>
            <span>MENOR ⬇️</span>
          </button>
        </div>
      </div>
    </GameContainer>
  );
};
