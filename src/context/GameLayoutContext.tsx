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
