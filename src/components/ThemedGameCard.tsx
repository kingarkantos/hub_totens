import React from 'react';
import { 
  Play, Sparkles, Smile, Gamepad2, LayoutGrid, Trophy, Box, Award, Crown, Zap, Flame, Terminal
} from 'lucide-react';
import { GameDefinition } from '../types';
import { GameLayoutId, GAME_LAYOUTS } from '../types/gameLayouts';
import { LayoutColorPalette } from '../lib/colorHarmony';
import { getFontFamilyById } from '../lib/fonts';
import { GameCardThumbnail } from './GameCardThumbnail';
import { sound } from '../lib/audio';

interface ThemedGameCardProps {
  layoutId?: GameLayoutId;
  palette: LayoutColorPalette;
  game: GameDefinition;
  index: number;
  isLight?: boolean;
  campaignFont?: string;
  timeDisplay?: string;
  onPlay?: () => void;
  isPreview?: boolean;
}

export const ThemedGameCard: React.FC<ThemedGameCardProps> = ({
  layoutId = 'cartoon_comic',
  palette,
  game,
  index,
  isLight = false,
  campaignFont,
  timeDisplay,
  onPlay,
  isPreview = false,
}) => {
  const fontFamily = getFontFamilyById(campaignFont);
  const layoutDef = GAME_LAYOUTS.find((l) => l.id === layoutId) || GAME_LAYOUTS[0];

  const handleCardClick = () => {
    sound.playClick();
    if (onPlay) onPlay();
  };

  const formattedTime = timeDisplay || game.estimatedTime || '40 seg';

  // Common inner content of the card
  const renderMetaAndTitle = () => (
    <div className="flex-1 min-w-0 z-10">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
          layoutId === 'cartoon_comic'
            ? 'bg-amber-400 text-slate-950 border-black font-black'
            : layoutId === 'pixel_retro'
            ? 'bg-yellow-400 text-black border-2 border-black font-mono font-bold'
            : layoutId === 'bento_tech' || layoutId === 'cyber_matrix'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-mono'
            : isLight
            ? 'bg-slate-100 text-slate-800 border-slate-300'
            : 'bg-white/10 text-white border-white/20'
        }`}>
          {game.category}
        </span>

        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${
          isLight ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-300 bg-black/40 border-white/10'
        }`}>
          ⏱️ {formattedTime}
        </span>

        <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Dificuldade: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{game.difficulty}</strong>
        </span>
      </div>

      <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2 ${
        isLight ? 'text-slate-900' : 'text-white'
      } ${layoutId === 'pixel_retro' ? 'font-mono' : ''}`}>
        {game.name}
      </h3>

      <p className={`text-sm sm:text-base leading-relaxed ${
        isLight ? 'text-slate-600' : 'text-slate-300'
      } line-clamp-2 sm:line-clamp-3 font-medium max-w-2xl`}>
        {game.description}
      </p>
    </div>
  );

  // Render Layouts:
  switch (layoutId) {
    // ==========================================
    // 1. CARTOON GAME 3D (cartoon_pop)
    // ==========================================
    case 'cartoon_pop':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 10px 0 ${palette.darkShade}, 0 25px 50px rgba(0,0,0,0.6)`,
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-4 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-visible ${
            isLight ? 'bg-white/95' : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950'
          }`}
        >
          {/* Floating 3D Badge */}
          <div className="absolute -top-5 left-6 sm:left-10 z-20 pointer-events-none">
            <div
              style={{
                background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 6px 0 ${palette.darkShade}, 0 10px 20px rgba(0,0,0,0.5)`,
              }}
              className="w-12 h-12 rounded-2xl border-4 border-white/90 flex items-center justify-center transform -rotate-3 text-white font-black text-xl select-none"
            >
              {index + 1}
            </div>
          </div>

          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1 pt-2 sm:pt-0">
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 6px 0 ${palette.darkShade}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl sm:rounded-3xl border-4 border-white/80 text-white font-black text-lg sm:text-xl tracking-wider uppercase flex items-center justify-center gap-3 transition-transform group-hover:scale-105 group-hover:brightness-110 active:translate-y-1.5 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 2. COMIC TOON POP (cartoon_comic)
    // ==========================================
    case 'cartoon_comic':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            boxShadow: '8px 8px 0 #000000',
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-4 border-black p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-200 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-visible ${
            isLight ? 'bg-white text-slate-900' : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white'
          }`}
        >
          {/* Slanted Comic Badge */}
          <div className="absolute -top-5 left-6 sm:left-10 z-20 pointer-events-none">
            <div
              style={{
                backgroundColor: palette.primary,
                boxShadow: '4px 4px 0 #000000',
              }}
              className="px-3.5 py-1.5 rounded-xl border-4 border-black flex items-center justify-center transform rotate-3 text-black font-black text-sm select-none"
            >
              #{index + 1} POP!
            </div>
          </div>

          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1 pt-2 sm:pt-0">
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                backgroundColor: palette.primary,
                boxShadow: '4px 4px 0 #000000',
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl sm:rounded-3xl border-4 border-black text-black font-black text-lg sm:text-xl tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-150 group-hover:scale-105 active:translate-x-1 active:translate-y-1 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current text-black" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 3. NEON ARCADE (neon_arcade)
    // ==========================================
    case 'neon_arcade':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}, inset 0 0 20px ${palette.glowColor}25`,
          }}
          className={`relative group rounded-[36px] border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden ${
            isLight ? 'bg-white/95' : 'bg-slate-950/95 text-white'
          }`}
        >
          {/* Glowing side connector tubes */}
          <div
            style={{ background: `linear-gradient(to right, transparent, ${palette.primary})`, boxShadow: `0 0 12px ${palette.primary}` }}
            className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-1.5 rounded-full pointer-events-none"
          />
          <div
            style={{ background: `linear-gradient(to left, transparent, ${palette.primary})`, boxShadow: `0 0 12px ${palette.primary}` }}
            className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-1.5 rounded-full pointer-events-none"
          />

          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                boxShadow: `0 0 16px ${palette.glowColor}`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border-2 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl flex-shrink-0 group-hover:scale-105 transition-transform"
            >
              {index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                borderColor: palette.primary,
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 0 25px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-full border-2 font-mono font-black text-lg sm:text-xl uppercase tracking-wider text-white flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 4. MECHA HUD (bento_tech)
    // ==========================================
    case 'bento_tech':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 0 30px ${palette.glowColor}`,
            clipPath:
              'polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px)',
          }}
          className={`relative group border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-98 font-mono flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 ${
            isLight ? 'bg-white/95' : 'bg-slate-950/95 text-white'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                backgroundColor: `${palette.primary}15`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 border-2 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              0{index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                borderColor: palette.primary,
                boxShadow: `0 0 20px ${palette.glowColor}`,
                backgroundColor: `${palette.primary}25`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 border-l-4 border-r border-t border-b font-mono font-black text-base sm:text-lg uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>&gt; JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 5. GAME SHOW VIP (neumorphic_luxe)
    // ==========================================
    case 'neumorphic_luxe':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 20px 50px ${palette.glowColor}`,
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-4 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-visible ${
            isLight ? 'bg-white/95' : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white'
          }`}
        >
          {/* Floating Gold Ribbon Badge */}
          <div className="absolute -top-5 left-6 sm:left-10 z-20 pointer-events-none">
            <div
              style={{
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 4px 16px ${palette.glowColor}`,
              }}
              className="flex items-center gap-1.5 px-4 py-1 rounded-full border-2 border-white/80 text-slate-950 font-black text-xs uppercase tracking-widest"
            >
              <Award className="w-3.5 h-3.5 fill-current" />
              <span>Edição VIP #{index + 1}</span>
            </div>
          </div>

          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1 pt-2 sm:pt-0">
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 8px 24px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-full border-2 border-white/70 font-black text-lg sm:text-xl uppercase tracking-wider text-slate-950 flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 6. CYBER GLASS (modern_glass)
    // ==========================================
    case 'modern_glass':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: `${palette.primary}80`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${palette.glowColor}30`,
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden backdrop-blur-2xl ${
            isLight ? 'bg-white/90 text-slate-900' : 'bg-white/[0.08] text-white'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: `${palette.primary}60`,
                backgroundColor: `${palette.primary}15`,
                color: palette.primary,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-black text-2xl sm:text-3xl flex-shrink-0 backdrop-blur-md"
            >
              {index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 0 25px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl text-white font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 7. SPATIAL 3D (spatial_3d)
    // ==========================================
    case 'spatial_3d':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: `${palette.primary}90`,
            boxShadow: `0 30px 60px -15px ${palette.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden ${
            isLight ? 'bg-white/95 text-slate-900' : 'bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 text-white'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                background: `linear-gradient(135deg, ${palette.primary}30, ${palette.secondary}20)`,
                color: palette.primary,
                boxShadow: `0 10px 20px ${palette.glowColor}40`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              {index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 15px 30px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl text-white font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 8. PIXEL ART 8-BIT (pixel_retro)
    // ==========================================
    case 'pixel_retro':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `6px 6px 0 ${palette.darkShade}`,
          }}
          className={`relative group rounded-none border-4 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-150 hover:scale-[1.01] active:translate-x-1 active:translate-y-1 font-mono flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 ${
            isLight ? 'bg-white text-slate-900' : 'bg-black text-yellow-300'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                color: '#000',
                backgroundColor: palette.primary,
                boxShadow: `3px 3px 0 ${palette.darkShade}`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 border-4 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              {index + 1}P
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                backgroundColor: palette.primary,
                boxShadow: `4px 4px 0 ${palette.darkShade}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-none border-4 border-white text-black font-mono font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:translate-x-1 active:translate-y-1 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current text-black" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 9. MATRIX TERMINAL (cyber_matrix)
    // ==========================================
    case 'cyber_matrix':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 0 25px ${palette.glowColor}`,
          }}
          className={`relative group rounded-xl border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-98 font-mono flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 ${
            isLight ? 'bg-white/95 text-slate-900' : 'bg-black/95 text-emerald-300'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                boxShadow: `0 0 12px ${palette.glowColor}`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-black border-2 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              [{index + 1}]
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                boxShadow: `0 0 15px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-lg bg-black border-2 font-mono font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>&gt; EXEC_GAME()</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 10. SYNTHWAVE GRID (synthwave_grid)
    // ==========================================
    case 'synthwave_grid':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}`,
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-2 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden ${
            isLight ? 'bg-white/95 text-slate-900' : 'bg-purple-950/80 text-pink-100'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                boxShadow: `0 0 16px ${palette.glowColor}`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-900/60 border-2 flex items-center justify-center font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              {index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                borderColor: '#F472B6',
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 0 20px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl border-2 text-white font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 11. ROYALE CASINO GOLD (golden_casino)
    // ==========================================
    case 'golden_casino':
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}`,
          }}
          className={`relative group rounded-[32px] sm:rounded-[36px] border-4 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden ${
            isLight ? 'bg-white/95 text-slate-900' : 'bg-stone-950/95 text-amber-100'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: palette.primary,
                background: 'linear-gradient(to bottom, #f59e0b, #b45309)',
                color: '#fff',
                boxShadow: `0 0 16px ${palette.glowColor}`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-serif font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              {index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                borderColor: '#fef08a',
                background: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',
                boxShadow: `0 8px 24px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-2xl border-2 text-stone-950 font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current text-stone-950" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 12. BUBBLE CANDY TOON (bubble_toon)
    // ==========================================
    case 'bubble_toon':
    default:
      return (
        <div
          onClick={handleCardClick}
          style={{
            fontFamily,
            borderColor: `${palette.primary}70`,
            boxShadow: `0 12px 24px ${palette.glowColor}40`,
          }}
          className={`relative group rounded-[40px] border-4 p-6 sm:p-8 lg:p-9 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 active:scale-98 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden ${
            isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-900/90 text-white'
          }`}
        >
          <div className="flex items-start gap-5 sm:gap-7 z-10 w-full lg:flex-1">
            <div
              style={{
                borderColor: '#ffffff',
                background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                color: '#fff',
                boxShadow: `0 4px 12px ${palette.glowColor}`,
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center font-black text-2xl sm:text-3xl flex-shrink-0"
            >
              {index + 1}
            </div>
            {renderMetaAndTitle()}
          </div>

          <div className="z-10 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 justify-end">
            <GameCardThumbnail game={game} themePrimary={palette.primary} isLight={isLight} />
            <button
              type="button"
              style={{
                borderColor: '#ffffff',
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 8px 16px ${palette.glowColor}`,
              }}
              className="w-full sm:w-auto py-4 sm:py-5 px-8 sm:px-10 rounded-full border-4 text-white font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-transform group-hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );
  }
};
