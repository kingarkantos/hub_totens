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

export interface WordSearchCustomConfig {
  theme: string;
  words: string[]; // List of words to find
}

export interface HangmanCustomItem {
  word: string;
  clue: string;
  category?: string;
}

export interface TrueFalseCustomItem {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface CompletePhraseCustomItem {
  sentence: string; // e.g. "O uso de ___ é indispensável em áreas de ruído."
  missingWord: string;
  options: [string, string, string, string];
}

export interface CorrectOrderCustomItem {
  title: string;
  steps: string[]; // Steps in correct order (0 to N)
}

export interface ConnectPairCustomItem {
  left: string;
  right: string;
}

export interface SpeedTriviaCustomItem {
  question: string;
  options: [string, string, string, string];
  correct: number;
}

export interface SpotErrorCustomItem {
  scenarioTitle: string;
  hazards: {
    name: string;
    description: string;
  }[];
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

  wordsearch: {
    gameId: 'wordsearch',
    gameName: 'Caça-Palavras',
    description: 'Cadastre as palavras-chave temáticas para serem escondidas e encontradas na matriz do totem.',
    csvColumns: [
      { name: 'word', description: 'Palavra a ser encontrada (sem acentos ou espaços)', example: 'CAPACETE' },
      { name: 'clue', description: 'Dica ou significado da palavra', example: 'Proteção essencial para a cabeça' },
    ],
    sampleCsv: `word,clue
CAPACETE,Proteção essencial para a cabeça
LUVAS,Proteção para as mãos e manuseio
OCULOS,Proteção visual contra fagulhas e estilhaços
PROTETOR,Proteção auricular em áreas de alto ruído
BOTA,Calçado de segurança com biqueira de aço`,
  },

  hangman: {
    gameId: 'hangman',
    gameName: 'Jogo da Forca',
    description: 'Palavras temáticas e dicas para os jogadores adivinharem no totem.',
    csvColumns: [
      { name: 'word', description: 'Palavra secreta a ser adivinhada', example: 'EXTINTOR' },
      { name: 'clue', description: 'Dica exibida na tela', example: 'Equipamento de combate a princípio de incêndio' },
      { name: 'category', description: 'Categoria temática', example: 'Segurança' },
    ],
    sampleCsv: `word,clue,category
EXTINTOR,Equipamento de combate a princípio de incêndio,Segurança
ISOLAMENTO,Procedimento antes de manutenção elétrica,Normas
ERGONOMIA,Ajuste adequado da postura e posto de trabalho,Saúde
HIGIENE,Prevenção contra contaminações no ambiente,Boas Práticas`,
  },

  truefalse: {
    gameId: 'truefalse',
    gameName: 'Verdadeiro ou Falso',
    description: 'Afirmações para o jogador julgar se são verdadeiras ou falsas contra o relógio.',
    csvColumns: [
      { name: 'statement', description: 'Afirmação sobre segurança ou tema da campanha', example: 'O uso de protetor auditivo só é necessário se o barulho incomodar.' },
      { name: 'is_true', description: 'true para Verdadeiro ou false para Falso', example: 'false' },
      { name: 'explanation', description: 'Explicação instrutiva exibida após a resposta', example: 'Falso! O ruído causa danos cumulativos invisíveis mesmo se acostumado.' },
    ],
    sampleCsv: `statement,is_true,explanation
O protetor auricular é obrigatório em setores com ruído acima do limite de tolerância,true,Correto! O protetor evita perdas auditivas cumulativas e irreversíveis.
Posso realizar reparos elétricos sem desligar a chave geral se estiver de luva simples,false,Falso! A desenergização e bloqueio são obrigatórios pela NR-10.
As rotas de fuga e saídas de emergência devem permanecer sempre desobstruídas,true,Correto! Desobstrução total é vital para evacuação rápida em caso de sinistro.
EPI danificado pode continuar sendo usado até o fim do expediente,false,Falso! Qualquer EPI avariado deve ser substituído imediatamente.`,
  },

  complete_phrase: {
    gameId: 'complete_phrase',
    gameName: 'Complete a Frase',
    description: 'Frases com lacunas temáticas e 4 opções de palavras para completar.',
    csvColumns: [
      { name: 'sentence', description: 'Frase com ___ representando a lacuna', example: 'Antes de iniciar qualquer atividade em altura, o uso de ___ é obrigatório.' },
      { name: 'missing_word', description: 'Palavra correta que preenche a lacuna', example: 'Cinto de Segurança' },
      { name: 'opt_2', description: 'Opção incorreta 2', example: 'Boné comum' },
      { name: 'opt_3', description: 'Opção incorreta 3', example: 'Capa de chuva' },
      { name: 'opt_4', description: 'Opção incorreta 4', example: 'Fone bluetooth' },
    ],
    sampleCsv: `sentence,missing_word,opt_2,opt_3,opt_4
Antes de iniciar qualquer trabalho acima de 2 metros use o ___,Cinto de Segurança,Boné comum,Capa de chuva,Fone bluetooth
Ao identificar um vazamento químico comunique imediatamente o ___,SESMT e Brigada,Refeitório,Setor de Vendas,Almoxarifado
O uso correto dos EPIs garante a sua ___ todos os dias,Integridade Física,Velocidade Máxima,Premiação Extra,Folga Semanal`,
  },

  correct_order: {
    gameId: 'correct_order',
    gameName: 'Ordem Correta',
    description: 'Procedimentos passo a passo para o jogador ordenar na sequência correta no totem.',
    csvColumns: [
      { name: 'title', description: 'Título do procedimento a ordenar', example: 'Procedimento Seguro de Trabalho em Altura' },
      { name: 'step_1', description: 'Passo 1 (primeiro)', example: 'Inspecionar as condições dos EPIs e do cinto paraquedista' },
      { name: 'step_2', description: 'Passo 2', example: 'Verificar e ancorar o talabarte na linha de vida homologada' },
      { name: 'step_3', description: 'Passo 3', example: 'Isolar e sinalizar a área no piso inferior' },
      { name: 'step_4', description: 'Passo 4', example: 'Subir pela escada mantendo os 3 pontos de apoio constantes' },
    ],
    sampleCsv: `title,step_1,step_2,step_3,step_4
Procedimento de Bloqueio Elétrico,Desligar o disjuntor principal,Aplicar o cadeado e etiqueta de bloqueio (LOTO),Testar com multímetro a ausência de tensão,Iniciar a manutenção com segurança
Uso do Extintor de Incêndio,Romper o lacre e puxar a trava de segurança,Empunhar a mangueira apontando para a base do fogo,Apertar o gatilho mantendo distância segura,Fazer movimento em leque cobrindo as chamas`,
  },

  connect_pairs: {
    gameId: 'connect_pairs',
    gameName: 'Conecte os Pares',
    description: 'Itens correspondentes entre duas colunas (ex: Risco e EPI, Conceito e Aplicação).',
    csvColumns: [
      { name: 'left_item', description: 'Item da coluna da esquerda', example: 'Ruído excessivo contínuo' },
      { name: 'right_item', description: 'Item correspondente da direita', example: 'Protetor Auricular Tipo Concha' },
    ],
    sampleCsv: `left_item,right_item
Ruído excessivo contínuo,Protetor Auricular Tipo Concha
Respingo de produtos químicos,Óculos de Ampla Visão
Queda de objetos pesados,Calçado com Biqueira de Aço
Inalação de vapores tóxicos,Máscara com Filtro Químico
Trabalho com solda elétrica,Máscara de Escurecimento Automático`,
  },

  speed_trivia: {
    gameId: 'speed_trivia',
    gameName: 'Trivia Rápida',
    description: 'Perguntas relâmpago de 8 segundos com alta adrenalina para totens.',
    csvColumns: [
      { name: 'question', description: 'Pergunta rápida e direta', example: 'Qual a cor da placa que indica rota de saída de emergência?' },
      { name: 'correct_option', description: 'Resposta correta', example: 'Verde' },
      { name: 'opt_2', description: 'Opção 2', example: 'Vermelha' },
      { name: 'opt_3', description: 'Opção 3', example: 'Amarela' },
      { name: 'opt_4', description: 'Opção 4', example: 'Azul' },
    ],
    sampleCsv: `question,correct_option,opt_2,opt_3,opt_4
Qual a cor padrão de sinalização de rotas de emergência?,Verde,Vermelha,Amarela,Azul
Qual norma regulamentadora trata de Segurança em Instalações Elétricas?,NR-10,NR-1,NR-35,NR-12
Qual equipamento protege a cabeça contra quedas de ferramentas?,Capacete com Carneira,Boné de Aba,Touca Térmica,Capuz de Malha
Em caso de alarme de incêndio o que você NUNCA deve utilizar?,Elevadores,Escadas,Portas corta-fogo,Rotas sinalizadas`,
  },

  spot_error: {
    gameId: 'spot_error',
    gameName: 'Encontre o Erro',
    description: 'Irregularidades ou riscos para identificar no cenário de segurança.',
    csvColumns: [
      { name: 'scenario_title', description: 'Título do cenário de inspeção', example: 'Inspeção no Canteiro de Obras' },
      { name: 'hazard_1', description: 'Irregularidade 1', example: 'Operador sem cinto em andaime superior' },
      { name: 'hazard_2', description: 'Irregularidade 2', example: 'Extintor obstruído por caixas de madeira' },
      { name: 'hazard_3', description: 'Irregularidade 3', example: 'Fio desencapado próximo a poça de água' },
    ],
    sampleCsv: `scenario_title,hazard_1,hazard_2,hazard_3
Inspeção na Área Operacional,Trabalhador sem capacete próximo ao guindaste,Fio desencapado no chão molhado,Extintor com validade vencida e lacre rompido`,
  },
};

