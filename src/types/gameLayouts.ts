import React from 'react';
import { Sparkles, Gamepad2, LayoutGrid, Gem, Box, Smile, Trophy } from 'lucide-react';

export type GameLayoutId = 'cartoon_pop' | 'cartoon_comic' | 'neon_arcade' | 'bento_tech' | 'neumorphic_luxe' | 'modern_glass' | 'spatial_3d';

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
    id: 'cartoon_pop',
    name: 'Cartoon Game 3D',
    tagline: 'Estilo Jogo & Toon Pop',
    description: 'Medalha "?" 3D em relevo, bordas cartoon grossas com sombra 3D, botões táteis e grade 2x2.',
    iconName: 'Smile',
    previewBg: 'from-amber-400 via-orange-500 to-rose-500',
    badgeBg: 'bg-amber-400/25 text-amber-200 border-amber-400/50 shadow-md',
    containerClass: 'rounded-3xl border-4 border-amber-400/90 shadow-[0_10px_0_#92400e]',
    headerClass: 'border-b-4 border-amber-400/60 bg-slate-900/90',
    cardClass: 'rounded-3xl border-4 border-amber-400/90 shadow-[0_10px_0_#92400e,0_20px_40px_rgba(0,0,0,0.6)]',
    buttonClass: 'rounded-2xl border-4 border-amber-300/80 shadow-[0_6px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f]',
    ambientEffect: 'particles',
  },
  {
    id: 'cartoon_comic',
    name: 'Comic Toon Pop',
    tagline: 'Gibi & Cores Vivas',
    description: 'Bordas pretas grossas estilo quadrinhos, sombra sólida marcante, estrela "?" e botões pop vibrantes.',
    iconName: 'Sparkles',
    previewBg: 'from-sky-400 via-cyan-500 to-emerald-400',
    badgeBg: 'bg-sky-400 text-slate-950 border-2 border-black font-black shadow-[2px_2px_0_#000]',
    containerClass: 'rounded-3xl border-4 border-black shadow-[8px_8px_0_#000]',
    headerClass: 'border-b-4 border-black bg-slate-900',
    cardClass: 'rounded-3xl border-4 border-black shadow-[8px_8px_0_#000]',
    buttonClass: 'rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000]',
    ambientEffect: 'dots',
  },
  {
    id: 'neon_arcade',
    name: 'Neon Arcade',
    tagline: 'Fliperama & Tubos Neon',
    description: 'Cápsula neon pulsante com tubos de energia luminosos, botões pílula 2x2 e scanlines retrô.',
    iconName: 'Gamepad2',
    previewBg: 'from-cyan-500 via-fuchsia-600 to-pink-600',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    containerClass: 'rounded-[36px] border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.35)]',
    headerClass: 'border-b border-cyan-500/40 bg-black/70 backdrop-blur-md',
    cardClass: 'rounded-[36px] border-2 border-cyan-400/80 bg-slate-950/90 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    buttonClass: 'rounded-full border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    ambientEffect: 'scanlines',
  },
  {
    id: 'bento_tech',
    name: 'Mecha HUD',
    tagline: 'Ficção Científica & Visor',
    description: 'Containers chanfrados angulares estilo cockpit, aletas de ventilação, ribbons técnicos e micro-telemetria.',
    iconName: 'LayoutGrid',
    previewBg: 'from-emerald-600 via-teal-700 to-slate-900',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-mono',
    containerClass: 'border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    headerClass: 'border-b border-emerald-500/40 bg-slate-950/95 font-mono',
    cardClass: 'border-2 border-emerald-500/70 bg-slate-950/95 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    buttonClass: 'border-l-4 border-emerald-400 bg-slate-900/90 font-mono tracking-wide',
    ambientEffect: 'dots',
  },
  {
    id: 'neumorphic_luxe',
    name: 'Game Show VIP',
    tagline: 'Quiz de TV & Dourado',
    description: 'Moldura dourada reluzente de show de auditório, medalhão 3D "?" no topo e botões ovais em grade 2x2.',
    iconName: 'Trophy',
    previewBg: 'from-amber-600 via-yellow-600 to-slate-950',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    containerClass: 'rounded-[32px] border-2 border-amber-400/60 shadow-[0_20px_50px_rgba(245,158,11,0.25)]',
    headerClass: 'border-b border-amber-400/30 bg-slate-950/80 backdrop-blur-xl',
    cardClass: 'rounded-[32px] border-2 border-amber-400/60 bg-gradient-to-b from-slate-900/95 to-slate-950 shadow-2xl',
    buttonClass: 'rounded-full border-2 border-amber-400/60 shadow-lg',
    ambientEffect: 'velvet',
  },
  {
    id: 'modern_glass',
    name: 'Cyber Glass',
    tagline: 'Vidro Translúcido Clean',
    description: 'Vidro jateado translúcido refinado, iluminação difusa e estética clean de totem premium.',
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
