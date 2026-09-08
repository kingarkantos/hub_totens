import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, Trophy, Play, Sparkles, ArrowLeft, Volume2, VolumeX, Flame } from 'lucide-react';
import { Campaign, GameDefinition, ThemeDefinition, CustomColorsConfig } from '../types';
import { supabase, TABLES } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { GAMES_CATALOG } from '../lib/gamesCatalog';
import { sound } from '../lib/audio';
import { LeaderboardModal } from '../components/LeaderboardModal';

// Games
import { WheelGame } from '../games/WheelGame';
import { QuizGame } from '../games/QuizGame';
import { TargetGame } from '../games/TargetGame';
import { MemoryGame } from '../games/MemoryGame';
import { CatcherGame } from '../games/CatcherGame';
import { SpeedGame } from '../games/SpeedGame';
import { SafeGame } from '../games/SafeGame';
import { GeniusGame } from '../games/GeniusGame';
import { PuzzleGame } from '../games/PuzzleGame';
import { BalloonGame } from '../games/BalloonGame';
import { WordSearchGame } from '../games/WordSearchGame';
import { HangmanGame } from '../games/HangmanGame';
import { TrueFalseGame } from '../games/TrueFalseGame';
import { CompletePhraseGame } from '../games/CompletePhraseGame';
import { CorrectOrderGame } from '../games/CorrectOrderGame';
import { ConnectPairsGame } from '../games/ConnectPairsGame';
import { SpeedTriviaGame } from '../games/SpeedTriviaGame';
import { SpotErrorGame } from '../games/SpotErrorGame';
import { MapEpiGame } from '../games/MapEpiGame';

interface TotemCampaignViewProps {
  slug: string;
}

export const TotemCampaignView: React.FC<TotemCampaignViewProps> = ({ slug }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [inSplash, setInSplash] = useState(true);
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [idleSeconds, setIdleSeconds] = useState(90);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch campaign by slug
  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(TABLES.CAMPAIGNS)
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          console.warn('Campaign not found in Supabase, using fallback');
          // Fallback demo
          setCampaign({
            id: 'demo-campaign',
            slug,
            name: 'Campanha Interativa Totem',
            client_name: 'Ativação Oficial',
            description: 'Experimente nossos jogos exclusivos no totem!',
            splash_image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=80',
            theme_id: 'honda-red',
            selected_games: GAMES_CATALOG.map((g) => g.id),
            ranking_enabled: true,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setCampaign(data as Campaign);
        }

        // Fetch idle timeout
        const { data: timeoutSetting } = await supabase
          .from(TABLES.SETTINGS)
          .select('value')
          .eq('key', 'idle_timeout_seconds')
          .single();

        if (timeoutSetting?.value) {
          setIdleSeconds(Number(timeoutSetting.value) || 90);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [slug]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Idle Timer Reset (returns to Splash on touch inactivity)
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!inSplash && !activeGame) {
      idleTimerRef.current = setTimeout(() => {
        setInSplash(true);
      }, idleSeconds * 1000);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    const touchListener = () => resetIdleTimer();
    window.addEventListener('pointerdown', touchListener);
    window.addEventListener('keydown', touchListener);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('pointerdown', touchListener);
      window.removeEventListener('keydown', touchListener);
    };
  }, [inSplash, activeGame, idleSeconds]);

  // Submit Ranking Score to Supabase (Player Name and Score only - no phone/contact)
  const handleScoreSubmit = async (playerName: string, score: number) => {
    if (!campaign || !activeGame) return;
    try {
      await supabase.from(TABLES.RANKINGS).insert({
        campaign_id: campaign.id,
        game_id: activeGame.id,
        player_name: playerName.trim(),
        score,
      });

      // Log analytics event
      await supabase.from(TABLES.ANALYTICS).insert({
        campaign_id: campaign.id,
        event_type: 'game_completed',
        game_id: activeGame.id,
      });
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-wider uppercase animate-pulse">Carregando Totem...</h2>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <h2 className="text-3xl font-black text-rose-500 mb-2">Campanha Não Encontrada</h2>
        <p className="text-slate-400">A campanha /{slug} não existe ou está desativada.</p>
      </div>
    );
  }

  const baseTheme = THEMES[campaign.theme_id] || THEMES['honda-red'];
  const customColors: CustomColorsConfig | undefined = campaign.games_config?.custom_colors;
  const isCustomActive = !!(customColors && customColors.enabled);

  const isLight = 
    campaign.games_config?.theme_mode === 'light' || 
    campaign.theme_mode === 'light' || 
    (isCustomActive && customColors?.bgType === 'light') ||
    (!isCustomActive && campaign.games_config?.theme_mode === 'light') ||
    customColors?.bgType === 'light';

  const theme: ThemeDefinition = {
    ...baseTheme,
    name: isCustomActive ? 'Personalizado' : baseTheme.name,
    primary: isCustomActive ? (customColors?.primary || baseTheme.primary) : baseTheme.primary,
    secondary: isCustomActive ? (customColors?.secondary || baseTheme.secondary) : baseTheme.secondary,
    accent: isCustomActive ? (customColors?.accent || baseTheme.accent) : baseTheme.accent,
    glowColor: isCustomActive ? (customColors?.glowColor || baseTheme.glowColor) : baseTheme.glowColor,
    bgGradient: isLight
      ? 'from-slate-100 via-slate-50 to-slate-200'
      : (isCustomActive && customColors?.bgType === 'custom')
      ? ''
      : baseTheme.bgGradient || 'from-slate-950 via-slate-900 to-black',
    cardBg: isLight
      ? 'bg-white/95 text-slate-900 shadow-xl'
      : baseTheme.cardBg || 'bg-slate-900/80 text-white',
    cardBorder: isLight
      ? 'border-slate-200 hover:border-slate-300 shadow-sm'
      : baseTheme.cardBorder || 'border-white/10 hover:border-white/30',
    textColor: isLight ? 'text-slate-900' : (baseTheme.textColor || 'text-white'),
    badgeBg: isLight
      ? 'bg-slate-100 text-slate-800 border-slate-300'
      : baseTheme.badgeBg || 'bg-white/10 text-white border-white/20',
  };

  const customBgStyle: React.CSSProperties =
    isCustomActive && customColors.bgType === 'custom'
      ? {
          background: `linear-gradient(to bottom, ${customColors.bgFrom || '#0F172A'}, ${customColors.bgTo || '#020617'})`,
        }
      : {};

  const customButtonGradientStyle: React.CSSProperties = isCustomActive
    ? {
        background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
      }
    : {};

  const gamesList = GAMES_CATALOG.filter((g) => campaign.selected_games.includes(g.id));

  // Active Game Render
  if (activeGame) {
    const orderMode = campaign.games_config?.order_mode || 'random';
    const gameTimer = campaign.games_config?.[`${activeGame.id}_time_limit`];

    const commonProps = {
      onExit: () => setActiveGame(null),
      rankingEnabled: campaign.ranking_enabled,
      onSubmitScore: (name: string, score: number) =>
        handleScoreSubmit(name, score),
      themePrimary: theme.primary,
      theme,
      isLight,
      themeMode: (isLight ? 'light' : 'dark') as 'light' | 'dark',
      orderMode: orderMode as 'random' | 'ordered',
      timeLimit: gameTimer !== undefined ? Number(gameTimer) : undefined,
      customBgStyle,
      campaignName: campaign.name,
      clientName: campaign.client_name,
      splashImageUrl: campaign.splash_image_url,
      customContent: campaign.games_config?.[activeGame.id],
    };

    switch (activeGame.id) {
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
      default:
        return null;
    }
  }

  return (
    <div
      style={{
        '--glow-color': theme.glowColor,
        ...customBgStyle,
      } as React.CSSProperties}
      className={`fixed inset-0 w-full h-full overflow-hidden select-none bg-gradient-to-b ${theme.bgGradient} ${theme.textColor} ${theme.fontClass}`}
    >
      {/* Floating Top Control Bar (Fullscreen Button only) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-slate-200 active:scale-95 transition-all shadow-lg"
          title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia do Totem'}
        >
          {isFullscreen ? <Minimize className="w-5 h-5 text-amber-400" /> : <Maximize className="w-5 h-5 text-slate-200" />}
        </button>
      </div>

      {/* 1. SPLASH SCREEN VIEW */}
      {inSplash ? (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-8 text-center animate-in fade-in duration-500 overflow-hidden">
          {/* Background image with gradient vignette overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={campaign.splash_image_url}
              alt={campaign.name}
              className="w-full h-full object-cover brightness-[0.4] contrast-125 scale-105 transition-transform duration-10000 animate-float"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${theme.bgGradient} opacity-90`} />
            <div className="absolute inset-0 bg-radial-vignette opacity-80" />
          </div>

          {/* Top Brand Logo / Client */}
          <div className="relative z-10 pt-8 flex flex-col items-center animate-in slide-in-from-top-6 duration-700">
            <div className="px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs sm:text-sm font-black tracking-widest uppercase mb-3 flex items-center gap-2 shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{campaign.client_name}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl max-w-3xl leading-tight">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-sm sm:text-lg text-slate-300 mt-4 max-w-xl font-medium drop-shadow leading-relaxed">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Central Interactive Touch CTA */}
          <div className="relative z-10 my-auto flex flex-col items-center">
            <button
              onClick={() => {
                sound.playSuccess();
                setInSplash(false);
              }}
              style={{
                boxShadow: `0 0 50px ${theme.glowColor}, 0 20px 40px rgba(0,0,0,0.6)`,
                ...customButtonGradientStyle,
              }}
              className={`py-6 px-12 sm:px-16 rounded-3xl ${!isCustomActive ? `bg-gradient-to-r ${theme.buttonGradient}` : ''} text-white font-black text-2xl sm:text-3xl tracking-wider uppercase border-2 border-white/40 active:scale-95 transition-all flex items-center gap-4 animate-totem-pulse`}
            >
              <Play className="w-8 h-8 fill-current" />
              <span>TOQUE PARA JOGAR</span>
            </button>

            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mt-4 animate-pulse">
              🎮 {gamesList.length} Desafios Interativos Disponíveis
            </span>
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 pb-6 text-xs text-slate-400 font-bold tracking-widest uppercase">
            Totem Interativo • Toque na tela para iniciar a sua experiência
          </div>
        </div>
      ) : (
        /* 2. TOTEM GAMES SELECTION VIEW */
        <div className="relative w-full h-full flex flex-col animate-in fade-in duration-300">
          {/* Totem Header */}
          <header className={`flex items-center justify-between px-6 py-5 ${isLight ? 'bg-white/90 border-b border-slate-200/80 backdrop-blur-xl text-slate-900 shadow-xs' : 'bg-black/40 border-b border-white/10 backdrop-blur-xl text-white'} z-20`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setInSplash(true);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white'} active:scale-95 transition-all text-xs font-bold`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Início</span>
              </button>

              <div>
                <span 
                  style={{ color: theme.primary }}
                  className="text-[11px] font-black uppercase tracking-widest block"
                >
                  {campaign.client_name}
                </span>
                <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'} leading-tight`}>
                  {campaign.name}
                </h2>
              </div>
            </div>

            {/* Leaderboard button if enabled */}
            {campaign.ranking_enabled && (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowLeaderboard(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                <Trophy className="w-4 h-4 fill-current" />
                <span>Quadro de Líderes</span>
              </button>
            )}
          </header>

          {/* Subtitle / Instructions banner */}
          <div className={`px-6 py-3 ${isLight ? 'bg-slate-100/90 border-b border-slate-200 text-slate-700' : 'bg-white/5 border-b border-white/5 text-slate-300'} flex items-center justify-between text-xs font-bold`}>
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Escolha um jogo abaixo e toque para começar a diversão!</span>
            </span>
            <span className={isLight ? 'text-slate-500 font-mono' : 'text-slate-400 font-mono'}>
              Totem Ativo • {gamesList.length} Jogos
            </span>
          </div>

          {/* Games List (Stacked vertically, big and highlighted for Totems) */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar max-w-4xl mx-auto w-full">
            {gamesList.map((game, index) => (
              <div
                key={game.id}
                onClick={() => {
                  sound.playClick();
                  setActiveGame(game);
                }}
                className={`relative group rounded-3xl border-2 p-6 sm:p-8 cursor-pointer transition-all duration-300 active:scale-98 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}
              >
                {/* Background decorative glow on hover */}
                <div
                  style={{ backgroundColor: theme.primary }}
                  className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                />

                {/* Left Side: Game Number, Badge & Details */}
                <div className="flex items-start gap-5 z-10 w-full sm:w-auto">
                  <div
                    style={{ color: theme.primary }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${isLight ? 'bg-slate-100 border border-slate-200 shadow-xs' : 'bg-gradient-to-br from-white/15 to-white/5 border border-white/20 text-amber-400 shadow-inner'} flex items-center justify-center font-black text-2xl sm:text-3xl flex-shrink-0`}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                        {game.category}
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${isLight ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-300 bg-black/40 border-white/10'}`}>
                        ⏱️ {game.estimatedTime}
                      </span>
                      <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Dificuldade: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{game.difficulty}</strong>
                      </span>
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-black tracking-tight group-hover:opacity-90 transition-colors ${theme.textColor}`}>
                      {game.name}
                    </h3>
                  </div>
                </div>

                {/* Right Side: Big Highlighted Play Button */}
                <div className="z-10 w-full sm:w-auto flex-shrink-0">
                  <button
                    style={{
                      backgroundColor: theme.primary,
                      boxShadow: `0 10px 30px -5px ${theme.glowColor}70`,
                    }}
                    className="w-full sm:w-auto py-4 px-8 rounded-2xl text-white font-black text-lg tracking-wider uppercase shadow-xl flex items-center justify-center gap-3 transition-transform group-hover:scale-105 group-hover:brightness-110 active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>JOGAR AGORA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          campaignId={campaign.id}
          onClose={() => setShowLeaderboard(false)}
          themePrimary={theme.primary}
        />
      )}
    </div>
  );
};
