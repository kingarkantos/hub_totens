export type SplashButtonStyleId =
  | 'default'
  | 'cartoon_3d'
  | 'neon_pulse'
  | 'arcade_retro'
  | 'cyber_tech'
  | 'luxury_gold'
  | 'glass_glow';

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
];
