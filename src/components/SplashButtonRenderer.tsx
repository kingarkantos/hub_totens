import React from 'react';
import { 
  Play, Sparkles, Gamepad2, Award, Crown, Zap, Flame, Terminal, Crosshair, Box, Smile
} from 'lucide-react';
import { SplashButtonStyleId } from '../types/splashCustomization';
import { LayoutColorPalette } from '../lib/colorHarmony';
import { sound } from '../lib/audio';

interface SplashButtonRendererProps {
  styleId: SplashButtonStyleId;
  palette: LayoutColorPalette;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const SplashButtonRenderer: React.FC<SplashButtonRendererProps> = ({
  styleId,
  palette,
  onClick,
  size = 'lg',
  label = 'TOQUE PARA JOGAR',
  className = '',
}) => {
  const isSm = size === 'sm';
  const isMd = size === 'md';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (onClick) onClick();
  };

  const textSizes = isSm
    ? 'text-xs tracking-wider'
    : isMd
    ? 'text-sm sm:text-base tracking-wider'
    : 'text-xl sm:text-2xl md:text-3xl tracking-wider';

  const paddings = isSm
    ? 'py-2.5 px-5'
    : isMd
    ? 'py-4 px-8 sm:px-10'
    : 'py-5 sm:py-6 px-10 sm:px-16';

  const iconSizes = isSm ? 'w-4 h-4' : isMd ? 'w-5 h-5' : 'w-7 sm:w-8 h-7 sm:h-8';

  switch (styleId) {
    // 1. CARTOON 3D GAME
    case 'cartoon_3d':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
            borderColor: '#FFFFFF',
            boxShadow: `0 ${isSm ? '4px' : isMd ? '8px' : '12px'} 0 ${palette.darkShade}, 0 25px 35px rgba(0,0,0,0.6)`,
          }}
          className={`group relative ${paddings} rounded-3xl border-4 text-white font-black ${textSizes} uppercase active:translate-y-2 hover:brightness-105 transition-all flex items-center justify-center gap-3.5 animate-bounce ${className}`}
        >
          <div className="p-1.5 sm:p-2 rounded-2xl bg-black/20 border border-white/30 flex items-center justify-center">
            <Play className={`${iconSizes} fill-current text-white`} />
          </div>
          <span className="drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">{label}</span>
        </button>
      );

    // 2. NEON CYBERPUNK
    case 'neon_pulse':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            borderColor: palette.primary,
            color: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}, inset 0 0 20px ${palette.glowColor}40`,
          }}
          className={`relative ${paddings} rounded-full bg-slate-950/90 border-2 font-black ${textSizes} tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Play className={`${iconSizes} fill-current`} style={{ filter: `drop-shadow(0 0 8px ${palette.primary})` }} />
          <span style={{ textShadow: `0 0 12px ${palette.glowColor}` }}>{label}</span>
        </button>
      );

    // 3. FLIPERAMA ARCADE
    case 'arcade_retro':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            borderColor: palette.primary,
            color: palette.primary,
            boxShadow: `0 0 25px ${palette.glowColor}, 6px 6px 0px ${palette.darkShade}`,
          }}
          className={`relative ${paddings} rounded-none bg-black border-4 font-mono font-black ${textSizes} tracking-widest uppercase active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          <Play className={`${iconSizes} fill-current`} />
          <span>▶ {label}</span>
        </button>
      );

    // 4. MECHA SCI-FI
    case 'cyber_tech':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            clipPath: 'polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)',
            borderColor: palette.primary,
            color: palette.primary,
            backgroundColor: 'rgba(2, 6, 23, 0.95)',
            boxShadow: `0 0 30px ${palette.glowColor}`,
          }}
          className={`relative ${paddings} border-2 font-mono font-black ${textSizes} tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Play className={`${iconSizes} fill-current`} />
          <span>[ {label} ]</span>
        </button>
      );

    // 5. OURO VIP GLAMOUR
    case 'luxury_gold':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
            borderColor: palette.accent,
            boxShadow: `0 0 40px ${palette.glowColor}, 0 15px 30px rgba(0,0,0,0.5)`,
          }}
          className={`relative ${paddings} rounded-3xl border-2 text-slate-950 font-black ${textSizes} tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Award className={`${iconSizes} fill-current text-slate-950`} />
          <span className="drop-shadow-xs">{label}</span>
        </button>
      );

    // 6. CYBER GLASS
    case 'glass_glow':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            borderColor: `${palette.primary}90`,
            boxShadow: `0 0 40px ${palette.glowColor}50, inset 0 0 20px ${palette.glowColor}25`,
          }}
          className={`relative ${paddings} rounded-3xl backdrop-blur-2xl bg-white/15 border-2 text-white font-black ${textSizes} tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Sparkles className={`${iconSizes} text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]`} />
          <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">{label}</span>
        </button>
      );

    // 7. COMIC TOON HQ (NOVO)
    case 'comic_pop':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            backgroundColor: palette.primary,
            boxShadow: `${isSm ? '4px 4px' : '6px 6px'} 0 #000000`,
          }}
          className={`relative ${paddings} rounded-2xl border-4 border-black text-slate-950 font-black ${textSizes} uppercase active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] hover:brightness-105 transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          <div className="px-2 py-0.5 rounded-md bg-black text-white text-[11px] font-black transform -rotate-6">
            POP!
          </div>
          <Play className={`${iconSizes} fill-current text-black`} />
          <span>{label}</span>
        </button>
      );

    // 8. PIXEL ART 8-BIT (NOVO)
    case 'pixel_8bit':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            backgroundColor: '#000000',
            borderColor: palette.primary,
            color: palette.primary,
            boxShadow: `4px 4px 0 #000000, 6px 6px 0 ${palette.darkShade}`,
          }}
          className={`relative ${paddings} rounded-none border-4 font-mono font-black ${textSizes} uppercase active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          <Play className={`${iconSizes} fill-current`} />
          <span>PRESS START &gt;&gt;</span>
        </button>
      );

    // 9. SYNTHWAVE 80S (NOVO)
    case 'synthwave_neon':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
            borderColor: palette.accent,
            boxShadow: `0 0 35px ${palette.glowColor}, inset 0 1px 0 rgba(255,255,255,0.4)`,
          }}
          className={`relative ${paddings} rounded-2xl border-2 text-white font-black ${textSizes} tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Zap className={`${iconSizes} fill-current text-amber-300 drop-shadow-[0_0_8px_#fde047]`} />
          <span className="drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">{label}</span>
        </button>
      );

    // 10. ROYALE CASINO GOLD (NOVO)
    case 'royal_casino':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(to bottom, #1c1917, #0c0a09)`,
            borderColor: palette.primary,
            color: palette.primary,
            boxShadow: `0 6px 0 ${palette.darkShade}, 0 15px 30px rgba(0,0,0,0.6)`,
          }}
          className={`relative ${paddings} rounded-2xl border-4 font-black ${textSizes} tracking-wider uppercase active:translate-y-1 transition-all flex items-center justify-center gap-3.5 hover:brightness-110 ${className}`}
        >
          <Crown className={`${iconSizes} text-amber-400`} />
          <span className="drop-shadow-xs">{label}</span>
        </button>
      );

    // 11. BUBBLE POP CANDY (NOVO)
    case 'candy_bubble':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
            boxShadow: `0 10px 25px ${palette.glowColor}, 0 4px 0 ${palette.darkShade}`,
          }}
          className={`relative ${paddings} rounded-full border-4 border-white/90 text-white font-black ${textSizes} tracking-wider uppercase active:scale-95 hover:scale-102 transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          <Smile className={`${iconSizes} text-white`} />
          <span className="drop-shadow-sm">{label} 🍬</span>
        </button>
      );

    // 12. VISOR HOLOGRÁFICO HUD (NOVO)
    case 'hologram_hud':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            borderColor: `${palette.primary}80`,
            backgroundColor: `${palette.primary}15`,
            color: palette.primary,
            boxShadow: `0 0 25px ${palette.glowColor}`,
          }}
          className={`relative ${paddings} border font-mono font-black ${textSizes} tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          {/* 4 Corner brackets */}
          <span style={{ borderColor: palette.primary }} className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2" />
          <span style={{ borderColor: palette.primary }} className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2" />
          <span style={{ borderColor: palette.primary }} className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2" />
          <span style={{ borderColor: palette.primary }} className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2" />

          <Crosshair className={`${iconSizes} text-current`} />
          <span>{label}</span>
        </button>
      );

    // 13. CHAMAS & FOGO (NOVO)
    case 'fire_inferno':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
            borderColor: '#fef08a',
            boxShadow: `0 0 40px ${palette.glowColor}, 0 0 15px #f97316`,
          }}
          className={`relative ${paddings} rounded-3xl border-2 text-white font-black ${textSizes} tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Flame className={`${iconSizes} fill-yellow-300 text-yellow-300 drop-shadow-[0_0_8px_#f97316]`} />
          <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{label}</span>
        </button>
      );

    // 14. TERMINAL MATRIX (NOVO)
    case 'cyber_matrix':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            borderColor: palette.primary,
            color: palette.primary,
            backgroundColor: '#020617',
            boxShadow: `0 0 20px ${palette.glowColor}`,
          }}
          className={`relative ${paddings} rounded-lg border-2 font-mono font-black ${textSizes} uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          <Terminal className={`${iconSizes} text-current`} />
          <span>&gt; RUN_START_EXE_</span>
        </button>
      );

    // 15. NÚCLEO QUÂNTICO (NOVO)
    case 'quantum_glow':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `radial-gradient(circle at center, ${palette.primary}40, #09090b 80%)`,
            borderColor: palette.primary,
            boxShadow: `0 0 40px ${palette.glowColor}, inset 0 0 25px ${palette.glowColor}`,
          }}
          className={`relative ${paddings} rounded-full border-2 text-white font-black ${textSizes} tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Zap className={`${iconSizes} text-cyan-300 animate-spin`} />
          <span style={{ textShadow: `0 0 12px ${palette.glowColor}` }}>{label}</span>
        </button>
      );

    // 16. NEOBRUTALISMO BOLD (NOVO)
    case 'brutalist_bold':
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            backgroundColor: palette.primary,
            boxShadow: `${isSm ? '4px 4px' : '8px 8px'} 0 #000000`,
          }}
          className={`relative ${paddings} rounded-none border-4 border-black text-black font-black ${textSizes} uppercase tracking-wider active:translate-x-1.5 active:translate-y-1.5 active:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-3.5 ${className}`}
        >
          <Play className={`${iconSizes} fill-black text-black`} />
          <span>{label}</span>
        </button>
      );

    // 17. PADRÃO DO TEMA (DEFAULT)
    case 'default':
    default:
      return (
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
            boxShadow: `0 0 45px ${palette.glowColor}, 0 20px 40px rgba(0,0,0,0.6)`,
          }}
          className={`relative ${paddings} rounded-3xl text-white font-black ${textSizes} tracking-wider uppercase border-2 border-white/40 active:scale-95 transition-all flex items-center justify-center gap-3.5 animate-totem-pulse ${className}`}
        >
          <Play className={`${iconSizes} fill-current`} />
          <span>{label}</span>
        </button>
      );
  }
};
