// Definitions of customized content for each of the 10 games

export interface WheelItem {
  label: string;
  score: number;
  color: string;
}

export interface QuizQuestionItem {
  question: string;
  options: [string, string, string, string];
  correct: number; // 0 to 3
}

export interface TargetCustomItem {
  name: string;
  symbol: string;
  points: number;
  isBonus: boolean;
}

export interface MemoryCustomPair {
  symbol: string;
  label: string;
}

export interface CatcherCustomItem {
  name: string;
  symbol: string;
  points: number;
  type: 'gift' | 'star' | 'hazard';
}

export interface SpeedCustomConfig {
  vehicleName: string;
  category: string;
  targetKmh: number;
  flavorText: string;
}

export interface SafeCustomConfig {
  secretCode: string; // 3 digits e.g. "375"
  prizeName: string;
  hints: string[];
}

export interface GeniusPadCustom {
  id: number;
  name: string;
  color: string;
  symbol: string;
}

export interface PuzzleCustomConfig {
  puzzleTitle: string;
  pieceLabels: string[]; // 8 items
}

export interface BalloonCustomItem {
  name: string;
  color: string;
  points: number;
  isGold: boolean;
}

export type GamesConfigMap = {
  wheel?: WheelItem[];
  quiz?: QuizQuestionItem[];
  target?: TargetCustomItem[];
  memory?: MemoryCustomPair[];
  catcher?: CatcherCustomItem[];
  speed?: SpeedCustomConfig;
  safe?: SafeCustomConfig;
  genius?: GeniusPadCustom[];
  puzzle?: PuzzleCustomConfig;
  balloon?: BalloonCustomItem[];
  [key: string]: any;
};

export interface CsvColumnSpec {
  name: string;
  description: string;
  example: string;
}

export interface GameContentMeta {
  gameId: string;
  gameName: string;
  description: string;
  csvColumns: CsvColumnSpec[];
  sampleCsv: string;
}

export const GAME_CONTENT_SCHEMAS: Record<string, GameContentMeta> = {
  wheel: {
    gameId: 'wheel',
    gameName: 'Roleta Premiada',
    description: 'Personalize os prêmios das fatias da roleta, pontuação e cores.',
    csvColumns: [
      { name: 'label', description: 'Nome do prêmio/fatia na roleta', example: 'Brinde Exclusivo' },
      { name: 'score', description: 'Pontos concedidos (número)', example: '500' },
      { name: 'color', description: 'Cor em hexadecimal ou nome', example: '#DC2626' },
    ],
    sampleCsv: `label,score,color
Brinde Exclusivo,500,#DC2626
10% Desconto,300,#2563EB
Kit Especial,800,#059669
Giro Extra,200,#D97706
Adesivo Oficial,150,#7C3AED
Garrafa Térmica,600,#DB2777
Boné da Marca,450,#0D9488
Chaveiro Turbo,250,#EA580C`,
  },

  quiz: {
    gameId: 'quiz',
    gameName: 'Quiz da Marca',
    description: 'Cadastre as perguntas com 4 alternativas e indique a letra da alternativa correta (A, B, C ou D).',
    csvColumns: [
      { name: 'question', description: 'Texto da pergunta', example: 'Qual o compromisso pioneiro da marca?' },
      { name: 'option_a', description: 'Alternativa A', example: 'Eletrificação e Zero Emissões' },
      { name: 'option_b', description: 'Alternativa B', example: 'Mais consumo de combustível' },
      { name: 'option_c', description: 'Alternativa C', example: 'Veículos sem revisão' },
      { name: 'option_d', description: 'Alternativa D', example: 'Motores a vapor' },
      { name: 'correct_option', description: 'Letra da alternativa correta (A, B, C ou D)', example: 'A' },
    ],
    sampleCsv: `question,option_a,option_b,option_c,option_d,correct_option
Qual o compromisso pioneiro da marca para o futuro?,Eletrificação e Zero Emissões,Mais consumo de combustível,Veículos sem garantia,Motores a vapor,A
O que o sistema de assistência à condução proporciona?,Menor visibilidade,Máxima segurança e frenagem autônoma,Aumento de ruído,Desativação dos freios,B
Qual a principal vantagem da motorização híbrida avançada?,Maior emissão de poluentes,Eficiência energética e torque instantâneo,Tanque menor sem autonomia,Perda de potência,B
Qual o atributo mais reconhecido e elogiado pelos clientes?,Durabilidade e alto valor de revenda,Peças descartáveis,Falta de revisões,Pneus sem aderência,A
No painel digital touchscreen o que você pode conectar?,Somente fita cassete,Apple CarPlay e Android Auto sem fio,Disquete de computador,Rádio analógico apenas,B`,
  },

  target: {
    gameId: 'target',
    gameName: 'Caça aos Alvos',
    description: 'Cadastre os tipos de alvos que surgem na tela para o jogador tocar.',
    csvColumns: [
      { name: 'name', description: 'Nome do alvo', example: 'Alvo Padrão' },
      { name: 'symbol', description: 'Símbolo ou emoji do alvo', example: '🎯' },
      { name: 'points', description: 'Pontos ganhos por toque', example: '100' },
      { name: 'is_bonus', description: 'Se é um alvo especial bônus (true ou false)', example: 'false' },
    ],
    sampleCsv: `name,symbol,points,is_bonus
Alvo Tradicional,◎,100,false
Estrela Dourada,★,250,true
Logotipo Especial,🚗,150,false
Troféu Relâmpago,🏆,300,true`,
  },

  memory: {
    gameId: 'memory',
    gameName: 'Jogo da Memória',
    description: 'Cadastre os pares de cartas com símbolo/emoji e nome do produto/atributo.',
    csvColumns: [
      { name: 'symbol', description: 'Emoji ou símbolo representativo', example: '🚗' },
      { name: 'label', description: 'Nome do modelo ou atributo da carta', example: 'Sedan Turbo' },
    ],
    sampleCsv: `symbol,label
🚗,Sedan Turbo
🚙,SUV Híbrido
🏍️,Moto Esportiva
⚡,Bateria Elétrica
🛡️,Segurança Sensing
🏁,Performance R`,
  },

  catcher: {
    gameId: 'catcher',
    gameName: 'Chuva de Brindes',
    description: 'Cadastre os itens que caem da tela: presentes (gift), bônus (star) ou obstáculos (hazard).',
    csvColumns: [
      { name: 'name', description: 'Nome do item', example: 'Kit Brinde' },
      { name: 'symbol', description: 'Emoji ou ícone do item', example: '🎁' },
      { name: 'points', description: 'Pontos atribuídos (ou deduzidos se for obstáculo)', example: '150' },
      { name: 'type', description: 'Tipo: gift, star ou hazard', example: 'gift' },
    ],
    sampleCsv: `name,symbol,points,type
Kit Brinde,🎁,150,gift
Estrela Dourada,⭐,300,star
Chaveiro Especial,🔑,200,gift
Pneu Furado,💣,-200,hazard`,
  },

  speed: {
    gameId: 'speed',
    gameName: 'Arrancada Turbo',
    description: 'Personalize o veículo, categoria, velocidade máxima e mensagem esportiva.',
    csvColumns: [
      { name: 'vehicle_name', description: 'Nome do veículo acelerado', example: 'Civic Type R' },
      { name: 'category', description: 'Categoria do veículo', example: 'Esportivo VTEC' },
      { name: 'target_kmh', description: 'Velocidade limite para a arrancada', example: '100' },
      { name: 'flavor_text', description: 'Frase de incentivo na largada', example: 'Pise fundo na aceleração!' },
    ],
    sampleCsv: `vehicle_name,category,target_kmh,flavor_text
Novo Civic Type R,Super Esportivo,100,Sinta a potência do motor Turbo na pista!`,
  },

  safe: {
    gameId: 'safe',
    gameName: 'Desafio do Cofre',
    description: 'Defina o código de 3 dígitos, o prêmio secreto do cofre e as dicas para os discos.',
    csvColumns: [
      { name: 'secret_code', description: 'Código secreto de 3 dígitos (ex: 375)', example: '375' },
      { name: 'prize_name', description: 'Nome do prêmio ao abrir o cofre', example: 'Kit VIP da Marca' },
      { name: 'hint_1', description: 'Dica do primeiro disco', example: 'Número ímpar menor que 5' },
      { name: 'hint_2', description: 'Dica do segundo disco', example: 'Maior que 6' },
      { name: 'hint_3', description: 'Dica do terceiro disco', example: 'Número central entre 4 e 6' },
    ],
    sampleCsv: `secret_code,prize_name,hint_1,hint_2,hint_3
375,Kit VIP da Marca,Número ímpar menor que 5,Maior que 6,Número central entre 4 e 6`,
  },

  genius: {
    gameId: 'genius',
    gameName: 'Sequência Luminosa',
    description: 'Personalize os 4 botões de luzes com os pilares da campanha.',
    csvColumns: [
      { name: 'pad_id', description: 'ID do botão (0, 1, 2 ou 3)', example: '0' },
      { name: 'name', description: 'Nome do pilar/recurso', example: 'Modo Eco' },
      { name: 'color', description: 'Cor do botão', example: 'Verde' },
      { name: 'symbol', description: 'Ícone/Emoji representativo', example: '🌱' },
    ],
    sampleCsv: `pad_id,name,color,symbol
0,Modo Sustentável,Verde,🌱
1,Potência Turbo,Vermelho,🔥
2,Design & Conforto,Amarelo,⭐
3,Conectividade Digital,Azul,⚡`,
  },

  puzzle: {
    gameId: 'puzzle',
    gameName: 'Quebra-Cabeça Rápido',
    description: 'Personalize o título do quebra-cabeça e o texto das 8 peças ordenáveis.',
    csvColumns: [
      { name: 'puzzle_title', description: 'Título ou tema da montagem', example: 'Monte o Slogan Oficial' },
      { name: 'piece_1', description: 'Texto da peça 1', example: 'A' },
      { name: 'piece_2', description: 'Texto da peça 2', example: 'Força' },
      { name: 'piece_3', description: 'Texto da peça 3', example: 'Dos' },
      { name: 'piece_4', description: 'Texto da peça 4', example: 'Seus' },
      { name: 'piece_5', description: 'Texto da peça 5', example: 'Sonhos' },
      { name: 'piece_6', description: 'Texto da peça 6', example: 'Em' },
      { name: 'piece_7', description: 'Texto da peça 7', example: 'Cada' },
      { name: 'piece_8', description: 'Texto da peça 8', example: 'Curva' },
    ],
    sampleCsv: `puzzle_title,piece_1,piece_2,piece_3,piece_4,piece_5,piece_6,piece_7,piece_8
Monte o Slogan Oficial,A,Força,Dos,Seus,Sonhos,Em,Cada,Curva`,
  },

  balloon: {
    gameId: 'balloon',
    gameName: 'Estoura Balões',
    description: 'Cadastre os tipos de balões com cores da marca, valores de pontos e se é dourado/bônus.',
    csvColumns: [
      { name: 'name', description: 'Nome do balão', example: 'Balão Vermelho Racing' },
      { name: 'color', description: 'Cor em hex', example: '#EF4444' },
      { name: 'points', description: 'Pontos ganhos ao estourar', example: '100' },
      { name: 'is_gold', description: 'Se é balão dourado com bônus (true ou false)', example: 'false' },
    ],
    sampleCsv: `name,color,points,is_gold
Balão Vermelho Racing,#EF4444,100,false
Balão Azul Conectividade,#3B82F6,100,false
Balão Verde Híbrido,#10B981,100,false
Balão Dourado Premium,#F59E0B,250,true
Balão Rosa Neon,#EC4899,150,false`,
  },
};
