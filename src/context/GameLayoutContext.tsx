import React, { createContext, useContext } from 'react';
import { GameLayoutId, GAME_LAYOUTS, GameLayoutDefinition } from '../types/gameLayouts';

interface GameLayoutContextValue {
  layout: GameLayoutId;
  layoutDef: GameLayoutDefinition;
  setLayout: (layout: GameLayoutId) => void;
}

const GameLayoutContext = createContext<GameLayoutContextValue>({
  layout: 'modern_glass',
  layoutDef: GAME_LAYOUTS[0],
  setLayout: () => {},
});

export const useGameLayout = () => useContext(GameLayoutContext);

export const GameLayoutProvider: React.FC<{
  layout: GameLayoutId;
  onLayoutChange: (layout: GameLayoutId) => void;
  children: React.ReactNode;
}> = ({ layout, onLayoutChange, children }) => {
  const layoutDef = GAME_LAYOUTS.find((l) => l.id === layout) || GAME_LAYOUTS[0];

  return (
    <GameLayoutContext.Provider value={{ layout, layoutDef, setLayout: onLayoutChange }}>
      {children}
    </GameLayoutContext.Provider>
  );
};
