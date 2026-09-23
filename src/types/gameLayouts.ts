import React from 'react';
import { Sparkles, Gamepad2, LayoutGrid, Gem, Box } from 'lucide-react';

export type GameLayoutId = 'modern_glass' | 'neon_arcade' | 'bento_tech' | 'neumorphic_luxe' | 'spatial_3d';

export interface GameLayoutDefinition {
  id: GameLayoutId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  previewBg: string;
  badgeBg: string;
  containerClass: string;
  headerClass: string;
  cardClass: string;
  buttonClass: string;
  ambientEffect: 'orbs' | 'scanlines' | 'dots' | 'velvet' | 'particles';
}

export const GAME_LAYOUTS: GameLayoutDefinition[] = [
  {
    id: 'modern_glass',
    name: 'Cyber Glass',
    tagline: 'Moderno & Sofisticado',
    description: 'Vidro jateado translúcido, iluminação difusa e cantos orgânicos arredondados.',
    iconName: 'Sparkles',
    previewBg: 'from-blue-600 via-indigo-600 to-purple-700',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    containerClass: 'rounded-3xl backdrop-blur-2xl border-2',
    headerClass: 'backdrop-blur-md border-b',
    cardClass: 'rounded-3xl border-2 backdrop-blur-xl',
    buttonClass: 'rounded-2xl',
    ambientEffect: 'orbs',
  },
  {
    id: 'neon_arcade',
    name: 'Neon Arcade',
    tagline: 'Cyberpunk & Alta Energia',
    description: 'Visual fliperama retrô com cantos angulados HUD, bordas neon pulsantes e scanlines sutis.',
    iconName: 'Gamepad2',
    previewBg: 'from-cyan-500 via-fuchsia-600 to-pink-600',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    containerClass: 'rounded-xl border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.25)]',
    headerClass: 'border-b border-cyan-500/30 bg-black/60',
    cardClass: 'rounded-xl border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    buttonClass: 'rounded-lg border-2 border-cyan-400/60 uppercase tracking-widest',
    ambientEffect: 'scanlines',
  },
  {
    id: 'bento_tech',
    name: 'Bento Tech',
    tagline: 'Modular & Industrial',
    description: 'Layout em blocos modulares geométricos, telemetria HUD e micro-grade de alta precisão.',
    iconName: 'LayoutGrid',
    previewBg: 'from-emerald-600 via-teal-700 to-slate-900',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-mono',
    containerClass: 'rounded-2xl border-2 border-slate-700/80 shadow-2xl',
    headerClass: 'border-b border-slate-800 bg-slate-900/95 font-mono',
    cardClass: 'rounded-2xl border-2 border-slate-700 bg-slate-900/90 shadow-xl',
    buttonClass: 'rounded-xl font-mono tracking-tight',
    ambientEffect: 'dots',
  },
  {
    id: 'neumorphic_luxe',
    name: 'Luxe Minimalista',
    tagline: 'Elegância & Curvas Orgânicas',
    description: 'Curvas ultra-arredondadas, iluminação suave aveludada e sombras profundas sofisticadas.',
    iconName: 'Gem',
    previewBg: 'from-amber-600 via-orange-600 to-stone-900',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    containerClass: 'rounded-[38px] border-2 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
    headerClass: 'border-b border-white/10 bg-black/30 backdrop-blur-xl',
    cardClass: 'rounded-[36px] border-2 border-white/15 shadow-2xl',
    buttonClass: 'rounded-[24px] shadow-lg',
    ambientEffect: 'velvet',
  },
  {
    id: 'spatial_3d',
    name: 'Spatial 3D',
    tagline: 'Ilha Flutuante & Shimmer',
    description: 'Profundidade 3D dramática, efeito feixe de luz que varre as bordas e partículas flutuantes.',
    iconName: 'Box',
    previewBg: 'from-violet-600 via-purple-700 to-indigo-900',
    badgeBg: 'bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-lg',
    containerClass: 'rounded-3xl border-2 border-purple-500/40 shadow-[0_30px_70px_rgba(0,0,0,0.7)]',
    headerClass: 'border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-2xl',
    cardClass: 'rounded-3xl border-2 border-purple-400/40 shadow-[0_25px_60px_-15px_rgba(147,51,234,0.3)]',
    buttonClass: 'rounded-2xl shadow-xl hover:-translate-y-1 transition-transform',
    ambientEffect: 'particles',
  },
];
