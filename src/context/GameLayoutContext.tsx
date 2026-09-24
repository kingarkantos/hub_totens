import React, { createContext, useContext, useMemo } from 'react';
import { GameLayoutId, GAME_LAYOUTS, GameLayoutDefinition } from '../types/gameLayouts';
import { LayoutColorPalette, generateLayoutPalette, getDefaultHueForLayout } from '../lib/colorHarmony';

interface GameLayoutContextValue {
  layout: GameLayoutId;
  layoutDef: GameLayoutDefinition;
  palette: LayoutColorPalette;
  setLayout: (layout: GameLayoutId) => void;
}

const defaultPalette = generateLayoutPalette(185);

const GameLayoutContext = createContext<GameLayoutContextValue>({
  layout: 'modern_glass',
  layoutDef: GAME_LAYOUTS[0],
  palette: defaultPalette,
  setLayout: () => {},
});

export const useGameLayout = () => useContext(GameLayoutContext);

export function useActiveGamePalette(props?: {
  palette?: LayoutColorPalette;
  layoutColorHue?: number;
  isLight?: boolean;
  themeMode?: 'light' | 'dark';
  theme?: any;
  themePrimary?: string;
  gameLayout?: GameLayoutId;
}) {
  const context = useContext(GameLayoutContext);
  const isLightMode =
    props?.isLight ??
    (props?.themeMode === 'light' ||
      props?.theme?.textColor?.includes('text-slate-900') ||
      props?.theme?.bgGradient?.includes('slate-100') ||
      false);
  const activeLayout: GameLayoutId = props?.gameLayout || context?.layout || 'cartoon_pop';

  const palette = useMemo(() => {
    if (props?.palette && (props.layoutColorHue === undefined || props.palette.hue === props.layoutColorHue)) {
      return props.palette;
    }
    if (props?.layoutColorHue !== undefined) {
      return generateLayoutPalette(props.layoutColorHue, isLightMode);
    }
    if (context?.palette) {
      return context.palette;
    }
    if (props?.theme?.primary && props.theme.primary !== '#DC2626') {
      return {
        hue: props.layoutColorHue || 185,
        primary: props.theme.primary,
        secondary: props.theme.secondary || '#3B82F6',
        darkShade: props.theme.secondary || '#78350f',
        accent: props.theme.accent || '#F59E0B',
        glowColor: props.theme.glowColor || `${props.theme.primary}66`,
        glowHex: props.theme.primary,
        textColor: isLightMode ? '#0F172A' : '#FFFFFF',
      };
    }
    return generateLayoutPalette(getDefaultHueForLayout(activeLayout), isLightMode);
  }, [props?.palette, props?.layoutColorHue, isLightMode, context?.palette, props?.theme, activeLayout]);

  const layoutPrimary = palette.primary || props?.themePrimary || props?.theme?.primary || '#06B6D4';
  const layoutSecondary = palette.secondary || props?.theme?.secondary || '#3B82F6';
  const darkPrimary = palette.darkShade || '#78350f';
  const layoutGlow = palette.glowColor || 'rgba(6, 182, 212, 0.45)';
  const layoutAccent = palette.accent || props?.theme?.accent || '#F59E0B';

  return {
    activeLayout,
    palette,
    layoutPrimary,
    layoutSecondary,
    darkPrimary,
    layoutGlow,
    layoutAccent,
    isLightMode,
  };
}

export const GameLayoutProvider: React.FC<{
  layout: GameLayoutId;
  hue?: number;
  isLight?: boolean;
  onLayoutChange: (layout: GameLayoutId) => void;
  children: React.ReactNode;
}> = ({ layout, hue, isLight = false, onLayoutChange, children }) => {
  const layoutDef = GAME_LAYOUTS.find((l) => l.id === layout) || GAME_LAYOUTS[0];

  const activeHue = hue !== undefined ? hue : getDefaultHueForLayout(layout);
  const palette = useMemo(() => generateLayoutPalette(activeHue, isLight), [activeHue, isLight]);

  return (
    <GameLayoutContext.Provider value={{ layout, layoutDef, palette, setLayout: onLayoutChange }}>
      {children}
    </GameLayoutContext.Provider>
  );
};

