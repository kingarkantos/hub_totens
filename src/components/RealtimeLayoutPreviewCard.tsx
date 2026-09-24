import React from 'react';
import { 
  Play, Sparkles, Smile, Gamepad2, LayoutGrid, Trophy, Box, Award, Crown, Zap
} from 'lucide-react';
import { GameLayoutId, GAME_LAYOUTS } from '../types/gameLayouts';
import { LayoutColorPalette } from '../lib/colorHarmony';
import { getFontFamilyById } from '../lib/fonts';

interface RealtimeLayoutPreviewCardProps {
  layoutId: GameLayoutId;
  palette: LayoutColorPalette;
  isLight?: boolean;
  campaignFont?: string;
}

export const RealtimeLayoutPreviewCard: React.FC<RealtimeLayoutPreviewCardProps> = ({
  layoutId,
  palette,
  isLight = false,
  campaignFont,
}) => {
  const layoutDef = GAME_LAYOUTS.find((l) => l.id === layoutId) || GAME_LAYOUTS[0];
  const fontFamily = getFontFamilyById(campaignFont);

  const containerStyle: React.CSSProperties = {
    fontFamily,
  };

  switch (layoutId) {
    // ==========================================
    // 1. CARTOON GAME 3D (cartoon_pop)
    // ==========================================
    case 'cartoon_pop':
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 10px 0 ${palette.darkShade}, 0 20px 40px rgba(0,0,0,0.6)`,
          }}
          className="w-full p-6 sm:p-7 rounded-3xl border-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative overflow-visible transition-all duration-300"
        >
          {/* Floating 3D Coin Badge */}
          <div className="absolute -top-7 left-6 sm:left-10 z-20 pointer-events-none">
            <div
              style={{
                background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 6px 0 ${palette.darkShade}, 0 10px 20px rgba(0,0,0,0.5)`,
              }}
              className="w-14 h-14 rounded-2xl border-4 border-white/90 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform"
            >
              <span className="text-3xl font-black text-white select-none drop-shadow-md">?</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  style={{ backgroundColor: palette.primary }}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                >
                  3D Toon Pop
                </span>
                <span className="text-xs text-slate-400 font-bold">Modo Relevo Tátil</span>
              </div>
              <h4 className="text-base sm:text-xl font-black text-white leading-tight drop-shadow-sm">
                Quiz &amp; Desafios da Campanha
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Bordas cartoon grossas com sombra 3D física, medalha em relevo e botões táteis
              </p>
            </div>

            <button
              type="button"
              style={{
                background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 6px 0 ${palette.darkShade}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl border-4 border-white/80 font-black text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2.5 transition-all duration-200 active:translate-y-1.5 hover:brightness-110 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            boxShadow: '8px 8px 0 #000000',
          }}
          className="w-full p-6 sm:p-7 rounded-3xl border-4 border-black bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative transition-all duration-300"
        >
          {/* Slanted Comic Badge */}
          <div className="absolute -top-6 left-6 sm:left-10 z-20 pointer-events-none">
            <div
              style={{
                backgroundColor: palette.primary,
                boxShadow: '4px 4px 0 #000000',
              }}
              className="w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center transform rotate-6 text-black font-black text-2xl select-none"
            >
              POP!
            </div>
          </div>

          <div className="pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  style={{ backgroundColor: palette.primary }}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase text-black border-2 border-black shadow-[2px_2px_0_#000]"
                >
                  Gibi &amp; HQ
                </span>
                <span className="text-xs text-slate-300 font-black">Traço Preto &amp; Sombra Sólida</span>
              </div>
              <h4 className="text-base sm:text-xl font-black text-white leading-tight drop-shadow-[2px_2px_0_#000]">
                Quiz &amp; Desafios da Campanha
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Bordas pretas grossas marcantes, sombra 2D sólida e visual de histórias em quadrinhos
              </p>
            </div>

            <button
              type="button"
              style={{
                backgroundColor: palette.primary,
                boxShadow: '4px 4px 0 #000000',
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl border-4 border-black font-black text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2.5 transition-all duration-150 active:translate-x-1 active:translate-y-1 hover:brightness-105 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}, inset 0 0 20px ${palette.glowColor}25`,
          }}
          className="w-full p-6 sm:p-7 rounded-[36px] sm:rounded-full border-2 bg-slate-950/95 relative overflow-hidden transition-all duration-300"
        >
          {/* Glowing side connector tubes */}
          <div
            style={{
              background: `linear-gradient(to right, transparent, ${palette.primary})`,
              boxShadow: `0 0 12px ${palette.primary}`,
            }}
            className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-1.5 rounded-full pointer-events-none"
          />
          <div
            style={{
              background: `linear-gradient(to left, transparent, ${palette.primary})`,
              boxShadow: `0 0 12px ${palette.primary}`,
            }}
            className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-1.5 rounded-full pointer-events-none"
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10 px-2 sm:px-4">
            <div className="flex items-center gap-4">
              <div
                style={{
                  borderColor: palette.primary,
                  color: palette.primary,
                  boxShadow: `0 0 16px ${palette.glowColor}`,
                }}
                className="w-13 h-13 rounded-full bg-slate-900 border-2 flex items-center justify-center font-mono font-black text-xl flex-shrink-0"
              >
                <Gamepad2 className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={{ borderColor: palette.primary, color: palette.primary }}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border tracking-wider"
                  >
                    ARCADE // 01
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Tubos Neon Pulsantes</span>
                </div>
                <h4
                  style={{ textShadow: `0 0 15px ${palette.glowColor}` }}
                  className="text-base sm:text-xl font-black text-white leading-tight font-mono tracking-wide"
                >
                  Quiz &amp; Desafios da Campanha
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cápsula neon futurista com iluminação por tubos catódicos e botões pílula
                </p>
              </div>
            </div>

            <button
              type="button"
              style={{
                borderColor: palette.primary,
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 0 25px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-full border-2 font-mono font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 30px ${palette.glowColor}`,
            clipPath:
              'polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px)',
          }}
          className="w-full p-6 sm:p-7 border-2 bg-slate-950/95 relative font-mono transition-all duration-300"
        >
          {/* Tech cooling louvers */}
          <div className="flex items-center gap-1.5 mb-3">
            <div style={{ backgroundColor: `${palette.primary}70` }} className="w-6 h-1 rounded-full" />
            <div
              style={{ backgroundColor: palette.primary, boxShadow: `0 0 8px ${palette.glowColor}` }}
              className="w-12 h-1.5 rounded-full"
            />
            <div style={{ backgroundColor: `${palette.primary}70` }} className="w-6 h-1 rounded-full" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <span
                style={{ color: palette.primary }}
                className="text-[11px] font-black uppercase tracking-widest block mb-1"
              >
                [ SYS_HUD // COCKPIT PROTOCOL ACTIVE ]
              </span>
              <h4 className="text-base sm:text-xl font-black text-white leading-tight tracking-wider">
                QUIZ &amp; DESAFIOS DA CAMPANHA
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Cantos chanfrados aeroespaciais, aletas de ventilação e botões angulares com telemetria
              </p>
            </div>

            <button
              type="button"
              style={{
                borderColor: palette.primary,
                boxShadow: `0 0 20px ${palette.glowColor}`,
                backgroundColor: `${palette.primary}20`,
              }}
              className="w-full md:w-auto px-7 py-3.5 border-l-4 border-r border-t border-b font-mono font-black text-xs sm:text-sm uppercase tracking-widest text-white flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-125 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>&gt; INICIAR JOGO</span>
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
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 20px 50px ${palette.glowColor}`,
          }}
          className="w-full p-6 sm:p-7 rounded-[32px] border-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative transition-all duration-300"
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
              <span>Edição VIP</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <span style={{ color: palette.primary }} className="text-xs font-black uppercase tracking-wider block mb-1">
                Show de Auditório &amp; Ouro Refinado
              </span>
              <h4 className="text-base sm:text-xl font-black text-white leading-tight drop-shadow-sm">
                Quiz &amp; Desafios da Campanha
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Moldura dourada reluzente de show de TV, medalhões nobres e botões VIP ovais
              </p>
            </div>

            <button
              type="button"
              style={{
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 8px 24px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-full border-2 border-white/70 font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            borderColor: `${palette.primary}80`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${palette.glowColor}30`,
          }}
          className="w-full p-6 sm:p-7 rounded-3xl border-2 backdrop-blur-2xl bg-white/[0.08] relative overflow-hidden transition-all duration-300"
        >
          {/* Glass Specular Beam */}
          <div
            style={{
              background: `linear-gradient(135deg, ${palette.primary}20, transparent 60%)`,
            }}
            className="absolute inset-0 pointer-events-none"
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div
                style={{
                  borderColor: `${palette.primary}60`,
                  backgroundColor: `${palette.primary}15`,
                  color: palette.primary,
                }}
                className="w-13 h-13 rounded-2xl border-2 flex items-center justify-center font-black text-xl flex-shrink-0 backdrop-blur-md"
              >
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <span style={{ color: palette.primary }} className="text-xs font-bold uppercase tracking-wider block mb-1">
                  Vidro Jateado &amp; Translúcido Clean
                </span>
                <h4 className="text-base sm:text-xl font-black text-white leading-tight">
                  Quiz &amp; Desafios da Campanha
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estética clean ultra premium de totem comercial com iluminação difusa
                </p>
              </div>
            </div>

            <button
              type="button"
              style={{
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 0 25px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            borderColor: `${palette.primary}90`,
            boxShadow: `0 30px 60px -15px ${palette.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
          className="w-full p-6 sm:p-7 rounded-3xl border-2 bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 relative overflow-hidden transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div
                style={{
                  borderColor: palette.primary,
                  background: `linear-gradient(135deg, ${palette.primary}30, ${palette.secondary}20)`,
                  color: palette.primary,
                  boxShadow: `0 10px 20px ${palette.glowColor}40`,
                }}
                className="w-13 h-13 rounded-2xl border-2 flex items-center justify-center font-black text-xl flex-shrink-0"
              >
                <Box className="w-6 h-6" />
              </div>

              <div>
                <span style={{ color: palette.primary }} className="text-xs font-bold uppercase tracking-wider block mb-1">
                  Ilha Flutuante &amp; Shimmer 3D
                </span>
                <h4 className="text-base sm:text-xl font-black text-white leading-tight">
                  Quiz &amp; Desafios da Campanha
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Profundidade 3D dramática, efeito feixe de luz que varre as bordas e ilha suspensa
                </p>
              </div>
            </div>

            <button
              type="button"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 15px 30px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2.5 transition-all duration-200 hover:-translate-y-1 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `6px 6px 0 #000000, 6px 6px 0 ${palette.darkShade}`,
          }}
          className="w-full p-6 sm:p-7 rounded-none border-4 bg-black relative font-mono transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  style={{ backgroundColor: palette.primary }}
                  className="px-2 py-0.5 rounded-none text-[10px] font-mono font-black text-black border-2 border-black"
                >
                  8-BIT ARCADE
                </span>
                <span style={{ color: palette.primary }} className="text-xs font-mono font-black">
                  INSERT COIN [01]
                </span>
              </div>
              <h4 style={{ color: palette.primary }} className="text-base sm:text-xl font-black font-mono leading-tight tracking-wider">
                &gt; QUIZ_RETRO.ROM
              </h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Bordas quadradas pixeladas, tipografia retrô anos 80 e sombra em degraus
              </p>
            </div>

            <button
              type="button"
              style={{
                backgroundColor: palette.primary,
                boxShadow: '4px 4px 0 #000000',
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-none border-4 border-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2.5 transition-all duration-100 active:translate-x-1 active:translate-y-1 hover:brightness-110 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PRESS START</span>
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
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 25px ${palette.glowColor}`,
          }}
          className="w-full p-6 sm:p-7 rounded-xl border-2 bg-black/95 relative font-mono transition-all duration-300"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-[11px] text-zinc-500">
            <span>root@hubtotens:~# run_activation --live</span>
            <span style={{ color: palette.primary }}>[PORT: 8080 OK]</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h4 style={{ color: palette.primary }} className="text-base sm:text-xl font-black font-mono leading-tight tracking-wide">
                &gt; TERMINAL_EXECUTE_CHALLENGE_
              </h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Interface hacker com estética cyberpunk esmeralda e scanlines de terminal
              </p>
            </div>

            <button
              type="button"
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                backgroundColor: `${palette.primary}20`,
                boxShadow: `0 0 15px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-7 py-3 rounded-lg border font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-125 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>[ RUN EXEC ]</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 10. SYNTHWAVE 80S GRID (synthwave_grid)
    // ==========================================
    case 'synthwave_grid':
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}`,
          }}
          className="w-full p-6 sm:p-7 rounded-3xl border-2 bg-purple-950/90 relative overflow-hidden transition-all duration-300"
        >
          {/* Retro Grid Accent */}
          <div
            style={{
              background: `linear-gradient(to top, ${palette.primary}30, transparent)`,
            }}
            className="absolute bottom-0 inset-x-0 h-16 pointer-events-none opacity-40"
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div>
              <span style={{ color: palette.primary }} className="text-xs font-black uppercase tracking-widest block mb-1">
                Pôr do Sol Neon &amp; Grade 3D 80s
              </span>
              <h4 className="text-base sm:text-xl font-black text-white leading-tight">
                Quiz &amp; Desafios da Campanha
              </h4>
              <p className="text-xs text-purple-200/70 mt-1">
                Cores magenta e roxas vibrantes, grade de perspectiva retrô e horizonte neon
              </p>
            </div>

            <button
              type="button"
              style={{
                borderColor: palette.primary,
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 0 25px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 0 35px ${palette.glowColor}`,
          }}
          className="w-full p-6 sm:p-7 rounded-3xl border-4 bg-stone-950 relative transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                style={{
                  borderColor: palette.primary,
                  background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                  color: '#000',
                  boxShadow: `0 6px 0 ${palette.darkShade}`,
                }}
                className="w-13 h-13 rounded-2xl border-2 flex items-center justify-center font-black text-xl flex-shrink-0"
              >
                <Crown className="w-6 h-6" />
              </div>

              <div>
                <span style={{ color: palette.primary }} className="text-xs font-black uppercase tracking-wider block mb-1">
                  Cassino &amp; Veludo Obsidiana
                </span>
                <h4 className="text-base sm:text-xl font-black text-white leading-tight">
                  Quiz &amp; Desafios da Campanha
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Bordas de ouro espelhado refinado com acabamento de alta classe e brilho luxuoso
                </p>
              </div>
            </div>

            <button
              type="button"
              style={{
                background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary})`,
                borderColor: palette.accent,
                boxShadow: `0 6px 0 ${palette.darkShade}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm uppercase tracking-wider text-stone-950 flex items-center justify-center gap-2.5 transition-all duration-150 active:translate-y-1 hover:brightness-110 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    // ==========================================
    // 12. BUBBLE POP CANDY (bubble_toon)
    // ==========================================
    case 'bubble_toon':
      return (
        <div
          style={{
            ...containerStyle,
            borderColor: palette.primary,
            boxShadow: `0 16px 32px ${palette.glowColor}`,
          }}
          className="w-full p-6 sm:p-7 rounded-[40px] border-4 bg-slate-900/95 relative transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                style={{
                  backgroundColor: palette.primary,
                  boxShadow: `0 6px 0 ${palette.darkShade}`,
                }}
                className="w-13 h-13 rounded-full border-4 border-white/80 flex items-center justify-center text-white flex-shrink-0"
              >
                <Smile className="w-7 h-7" />
              </div>

              <div>
                <span style={{ color: palette.primary }} className="text-xs font-black uppercase tracking-wider block mb-1">
                  Doce Pastel &amp; Bolhas Puffy
                </span>
                <h4 className="text-base sm:text-xl font-black text-white leading-tight">
                  Quiz &amp; Desafios da Campanha
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formas super acolchoadas em tons doces e botões fofos com sensação lúdica
                </p>
              </div>
            </div>

            <button
              type="button"
              style={{
                background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `0 8px 20px ${palette.glowColor}`,
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-full border-4 border-white/80 font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 hover:scale-102 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};
