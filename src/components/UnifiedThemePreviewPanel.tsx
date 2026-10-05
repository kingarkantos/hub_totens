import React, { useState } from 'react';
import { Play, Sparkles, Gamepad2, Eye, LayoutGrid, Layers, Monitor, RotateCcw } from 'lucide-react';
import { GameLayoutId, GAME_LAYOUTS } from '../types/gameLayouts';
import { LayoutColorPalette, getThemeBackgroundGradient } from '../lib/colorHarmony';
import { SplashButtonRenderer } from './SplashButtonRenderer';
import { ThemedGameCard } from './ThemedGameCard';
import { ThemedGamePlayPreview } from './ThemedGamePlayPreview';
import { getSplashButtonStyleForLayout } from '../types/splashCustomization';
import { BackgroundEffectOverlay, BackgroundEffectId } from './BackgroundEffectOverlay';
import { GameDefinition } from '../types';
import { sound } from '../lib/audio';

interface UnifiedThemePreviewPanelProps {
  layoutId: GameLayoutId;
  palette: LayoutColorPalette;
  isLight?: boolean;
  campaignFont?: string;
  clientName?: string;
  campaignName?: string;
  splashUrl?: string;
  splashOverlayStyle: {
    overlayGradient: string;
    overlayOpacity: number;
    imageBrightness: number;
    primaryColor: string;
  };
  splashOverlayHue?: number;
  splashOverlayMode?: 'color' | 'original' | 'black' | 'white';
  splashOverlayOpacity?: number;
  splashBgEffect?: BackgroundEffectId;
}

const SAMPLE_GAME: GameDefinition = {
  id: 'quiz',
  slug: 'quiz',
  name: 'Quiz & Desafios da Campanha',
  category: 'Quizzes & Perguntas',
  categoryId: 'quizzes',
  difficulty: 'Fácil',
  estimatedTime: '40 seg',
  description: 'Responda perguntas dinâmicas sobre os destaques e regras para acumular pontos no ranking do evento.',
  icon: 'HelpCircle',
  previewBg: 'from-amber-500 to-orange-600',
};

export const UnifiedThemePreviewPanel: React.FC<UnifiedThemePreviewPanelProps> = ({
  layoutId,
  palette,
  isLight = false,
  campaignFont,
  clientName = 'Cliente',
  campaignName = 'Nome da Campanha',
  splashUrl,
  splashOverlayStyle,
  splashOverlayHue,
  splashOverlayMode = 'color',
  splashOverlayOpacity = 35,
  splashBgEffect,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'button' | 'catalog' | 'gameplay' | 'all'>('button');

  const layoutDef = GAME_LAYOUTS.find((l) => l.id === layoutId) || GAME_LAYOUTS[0];
  const mappedButtonStyle = getSplashButtonStyleForLayout(layoutId);
  const effectiveBgHue = splashOverlayHue !== undefined ? splashOverlayHue : palette.hue;
  const themeBgGradient = getThemeBackgroundGradient(
    layoutId,
    effectiveBgHue,
    splashOverlayMode,
    splashOverlayOpacity,
    isLight
  );

  return (
    <div className="space-y-4">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            style={{ backgroundColor: palette.primary, boxShadow: `0 0 15px ${palette.glowColor}` }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all duration-300"
          >
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black flex items-center gap-2 text-white">
              <span>PRÉ-VISUALIZAÇÃO EM TEMPO REAL NOS 3 LOCAIS:</span>
              <span style={{ color: palette.primary }} className="font-mono text-xs">
                ({layoutDef.name})
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Veja exatamente como o mesmo tema e cores são aplicados no botão, na lista de jogos e durante as partidas:
            </p>
          </div>
        </div>

        {/* Preview Selector Tabs */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 flex-wrap">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActivePreviewTab('button');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activePreviewTab === 'button'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🔘 1. Botão Splash</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActivePreviewTab('catalog');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activePreviewTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>📋 2. Escolha de Jogos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActivePreviewTab('gameplay');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activePreviewTab === 'gameplay'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🎮 3. Tela do Jogo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActivePreviewTab('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activePreviewTab === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ver os 3 Juntos</span>
          </button>
        </div>
      </div>

      {/* 1. SINGLE VIEW: BUTTON PREVIEW */}
      {activePreviewTab === 'button' && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
            <span>🔘 BOTÃO DA TELA DE ABERTURA (SPLASH SCREEN DO TOTEM):</span>
            <span className="text-amber-400">Toque no botão para testar som e clique tátil</span>
          </div>

          <div
            style={{ background: themeBgGradient }}
            className="relative rounded-2xl overflow-hidden border-2 border-slate-800 min-h-[220px] flex flex-col items-center justify-center p-6 text-center shadow-inner transition-all duration-300"
          >
            {/* Background image preview if available */}
            {splashUrl && (
              <img
                src={splashUrl}
                alt="Fundo Totem"
                style={{
                  filter: `brightness(${splashOverlayStyle.imageBrightness}) contrast(1.05)`,
                }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40 transition-all duration-300"
              />
            )}
            {/* Dynamic Background Blend Layer */}
            <div
              style={{
                background: splashOverlayStyle.overlayGradient,
                opacity: splashOverlayStyle.overlayOpacity,
              }}
              className="absolute inset-0 pointer-events-none transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

            {/* Ambient Background Effect */}
            {splashBgEffect && splashBgEffect !== 'none' && (
              <div className="absolute inset-0 pointer-events-none">
                <BackgroundEffectOverlay effect={splashBgEffect} />
              </div>
            )}

            {/* Splash Info */}
            <div className="relative z-10 mb-4 pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 drop-shadow-sm">
                {clientName || 'Cliente'}
              </span>
              <h3 className="text-base sm:text-xl font-black text-white drop-shadow-md truncate max-w-md">
                {campaignName || 'Nome da Campanha'}
              </h3>
              <p className="text-[11px] text-slate-300 drop-shadow-sm mt-0.5">
                Toque no botão abaixo para iniciar os desafios interativos no totem
              </p>
            </div>

            {/* Themed Button */}
            <div className="relative z-20 scale-90 sm:scale-100 transition-transform">
              <SplashButtonRenderer
                styleId={mappedButtonStyle}
                palette={palette}
                size="md"
                label="TOQUE PARA JOGAR"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SINGLE VIEW: CATALOG GAME CARD PREVIEW */}
      {activePreviewTab === 'catalog' && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
            <span>📋 CARD NA TELA DE ESCOLHA DE JOGOS DO TOTEM COM BOTÃO "JOGAR AGORA":</span>
            <span className="text-amber-400">Estilo e botão correspondentes ao tema selecionado</span>
          </div>

          <div
            style={{ background: themeBgGradient }}
            className="relative rounded-2xl overflow-hidden border-2 border-slate-800 p-3 sm:p-5 shadow-inner transition-all duration-300"
          >
            {splashBgEffect && splashBgEffect !== 'none' && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <BackgroundEffectOverlay effect={splashBgEffect} />
              </div>
            )}
            <div className="relative z-10">
              <ThemedGameCard
                layoutId={layoutId}
                palette={palette}
                game={SAMPLE_GAME}
                index={0}
                isLight={isLight}
                campaignFont={campaignFont}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. SINGLE VIEW: GAMEPLAY PREVIEW */}
      {activePreviewTab === 'gameplay' && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
            <span>🎮 TELA DO JOGO (GAMEPLAY COM PERGUNTAS, TEMPO E PONTUAÇÃO):</span>
            <span className="text-amber-400">Clique nas opções abaixo para testar a resposta táctil</span>
          </div>

          <div
            style={{ background: themeBgGradient }}
            className="relative rounded-2xl overflow-hidden border-2 border-slate-800 p-3 sm:p-5 shadow-inner transition-all duration-300"
          >
            {splashBgEffect && splashBgEffect !== 'none' && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <BackgroundEffectOverlay effect={splashBgEffect} />
              </div>
            )}
            <div className="relative z-10">
              <ThemedGamePlayPreview
                layoutId={layoutId}
                palette={palette}
                isLight={isLight}
                campaignFont={campaignFont}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. ALL 3 TOGETHER */}
      {activePreviewTab === 'all' && (
        <div className="space-y-6 animate-in fade-in duration-200 pt-1">
          {/* Section 1: Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>1. 🔘 Botão de Toque para Jogar (Splash Screen):</span>
              <span className="text-[10px] text-slate-400">Estilo: {mappedButtonStyle}</span>
            </div>
            <div
              style={{ background: themeBgGradient }}
              className="relative rounded-2xl overflow-hidden border border-slate-800 min-h-[170px] p-6 flex flex-col items-center justify-center transition-all duration-300"
            >
              {splashUrl && (
                <img
                  src={splashUrl}
                  alt="Fundo Totem"
                  style={{
                    filter: `brightness(${splashOverlayStyle.imageBrightness}) contrast(1.05)`,
                  }}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40 transition-all duration-300"
                />
              )}
              <div
                style={{
                  background: splashOverlayStyle.overlayGradient,
                  opacity: splashOverlayStyle.overlayOpacity,
                }}
                className="absolute inset-0 pointer-events-none transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
              {splashBgEffect && splashBgEffect !== 'none' && (
                <div className="absolute inset-0 pointer-events-none">
                  <BackgroundEffectOverlay effect={splashBgEffect} />
                </div>
              )}
              <div className="relative z-20 scale-90 sm:scale-100">
                <SplashButtonRenderer
                  styleId={mappedButtonStyle}
                  palette={palette}
                  size="md"
                  label="TOQUE PARA JOGAR"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Catalog Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>2. 📋 Card na Escolha de Jogos (com Botão Jogar):</span>
              <span className="text-[10px] text-slate-400">Layout: {layoutDef.name}</span>
            </div>
            <div
              style={{ background: themeBgGradient }}
              className="relative rounded-2xl overflow-hidden border border-slate-800 p-2 sm:p-4 shadow-inner transition-all duration-300"
            >
              {splashBgEffect && splashBgEffect !== 'none' && (
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <BackgroundEffectOverlay effect={splashBgEffect} />
                </div>
              )}
              <div className="relative z-10">
                <ThemedGameCard
                  layoutId={layoutId}
                  palette={palette}
                  game={SAMPLE_GAME}
                  index={0}
                  isLight={isLight}
                  campaignFont={campaignFont}
                  isPreview={true}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Gameplay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>3. 🎮 Tela do Jogo em Andamento:</span>
              <span className="text-[10px] text-slate-400">Interface &amp; Alternativas</span>
            </div>
            <div
              style={{ background: themeBgGradient }}
              className="relative rounded-2xl overflow-hidden border border-slate-800 p-2 sm:p-4 shadow-inner transition-all duration-300"
            >
              {splashBgEffect && splashBgEffect !== 'none' && (
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <BackgroundEffectOverlay effect={splashBgEffect} />
                </div>
              )}
              <div className="relative z-10">
                <ThemedGamePlayPreview
                  layoutId={layoutId}
                  palette={palette}
                  isLight={isLight}
                  campaignFont={campaignFont}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
