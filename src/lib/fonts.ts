export interface FontDefinition {
  id: string;
  name: string;
  category: string;
  fontFamily: string;
  tagline: string;
  previewText?: string;
}

export const GAME_FONTS: FontDefinition[] = [
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Moderna Arredondada',
    fontFamily: "'Outfit', sans-serif",
    tagline: 'Design atual, amigável e com alto impacto visual (Padrão)',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'inter',
    name: 'Inter Clean',
    category: 'Sóbria & Corporativa',
    fontFamily: "'Inter', sans-serif",
    tagline: 'Ultra legibilidade, elegância e clareza informativa',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'montserrat',
    name: 'Montserrat Bold',
    category: 'Geométrica & Forte',
    fontFamily: "'Montserrat', sans-serif",
    tagline: 'Formas geométricas robustas e moderna presença',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'russo_one',
    name: 'Russo One',
    category: 'Arcade & Gamer',
    fontFamily: "'Russo One', sans-serif",
    tagline: 'Tipografia de impacto pesado inspirada em jogos e ação',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'orbitron',
    name: 'Orbitron Sci-Fi',
    category: 'Futurista & Cyberpunk',
    fontFamily: "'Orbitron', sans-serif",
    tagline: 'Visual de cockpit tecnológico, visor espacial e neon',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'press_start',
    name: 'Press Start 2P',
    category: 'Pixel Art 8-Bit',
    fontFamily: "'Press Start 2P', monospace",
    tagline: 'Nostalgia dos fliperamas clássicos dos anos 80 em pixel',
    previewText: 'PRATICAR ATIVIDADES MELHORA A SAÚDE!',
  },
  {
    id: 'fredoka',
    name: 'Fredoka Toon',
    category: 'Cartoon & Lúdica',
    fontFamily: "'Fredoka', cursive",
    tagline: 'Super arredondada, fofa e divertida para jogos casuais e kids',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'bebas_neue',
    name: 'Bebas Neue',
    category: 'Game Show & TV',
    fontFamily: "'Bebas Neue', sans-serif",
    tagline: 'Condensada imponente, estilo quiz de auditório e manchete',
    previewText: 'PRATICAR ATIVIDADES FÍSICAS MELHORA A SAÚDE!',
  },
  {
    id: 'cinzel',
    name: 'Cinzel Royale',
    category: 'Luxo Clássico & VIP',
    fontFamily: "'Cinzel', serif",
    tagline: 'Serifas lapidadas, elegância nobre estilo cassino de ouro',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'bungee',
    name: 'Bungee Fliperama',
    category: 'Arcade Caixa & Pop',
    fontFamily: "'Bungee', cursive",
    tagline: 'Letras robustas e verticais de máquinas arcade urbanas',
    previewText: 'PRATICAR ATIVIDADES MELHORA A SAÚDE!',
  },
  {
    id: 'share_tech_mono',
    name: 'Share Tech Mono',
    category: 'Hacker & Matrix',
    fontFamily: "'Share Tech Mono', monospace",
    tagline: 'Monospaçada técnica de telemetria e consoles cibernéticos',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'permanent_marker',
    name: 'Permanent Marker',
    category: 'Comic & Graffiti',
    fontFamily: "'Permanent Marker', cursive",
    tagline: 'Traço manual de piloto marcador, gibi rebelde e vibrante',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'chakra_petch',
    name: 'Chakra Petch',
    category: 'Mecha & Velocidade',
    fontFamily: "'Chakra Petch', sans-serif",
    tagline: 'Cortes chanfrados angulares estilo mecha e corrida',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
  {
    id: 'righteous',
    name: 'Righteous 80s',
    category: 'Synthwave & Retrô',
    fontFamily: "'Righteous', cursive",
    tagline: 'Curvas art déco futuristas do pop anos 80 e synthwave',
    previewText: 'Praticar atividades físicas melhora a saúde!',
  },
];

export function getFontFamilyById(fontId?: string): string {
  if (!fontId || fontId === 'default') return "'Outfit', sans-serif";
  const found = GAME_FONTS.find((f) => f.id === fontId);
  return found ? found.fontFamily : "'Outfit', sans-serif";
}
