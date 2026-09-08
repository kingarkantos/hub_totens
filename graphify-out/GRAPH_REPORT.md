# Graph Report - .  (2026-09-08)

## Corpus Check
- Corpus is ~15,891 words - fits in a single context window. You may not need a graph.

## Summary
- 164 nodes · 299 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 16

## God Nodes (most connected - your core abstractions)
1. `sound` - 16 edges
2. `compilerOptions` - 16 edges
3. `GameContainer()` - 12 edges
4. `SoundManager` - 8 edges
5. `GameDefinition` - 7 edges
6. `GAMES_CATALOG` - 6 edges
7. `supabase` - 6 edges
8. `TABLES` - 5 edges
9. `Campaign` - 5 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- `GameContainer()` --references--> `react`  [EXTRACTED]
  src/games/GameContainer.tsx → package.json
- `CampaignFormModalProps` --references--> `Campaign`  [EXTRACTED]
  src/components/CampaignFormModal.tsx → src/types/index.ts
- `GamePreviewModalProps` --references--> `GameDefinition`  [EXTRACTED]
  src/games/GamePreviewModal.tsx → src/types/index.ts
- `CampaignFormModal()` --references--> `THEME_LIST`  [EXTRACTED]
  src/components/CampaignFormModal.tsx → src/lib/themes.ts
- `LeaderboardModal()` --references--> `GAMES_CATALOG`  [EXTRACTED]
  src/components/LeaderboardModal.tsx → src/lib/gamesCatalog.ts

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (21): CampaignFormModal(), CampaignFormModalProps, SPLASH_PRESETS, LeaderboardModal(), LeaderboardModalProps, SettingsModal(), SettingsModalProps, GamePreviewModal() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, lucide-react, react (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.31
Nodes (6): CatcherGameProps, FallingItem, GameContainerProps, PuzzleGame(), PuzzleGameProps, sound

### Community 6 - "Community 6"
Cohesion: 0.38
Nodes (5): CatcherGame(), GamePreviewModalProps, SpeedGame(), SpeedGameProps, GameDefinition

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (3): App(), AdminHubView(), TotemCampaignView()

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (4): Balloon, BALLOON_COLORS, BalloonGame(), BalloonGameProps

### Community 9 - "Community 9"
Cohesion: 0.40
Nodes (4): Card, DEFAULT_ICONS, MemoryGame(), MemoryGameProps

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (3): GameContainer(), SafeGame(), SafeGameProps

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): GeniusGame(), GeniusGameProps, PADS

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (3): DEFAULT_QUESTIONS, QuizGame(), QuizGameProps

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): TargetGame(), TargetGameProps, TargetItem

### Community 14 - "Community 14"
Cohesion: 0.50
Nodes (3): DEFAULT_PRIZES, WheelGame(), WheelGameProps

## Knowledge Gaps
- **69 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameContainer()` connect `Community 10` to `Community 1`, `Community 4`, `Community 6`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Why does `react` connect `Community 1` to `Community 10`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._