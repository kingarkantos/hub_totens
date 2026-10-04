import React, { useState } from 'react';
import { CheckCircle2, Clock, Trophy, ArrowLeft, Sparkles, HelpCircle, Gamepad2, Award } from 'lucide-react';
import { GameLayoutId, GAME_LAYOUTS } from '../types/gameLayouts';
import { LayoutColorPalette } from '../lib/colorHarmony';
import { getFontFamilyById } from '../lib/fonts';
import { sound } from '../lib/audio';

interface ThemedGamePlayPreviewProps {
  layoutId?: GameLayoutId;
  palette: LayoutColorPalette;
  isLight?: boolean;
  campaignFont?: string;
}

export const ThemedGamePlayPreview: React.FC<ThemedGamePlayPreviewProps> = ({
  layoutId = 'cartoon_comic',
  palette,
  isLight = false,
  campaignFont,
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const fontFamily = getFontFamilyById(campaignFont);

  const options = [
    { text: 'A) Motor Elétrico de Alta Eficiência & Autonomia', isCorrect: true },
    { text: 'B) Design Aerodinâmico com Menor Atrito', isCorrect: false },
    { text: 'C) Painel 100% Touchscreen Conectado', isCorrect: false },
    { text: 'D) Câmbio Automático com Modo Esportivo', isCorrect: false },
  ];

  const handleSelect = (idx: number) => {
    sound.playClick();
    setSelectedOption(idx);
    if (options[idx].isCorrect) {
      sound.playSuccess();
    }
  };

  const containerStyle: React.CSSProperties = {
    fontFamily,
  };

  // Switch layouts for the gameplay interface
  switch (layoutId) {
    // 1. CARTOON POP 3D
    case 'cartoon_pop':
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 10px 0 ${palette.darkShade}, 0 25px 50px rgba(0,0,0,0.6)`,
          }}
          className="w-full p-5 sm:p-7 rounded-3xl border-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white space-y-5"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                style={{
                  background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                  boxShadow: `0 3px 0 ${palette.darkShade}`,
                }}
                className="px-3 py-1 rounded-xl text-xs font-black uppercase text-white shadow-xs"
              >
                Pergunta 1 de 5
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-800 border-2 border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5" /> 28s
              </span>
              <span
                style={{
                  backgroundColor: palette.primary,
                  boxShadow: `0 2px 0 ${palette.darkShade}`,
                }}
                className="px-3 py-1 rounded-xl text-xs font-black text-white flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" /> 150 PTS
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div
            style={{
              borderColor: palette.primary,
              boxShadow: `0 6px 0 ${palette.darkShade}`,
            }}
            className="p-4 sm:p-5 rounded-2xl border-4 bg-slate-800/90 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
              Desafio Quiz da Campanha
            </span>
            <h4 className="text-base sm:text-lg font-black leading-snug">
              Qual é a principal inovação destacada no modelo em exposição?
            </h4>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  style={
                    isChosen
                      ? {
                          background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                          borderColor: '#FFFFFF',
                          boxShadow: `0 5px 0 ${palette.darkShade}`,
                        }
                      : {
                          boxShadow: `0 4px 0 #1e293b`,
                        }
                  }
                  className={`p-3.5 sm:p-4 rounded-2xl border-4 text-left font-black text-xs sm:text-sm transition-all duration-150 active:translate-y-1 flex items-center justify-between gap-2 ${
                    isChosen
                      ? 'text-white'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isChosen && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      );

    // 2. COMIC TOON POP
    case 'cartoon_comic':
      return (
        <div
          style={{
            ...containerStyle,
            boxShadow: '8px 8px 0 #000000',
          }}
          className="w-full p-5 sm:p-7 rounded-3xl border-4 border-black bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white space-y-5"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b-4 border-black flex-wrap gap-2">
            <span
              style={{
                backgroundColor: palette.primary,
                boxShadow: '3px 3px 0 #000000',
              }}
              className="px-3.5 py-1 rounded-xl border-2 border-black text-xs font-black uppercase text-black"
            >
              Questão 01/05 POP!
            </span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-yellow-400 border-2 border-black text-black font-black text-xs shadow-[2px_2px_0_#000] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 28s
              </span>
              <span
                style={{
                  backgroundColor: palette.primary,
                  boxShadow: '2px 2px 0 #000000',
                }}
                className="px-3 py-1 rounded-xl border-2 border-black text-xs font-black text-black flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" /> 150 PTS
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div
            style={{
              boxShadow: '6px 6px 0 #000000',
            }}
            className="p-4 sm:p-5 rounded-2xl border-4 border-black bg-slate-800 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
              Desafio Quiz Comic Pop
            </span>
            <h4 className="text-base sm:text-lg font-black leading-snug drop-shadow-[1px_1px_0_#000]">
              Qual é a principal inovação destacada no modelo em exposição?
            </h4>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  style={
                    isChosen
                      ? {
                          backgroundColor: palette.primary,
                          boxShadow: '4px 4px 0 #000000',
                        }
                      : {
                          boxShadow: '3px 3px 0 #000000',
                        }
                  }
                  className={`p-3.5 sm:p-4 rounded-2xl border-4 border-black text-left font-black text-xs sm:text-sm transition-all duration-150 active:translate-x-1 active:translate-y-1 flex items-center justify-between gap-2 ${
                    isChosen
                      ? 'text-black'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isChosen && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-black stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      );

    // 3. NEON ARCADE
    case 'neon_arcade':
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}, inset 0 0 20px ${palette.glowColor}25`,
          }}
          className="w-full p-5 sm:p-7 rounded-[36px] border-2 bg-slate-950 text-white space-y-5"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 flex-wrap gap-2">
            <span
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                boxShadow: `0 0 10px ${palette.glowColor}`,
              }}
              className="px-3 py-1 rounded-full border text-xs font-mono font-black uppercase tracking-wider"
            >
              ARCADE // STAGE 01
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-bold flex items-center gap-1.5 text-cyan-300">
                <Clock className="w-3.5 h-3.5" /> 28s
              </span>
              <span
                style={{
                  borderColor: palette.primary,
                  color: palette.primary,
                }}
                className="px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" /> 150 PTS
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div
            style={{
              borderColor: `${palette.primary}60`,
              boxShadow: `0 0 20px ${palette.glowColor}25`,
            }}
            className="p-4 sm:p-5 rounded-3xl border-2 bg-slate-900/90 text-center"
          >
            <span style={{ color: palette.primary }} className="text-[10px] font-mono uppercase tracking-widest block mb-1">
              [ NEON QUESTION PROTOCOL ]
            </span>
            <h4
              style={{ textShadow: `0 0 10px ${palette.glowColor}` }}
              className="text-base sm:text-lg font-black font-mono leading-snug"
            >
              Qual é a principal inovação destacada no modelo em exposição?
            </h4>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  style={
                    isChosen
                      ? {
                          borderColor: palette.primary,
                          background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                          boxShadow: `0 0 20px ${palette.glowColor}`,
                        }
                      : {
                          borderColor: `${palette.primary}40`,
                        }
                  }
                  className={`p-3.5 sm:p-4 rounded-full border-2 text-left font-mono font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 flex items-center justify-between gap-2 ${
                    isChosen
                      ? 'text-white'
                      : 'bg-slate-900/80 text-slate-300 hover:border-cyan-400'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isChosen && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      );

    // 4. MECHA HUD (bento_tech)
    case 'bento_tech':
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 30px ${palette.glowColor}`,
            clipPath:
              'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)',
          }}
          className="w-full p-5 sm:p-7 border-2 bg-slate-950 font-mono text-white space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30 flex-wrap gap-2">
            <span style={{ color: palette.primary }} className="text-xs font-mono font-black uppercase tracking-widest">
              [ SEC_01 // QUERY ACTIVE ]
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                T: 28s
              </span>
              <span style={{ color: palette.primary }} className="text-xs font-mono font-black">
                SCORE: 150
              </span>
            </div>
          </div>

          <div
            style={{
              borderColor: palette.primary,
              backgroundColor: `${palette.primary}10`,
            }}
            className="p-4 sm:p-5 border-2 text-center"
          >
            <h4 className="text-base sm:text-lg font-black tracking-wide leading-snug">
              QUAL É A PRINCIPAL INOVAÇÃO DESTACADA NO MODELO EM EXPOSIÇÃO?
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  style={
                    isChosen
                      ? {
                          borderColor: palette.primary,
                          backgroundColor: `${palette.primary}30`,
                          boxShadow: `0 0 15px ${palette.glowColor}`,
                        }
                      : {
                          borderColor: `${palette.primary}30`,
                        }
                  }
                  className={`p-3.5 border-l-4 border-r border-t border-b text-left font-mono text-xs sm:text-sm transition-all duration-150 active:scale-98 flex items-center justify-between gap-2 ${
                    isChosen ? 'text-white font-black' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isChosen && <span style={{ color: palette.primary }} className="font-mono font-black">[OK]</span>}
                </button>
              );
            })}
          </div>
        </div>
      );

    // DEFAULT / OTHER LAYOUTS
    default:
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: `${palette.primary}80`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${palette.glowColor}30`,
          }}
          className="w-full p-5 sm:p-7 rounded-3xl border-2 backdrop-blur-2xl bg-white/[0.08] text-white space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
            <span
              style={{
                backgroundColor: `${palette.primary}30`,
                borderColor: `${palette.primary}60`,
                color: palette.primary,
              }}
              className="px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider"
            >
              Questão 1 de 5
            </span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> 28s
              </span>
              <span
                style={{
                  backgroundColor: palette.primary,
                }}
                className="px-3 py-1 rounded-full text-xs font-black text-white flex items-center gap-1.5 shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5" /> 150 PTS
              </span>
            </div>
          </div>

          <div
            style={{
              borderColor: `${palette.primary}40`,
            }}
            className="p-4 sm:p-5 rounded-2xl border-2 bg-white/5 text-center"
          >
            <span style={{ color: palette.primary }} className="text-[10px] font-bold uppercase tracking-wider block mb-1">
              Desafio Interativo
            </span>
            <h4 className="text-base sm:text-lg font-black leading-snug">
              Qual é a principal inovação destacada no modelo em exposição?
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  style={
                    isChosen
                      ? {
                          background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                          boxShadow: `0 0 20px ${palette.glowColor}`,
                        }
                      : {}
                  }
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 flex items-center justify-between gap-2 ${
                    isChosen
                      ? 'border-white/60 text-white shadow-lg'
                      : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isChosen && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      );
  }
};
