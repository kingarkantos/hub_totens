import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, Trophy, Play, Sparkles, ArrowLeft, Volume2, VolumeX, Flame, ShieldAlert, Home, ChevronDown } from 'lucide-react';
import { Campaign, GameDefinition, ThemeDefinition, CustomColorsConfig } from '../types';
import { supabase, TABLES } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { GAMES_CATALOG, GAME_CATEGORIES } from '../lib/gamesCatalog';
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
import { MathBlitzGame } from '../games/MathBlitzGame';
import { HigherLowerGame } from '../games/HigherLowerGame';
import { ReactionTimeGame } from '../games/ReactionTimeGame';
import { BullseyeGame } from '../games/BullseyeGame';

interface ScrollableDescriptionProps {
  description: string;
  alignClass: string;
  sizeClass: string;
}

const ScrollableDescription: React.FC<ScrollableDescriptionProps> = ({
  description,
  alignClass,
  sizeClass,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkOverflow = () => {
      const isOverflowing = el.scrollHeight > el.clientHeight + 10;
      setCanScroll(isOverflowing);
    };

    checkOverflow();

    const ro = new ResizeObserver(() => {
      checkOverflow();
    });
    ro.observe(el);

    const timer = setTimeout(checkOverflow, 250);

    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, [description]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 15) {
      setHasScrolled(true);
    }
  };

  const handleIndicatorClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: 140, behavior: 'smooth' });
      setHasScrolled(true);
    }
  };

  return (
    <div className="relative mt-4 w-full max-w-2xl sm:max-w-3xl">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchMove={() => setHasScrolled(true)}
        onWheel={(e) => {
          if (e.deltaY > 5) setHasScrolled(true);
        }}
        className={`max-h-[35vh] sm:max-h-[42vh] overflow-y-auto px-6 py-5 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/20 shadow-2xl text-slate-200 font-medium leading-relaxed whitespace-pre-line no-scrollbar ${alignClass} ${sizeClass}`}
      >
        {description}
      </div>

      {/* Sombra sutil de fade na borda inferior indicando continuidade */}
      {canScroll && (
        <div
          className={`absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/85 via-black/40 to-transparent rounded-b-3xl pointer-events-none transition-opacity duration-300 ${
            hasScrolled ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Pill informativo animado para o usuário deslizar */}
      {canScroll && (
        <div
          className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-out ${
            hasScrolled
              ? 'opacity-0 translate-y-3 pointer-events-none'
              : 'opacity-100 translate-y-0 pointer-events-auto'
          }`}
        >
          <button
            type="button"
            onClick={handleIndicatorClick}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 hover:bg-black text-white border border-white/30 shadow-2xl backdrop-blur-md text-xs font-semibold tracking-wide cursor-pointer active:scale-95 transition-all select-none group"
          >
            <span className="text-slate-200">Deslize para ler mais</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
};

interface TotemCampaignViewProps {
  slug: string;
}

export const TotemCampaignView: React.FC<TotemCampaignViewProps> = ({ slug }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [inSplash, setInSplash] = useState(true);
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
          .maybeSingle();

        if (error || !data || data.active === false) {
          // If deleted or inactive, deactivate the link
          setCampaign(null);
        } else {
          setCampaign(data as Campaign);
        }

        // Fetch idle timeout
        const { data: timeoutSetting } = await supabase
          .from(TABLES.SETTINGS)
          .select('value')
          .eq('key', 'idle_timeout_seconds')
          .maybeSingle();

        if (timeoutSetting?.value) {
          setIdleSeconds(Number(timeoutSetting.value) || 90);
        }
      } catch (err) {
        console.error(err);
        setCampaign(null);
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
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white p-6 text-center select-none overflow-y-auto">
        <div className="max-w-md sm:max-w-lg w-full bg-slate-900/90 border-2 border-white/15 rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Glowing Status Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border-2 border-amber-500/40 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
          </div>

          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
            Link Desativado
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            Campanha Indisponível
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
            A campanha vinculada ao link <span className="text-amber-400 font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg">/{slug}</span> não está ativa no momento. Ela pode ter sido encerrada ou excluída pelo administrador.
          </p>

          <div className="w-full pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                window.location.href = '/';
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
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

  const availableCategories = GAME_CATEGORIES.filter((cat) =>
    gamesList.some((g) => g.categoryId === cat.id || g.category === cat.name)
  );

  const displayedGames = selectedCategory === 'all'
    ? gamesList
    : gamesList.filter((g) => g.categoryId === selectedCategory || g.category === selectedCategory);

  // Active Game Render
  if (activeGame) {
    const orderMode = campaign.games_config?.order_mode || 'random';
    const gameTimer = campaign.games_config?.[`${activeGame.id}_time_limit`];
    const gameTotalTimer = campaign.games_config?.[`${activeGame.id}_total_time_limit`];

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
      totalTimeLimit: gameTotalTimer !== undefined ? Number(gameTotalTimer) : undefined,
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
      case 'math_blitz':
        return <MathBlitzGame {...commonProps} />;
      case 'higher_lower':
        return <HigherLowerGame {...commonProps} />;
      case 'reaction_time':
        return <ReactionTimeGame {...commonProps} />;
      case 'bullseye':
        return <BullseyeGame {...commonProps} />;
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
            {campaign.description && (() => {
              const descAlign = campaign.games_config?.description_align || 'left';
              const descSize = campaign.games_config?.description_size || 'md';

              const alignClass = descAlign === 'center'
                ? 'text-center'
                : descAlign === 'right'
                ? 'text-right'
                : descAlign === 'justify'
                ? 'text-justify'
                : 'text-left';

              const sizeClass = descSize === 'sm'
                ? 'text-xs sm:text-sm'
                : descSize === 'lg'
                ? 'text-base sm:text-lg'
                : 'text-sm sm:text-base';

              const hasMultipleLines = campaign.description.includes('\n') || campaign.description.length > 120;

              if (hasMultipleLines) {
                return (
                  <ScrollableDescription
                    description={campaign.description}
                    alignClass={alignClass}
                    sizeClass={sizeClass}
                  />
                );
              }

              return (
                <p className={`mt-4 max-w-2xl font-medium drop-shadow leading-relaxed whitespace-pre-line text-slate-300 ${alignClass} ${sizeClass}`}>
                  {campaign.description}
                </p>
              );
            })()}
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

              {campaign.splash_image_url && (
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 ${isLight ? 'border-slate-300 shadow-xs' : 'border-white/20 shadow-md'} bg-black/20 flex-shrink-0`}>
                  <img
                    src={campaign.splash_image_url}
                    alt={campaign.client_name || campaign.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

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

          {/* Category Filter Tabs Bar for Totem Touch */}
          {availableCategories.length > 1 && (
            <div className={`px-6 py-3.5 ${isLight ? 'bg-white/80 border-b border-slate-200/80 backdrop-blur-md' : 'bg-black/30 border-b border-white/10 backdrop-blur-md'} z-10 overflow-x-auto no-scrollbar`}>
              <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
                {/* "Todos" Tab */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory('all');
                  }}
                  style={selectedCategory === 'all' ? {
                    backgroundColor: theme.primary,
                    boxShadow: `0 0 20px ${theme.glowColor}60`,
                  } : {}}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all flex-shrink-0 active:scale-95 ${
                    selectedCategory === 'all'
                      ? 'text-white shadow-md'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                  }`}
                >
                  <span>Todos os Jogos</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    selectedCategory === 'all' ? 'bg-black/30 text-white' : isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/15 text-slate-300'
                  }`}>
                    {gamesList.length}
                  </span>
                </button>

                {/* Specific Category Tabs */}
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = gamesList.filter((g) => g.categoryId === cat.id || g.category === cat.name).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedCategory(cat.id);
                      }}
                      style={isSelected ? {
                        backgroundColor: theme.primary,
                        boxShadow: `0 0 20px ${theme.glowColor}60`,
                      } : {}}
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all flex-shrink-0 active:scale-95 ${
                        isSelected
                          ? 'text-white shadow-md'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-black/30 text-white' : isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/15 text-slate-300'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Games List (Stacked vertically, big and highlighted for Totems) */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar max-w-4xl mx-auto w-full">
            {displayedGames.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <p className="text-slate-400 font-bold mb-4">Nenhum jogo habilitado nesta categoria.</p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  Ver Todos os Jogos
                </button>
              </div>
            ) : (
              displayedGames.map((game, index) => (
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
                        {(() => {
                          const cfgPerQuestion = campaign.games_config?.[`${game.id}_time_limit`];
                          const cfgTotal = campaign.games_config?.[`${game.id}_total_time_limit`];
                          const isQuestionGame = ['quiz', 'truefalse', 'speed_trivia', 'complete_phrase', 'math_blitz'].includes(game.id);

                          let timeDisplay = game.estimatedTime;
                          if (cfgPerQuestion !== undefined) {
                            if (cfgPerQuestion === 0) {
                              timeDisplay = cfgTotal ? `${cfgTotal} seg total` : 'Sem tempo';
                            } else {
                              timeDisplay = isQuestionGame ? `${cfgPerQuestion} seg` : `${cfgPerQuestion} seg`;
                            }
                          } else if (cfgTotal !== undefined) {
                            timeDisplay = `${cfgTotal} seg total`;
                          }

                          return (
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${isLight ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-300 bg-black/40 border-white/10'}`}>
                              ⏱️ {timeDisplay}
                            </span>
                          );
                        })()}
                        <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Dificuldade: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{game.difficulty}</strong>
                        </span>
                      </div>

                      <h3 className={`text-2xl sm:text-3xl font-black tracking-tight group-hover:opacity-90 transition-colors ${theme.textColor}`}>
                        {game.name}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {game.description}
                      </p>
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
              ))
            )}
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
