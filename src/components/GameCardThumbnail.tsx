import React from 'react';
import { 
  Disc, HelpCircle, Target, Grid, ShoppingBag, Gauge, Lock, 
  Sparkles, Puzzle, Zap, Search, PenTool, ThumbsUp, Type, 
  ListOrdered, Link, AlertTriangle, MapPin, CheckCircle2,
  Check, Flame, Shield, Award
} from 'lucide-react';
import { GameDefinition } from '../types';

interface GameCardThumbnailProps {
  game: GameDefinition;
  themePrimary?: string;
  isLight?: boolean;
}

export const GameCardThumbnail: React.FC<GameCardThumbnailProps> = ({
  game,
  themePrimary = '#DC2626',
  isLight = false,
}) => {
  const renderGameArt = () => {
    switch (game.id) {
      case 'wheel':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Spinning colorful wheel */}
            <div className="w-20 h-20 rounded-full border-4 border-amber-300 shadow-lg relative overflow-hidden animate-[spin_12s_linear_infinite] flex items-center justify-center bg-conic-wheel">
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ef4444_0deg_45deg,#f59e0b_45deg_90deg,#10b981_90deg_135deg,#06b6d4_135deg_180deg,#8b5cf6_180deg_225deg,#ec4899_225deg_270deg,#f97316_270deg_315deg,#3b82f6_315deg_360deg)]" />
              {/* Center Hub */}
              <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white shadow-md flex items-center justify-center">
                <Disc className="w-3.5 h-3.5 text-slate-900 animate-spin" />
              </div>
            </div>
            {/* Pointer Pin */}
            <div className="absolute top-1 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-amber-300 drop-shadow-md z-20" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-pulse" />
          </div>
        );

      case 'quiz':
        return (
          <div className="relative w-full h-full p-2 flex flex-col justify-between">
            {/* Top mini header */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-cyan-400" />
                <span>Q. 01/05</span>
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                15s
              </span>
            </div>
            {/* Mini Question Bar */}
            <div className="w-full bg-white/10 rounded-md p-1.5 border border-white/15">
              <div className="h-1.5 w-3/4 bg-white/70 rounded-full mb-1" />
              <div className="h-1.5 w-1/2 bg-white/40 rounded-full" />
            </div>
            {/* 4 Mini Options with one Correct */}
            <div className="grid grid-cols-2 gap-1">
              <div className="h-5 rounded bg-emerald-500/80 border border-emerald-400 flex items-center justify-between px-1.5 text-[8px] font-black text-white shadow-xs">
                <span>A</span>
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div className="h-5 rounded bg-white/10 border border-white/15 flex items-center px-1.5 text-[8px] font-black text-slate-300">
                <span>B</span>
              </div>
              <div className="h-5 rounded bg-white/10 border border-white/15 flex items-center px-1.5 text-[8px] font-black text-slate-300">
                <span>C</span>
              </div>
              <div className="h-5 rounded bg-white/10 border border-white/15 flex items-center px-1.5 text-[8px] font-black text-slate-300">
                <span>D</span>
              </div>
            </div>
          </div>
        );

      case 'target':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute w-20 h-20 rounded-full border border-red-500/30 animate-ping opacity-30" />
            <div className="w-18 h-18 rounded-full border-2 border-red-500/50 flex items-center justify-center relative">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                  <Target className="w-4 h-4 text-white animate-pulse" />
                </div>
              </div>
              {/* Crosshair lines */}
              <div className="absolute h-full w-[1px] bg-red-500/40" />
              <div className="absolute w-full h-[1px] bg-red-500/40" />
            </div>
            <span className="absolute bottom-1 right-2 text-[9px] font-black text-amber-400 font-mono bg-black/50 px-1 rounded">
              +100 PTS
            </span>
          </div>
        );

      case 'memory':
        return (
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1.5 w-full max-w-[90px]">
              <div className="h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-300 flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-300 flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/50 text-[10px] font-bold">
                ?
              </div>
              <div className="h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/50 text-[10px] font-bold">
                ?
              </div>
            </div>
          </div>
        );

      case 'catcher':
        return (
          <div className="relative w-full h-full p-2 flex flex-col justify-between overflow-hidden">
            {/* Falling items */}
            <div className="flex justify-around items-start pt-1">
              <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-md shadow-amber-400/50 animate-bounce">
                <Award className="w-2.5 h-2.5 text-slate-950" />
              </div>
              <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center shadow-md shadow-pink-500/50 animate-bounce delay-150">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            {/* Basket / Catcher at bottom */}
            <div className="w-3/4 mx-auto h-5 rounded-t-xl bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-t-purple-300 border-white/20 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-3 h-3 text-white" />
            </div>
          </div>
        );

      case 'speed':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Speedometer dial */}
            <div className="relative w-18 h-18 rounded-full border-4 border-amber-500/40 border-b-transparent flex items-center justify-center bg-slate-950/60 shadow-inner">
              <Gauge className="w-7 h-7 text-amber-400" />
              <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-amber-300 font-mono">
              <Flame className="w-3 h-3 text-red-500 fill-current animate-pulse" />
              <span>TURBO BOOST</span>
            </div>
          </div>
        );

      case 'safe':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-amber-500/60 shadow-xl flex items-center justify-center relative">
              {/* Dial wheel */}
              <div className="w-11 h-11 rounded-full border-2 border-amber-400/80 bg-slate-900 flex items-center justify-center shadow-inner animate-[spin_8s_linear_infinite]">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-emerald-400" />
            </div>
          </div>
        );

      case 'genius':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-18 h-18 rounded-full border-2 border-white/20 grid grid-cols-2 gap-1 p-1 bg-black/60 shadow-lg">
              <div className="rounded-tl-full bg-emerald-500 opacity-90 hover:opacity-100 transition-opacity" />
              <div className="rounded-tr-full bg-rose-500 opacity-90 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
              <div className="rounded-bl-full bg-amber-500 opacity-90" />
              <div className="rounded-br-full bg-blue-500 opacity-90" />
            </div>
          </div>
        );

      case 'puzzle':
        return (
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1 w-full max-w-[85px] bg-black/40 p-1 rounded-xl border border-white/15">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-5 rounded bg-gradient-to-br from-teal-500 to-emerald-600 border border-teal-300/40 flex items-center justify-center text-[8px] font-mono font-black text-white">
                  {n}
                </div>
              ))}
              <div className="h-5 rounded bg-white/5 border border-dashed border-white/20" />
            </div>
          </div>
        );

      case 'balloon':
        return (
          <div className="relative w-full h-full p-2 flex items-end justify-around overflow-hidden">
            <div className="w-5 h-7 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 animate-bounce relative mb-2">
              <div className="absolute -bottom-1 left-1.5 w-1.5 h-1 bg-rose-700" />
            </div>
            <div className="w-6 h-8 rounded-full bg-amber-400 shadow-md shadow-amber-400/50 animate-bounce delay-100 relative mb-5">
              <div className="absolute -bottom-1 left-2 w-1.5 h-1 bg-amber-600" />
            </div>
            <div className="w-5 h-7 rounded-full bg-sky-400 shadow-md shadow-sky-400/50 animate-bounce delay-200 relative mb-1">
              <div className="absolute -bottom-1 left-1.5 w-1.5 h-1 bg-sky-600" />
            </div>
          </div>
        );

      case 'wordsearch':
        return (
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <div className="grid grid-cols-4 gap-1 w-full max-w-[85px] text-center font-mono text-[9px] font-bold text-white/80 bg-black/40 p-1.5 rounded-xl border border-white/10">
              <span className="bg-amber-500 text-slate-950 font-black rounded px-0.5">S</span>
              <span className="bg-amber-500 text-slate-950 font-black rounded px-0.5">E</span>
              <span className="bg-amber-500 text-slate-950 font-black rounded px-0.5">G</span>
              <span>U</span>
              <span>R</span>
              <span>A</span>
              <span>N</span>
              <span>C</span>
              <span>A</span>
              <span>T</span>
              <span>O</span>
              <span>P</span>
            </div>
          </div>
        );

      case 'hangman':
        return (
          <div className="relative w-full h-full p-2 flex flex-col justify-between items-center">
            <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <PenTool className="w-3 h-3" />
              <span>FORCA</span>
            </div>
            {/* Word Slots */}
            <div className="flex gap-1">
              {['H', 'O', 'N', 'D', 'A'].map((l, i) => (
                <div key={i} className="w-4 h-6 border-b-2 border-emerald-400 text-center font-mono text-[10px] font-black text-white">
                  {i < 3 ? l : ''}
                </div>
              ))}
            </div>
            {/* Heart / chances */}
            <span className="text-[8px] text-slate-400 font-mono">Chances: 4/6</span>
          </div>
        );

      case 'truefalse':
        return (
          <div className="relative w-full h-full p-2 flex flex-col justify-around">
            <div className="h-6 rounded-lg bg-emerald-600/90 border border-emerald-400 flex items-center justify-center gap-1.5 text-[9px] font-black text-white shadow-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
              <span>VERDADEIRO</span>
            </div>
            <div className="h-6 rounded-lg bg-rose-600/90 border border-rose-400 flex items-center justify-center gap-1.5 text-[9px] font-black text-white shadow-md">
              <span>✗</span>
              <span>FALSO</span>
            </div>
          </div>
        );

      case 'speed_trivia':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 border-2 border-amber-300 shadow-xl shadow-amber-500/30 flex items-center justify-center relative">
              <Zap className="w-8 h-8 text-white fill-current animate-bounce" />
              <span className="absolute -top-1.5 -right-1.5 text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full border border-white">
                2X
              </span>
            </div>
            <span className="text-[9px] font-black text-amber-300 font-mono mt-1">FLASH 30S</span>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>
            <span className="text-[9px] font-black text-slate-300 font-mono mt-1">INTERATIVO</span>
          </div>
        );
    }
  };

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${game.previewBg} opacity-90`} />
      
      {/* Subtle Scanline / Glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 pointer-events-none" />

      {/* Decorative Brand Accent Ring */}
      <div 
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl opacity-50 pointer-events-none"
        style={{ backgroundColor: themePrimary }}
      />

      {/* Mini Interactive Art */}
      <div className="relative z-10 w-full h-full">
        {renderGameArt()}
      </div>

      {/* Corner category chip */}
      <div className="absolute bottom-1 left-1 z-20 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-[7px] font-black uppercase tracking-wider text-white/90">
        {game.category}
      </div>
    </div>
  );
};
