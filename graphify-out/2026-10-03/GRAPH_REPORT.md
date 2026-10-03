# Graph Report - hub_totens  (2026-10-03)

## Corpus Check
- 67 files · ~97,981 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 371 nodes · 1066 edges · 17 communities (12 shown, 5 thin omitted)
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
- Diretrizes do Projeto - Hub de Totens
- vite-env.d.ts
- auto-push-github.md
- GameContentEditorModal.tsx
- TargetGame.tsx
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `useActiveGamePalette()` - 50 edges
2. `BaseGameProps` - 47 edges
3. `sound` - 34 edges
4. `GameContainer()` - 29 edges
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

## Communities (17 total, 5 thin omitted)

### Community 0 - "CampaignFormModal.tsx"
Cohesion: 0.07
Nodes (52): App(), BACKGROUND_EFFECTS, BackgroundEffectDefinition, BackgroundEffectId, BackgroundEffectOverlay(), BackgroundEffectOverlayProps, CampaignFormModalProps, CampaignTab (+44 more)

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
Cohesion: 0.05
Nodes (62): TouchVirtualKeyboard(), TouchVirtualKeyboardProps, Balloon, BalloonGameProps, DEFAULT_BALLOONS, isImageUrl(), CatcherGameProps, DEFAULT_CATCHER_ITEMS (+54 more)

### Community 6 - "TotemCampaignView.tsx"
Cohesion: 0.12
Nodes (37): CampaignFormModal(), RealtimeLayoutPreviewCard(), RealtimeLayoutPreviewCardProps, defaultPalette, GameLayoutContext, GameLayoutContextValue, GameLayoutProvider(), useGameLayout() (+29 more)

### Community 13 - "GameContentEditorModal.tsx"
Cohesion: 0.18
Nodes (18): GameContentEditorModal(), GameContentEditorModalProps, getContentCount(), getDefaultTimeForGame(), getStarterContentForGame(), CompletePhraseGameProps, QuizGameProps, downloadSampleCsv() (+10 more)

### Community 14 - "TargetGame.tsx"
Cohesion: 0.09
Nodes (45): react, react, useActiveGamePalette(), BalloonGame(), BullseyeGame(), BullseyeGameProps, ShotImpact, CatcherGame() (+37 more)

## Knowledge Gaps
- **112 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `TargetGame.tsx` to `devDependencies`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `dependencies` connect `devDependencies` to `TargetGame.tsx`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CampaignFormModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06506849315068493 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `useActiveGamePalette` be split into smaller, more focused modules?**
  _Cohesion score 0.05030834144758196 - nodes in this community are weakly interconnected._