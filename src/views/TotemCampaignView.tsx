import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, Trophy, Play, ArrowLeft, Volume2, VolumeX, Flame, ShieldAlert, Home, ChevronDown } from 'lucide-react';
import { Campaign, GameDefinition, ThemeDefinition, CustomColorsConfig, SplashButtonStyleId } from '../types';
import { supabase, TABLES } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { GAMES_CATALOG, GAME_CATEGORIES } from '../lib/gamesCatalog';
import { sound } from '../lib/audio';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { GameCardThumbnail } from '../components/GameCardThumbnail';
import { GameLayoutProvider } from '../context/GameLayoutContext';
import { BackgroundEffectOverlay, BackgroundEffectId } from '../components/BackgroundEffectOverlay';
import { GameLayoutId } from '../types/gameLayouts';
import { generateLayoutPalette } from '../lib/colorHarmony';

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
  layout?: GameLayoutId;
}

interface SplashDescriptionStyleConfig {
  wrapperClass: string;
  cardClass: string;
  badge?: {
    text: string;
    className: string;
  };
  fadeClass: string;
  indicatorClass: string;
  style?: React.CSSProperties;
}

const getSplashDescriptionStyle = (layout: GameLayoutId = 'modern_glass'): SplashDescriptionStyleConfig => {
  switch (layout) {
    case 'cartoon_comic':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-3xl border-4 border-black bg-white/95 text-slate-900 shadow-[8px_8px_0_#000] font-bold p-6 sm:p-7 leading-relaxed backdrop-blur-md',
        badge: {
          text: 'DESAFIO INTERATIVO 💬',
          className: 'bg-yellow-400 text-slate-950 border-2 border-black font-black uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-[2px_2px_0_#000]',
        },
        fadeClass: 'from-white via-white/80 to-transparent',
        indicatorClass: 'bg-yellow-400 text-black border-2 border-black font-black shadow-[2px_2px_0_#000]',
      };

    case 'cartoon_pop':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-3xl border-4 border-amber-400/90 bg-amber-950/85 backdrop-blur-xl text-amber-50 shadow-[0_10px_0_#92400e,0_20px_40px_rgba(0,0,0,0.6)] font-bold p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'DESAFIO ESPECIAL ⭐',
          className: 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 border-2 border-amber-300 font-black uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-md',
        },
        fadeClass: 'from-amber-950 via-amber-950/70 to-transparent',
        indicatorClass: 'bg-amber-400 text-amber-950 border-2 border-amber-600 font-black shadow-md',
      };

    case 'neon_arcade':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-[32px] border-2 border-cyan-400 bg-slate-950/90 backdrop-blur-2xl text-cyan-100 shadow-[0_0_35px_rgba(6,182,212,0.4),inset_0_0_20px_rgba(6,182,212,0.15)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'NEON MISSION // BRIEFING 🕹️',
          className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-mono font-bold uppercase text-xs tracking-widest px-4 py-1 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.4)]',
        },
        fadeClass: 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'bg-slate-900 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-mono',
      };

    case 'bento_tech':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'border-2 border-emerald-500/80 bg-slate-950/95 backdrop-blur-2xl text-emerald-200 font-mono shadow-[0_0_30px_rgba(16,185,129,0.3)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'SYS_DIRECTIVE // 01 ⚡',
          className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-mono font-bold uppercase text-xs tracking-widest px-3.5 py-1 rounded-sm shadow-sm',
        },
        fadeClass: 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'bg-slate-950 border border-emerald-400 text-emerald-300 font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        style: {
          clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
        },
      };

    case 'neumorphic_luxe':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-[32px] border-2 border-amber-400/60 bg-gradient-to-b from-slate-900/95 via-amber-950/40 to-slate-950/95 backdrop-blur-2xl text-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.25)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'SHOW VIP // REGULAMENTO 🏆',
          className: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border border-amber-200 font-black uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-md',
        },
        fadeClass: 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'bg-slate-900 border border-amber-400 text-amber-300 shadow-md',
      };

    case 'pixel_retro':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-none border-4 border-yellow-400 bg-black/95 text-yellow-300 font-mono shadow-[6px_6px_0_#ca8a04] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: '▶ STAGE BRIEFING 👾',
          className: 'bg-yellow-400 text-black border-2 border-black font-mono font-black uppercase text-xs tracking-wider px-4 py-1',
        },
        fadeClass: 'from-black via-black/80 to-transparent',
        indicatorClass: 'bg-yellow-400 text-black border-2 border-black font-mono font-bold shadow-[2px_2px_0_#ca8a04]',
      };

    case 'cyber_matrix':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-xl border-2 border-emerald-400/90 bg-black/95 text-emerald-300 font-mono shadow-[0_0_30px_rgba(16,185,129,0.35)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: '> ROOT_INSTRUCTION.LOG 💻',
          className: 'bg-emerald-950/90 text-emerald-300 border border-emerald-400 font-mono font-bold uppercase text-xs tracking-wider px-4 py-1 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        },
        fadeClass: 'from-black via-black/80 to-transparent',
        indicatorClass: 'bg-black border border-emerald-400 text-emerald-300 font-mono',
      };

    case 'synthwave_grid':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-3xl border-2 border-pink-400/80 bg-purple-950/85 backdrop-blur-2xl text-pink-100 shadow-[0_0_35px_rgba(244,63,94,0.35)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'SYNTHWAVE // INFO 🌴',
          className: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border border-pink-300/40 font-black uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-md',
        },
        fadeClass: 'from-purple-950 via-purple-950/80 to-transparent',
        indicatorClass: 'bg-purple-900 border border-pink-400 text-pink-200 shadow-md',
      };

    case 'golden_casino':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-3xl border-4 border-amber-300 bg-stone-950/95 backdrop-blur-xl text-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.4)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'REGULAMENTO OFICIAL ✦ 💎',
          className: 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border border-yellow-100 font-black uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-lg',
        },
        fadeClass: 'from-stone-950 via-stone-950/80 to-transparent',
        indicatorClass: 'bg-stone-900 border border-amber-300 text-amber-300 shadow-md font-bold',
      };

    case 'bubble_toon':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-[36px] border-4 border-pink-300/80 bg-pink-950/70 backdrop-blur-2xl text-pink-100 shadow-[0_12px_28px_rgba(244,114,182,0.35)] font-bold p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'INFORMAÇÕES DO JOGO 🎈',
          className: 'bg-pink-400 text-white border-2 border-pink-200 font-black uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-md',
        },
        fadeClass: 'from-pink-950 via-pink-950/80 to-transparent',
        indicatorClass: 'bg-pink-500 text-white border border-pink-300 font-black shadow-md rounded-full',
      };

    case 'spatial_3d':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-3xl border-2 border-purple-400/60 bg-slate-950/85 backdrop-blur-2xl text-purple-100 shadow-[0_25px_60px_-15px_rgba(147,51,234,0.4)] p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'SPATIAL EXPERIENCE 🌌',
          className: 'bg-purple-500/25 text-purple-200 border border-purple-400/50 font-bold uppercase text-xs tracking-wider px-4 py-1 rounded-full shadow-md',
        },
        fadeClass: 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'bg-purple-950 border border-purple-400 text-purple-200 shadow-md',
      };

    case 'modern_glass':
    default:
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: 'rounded-3xl border-2 border-white/20 bg-black/50 backdrop-blur-2xl text-slate-100 shadow-2xl p-6 sm:p-7 leading-relaxed',
        badge: {
          text: 'INFORMAÇÕES ✦',
          className: 'bg-white/15 text-white border border-white/30 font-bold uppercase text-xs tracking-wider px-4 py-1 rounded-full backdrop-blur-md',
        },
        fadeClass: 'from-black/85 via-black/40 to-transparent',
        indicatorClass: 'bg-slate-950/90 text-white border border-white/30 shadow-2xl',
      };
  }
};

const ScrollableDescription: React.FC<ScrollableDescriptionProps> = ({
  description,
  alignClass,
  sizeClass,
  layout = 'modern_glass',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const config = getSplashDescriptionStyle(layout);

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
    <div className={`relative ${config.wrapperClass}`}>
      {/* Thematic Top Tag/Badge */}
      {config.badge && (
        <div className="flex justify-center -mb-3.5 relative z-20">
          <span className={config.badge.className}>{config.badge.text}</span>
        </div>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchMove={() => setHasScrolled(true)}
        onWheel={(e) => {
          if (e.deltaY > 5) setHasScrolled(true);
        }}
        style={config.style}
        className={`max-h-[35vh] sm:max-h-[42vh] overflow-y-auto whitespace-pre-line no-scrollbar transition-all duration-300 ${config.cardClass} ${alignClass} ${sizeClass}`}
      >
        {description}
      </div>

      {/* Sombra sutil de fade na borda inferior indicando continuidade */}
      {canScroll && (
        <div
          className={`absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t ${config.fadeClass} rounded-b-3xl pointer-events-none transition-opacity duration-300 ${
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
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold tracking-wide cursor-pointer active:scale-95 transition-all select-none group ${config.indicatorClass}`}
          >
            <span>Deslize para ler mais</span>
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 animate-bounce" />
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
  const layoutColorHue = campaign.games_config?.layout_color_hue !== undefined
    ? Number(campaign.games_config.layout_color_hue)
    : undefined;

  const isLight = 
    campaign.games_config?.theme_mode === 'light' || 
    campaign.theme_mode === 'light' || 
    (customColors && customColors?.bgType === 'light') ||
    customColors?.bgType === 'light';

  // Compute dynamic palette from slider if defined
  const sliderPalette = layoutColorHue !== undefined
    ? generateLayoutPalette(layoutColorHue, isLight)
    : null;

  const isCustomActive = !!((customColors && customColors.enabled) || sliderPalette);

  const theme: ThemeDefinition = {
    ...baseTheme,
    name: sliderPalette ? 'Personalizado' : (isCustomActive ? 'Personalizado' : baseTheme.name),
    primary: sliderPalette ? sliderPalette.primary : (isCustomActive ? (customColors?.primary || baseTheme.primary) : baseTheme.primary),
    secondary: sliderPalette ? sliderPalette.secondary : (isCustomActive ? (customColors?.secondary || baseTheme.secondary) : baseTheme.secondary),
    accent: sliderPalette ? sliderPalette.accent : (isCustomActive ? (customColors?.accent || baseTheme.accent) : baseTheme.accent),
    glowColor: sliderPalette ? sliderPalette.glowColor : (isCustomActive ? (customColors?.glowColor || baseTheme.glowColor) : baseTheme.glowColor),
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
    isCustomActive && customColors?.bgType === 'custom'
      ? {
          background: `linear-gradient(to bottom, ${customColors?.bgFrom || '#0F172A'}, ${customColors?.bgTo || '#020617'})`,
        }
      : {};

  const customButtonGradientStyle: React.CSSProperties = isCustomActive
    ? {
        background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
      }
    : {};

  const gamesList = GAMES_CATALOG.filter((g) => campaign.selected_games.includes(g.id));

  const splashButtonStyle: SplashButtonStyleId =
    (campaign.games_config?.splash_button_style as SplashButtonStyleId) || 'default';
  const splashBgEffect: BackgroundEffectId =
    (campaign.games_config?.splash_bg_effect as BackgroundEffectId) || 'none';
  const campaignLayout: GameLayoutId =
    (campaign.games_config?.game_layout as GameLayoutId) || 'modern_glass';

  const handleStartPlay = () => {
    sound.playSuccess();
    if (gamesList.length === 1) {
      setActiveGame(gamesList[0]);
    } else {
      setInSplash(false);
    }
  };

  const renderSplashButton = () => {
    switch (splashButtonStyle) {
      case 'cartoon_3d':
        return (
          <button
            onClick={handleStartPlay}
            style={{ '--glow-color': 'rgba(245, 158, 11, 0.7)' } as React.CSSProperties}
            className="group relative py-6 px-12 sm:px-16 rounded-3xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-4 border-amber-100 text-amber-950 font-black text-2xl sm:text-3xl tracking-wider uppercase shadow-[0_12px_0_#b45309,0_25px_35px_rgba(0,0,0,0.6)] active:translate-y-2 active:shadow-[0_4px_0_#b45309] hover:brightness-105 transition-all flex items-center gap-4 animate-bounce"
          >
            <div className="p-2 rounded-2xl bg-amber-950/15 border border-amber-950/20">
              <Play className="w-8 h-8 fill-amber-950 text-amber-950" />
            </div>
            <span className="drop-shadow-[0_2px_0_rgba(255,255,255,0.7)]">TOQUE PARA JOGAR</span>
          </button>
        );

      case 'neon_pulse':
        return (
          <button
            onClick={handleStartPlay}
            style={{ '--glow-color': 'rgba(34, 211, 238, 0.85)' } as React.CSSProperties}
            className="relative py-6 px-12 sm:px-16 rounded-full bg-slate-950/90 border-2 border-cyan-400 text-cyan-300 font-black text-2xl sm:text-3xl tracking-widest uppercase shadow-[0_0_35px_rgba(34,211,238,0.7),inset_0_0_20px_rgba(34,211,238,0.3)] active:scale-95 transition-all flex items-center gap-4 animate-totem-pulse"
          >
            <Play className="w-8 h-8 fill-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
            <span className="drop-shadow-[0_0_12px_#22d3ee]">TOQUE PARA JOGAR</span>
          </button>
        );

      case 'arcade_retro':
        return (
          <button
            onClick={handleStartPlay}
            style={{ '--glow-color': 'rgba(250, 204, 21, 0.8)' } as React.CSSProperties}
            className="relative py-6 px-12 sm:px-16 rounded-none bg-black border-4 border-yellow-400 text-yellow-300 font-mono font-black text-2xl sm:text-3xl tracking-widest uppercase shadow-[0_0_25px_#facc15,6px_6px_0px_#ca8a04] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-4 animate-totem-pulse"
          >
            <Play className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            <span className="tracking-widest">▶ TOQUE PARA JOGAR</span>
          </button>
        );

      case 'cyber_tech':
        return (
          <button
            onClick={handleStartPlay}
            style={{
              clipPath: 'polygon(18px 0%, 100% 0%, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0% 100%, 0% 18px)',
              '--glow-color': 'rgba(16, 185, 129, 0.8)',
            } as React.CSSProperties}
            className="relative py-6 px-12 sm:px-16 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 font-mono font-black text-2xl sm:text-3xl tracking-widest uppercase shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95 transition-all flex items-center gap-4 animate-totem-pulse"
          >
            <Play className="w-8 h-8 fill-emerald-400 text-emerald-400" />
            <span>TOQUE PARA JOGAR</span>
          </button>
        );

      case 'luxury_gold':
        return (
          <button
            onClick={handleStartPlay}
            style={{ '--glow-color': 'rgba(245, 158, 11, 0.8)' } as React.CSSProperties}
            className="relative py-6 px-12 sm:px-16 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 border-2 border-yellow-100 text-slate-950 font-black text-2xl sm:text-3xl tracking-wider uppercase shadow-[0_0_40px_rgba(245,158,11,0.6),0_15px_30px_rgba(0,0,0,0.5)] active:scale-95 transition-all flex items-center gap-4 animate-totem-pulse"
          >
            <Play className="w-8 h-8 fill-slate-950 text-slate-950" />
            <span className="drop-shadow-xs">TOQUE PARA JOGAR</span>
          </button>
        );

      case 'glass_glow':
        return (
          <button
            onClick={handleStartPlay}
            style={{ '--glow-color': 'rgba(255, 255, 255, 0.6)' } as React.CSSProperties}
            className="relative py-6 px-12 sm:px-16 rounded-3xl backdrop-blur-2xl bg-white/20 border-2 border-white/60 text-white font-black text-2xl sm:text-3xl tracking-wider uppercase shadow-[0_0_40px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center gap-4 animate-totem-pulse"
          >
            <Play className="w-8 h-8 fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">TOQUE PARA JOGAR</span>
          </button>
        );

      case 'default':
      default:
        return (
          <button
            onClick={handleStartPlay}
            style={{
              '--glow-color': theme.glowColor || theme.primary,
              boxShadow: `0 0 50px ${theme.glowColor}, 0 20px 40px rgba(0,0,0,0.6)`,
              ...customButtonGradientStyle,
            } as React.CSSProperties}
            className={`py-6 px-12 sm:px-16 rounded-3xl ${!isCustomActive ? `bg-gradient-to-r ${theme.buttonGradient}` : ''} text-white font-black text-2xl sm:text-3xl tracking-wider uppercase border-2 border-white/40 active:scale-95 transition-all flex items-center gap-4 animate-totem-pulse`}
          >
            <Play className="w-8 h-8 fill-current" />
            <span>TOQUE PARA JOGAR</span>
          </button>
        );
    }
  };

  const availableCategories = GAME_CATEGORIES.filter((cat) =>
    gamesList.some((g) => g.categoryId === cat.id || g.category === cat.name)
  );

  const displayedGames = selectedCategory === 'all'
    ? gamesList
    : gamesList.filter((g) => g.categoryId === selectedCategory || g.category === selectedCategory);

  // Active Game Render
  if (activeGame) {
    const orderMode = campaign.games_config?.[`${activeGame.id}_order_mode`] || campaign.games_config?.order_mode || 'random';
    const questionsCount = Number(campaign.games_config?.[`${activeGame.id}_questions_count`]) || undefined;
    const gameTimer = campaign.games_config?.[`${activeGame.id}_time_limit`];
    const gameTotalTimer = campaign.games_config?.[`${activeGame.id}_total_time_limit`];

    const commonProps = {
      onExit: () => {
        setActiveGame(null);
        if (gamesList.length === 1) {
          setInSplash(true);
        }
      },
      rankingEnabled: campaign.ranking_enabled,
      onSubmitScore: (name: string, score: number) =>
        handleScoreSubmit(name, score),
      themePrimary: theme.primary,
      theme,
      isLight,
      themeMode: (isLight ? 'light' : 'dark') as 'light' | 'dark',
      orderMode: orderMode as 'random' | 'ordered',
      questionsCount,
      timeLimit: gameTimer !== undefined ? Number(gameTimer) : undefined,
      totalTimeLimit: gameTotalTimer !== undefined ? Number(gameTotalTimer) : undefined,
      customBgStyle,
      campaignName: campaign.name,
      clientName: campaign.client_name,
      splashImageUrl: campaign.splash_image_url,
      customContent: campaign.games_config?.[activeGame.id],
      gameLayout: campaign.games_config?.[`${activeGame.id}_layout`] || campaign.games_config?.game_layout || 'modern_glass',
    };

    const renderActiveGame = () => {
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
    };

    return (
      <GameLayoutProvider layout={commonProps.gameLayout} hue={layoutColorHue} isLight={isLight} onLayoutChange={() => {}}>
        {renderActiveGame()}
      </GameLayoutProvider>
    );
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

          {/* Background Overlay Animation Effect (Matrix, Stars, Rain, Nanotech, etc.) */}
          <BackgroundEffectOverlay effect={splashBgEffect} />

          {/* Top Brand Logo / Client */}
          <div className="relative z-10 pt-8 flex flex-col items-center animate-in slide-in-from-top-6 duration-700">
            {campaign.client_name && (
              <span className={`text-xs sm:text-sm font-black tracking-widest uppercase mb-2 ${
                campaignLayout === 'cartoon_comic'
                  ? 'bg-yellow-400 text-slate-950 border-2 border-black px-3.5 py-1 rounded-full shadow-[2px_2px_0_#000]'
                  : campaignLayout === 'pixel_retro'
                  ? 'bg-yellow-400 text-black border-2 border-black font-mono px-3 py-1 shadow-[2px_2px_0_#ca8a04]'
                  : campaignLayout === 'neon_arcade'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : campaignLayout === 'bento_tech'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-mono px-3 py-1 rounded-sm'
                  : campaignLayout === 'golden_casino'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40 px-3.5 py-1 rounded-full shadow-md'
                  : 'text-white/80'
              }`}>
                {campaign.client_name}
              </span>
            )}
            <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight drop-shadow-2xl max-w-3xl leading-tight ${
              campaignLayout === 'pixel_retro' ? 'font-mono text-yellow-300' : 'text-white'
            }`}>
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

              return (
                <ScrollableDescription
                  description={campaign.description}
                  alignClass={alignClass}
                  sizeClass={sizeClass}
                  layout={campaignLayout}
                />
              );
            })()}
          </div>

          {/* Central Interactive Touch CTA */}
          <div className="relative z-10 my-auto flex flex-col items-center">
            {renderSplashButton()}
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
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-6 sm:space-y-8 no-scrollbar max-w-5xl xl:max-w-6xl mx-auto w-full">
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
                  className={`relative group rounded-[32px] sm:rounded-[36px] border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}
                  style={{
                    boxShadow: `0 20px 50px -15px ${theme.glowColor}30`,
                  }}
                >
                  {/* Background decorative glow on hover */}
                  <div
                    style={{ backgroundColor: theme.primary }}
                    className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none"
                  />

                  {/* Left Side: Game Number, Badge, Title & Description */}
                  <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
                    <div
                      style={{ color: theme.primary }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${
                        isLight 
                          ? 'bg-slate-100 border-2 border-slate-200 shadow-sm' 
                          : 'bg-gradient-to-br from-white/15 to-white/5 border-2 border-white/20 text-amber-400 shadow-inner'
                      } flex items-center justify-center font-black text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${theme.badgeBg}`}>
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
                            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${isLight ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-300 bg-black/40 border-white/10'}`}>
                              ⏱️ {timeDisplay}
                            </span>
                          );
                        })()}
                        <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Dificuldade: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{game.difficulty}</strong>
                        </span>
                      </div>

                      <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight group-hover:opacity-95 transition-colors ${theme.textColor} mb-2`}>
                        {game.name}
                      </h3>

                      <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'} line-clamp-2 sm:line-clamp-3 font-medium max-w-2xl`}>
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Game Miniature + Big Highlighted Play Button */}
                  <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
                    {/* Miniature Game Preview Art */}
                    <GameCardThumbnail 
                      game={game} 
                      themePrimary={theme.primary} 
                      isLight={isLight} 
                    />

                    {/* Play Action Button */}
                    <button
                      style={{
                        backgroundColor: theme.primary,
                        boxShadow: `0 12px 35px -5px ${theme.glowColor}80`,
                      }}
                      className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl sm:rounded-3xl text-white font-black text-lg sm:text-xl tracking-wider uppercase shadow-xl flex items-center justify-center gap-3 transition-transform group-hover:scale-105 group-hover:brightness-110 active:scale-95 flex-shrink-0"
                    >
                      <Play className="w-6 h-6 fill-current" />
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
