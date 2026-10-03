# Graph Report - hub_totens  (2026-10-03)

## Corpus Check
- 69 files · ~111,950 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 390 nodes · 1125 edges · 33 communities (28 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6819cdf6`
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
- TotemCampaignView.tsx
- BaseGameProps
- audio.ts
- GameLayoutContext.tsx
- GameContainer
- MemoryGame.tsx
- TargetGame.tsx
- HigherLowerGame.tsx
- MapEpiGame.tsx
- HangmanGame.tsx
- MathBlitzGame.tsx
- WheelGame.tsx

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
- `MapEpiGame()` --references--> `react`  [EXTRACTED]
  src/games/MapEpiGame.tsx → package.json
- `MemoryGame()` --references--> `react`  [EXTRACTED]
  src/games/MemoryGame.tsx → package.json
- `ResellerPortfolioView()` --references--> `react`  [EXTRACTED]
  src/views/ResellerPortfolioView.tsx → package.json
- `ConnectPairsGame()` --references--> `react`  [EXTRACTED]
  src/games/ConnectPairsGame.tsx → package.json

## Import Cycles
- None detected.

## Communities (33 total, 5 thin omitted)

### Community 0 - "CampaignFormModal.tsx"
Cohesion: 0.08
Nodes (46): App(), CampaignFormModalProps, CampaignTab, COLOR_PRESETS, SPLASH_PRESETS, GameCardThumbnail(), GameCardThumbnailProps, LeaderboardModal() (+38 more)

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
Cohesion: 0.19
Nodes (15): react, react, useActiveGamePalette(), BullseyeGame(), BullseyeGameProps, ShotImpact, ConnectPairsGame(), GeniusGame() (+7 more)

### Community 6 - "TotemCampaignView.tsx"
Cohesion: 0.14
Nodes (19): RealtimeLayoutPreviewCard(), RealtimeLayoutPreviewCardProps, TouchVirtualKeyboard(), GameLayoutContextValue, CompletePhraseGame(), CompletePhraseGameProps, DEFAULT_PHRASES, FEEDBACK_POOLS (+11 more)

### Community 7 - "TargetGame.tsx"
Cohesion: 0.33
Nodes (6): CatcherGame(), CatcherGameProps, DEFAULT_CATCHER_ITEMS, FallingItem, isImageUrl(), CatcherCustomItem

### Community 8 - "TopGearGame.tsx"
Cohesion: 0.33
Nodes (6): CAR_COLORS, RoadsideObject, TopGearGame(), TopGearGameProps, TrafficCar, TopGearCustomConfig

### Community 13 - "GameContentEditorModal.tsx"
Cohesion: 0.18
Nodes (19): GameContentEditorModal(), GameContentEditorModalProps, getContentCount(), getDefaultTimeForGame(), getStarterContentForGame(), downloadSampleCsv(), parseCSVToRows(), parseGameCSV() (+11 more)

### Community 14 - "TargetGame.tsx"
Cohesion: 0.09
Nodes (25): Balloon, BalloonGame(), BalloonGameProps, DEFAULT_BALLOONS, isImageUrl(), Ball, DEFAULT_SLOTS, Pin (+17 more)

### Community 15 - "CorrectOrderGame.tsx"
Cohesion: 0.50
Nodes (4): CorrectOrderGame(), CorrectOrderGameProps, DEFAULT_PROCEDURE, CorrectOrderCustomItem

### Community 20 - "SafeGame.tsx"
Cohesion: 0.50
Nodes (4): DEFAULT_SAFE, SafeGame(), SafeGameProps, SafeCustomConfig

### Community 21 - "TotemCampaignView.tsx"
Cohesion: 0.10
Nodes (32): BACKGROUND_EFFECTS, BackgroundEffectDefinition, BackgroundEffectId, BackgroundEffectOverlay(), BackgroundEffectOverlayProps, CampaignFormModal(), SplashButtonRenderer(), SplashButtonRendererProps (+24 more)

### Community 22 - "BaseGameProps"
Cohesion: 0.28
Nodes (7): GeniusGameProps, PuzzleGame(), PuzzleGameProps, SpeedGame(), SpeedGameProps, PuzzleCustomConfig, BaseGameProps

### Community 23 - "audio.ts"
Cohesion: 0.36
Nodes (5): TouchVirtualKeyboardProps, DEFAULT_WORDS, WordSearchGameProps, sound, WordSearchCustomConfig

### Community 24 - "GameLayoutContext.tsx"
Cohesion: 0.33
Nodes (5): defaultPalette, GameLayoutContext, ConnectPairsGameProps, DEFAULT_PAIRS, ConnectPairCustomItem

### Community 25 - "GameContainer"
Cohesion: 0.38
Nodes (6): useGameLayout(), GameContainer(), DEFAULT_STATEMENTS, TrueFalseGame(), TrueFalseGameProps, TrueFalseCustomItem

### Community 26 - "MemoryGame.tsx"
Cohesion: 0.38
Nodes (6): Card, DEFAULT_ICONS, isImageUrl(), MemoryGame(), MemoryGameProps, MemoryCustomPair

### Community 27 - "TargetGame.tsx"
Cohesion: 0.33
Nodes (6): DEFAULT_TARGETS, isImageUrl(), TargetGame(), TargetGameProps, TargetItem, TargetCustomItem

### Community 28 - "HigherLowerGame.tsx"
Cohesion: 0.47
Nodes (5): createTiles(), HigherLowerGame(), HigherLowerGameProps, NumberTile, shuffleArray()

### Community 29 - "MapEpiGame.tsx"
Cohesion: 0.40
Nodes (5): DEFAULT_SECTORS, isImageUrl(), MapEpiGame(), MapEpiGameProps, SectorMatch

### Community 30 - "HangmanGame.tsx"
Cohesion: 0.50
Nodes (4): ALPHABET, DEFAULT_WORDS, HangmanGameProps, HangmanCustomItem

### Community 31 - "MathBlitzGame.tsx"
Cohesion: 0.50
Nodes (4): generateQuestion(), MathBlitzGame(), MathBlitzGameProps, Question

### Community 32 - "WheelGame.tsx"
Cohesion: 0.50
Nodes (4): DEFAULT_PRIZES, WheelGame(), WheelGameProps, WheelItem

## Knowledge Gaps
- **120 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useActiveGamePalette` to `CampaignFormModal.tsx`, `devDependencies`, `TargetGame.tsx`, `MemoryGame.tsx`, `MapEpiGame.tsx`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `dependencies` connect `devDependencies` to `useActiveGamePalette`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CampaignFormModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08090957165520889 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `TotemCampaignView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._