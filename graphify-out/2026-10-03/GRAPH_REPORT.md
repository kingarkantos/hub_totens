# Graph Report - hub_totens  (2026-10-03)

## Corpus Check
- 69 files · ~107,609 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 386 nodes · 1118 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb40f253`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CampaignFormModal.tsx
- devDependencies
- compilerOptions
- 🎯 Hub de Jogos para Totens
- useActiveGamePalette
- SoundManager
- TotemCampaignView.tsx
- TargetGame.tsx
- TopGearGame.tsx
- Diretrizes do Projeto - Hub de Totens
- vite-env.d.ts
- auto-push-github.md
- GameContentEditorModal.tsx
- TargetGame.tsx
- CorrectOrderGame.tsx
- vercel.json
- SafeGame.tsx

## God Nodes (most connected - your core abstractions)
1. `useActiveGamePalette()` - 54 edges
2. `BaseGameProps` - 51 edges
3. `sound` - 36 edges
4. `GameContainer()` - 31 edges
5. `GameLayoutId` - 18 edges
6. `generateLayoutPalette()` - 16 edges
7. `compilerOptions` - 16 edges
8. `LayoutColorPalette` - 15 edges
9. `getDefaultHueForLayout()` - 14 edges
10. `getFontFamilyById()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `CatcherGame()` --references--> `react`  [EXTRACTED]
  src/games/CatcherGame.tsx → package.json
- `ConnectPairsGame()` --references--> `react`  [EXTRACTED]
  src/games/ConnectPairsGame.tsx → package.json
- `HangmanGame()` --references--> `react`  [EXTRACTED]
  src/games/HangmanGame.tsx → package.json
- `MapEpiGame()` --references--> `react`  [EXTRACTED]
  src/games/MapEpiGame.tsx → package.json
- `MemoryGame()` --references--> `react`  [EXTRACTED]
  src/games/MemoryGame.tsx → package.json

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "CampaignFormModal.tsx"
Cohesion: 0.07
Nodes (56): App(), BACKGROUND_EFFECTS, BackgroundEffectDefinition, BackgroundEffectId, BackgroundEffectOverlay(), BackgroundEffectOverlayProps, CampaignFormModal(), CampaignFormModalProps (+48 more)

### Community 1 - "devDependencies"
Cohesion: 0.05
Nodes (42): autoprefixer, canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, lucide-react (+34 more)

### Community 2 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+13 more)

### Community 3 - "🎯 Hub de Jogos para Totens"
Cohesion: 0.20
Nodes (9): 1. Painel Administrativo / Hub Principal (`/`), 2. Visão do Totem (`/:slug`, ex: `/campanha-honda`), 3. Design System com 10 Temas Visuais, 📦 Como Rodar Localmente, 🌐 Deploy na Vercel & Integração com GitHub, 🗄️ Estrutura do Banco de Dados (Supabase), 🚀 Funcionalidades Principais, 🎯 Hub de Jogos para Totens (+1 more)

### Community 4 - "useActiveGamePalette"
Cohesion: 0.06
Nodes (59): react, react, TouchVirtualKeyboard(), TouchVirtualKeyboardProps, useActiveGamePalette(), BullseyeGame(), BullseyeGameProps, ShotImpact (+51 more)

### Community 6 - "TotemCampaignView.tsx"
Cohesion: 0.11
Nodes (43): RealtimeLayoutPreviewCard(), RealtimeLayoutPreviewCardProps, defaultPalette, GameLayoutContext, GameLayoutContextValue, GameLayoutProvider(), useGameLayout(), CompletePhraseGame() (+35 more)

### Community 7 - "TargetGame.tsx"
Cohesion: 0.33
Nodes (6): DEFAULT_TARGETS, isImageUrl(), TargetGame(), TargetGameProps, TargetItem, TargetCustomItem

### Community 8 - "TopGearGame.tsx"
Cohesion: 0.33
Nodes (6): CAR_COLORS, RoadsideObject, TopGearGame(), TopGearGameProps, TrafficCar, TopGearCustomConfig

### Community 13 - "GameContentEditorModal.tsx"
Cohesion: 0.07
Nodes (43): GameContentEditorModal(), GameContentEditorModalProps, getContentCount(), getDefaultTimeForGame(), getStarterContentForGame(), CompletePhraseGameProps, ConnectPairsGameProps, DEFAULT_PAIRS (+35 more)

### Community 14 - "TargetGame.tsx"
Cohesion: 0.33
Nodes (6): Balloon, BalloonGame(), BalloonGameProps, DEFAULT_BALLOONS, isImageUrl(), BalloonCustomItem

### Community 15 - "CorrectOrderGame.tsx"
Cohesion: 0.50
Nodes (4): CorrectOrderGame(), CorrectOrderGameProps, DEFAULT_PROCEDURE, CorrectOrderCustomItem

### Community 20 - "SafeGame.tsx"
Cohesion: 0.50
Nodes (4): DEFAULT_SAFE, SafeGame(), SafeGameProps, SafeCustomConfig

## Knowledge Gaps
- **117 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useActiveGamePalette` to `devDependencies`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `dependencies` connect `devDependencies` to `useActiveGamePalette`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CampaignFormModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06793206793206794 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `useActiveGamePalette` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._