export type SplashButtonStyleId =
  | 'default'
  | 'cartoon_3d'
  | 'neon_pulse'
  | 'arcade_retro'
  | 'cyber_tech'
  | 'luxury_gold'
  | 'glass_glow'
  | 'comic_pop'
  | 'pixel_8bit'
  | 'synthwave_neon'
  | 'royal_casino'
  | 'candy_bubble'
  | 'hologram_hud'
  | 'fire_inferno'
  | 'cyber_matrix'
  | 'quantum_glow'
  | 'brutalist_bold';

export interface SplashButtonStyleDefinition {
  id: SplashButtonStyleId;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  previewClass: string;
}

export const SPLASH_BUTTON_STYLES: SplashButtonStyleDefinition[] = [
  {
    id: 'default',
    name: 'Padrão do Tema',
    tagline: 'Brilho Dinâmico',
    icon: '✨',
    description: 'Usa a paleta de cores e o degradê primário do tema selecionado para a campanha.',
    previewClass: 'bg-red-600 border-2 border-white/40 text-white shadow-lg',
  },
  {
    id: 'cartoon_3d',
    name: 'Cartoon 3D Game',
    tagline: 'Toon Pop & Relevo',
    icon: '🎮',
    description: 'Botão 3D espesso com borda dourada, sombra de profundidade tátil e animação saltitante.',
    previewClass: 'bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-amber-950 font-black shadow-[0_6px_0_#92400e]',
  },
  {
    id: 'neon_pulse',
    name: 'Neon Cyberpunk',
    tagline: 'Cápsula Futurista',
    icon: '⚡',
    description: 'Pílula escura com anéis de neon ciano pulsantes e brilho elétrico de alta intensidade.',
    previewClass: 'bg-slate-950 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_#22d3ee]',
  },
  {
    id: 'arcade_retro',
    name: 'Fliperama Arcade',
    tagline: 'Insert Coin 80s',
    icon: '🕹️',
    description: 'Visual clássico de fliperama arcade com traço amarelo e sensação de arcade retrô.',
    previewClass: 'bg-black border-4 border-yellow-400 text-yellow-300 font-mono shadow-[0_0_12px_#facc15]',
  },
  {
    id: 'cyber_tech',
    name: 'Mecha Sci-Fi',
    tagline: 'Cortes Chanfrados',
    icon: '🤖',
    description: 'Bordas angulares chanfradas estilo visor tático de mecha com cor verde esmeralda terminal.',
    previewClass: 'bg-slate-900 border-2 border-emerald-400 text-emerald-300 font-mono shadow-[0_0_12px_#10b981]',
  },
  {
    id: 'luxury_gold',
    name: 'Ouro VIP Glamour',
    tagline: 'Show de TV & Palco',
    icon: '🏆',
    description: 'Degradê metálico dourado espelhado com acabamento de show de auditório luxuoso.',
    previewClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-100 text-slate-950 font-black shadow-lg',
  },
  {
    id: 'glass_glow',
    name: 'Cyber Glass',
    tagline: 'Vidro Translúcido',
    icon: '💎',
    description: 'Vidro jateado translúcido premium com reflexos sutis de luz difusa.',
    previewClass: 'backdrop-blur-md bg-white/20 border-2 border-white/60 text-white shadow-xl',
  },
  {
    id: 'comic_pop',
    name: 'Comic Toon HQ',
    tagline: 'Gibi Pop & Traço Preto',
    icon: '💥',
    description: 'Bordas pretas grossas de história em quadrinhos, sombra sólida marcante e badge POP.',
    previewClass: 'bg-amber-400 border-4 border-black text-slate-950 font-black shadow-[4px_4px_0_#000]',
  },
  {
    id: 'pixel_8bit',
    name: 'Pixel Art 8-Bit',
    tagline: 'Retro Arcade Vintage',
    icon: '👾',
    description: 'Bordas pixeladas sem curvatura, tipografia pixelada clássica e clique mecânico retrô.',
    previewClass: 'bg-black border-4 border-yellow-400 text-yellow-300 font-mono shadow-[4px_4px_0_#000]',
  },
  {
    id: 'synthwave_neon',
    name: 'Synthwave 80s',
    tagline: 'Pôr do Sol & Cromo',
    icon: '🌅',
    description: 'Degradê pôr do sol rosa/roxo retrô futurista com anel de neon brilhante e grade 3D.',
    previewClass: 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 border-2 border-pink-300 text-white font-black shadow-[0_0_20px_#ec4899]',
  },
  {
    id: 'royal_casino',
    name: 'Royale Cassino Gold',
    tagline: 'Veludo & Brasão Nobre',
    icon: '👑',
    description: 'Moldura dourada trabalhada de alta nobreza sobre veludo obsidiana com brasão real.',
    previewClass: 'bg-stone-950 border-4 border-amber-300 text-amber-200 font-black shadow-[0_6px_0_#78350f]',
  },
  {
    id: 'candy_bubble',
    name: 'Bubble Pop Candy',
    tagline: 'Doce Pastel & Bolha',
    icon: '🍬',
    description: 'Botão pílula super fofo e inflado com reflexos de gelatina e sensação elástica divertida.',
    previewClass: 'bg-gradient-to-r from-pink-400 to-rose-500 border-4 border-white/80 text-white font-black shadow-[0_8px_16px_rgba(244,114,182,0.5)]',
  },
  {
    id: 'hologram_hud',
    name: 'Visor Holográfico HUD',
    tagline: 'Interface Aeroespacial',
    icon: '🎯',
    description: 'Ecrã holográfico translúcido com colchetes nos 4 cantos, retículo de mira e telemetria.',
    previewClass: 'bg-cyan-950/80 border border-cyan-400 text-cyan-200 font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)]',
  },
  {
    id: 'fire_inferno',
    name: 'Chamas & Fogo Quente',
    tagline: 'Alta Temperatura & Brasa',
    icon: '🔥',
    description: 'Lava incandescente com pulso de alta temperatura, aura de calor e bordas ardentes.',
    previewClass: 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 border-2 border-yellow-200 text-white font-black shadow-[0_0_25px_#f97316]',
  },
  {
    id: 'cyber_matrix',
    name: 'Terminal Matrix',
    tagline: 'Prompt Hacker Monospace',
    icon: '💻',
    description: 'Terminal hacker de linha de comando com prompt de execução e fósforo verde esmeralda.',
    previewClass: 'bg-black border-2 border-emerald-400 text-emerald-300 font-mono shadow-[0_0_15px_#10b981]',
  },
  {
    id: 'quantum_glow',
    name: 'Núcleo Quântico',
    tagline: 'Plasma & Energia Pura',
    icon: '⚛️',
    description: 'Anel duplo orbital com descarga de plasma e núcleo de alta voltagem pulsante.',
    previewClass: 'bg-violet-950 border-2 border-fuchsia-400 text-fuchsia-200 font-black shadow-[0_0_25px_#d946ef]',
  },
  {
    id: 'brutalist_bold',
    name: 'Neobrutalismo Bold',
    tagline: 'Contraste Extremo',
    icon: '⚡',
    description: 'Estilo brutalista cru com borda preta espessa, sombra bloco sólida chanfrada e impacto visual.',
    previewClass: 'bg-yellow-300 border-4 border-black text-black font-black shadow-[6px_6px_0_#000]',
  },
];
