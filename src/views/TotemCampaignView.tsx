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
import { generateLayoutPalette, getSplashOverlayStyle, LayoutColorPalette, getDefaultHueForLayout, hexToRgba } from '../lib/colorHarmony';
import { getFontFamilyById } from '../lib/fonts';
import { SplashButtonRenderer } from '../components/SplashButtonRenderer';

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
  palette?: LayoutColorPalette | null;
  isLight?: boolean;
}

interface SplashDescriptionStyleConfig {
  wrapperClass: string;
  cardClass: string;
  fadeClass: string;
  indicatorClass: string;
  style?: React.CSSProperties;
  indicatorStyle?: React.CSSProperties;
}

const getSplashDescriptionStyle = (
  layout: GameLayoutId = 'modern_glass',
  palette?: LayoutColorPalette | null,
  isLight = false
): SplashDescriptionStyleConfig => {
  const p = palette?.primary || (isLight ? '#0f172a' : '#ffffff');
  const sec = palette?.secondary || p;
  const dark = palette?.darkShade || (isLight ? '#334155' : '#020617');
  const glow = palette?.glowColor || 'rgba(255,255,255,0.2)';

  switch (layout) {
    case 'cartoon_comic':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-3xl border-4 border-black backdrop-blur-md font-bold p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900 shadow-[8px_8px_0_#000]' : 'bg-slate-900/95 text-white shadow-[8px_8px_0_#000]'}`,
        style: { boxShadow: '8px 8px 0 #000' },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-900 via-slate-900/80 to-transparent',
        indicatorClass: 'text-black border-2 border-black font-black shadow-[2px_2px_0_#000]',
        indicatorStyle: { backgroundColor: p, color: '#000' },
      };

    case 'cartoon_pop':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-3xl border-4 backdrop-blur-xl font-bold p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/90 text-white'}`,
        style: {
          borderColor: p,
          boxShadow: `0 10px 0 ${dark}, 0 20px 40px rgba(0,0,0,0.6)`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border-2 font-black shadow-md',
        indicatorStyle: { backgroundColor: p, color: isLight ? '#fff' : '#020617', borderColor: dark },
      };

    case 'neon_arcade':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-[32px] border-2 backdrop-blur-2xl p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/90 text-slate-900' : 'bg-slate-950/90 text-slate-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 0 35px ${glow}, inset 0 0 20px ${hexToRgba(p, 0.15)}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border font-mono shadow-md backdrop-blur-md',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: isLight ? '#fff' : '#020617', boxShadow: `0 0 15px ${glow}` },
      };

    case 'bento_tech':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `border-2 backdrop-blur-2xl font-mono p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/95 text-slate-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 0 30px ${glow}`,
          clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border font-mono shadow-md',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: isLight ? '#fff' : '#020617', boxShadow: `0 0 12px ${glow}` },
      };

    case 'neumorphic_luxe':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-[32px] border-2 backdrop-blur-2xl p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/90 text-slate-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 20px 50px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border shadow-md font-bold',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: isLight ? '#fff' : '#020617' },
      };

    case 'pixel_retro':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-none border-4 font-mono p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-black/95 text-yellow-300'}`,
        style: {
          borderColor: p,
          boxShadow: `6px 6px 0 ${dark}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-black via-black/80 to-transparent',
        indicatorClass: 'border-2 font-mono font-bold',
        indicatorStyle: { backgroundColor: p, borderColor: dark, color: '#000', boxShadow: `2px 2px 0 ${dark}` },
      };

    case 'cyber_matrix':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-xl border-2 font-mono p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-black/95 text-emerald-300'}`,
        style: {
          borderColor: p,
          boxShadow: `0 0 30px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-black via-black/80 to-transparent',
        indicatorClass: 'border font-mono shadow-md',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: '#000' },
      };

    case 'synthwave_grid':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-3xl border-2 backdrop-blur-2xl p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/90 text-pink-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 0 35px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border shadow-md',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: isLight ? '#fff' : '#020617' },
      };

    case 'golden_casino':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-3xl border-4 backdrop-blur-xl p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-stone-950/95 text-amber-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 0 40px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-stone-950 via-stone-950/80 to-transparent',
        indicatorClass: 'border shadow-md font-bold',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: isLight ? '#fff' : '#0c0a09' },
      };

    case 'bubble_toon':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-[36px] border-4 backdrop-blur-2xl font-bold p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/90 text-pink-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 12px 28px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border font-black shadow-md rounded-full',
        indicatorStyle: { backgroundColor: p, borderColor: sec, color: '#fff' },
      };

    case 'spatial_3d':
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-3xl border-2 backdrop-blur-2xl p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/85 text-purple-100'}`,
        style: {
          borderColor: p,
          boxShadow: `0 25px 60px -15px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent',
        indicatorClass: 'border shadow-md',
        indicatorStyle: { borderColor: p, color: p, backgroundColor: isLight ? '#fff' : '#020617' },
      };

    case 'modern_glass':
    default:
      return {
        wrapperClass: 'mt-6 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500',
        cardClass: `rounded-3xl border-2 backdrop-blur-2xl text-slate-100 shadow-2xl p-6 sm:p-7 leading-relaxed ${isLight ? 'bg-white/90 text-slate-900' : 'bg-black/60 text-slate-100'}`,
        style: {
          borderColor: hexToRgba(p, 0.4),
          boxShadow: `0 0 30px ${glow}`,
        },
        fadeClass: isLight ? 'from-white via-white/80 to-transparent' : 'from-black/85 via-black/40 to-transparent',
        indicatorClass: 'border shadow-2xl backdrop-blur-md',
        indicatorStyle: { borderColor: hexToRgba(p, 0.5), color: isLight ? '#0f172a' : '#ffffff', backgroundColor: isLight ? '#fff' : '#020617' },
      };
  }
};

const ScrollableDescription: React.FC<ScrollableDescriptionProps> = ({
  description,
  alignClass,
  sizeClass,
  layout = 'modern_glass',
  palette,
  isLight = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const config = getSplashDescriptionStyle(layout, palette, isLight);

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
            style={config.indicatorStyle}
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

  // Splash bottom button floating logic when content overflows viewport
  const [isSplashOverflowing, setIsSplashOverflowing] = useState(false);
  const splashContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inSplash) return;
    const el = splashContainerRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsSplashOverflowing(prev => {
        if (prev) {
          return (el.scrollHeight - 144) > (el.clientHeight + 20);
        } else {
          return el.scrollHeight > (el.clientHeight + 25);
        }
      });
    };

    checkOverflow();

    const ro = new ResizeObserver(() => {
      checkOverflow();
    });
    ro.observe(el);

    const t1 = setTimeout(checkOverflow, 120);
    const t2 = setTimeout(checkOverflow, 450);
    const t3 = setTimeout(checkOverflow, 1200);
    window.addEventListener('resize', checkOverflow);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [inSplash, campaign]);

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

  // Splash Button color hue & palette
  const splashButtonHue: number = campaign.games_config?.splash_button_hue !== undefined
    ? Number(campaign.games_config.splash_button_hue)
    : (layoutColorHue !== undefined ? layoutColorHue : 38);

  const splashButtonPalette = generateLayoutPalette(splashButtonHue, isLight);

  // Splash Background Color Blend & Overlay
  const splashOverlayMode: 'color' | 'original' | 'black' | 'white' =
    campaign.games_config?.splash_overlay_mode || 
    (campaign.games_config?.splash_overlay_opacity === 0 ? 'original' : 'color');

  const splashOverlayHue: number =
    campaign.games_config?.splash_overlay_hue !== undefined
      ? Number(campaign.games_config.splash_overlay_hue)
      : (layoutColorHue !== undefined ? layoutColorHue : 145);

  const splashOverlayOpacity: number =
    campaign.games_config?.splash_overlay_opacity !== undefined
      ? Number(campaign.games_config.splash_overlay_opacity)
      : (splashOverlayMode === 'original' ? 0 : 35);

  const splashOverlayBrightness: number =
    campaign.games_config?.splash_overlay_brightness !== undefined
      ? Number(campaign.games_config.splash_overlay_brightness)
      : (splashOverlayOpacity === 0 ? 100 : 95);

  const splashOverlayStyle = getSplashOverlayStyle(
    splashOverlayMode,
    splashOverlayHue,
    splashOverlayOpacity,
    splashOverlayBrightness
  );

  const handleStartPlay = () => {
    sound.playSuccess();
    if (gamesList.length === 1) {
      setActiveGame(gamesList[0]);
    } else {
      setInSplash(false);
    }
  };

  const renderSplashButton = () => {
    return (
      <SplashButtonRenderer
        styleId={splashButtonStyle}
        palette={splashButtonPalette}
        onClick={handleStartPlay}
        size="lg"
        label="TOQUE PARA JOGAR"
      />
    );
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

    const activeGameLayout: GameLayoutId = campaign.games_config?.[`${activeGame.id}_layout`] || campaign.games_config?.game_layout || 'modern_glass';
    const activeGameHue = campaign.games_config?.[`${activeGame.id}_layout_color_hue`] !== undefined
      ? Number(campaign.games_config[`${activeGame.id}_layout_color_hue`])
      : layoutColorHue;
    const activeGamePalette = activeGameHue !== undefined
      ? generateLayoutPalette(activeGameHue, isLight)
      : sliderPalette || undefined;

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
      themePrimary: activeGamePalette?.primary || theme.primary,
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
      gameLayout: activeGameLayout,
      fontId: campaign.games_config?.[`${activeGame.id}_font`] || campaign.games_config?.campaign_font || 'outfit',
      fontFamily: getFontFamilyById(campaign.games_config?.[`${activeGame.id}_font`] || campaign.games_config?.campaign_font || 'outfit'),
      palette: activeGamePalette,
      layoutColorHue: activeGameHue,
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
      <GameLayoutProvider layout={commonProps.gameLayout} hue={activeGameHue} isLight={isLight} onLayoutChange={() => {}}>
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
      className={`fixed inset-0 w-full h-full overflow-hidden select-none ${inSplash ? 'bg-slate-950' : `bg-gradient-to-b ${theme.bgGradient}`} ${theme.textColor} ${theme.fontClass}`}
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
        <div
          ref={splashContainerRef}
          className={`relative w-full h-full flex flex-col items-center justify-between p-8 text-center animate-in fade-in duration-500 overflow-y-auto no-scrollbar ${
            isSplashOverflowing ? 'pb-36' : ''
          }`}
        >
          {/* Background image with custom color blend overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={campaign.splash_image_url}
              alt={campaign.name}
              style={{
                filter: `brightness(${splashOverlayStyle.imageBrightness}) contrast(1.05)`,
              }}
              className="w-full h-full object-cover scale-105 transition-transform duration-10000 animate-float"
            />
            {/* Camada Dinâmica de Mistura da Cor Personalizada */}
            <div
              style={{
                background: splashOverlayStyle.overlayGradient,
                opacity: splashOverlayStyle.overlayOpacity,
              }}
              className="absolute inset-0 pointer-events-none transition-all duration-300"
            />
            <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none" />
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
                  : 'text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]'
              }`}>
                {campaign.client_name}
              </span>
            )}
            <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] max-w-3xl leading-tight ${
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

              const activeDescHue = layoutColorHue !== undefined
                ? layoutColorHue
                : (campaign.games_config?.layout_color_hue !== undefined
                  ? Number(campaign.games_config.layout_color_hue)
                  : getDefaultHueForLayout(campaignLayout));

              const activeDescPalette = sliderPalette || generateLayoutPalette(activeDescHue, isLight);

              return (
                <ScrollableDescription
                  description={campaign.description}
                  alignClass={alignClass}
                  sizeClass={sizeClass}
                  layout={campaignLayout}
                  palette={activeDescPalette}
                  isLight={isLight}
                />
              );
            })()}

            {/* Imagem descritiva da campanha em formato horizontal (lado a lado) logo abaixo da descrição */}
            {(() => {
              const descImg = campaign.description_image_url || campaign.games_config?.description_image_url;
              if (!descImg) return null;

              const activeDescHue = layoutColorHue !== undefined
                ? layoutColorHue
                : (campaign.games_config?.layout_color_hue !== undefined
                  ? Number(campaign.games_config.layout_color_hue)
                  : getDefaultHueForLayout(campaignLayout));

              const activeDescPalette = sliderPalette || generateLayoutPalette(activeDescHue, isLight);

              return (
                <div className="mt-4 w-full max-w-2xl sm:max-w-3xl animate-in zoom-in-95 duration-500">
                  <div
                    style={{
                      borderColor: activeDescPalette.primary,
                      boxShadow: campaignLayout === 'cartoon_comic'
                        ? '8px 8px 0 #000'
                        : campaignLayout === 'cartoon_pop'
                        ? `0 10px 0 ${activeDescPalette.darkShade}, 0 20px 40px rgba(0,0,0,0.6)`
                        : campaignLayout === 'pixel_retro'
                        ? `6px 6px 0 ${activeDescPalette.darkShade}`
                        : `0 0 35px ${activeDescPalette.glowColor}`,
                    }}
                    className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md mx-auto ${
                      campaignLayout === 'cartoon_comic'
                        ? 'border-4 border-black bg-white/10'
                        : campaignLayout === 'pixel_retro' || campaignLayout === 'cartoon_pop' || campaignLayout === 'golden_casino' || campaignLayout === 'bubble_toon'
                        ? 'border-4'
                        : 'border-2'
                    } ${isLight ? 'bg-white/80' : 'bg-black/40'}`}
                  >
                    <img
                      src={descImg}
                      alt={campaign.name}
                      onLoad={() => {
                        const el = splashContainerRef.current;
                        if (el) {
                          setIsSplashOverflowing(prev => {
                            if (prev) {
                              return (el.scrollHeight - 144) > (el.clientHeight + 20);
                            }
                            return el.scrollHeight > (el.clientHeight + 25);
                          });
                        }
                      }}
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Central Interactive Touch CTA (in-flow when content fits without scrolling) */}
          {!isSplashOverflowing && (
            <div className="relative z-10 my-auto flex flex-col items-center">
              {renderSplashButton()}
            </div>
          )}

          {/* Bottom Footer Info */}
          <div className={`relative z-10 text-xs text-slate-400 font-bold tracking-widest uppercase ${
            isSplashOverflowing ? 'pb-2 pt-4' : 'pb-6'
          }`}>
            Totem Interativo • Toque na tela para iniciar a sua experiência
          </div>

          {/* Floating Bottom Touch CTA when content overflows viewport */}
          {isSplashOverflowing && (
            <div
              className={`fixed bottom-0 inset-x-0 z-30 pointer-events-none flex flex-col items-center justify-end pb-6 pt-14 bg-gradient-to-t ${
                isLight ? 'from-white via-white/90 to-transparent' : 'from-slate-950 via-slate-950/90 to-transparent'
              } backdrop-blur-[2px] animate-in fade-in slide-in-from-bottom-4 duration-300`}
            >
              <div className="pointer-events-auto transform hover:scale-105 active:scale-95 transition-all drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
                {renderSplashButton()}
              </div>
            </div>
          )}
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
