import React, { useState } from 'react';
import { X, FileText, Download, Upload, Sparkles, Plus, Trash2, Check, AlertCircle, Bot, Sliders, Clock, HelpCircle, Layers, CheckCircle2, ListOrdered, Link, PenTool, Target, Shield, AlertTriangle, RotateCcw } from 'lucide-react';
import { GameDefinition } from '../types';
import {
  GAME_CONTENT_SCHEMAS,
  TrueFalseCustomItem,
  QuizQuestionItem,
  CompletePhraseCustomItem,
  HangmanCustomItem,
  ConnectPairCustomItem,
  CorrectOrderCustomItem,
  MemoryCustomPair,
  WheelItem,
  TargetCustomItem,
  BalloonCustomItem,
  CatcherCustomItem,
  WordSearchCustomConfig,
  SafeCustomConfig,
  SpotErrorCustomItem,
  PuzzleCustomConfig,
  SpeedCustomConfig,
  GeniusPadCustom,
} from '../types/gameContent';
import { parseGameCSV, downloadSampleCsv } from '../lib/csvParser';
import { generateGameContentWithAI, CampaignAIContext } from '../lib/gemini';
import { sound } from '../lib/audio';

export const getDefaultTimeForGame = (id: string): number => {
  switch (id) {
    case 'quiz': return 15;
    case 'truefalse': return 15;
    case 'speed_trivia': return 15;
    case 'complete_phrase': return 20;
    case 'speed': return 15;
    case 'target': return 30;
    case 'catcher': return 30;
    case 'balloon': return 30;
    case 'correct_order': return 30;
    case 'safe': return 45;
    case 'connect_pairs': return 45;
    case 'spot_error': return 45;
    case 'memory': return 60;
    case 'puzzle': return 60;
    case 'hangman': return 60;
    case 'map_epi': return 60;
    case 'wordsearch': return 90;
    case 'wheel': return 0;
    case 'genius': return 0;
    default: return 30;
  }
};

export const getStarterContentForGame = (gameId: string): any => {
  switch (gameId) {
    case 'truefalse':
      return [
        { statement: 'O protetor auricular é obrigatório em setores com ruído acima do limite de tolerância.', isTrue: true, explanation: 'Correto! O ruído contínuo causa perdas auditivas cumulativas e irreversíveis.' },
        { statement: 'Posso realizar manutenção elétrica sem desligar a chave geral se estiver de luvas comuns.', isTrue: false, explanation: 'Falso! A desenergização e bloqueio LOTO são obrigatórios pela NR-10.' },
        { statement: 'As rotas de fuga e saídas de emergência devem permanecer sempre desobstruídas.', isTrue: true, explanation: 'Correto! Desobstrução total é vital para rápida evacuação em sinistros.' },
        { statement: 'EPI com fissura ou danificado pode continuar sendo usado até o fim do turno.', isTrue: false, explanation: 'Falso! Qualquer EPI com avaria deve ser descartado e substituído imediatamente.' },
      ];
    case 'quiz':
    case 'speed_trivia':
      return [
        {
          question: 'Qual o compromisso pioneiro da marca para o futuro da mobilidade?',
          options: ['Eletrificação e Zero Emissões', 'Mais consumo de combustível', 'Veículos sem revisão', 'Motores apenas a vapor'],
          correct: 0,
        },
        {
          question: 'O que o sistema inteligente de assistência à condução proporciona?',
          options: ['Menor visibilidade', 'Máxima segurança e frenagem autônoma', 'Aumento de ruído', 'Desativação dos freios'],
          correct: 1,
        },
        {
          question: 'Qual a principal vantagem da motorização híbrida avançada?',
          options: ['Maior poluição', 'Eficiência energética e torque instantâneo', 'Tanque menor sem autonomia', 'Perda de torque'],
          correct: 1,
        },
        {
          question: 'Qual o atributo mais elogiado pelos clientes em todo o Brasil?',
          options: ['Durabilidade, confiabilidade e alto valor de revenda', 'Peças descartáveis', 'Falta de peças', 'Pneus sem aderência'],
          correct: 0,
        },
        {
          question: 'No painel digital touchscreen, o que você pode conectar sem fio?',
          options: ['Somente fita K7', 'Apple CarPlay e Android Auto sem fio', 'Disquete de computador', 'Rádio AM apenas'],
          correct: 1,
        },
      ];
    case 'complete_phrase':
      return [
        {
          sentence: 'Antes de iniciar qualquer atividade em altura, o uso de ___ é obrigatório.',
          missingWord: 'Cinto de Segurança',
          options: ['Cinto de Segurança', 'Boné Comum', 'Capa de Chuva', 'Fone Bluetooth'],
        },
        {
          sentence: 'Ao identificar um vazamento químico, comunique imediatamente a equipe de ___.',
          missingWord: 'SESMT e Brigada',
          options: ['SESMT e Brigada', 'Refeitório', 'Setor de Vendas', 'Almoxarifado'],
        },
        {
          sentence: 'O uso correto dos EPIs garante a sua ___ todos os dias.',
          missingWord: 'Integridade Física',
          options: ['Integridade Física', 'Velocidade Máxima', 'Premiação Extra', 'Folga Semanal'],
        },
      ];
    case 'hangman':
      return [
        { word: 'EXTINTOR', clue: 'Equipamento de combate a princípio de incêndio', category: 'Segurança' },
        { word: 'ISOLAMENTO', clue: 'Procedimento antes de reparos e intervenções', category: 'Normas' },
        { word: 'ERGONOMIA', clue: 'Ajuste adequado da postura e posto de trabalho', category: 'Saúde' },
        { word: 'PREVENCAO', clue: 'Melhor atitude diária para zero acidentes', category: 'Segurança' },
      ];
    case 'connect_pairs':
      return [
        { left: 'Ruído excessivo contínuo', right: 'Protetor Auricular Tipo Concha' },
        { left: 'Respingo de produtos químicos', right: 'Óculos de Ampla Visão' },
        { left: 'Queda de ferramentas em altura', right: 'Capacete com Jugular' },
        { left: 'Inalação de poeiras tóxicas', right: 'Máscara com Filtro PFF2' },
      ];
    case 'wheel':
      return [
        { label: 'Brinde Exclusivo', score: 500, color: '#EF4444' },
        { label: '10% Desconto', score: 300, color: '#3B82F6' },
        { label: 'Kit Especial', score: 800, color: '#10B981' },
        { label: 'Giro Extra', score: 200, color: '#F59E0B' },
        { label: 'Adesivo Oficial', score: 150, color: '#8B5CF6' },
        { label: 'Garrafa Térmica', score: 600, color: '#EC4899' },
        { label: 'Boné da Marca', score: 450, color: '#06B6D4' },
        { label: 'Chaveiro Turbo', score: 250, color: '#D97706' },
      ];
    case 'memory':
      return [
        { symbol: '🚗', label: 'Sedan Turbo' },
        { symbol: '🚙', label: 'SUV Híbrido' },
        { symbol: '🏍️', label: 'Moto Esportiva' },
        { symbol: '⚡', label: 'Bateria Alta Voltagem' },
        { symbol: '🛡️', label: 'Segurança Sensing' },
        { symbol: '🏁', label: 'Performance R' },
      ];
    case 'wordsearch':
      return {
        theme: 'Equipamentos de Proteção e Segurança',
        words: ['CAPACETE', 'LUVAS', 'OCULOS', 'PROTETOR', 'BOTA'],
      };
    case 'correct_order':
      return {
        title: 'Procedimento Seguro de Bloqueio Elétrico (LOTO)',
        steps: [
          'Desligar o disjuntor principal da máquina ou circuito',
          'Aplicar o cadeado de segurança e a etiqueta LOTO',
          'Testar a ausência de tensão com multímetro homologado',
          'Iniciar o trabalho de manutenção com segurança',
        ],
      };
    case 'safe':
      return {
        secretCode: '375',
        prizeName: 'Kit VIP da Marca',
        hints: [
          'Dica 1: Número ímpar menor que 5',
          'Dica 2: Maior que 6',
          'Dica 3: Número central entre 4 e 6',
        ],
      };
    case 'spot_error':
      return {
        scenarioTitle: 'Inspeção na Linha Operacional',
        hazards: [
          { name: 'Trabalhador sem óculos de proteção', description: 'Risco de estilhaços e partículas nos olhos' },
          { name: 'Cabo elétrico exposto e desencapado', description: 'Risco grave de choque elétrico e curto-circuito' },
          { name: 'Extintor de incêndio obstruído por caixas', description: 'Impede o acesso rápido em emergência' },
          { name: 'Líquido inflamável derramado no piso', description: 'Risco de escorregamento e combustão' },
        ],
      };
    case 'puzzle':
      return {
        puzzleTitle: 'Monte o Slogan Oficial',
        pieceLabels: ['A', 'Força', 'Dos', 'Seus', 'Sonhos', 'Em', 'Cada', 'Curva'],
      };
    case 'speed':
      return {
        vehicleName: 'Novo Civic Type R',
        category: 'Super Esportivo Turbo',
        targetKmh: 100,
        flavorText: 'Sinta a potência do motor Turbo na pista!',
      };
    case 'target':
      return [
        { name: 'Alvo Padrão', symbol: '◎', points: 100, isBonus: false },
        { name: 'Estrela Dourada', symbol: '★', points: 250, isBonus: true },
        { name: 'Logotipo Marca', symbol: '⭐', points: 150, isBonus: false },
        { name: 'Troféu Relâmpago', symbol: '🏆', points: 300, isBonus: true },
      ];
    case 'balloon':
      return [
        { name: 'Balão Vermelho Racing', color: '#EF4444', points: 100, isGold: false },
        { name: 'Balão Azul Conectividade', color: '#3B82F6', points: 100, isGold: false },
        { name: 'Balão Verde Híbrido', color: '#10B981', points: 100, isGold: false },
        { name: 'Balão Dourado Premium', color: '#F59E0B', points: 250, isGold: true },
        { name: 'Balão Rosa Neon', color: '#EC4899', points: 150, isGold: false },
      ];
    case 'catcher':
      return [
        { name: 'Kit Brinde', symbol: '🎁', points: 150, type: 'gift' },
        { name: 'Estrela Dourada', symbol: '⭐', points: 300, type: 'star' },
        { name: 'Chaveiro Especial', symbol: '🔑', points: 200, type: 'gift' },
        { name: 'Pneu Furado', symbol: '💣', points: -200, type: 'hazard' },
      ];
    case 'genius':
      return [
        { id: 0, name: 'Modo Sustentável', color: '#10B981', symbol: '🌱' },
        { id: 1, name: 'Potência Turbo', color: '#EF4444', symbol: '🔥' },
        { id: 2, name: 'Design & Conforto', color: '#F59E0B', symbol: '⭐' },
        { id: 3, name: 'Conectividade Digital', color: '#3B82F6', symbol: '⚡' },
      ];
    case 'map_epi':
      return [
        { id: 'civil', sectorName: 'Canteiro de Obras & Altura', requiredEpi: 'Capacete com Jugular', epiEmoji: '⛑️', color: '#F59E0B' },
        { id: 'noise', sectorName: 'Área com Prensas e Compressores', requiredEpi: 'Protetor Auricular Concha', epiEmoji: '🎧', color: '#3B82F6' },
        { id: 'electric', sectorName: 'Subestação Elétrica 13.8kV', requiredEpi: 'Luvas de Alta Tensão 10kV', epiEmoji: '🧤', color: '#8B5CF6' },
        { id: 'weld', sectorName: 'Cabine de Soldagem Mig/Mag', requiredEpi: 'Máscara de Escurecimento', epiEmoji: '🥽', color: '#EF4444' },
      ];
    default:
      return [];
  }
};

export const getContentCount = (data: any): number => {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data === 'object') {
    if (Array.isArray(data.words)) return data.words.length;
    if (Array.isArray(data.steps)) return data.steps.length;
    if (Array.isArray(data.hazards)) return data.hazards.length;
    if (Array.isArray(data.hints)) return data.hints.length;
    if (Array.isArray(data.pieceLabels)) return data.pieceLabels.length;
    if (data.vehicleName !== undefined) return 1;
    return Object.keys(data).length;
  }
  return 0;
};

interface GameContentEditorModalProps {
  game: GameDefinition;
  currentContent: any;
  currentTimeLimit?: number;
  currentTotalTimeLimit?: number;
  campaignContext: CampaignAIContext;
  onClose: () => void;
  onSave: (gameId: string, updatedContent: any, timeLimit?: number, totalTimeLimit?: number) => void;
}

export const GameContentEditorModal: React.FC<GameContentEditorModalProps> = ({
  game,
  currentContent,
  currentTimeLimit,
  currentTotalTimeLimit,
  campaignContext,
  onClose,
  onSave,
}) => {
  const meta = GAME_CONTENT_SCHEMAS[game.id];
  const isQuestionGame = ['quiz', 'truefalse', 'speed_trivia', 'complete_phrase'].includes(game.id);
  const defaultTime = getDefaultTimeForGame(game.id);

  // Time per question or single-action time
  const [timeLimit, setTimeLimit] = useState<number>(() => {
    if (currentTimeLimit !== undefined) return currentTimeLimit;
    return defaultTime;
  });

  // Total session/game time (especially for question games)
  const [totalTimeLimit, setTotalTimeLimit] = useState<number>(() => {
    if (currentTotalTimeLimit !== undefined) return currentTotalTimeLimit;
    return isQuestionGame ? 60 : 0;
  });

  const isStarterContent = currentContent === undefined || currentContent === null;
  const [hasCustomEdits, setHasCustomEdits] = useState(!isStarterContent);

  const [content, setContent] = useState<any>(() => {
    if (currentContent !== undefined && currentContent !== null) return currentContent;
    return getStarterContentForGame(game.id);
  });

  const currentCount = getContentCount(content);
  const hasExistingContent = currentCount > 0;

  // Always start directly on the manual form so the user sees the existing records immediately!
  const [activeTab, setActiveTab] = useState<'csv' | 'form' | 'ai'>('form');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');

  const getDefaultCountForGame = (id: string) => {
    switch (id) {
      case 'wheel': return 8;
      case 'quiz': return 5;
      case 'truefalse': return 5;
      case 'speed_trivia': return 5;
      case 'hangman': return 5;
      case 'complete_phrase': return 4;
      case 'connect_pairs': return 4;
      case 'memory': return 6;
      case 'wordsearch': return 5;
      case 'target': return 5;
      case 'catcher': return 5;
      case 'spot_error': return 4;
      case 'balloon': return 5;
      case 'correct_order': return 4;
      default: return 5;
    }
  };

  const [aiItemCount, setAiItemCount] = useState<number>(() => getDefaultCountForGame(game.id));
  const [csvImportMode, setCsvImportMode] = useState<'replace' | 'append'>('replace');

  // Handle CSV File Upload - REPLACES or APPENDS according to csvImportMode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGameCSV(game.id, text);

        if (Array.isArray(parsed)) {
          if (csvImportMode === 'append' && Array.isArray(content) && content.length > 0 && hasCustomEdits) {
            const merged = [...content, ...parsed];
            setContent(merged);
            setHasCustomEdits(true);
            setSuccessMsg(`+${parsed.length} novos itens adicionados do CSV! Total: ${merged.length} itens.`);
          } else {
            setContent(parsed);
            setHasCustomEdits(true);
            setSuccessMsg(`CSV importado com sucesso! (${parsed.length} itens carregados).`);
          }
        } else {
          setContent(parsed);
          setHasCustomEdits(true);
          setSuccessMsg('Configuração importada com sucesso do CSV!');
        }

        try {
          sound.playSuccess();
        } catch (e) {
          console.warn(e);
        }
        setErrorMsg('');
        setActiveTab('form'); // Switch to manual form tab so user sees all items immediately!
      } catch (err: any) {
        sound.playError();
        setErrorMsg(err.message || 'Erro ao processar o arquivo CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle AI Generation - REPLACES starter examples, APPENDS if already custom
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setErrorMsg('');
    setSuccessMsg('');
    sound.playEngineRev();

    try {
      const generated = await generateGameContentWithAI(game.id, {
        ...campaignContext,
        userPrompt: aiCustomPrompt.trim() || undefined,
        itemCount: aiItemCount > 0 ? aiItemCount : undefined,
      });

      if (Array.isArray(generated)) {
        if (Array.isArray(content) && content.length > 0 && hasCustomEdits) {
          const merged = [...content, ...generated];
          setContent(merged);
          setSuccessMsg(`+${generated.length} novos itens gerados com IA e acrescentados! Total: ${merged.length} itens.`);
        } else {
          setContent(generated);
          setHasCustomEdits(true);
          setSuccessMsg(`Conteúdo temático gerado com Inteligência Artificial! (${generated.length} itens - exemplos iniciais substituídos).`);
        }
      } else {
        setContent(generated);
        setHasCustomEdits(true);
        setSuccessMsg('Conteúdo temático gerado com Inteligência Artificial (Gemini)!');
      }

      try {
        sound.playSuccess();
      } catch (e) {
        console.warn(e);
      }
      setActiveTab('form'); // Switch to manual form tab so user sees all items immediately!
    } catch (err: any) {
      console.error(err);
      sound.playError();
      setErrorMsg(err.message || 'Falha ao conectar com o Google Gemini.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      alert('Nenhum conteúdo configurado ainda!');
      return;
    }
    try {
      sound.playSuccess();
    } catch (e) {
      console.warn('Audio play error:', e);
    }
    onSave(game.id, content, timeLimit, totalTimeLimit);
  };

  // -------------------------------------------------------------
  // RENDER DEDICATED INPUT FORMS (NO JSON TEXTAREA!)
  // -------------------------------------------------------------
  const renderManualForm = () => {
    switch (game.id) {
      // 1. VERDADEIRO OU FALSO
      case 'truefalse': {
        const statements: TrueFalseCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Afirmações de Verdadeiro ou Falso ({statements.length})
                  </span>
                  {!hasCustomEdits && statements.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Exemplos Iniciais
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Edite os campos abaixo ou clique no botão para adicionar novas afirmações ao jogo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {statements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja limpar todos os registros da lista?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar todos os registros para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([
                      ...statements,
                      {
                        statement: '',
                        isTrue: true,
                        explanation: '',
                      },
                    ]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Afirmação</span>
                </button>
              </div>
            </div>

            {statements.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhuma afirmação cadastrada ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([
                        {
                          statement: 'O uso de protetor auditivo só é necessário se o barulho incomodar.',
                          isTrue: false,
                          explanation: 'Falso! O ruído contínuo causa danos cumulativos imperceptíveis no início.',
                        },
                        {
                          statement: 'A inspeção prévia dos EPIs antes do uso é obrigatória pela NR-6.',
                          isTrue: true,
                          explanation: 'Verdadeiro! O colaborador deve inspecionar o equipamento antes de cada jornada.',
                        },
                      ]);
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([{ statement: '', isTrue: true, explanation: '' }]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {statements.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        Afirmação #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setContent(statements.filter((_, i) => i !== idx));
                          setHasCustomEdits(true);
                        }}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                        Texto da Afirmação (O que o participante lê):
                      </label>
                      <textarea
                        rows={2}
                        value={item.statement}
                        placeholder="Ex: O protetor auditivo só é necessário se o barulho incomodar..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(statements.map((it, i) => i === idx ? { ...it, statement: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                          Gabarito (Resposta Correta):
                        </label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-300 p-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setContent(statements.map((it, i) => i === idx ? { ...it, isTrue: true } : it));
                              setHasCustomEdits(true);
                            }}
                            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                              item.isTrue
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            ✓ Verdadeiro
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setContent(statements.map((it, i) => i === idx ? { ...it, isTrue: false } : it));
                              setHasCustomEdits(true);
                            }}
                            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                              !item.isTrue
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            ✕ Falso
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-7">
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                          Explicação Educativa pós-resposta:
                        </label>
                        <input
                          type="text"
                          value={item.explanation}
                          placeholder="Ex: Falso! O ruído danifica a audição de forma contínua."
                          onChange={(e) => {
                            const val = e.target.value;
                            setContent(statements.map((it, i) => i === idx ? { ...it, explanation: val } : it));
                            setHasCustomEdits(true);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 2. QUIZ & SPEED TRIVIA
      case 'quiz':
      case 'speed_trivia': {
        const questions: QuizQuestionItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Perguntas de Múltipla Escolha ({questions.length})
                  </span>
                  {!hasCustomEdits && questions.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Exemplos Iniciais
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Cadastre perguntas com 4 alternativas e marque o círculo da resposta correta.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja remover todas as perguntas da lista?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar todas as perguntas para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([
                      ...questions,
                      {
                        question: '',
                        options: ['', '', '', ''],
                        correct: 0,
                      },
                    ]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Pergunta</span>
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhuma pergunta cadastrada ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(getStarterContentForGame(game.id));
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([
                        {
                          question: '',
                          options: ['', '', '', ''],
                          correct: 0,
                        },
                      ]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        Pergunta #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setContent(questions.filter((_, i) => i !== qIdx));
                          setHasCustomEdits(true);
                        }}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                        Enunciado da Pergunta:
                      </label>
                      <input
                        type="text"
                        value={q.question}
                        placeholder="Digite a pergunta para o totem..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(questions.map((it, i) => i === qIdx ? { ...it, question: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase">
                        Alternativas (Selecione a opção correta no botão redondo):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              q.correct === optIdx
                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correct === optIdx}
                              onChange={() => {
                                setContent(questions.map((it, i) => i === qIdx ? { ...it, correct: optIdx } : it));
                                setHasCustomEdits(true);
                              }}
                              className="w-4 h-4 text-emerald-600 focus:ring-0 cursor-pointer"
                              title="Marcar como alternativa correta"
                            />
                            <span className="text-xs font-mono font-bold text-slate-400">
                              {String.fromCharCode(65 + optIdx)}:
                            </span>
                            <input
                              type="text"
                              value={opt}
                              placeholder={`Alternativa ${String.fromCharCode(65 + optIdx)}`}
                              onChange={(e) => {
                                const val = e.target.value;
                                setContent(questions.map((it, i) => i === qIdx ? {
                                  ...it,
                                  options: it.options.map((op, oIdx) => oIdx === optIdx ? val : op),
                                } : it));
                                setHasCustomEdits(true);
                              }}
                              className="flex-1 bg-transparent text-xs text-slate-900 font-medium focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 3. COMPLETE A FRASE
      case 'complete_phrase': {
        const phrases: CompletePhraseCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Frases com Lacuna ({phrases.length})
                  </span>
                  {!hasCustomEdits && phrases.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Exemplos Iniciais
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Digite a frase com "___" e cadastre as alternativas com a palavra correta.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {phrases.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja remover todas as frases da lista?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar todas as frases para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([
                      ...phrases,
                      {
                        sentence: 'O uso de ___ é obrigatório na área fabril.',
                        missingWord: 'capacete',
                        options: ['capacete', 'chinelo', 'boné', 'relógio'],
                      },
                    ]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Frase</span>
                </button>
              </div>
            </div>

            {phrases.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhuma frase cadastrada ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(getStarterContentForGame(game.id));
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([
                        {
                          sentence: 'O uso de ___ é obrigatório na área.',
                          missingWord: 'EPI',
                          options: ['EPI', 'Crachá', 'Uniforme', 'Sapato'],
                        },
                      ]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                {phrases.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        Frase #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setContent(phrases.filter((_, i) => i !== idx));
                          setHasCustomEdits(true);
                        }}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                        Frase (use ___ no lugar da palavra):
                      </label>
                      <input
                        type="text"
                        value={item.sentence}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(phrases.map((it, i) => i === idx ? { ...it, sentence: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-emerald-700 font-bold uppercase mb-1">
                          Palavra Correta (Lacuna):
                        </label>
                        <input
                          type="text"
                          value={item.missingWord}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContent(phrases.map((it, i) => {
                              if (i !== idx) return it;
                              const updatedOptions = [...(it.options || [])];
                              updatedOptions[0] = val;
                              return { ...it, missingWord: val, options: updatedOptions };
                            }));
                            setHasCustomEdits(true);
                          }}
                          className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-black text-emerald-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                          Outras 3 Opções (Distratores):
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[1, 2, 3].map((optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              value={item.options?.[optIdx] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setContent(phrases.map((it, i) => {
                                  if (i !== idx) return it;
                                  const updatedOptions = [...(it.options || [])];
                                  updatedOptions[optIdx] = val;
                                  return { ...it, options: updatedOptions };
                                }));
                                setHasCustomEdits(true);
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 4. JOGO DA FORCA
      case 'hangman': {
        const words: HangmanCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Palavras da Forca ({words.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Cadastre as palavras secretas, dicas e categorias.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {words.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja limpar todas as palavras da lista?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar tudo para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([...words, { word: '', clue: '', category: 'Segurança' }]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Palavra</span>
                </button>
              </div>
            </div>

            {words.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhuma palavra cadastrada ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(getStarterContentForGame(game.id));
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([{ word: 'PREVENCAO', clue: 'Melhor atitude diária', category: 'Segurança' }]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {words.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-xs">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Palavra Secreta:</label>
                      <input
                        type="text"
                        value={item.word}
                        placeholder="Ex: EXTINTOR"
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setContent(words.map((it, i) => i === idx ? { ...it, word: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-red-600 tracking-wider focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Dica:</label>
                      <input
                        type="text"
                        value={item.clue}
                        placeholder="Ex: Usado para conter início de incêndio"
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(words.map((it, i) => i === idx ? { ...it, clue: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Categoria:</label>
                      <input
                        type="text"
                        value={item.category || ''}
                        placeholder="Segurança"
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(words.map((it, i) => i === idx ? { ...it, category: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setContent(words.filter((_, i) => i !== idx));
                          setHasCustomEdits(true);
                        }}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 5. CONECTE OS PARES
      case 'connect_pairs': {
        const pairs: ConnectPairCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Pares Correspondentes ({pairs.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Cadastre o item da coluna esquerda e o seu par correspondente na direita.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pairs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja limpar todos os pares da lista?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar tudo para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([...pairs, { left: '', right: '' }]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Par</span>
                </button>
              </div>
            </div>

            {pairs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhum par cadastrado ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(getStarterContentForGame(game.id));
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([{ left: 'Ruído', right: 'Protetor Auricular' }]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {pairs.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-xs">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Item Esquerda:</label>
                      <input
                        type="text"
                        value={item.left}
                        placeholder="Ex: Óculos de Proteção"
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(pairs.map((it, i) => i === idx ? { ...it, left: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Par Correspondente (Direita):</label>
                      <input
                        type="text"
                        value={item.right}
                        placeholder="Ex: Proteção contra fagulhas"
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(pairs.map((it, i) => i === idx ? { ...it, right: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setContent(pairs.filter((_, i) => i !== idx));
                          setHasCustomEdits(true);
                        }}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 6. ROLETA PREMIADA
      case 'wheel': {
        const items: WheelItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Fatias da Roleta ({items.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Edite os prêmios, pontuações e cores das fatias.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja limpar todas as fatias da roleta?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar tudo para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([...items, { label: 'Novo Prêmio', score: 300, color: '#DC2626' }]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Fatia</span>
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhuma fatia cadastrada ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(getStarterContentForGame(game.id));
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([{ label: 'Brinde Especial', score: 500, color: '#EF4444' }]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome do Prêmio</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(items.map((it, i) => i === idx ? { ...it, label: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Pontos</label>
                      <input
                        type="number"
                        value={item.score}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setContent(items.map((it, i) => i === idx ? { ...it, score: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-red-600 font-bold focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="w-16">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Cor</label>
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(items.map((it, i) => i === idx ? { ...it, color: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full h-9 bg-transparent border-0 cursor-pointer rounded-lg"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setContent(items.filter((_, i) => i !== idx));
                        setHasCustomEdits(true);
                      }}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 7. JOGO DA MEMÓRIA
      case 'memory': {
        const pairs: MemoryCustomPair[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Cartas do Jogo da Memória ({pairs.length} pares)
                </span>
                <p className="text-[11px] text-slate-500">
                  Defina o ícone/emoji e o nome de cada par de cartas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pairs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (window.confirm('Deseja limpar todas as cartas da lista?')) {
                        setContent([]);
                        setHasCustomEdits(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold border border-slate-200 active:scale-95 transition-all"
                    title="Limpar tudo para começar do zero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent([...pairs, { symbol: '🛡️', label: 'Segurança' }]);
                    setHasCustomEdits(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Par</span>
                </button>
              </div>
            </div>

            {pairs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Nenhum par de cartas cadastrado ainda.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(getStarterContentForGame(game.id));
                      setHasCustomEdits(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent([{ symbol: '⚡', label: 'Energia' }]);
                      setHasCustomEdits(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar em Branco</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                {pairs.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs">
                    <div className="w-16">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Emoji</label>
                      <input
                        type="text"
                        value={item.symbol}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(pairs.map((it, i) => i === idx ? { ...it, symbol: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full text-center py-1.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome da Carta</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent(pairs.map((it, i) => i === idx ? { ...it, label: val } : it));
                          setHasCustomEdits(true);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setContent(pairs.filter((_, i) => i !== idx));
                        setHasCustomEdits(true);
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 8. CAÇA-PALAVRAS
      case 'wordsearch': {
        const data: WordSearchCustomConfig = typeof content === 'object' && content !== null && 'words' in content
          ? content
          : { theme: 'Segurança no Trabalho', words: Array.isArray(content) ? content : ['EPI', 'CAPACETE', 'LUVA', 'OCULOS', 'PREVENCAO'] };
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Tema do Caça-Palavras:
              </label>
              <input
                type="text"
                value={data.theme || ''}
                placeholder="Ex: Segurança e Saúde"
                onChange={(e) => {
                  setContent({ ...data, theme: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  Palavras a Encontrar ({data.words?.length || 0}):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent({ ...data, words: [...(data.words || []), 'NOVA'] });
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Palavra</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.words?.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="text"
                      value={w}
                      onChange={(e) => {
                        const copy = [...data.words];
                        copy[idx] = e.target.value.toUpperCase();
                        setContent({ ...data, words: copy });
                      }}
                      className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black text-red-600 tracking-wider focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setContent({ ...data, words: data.words.filter((_, i) => i !== idx) });
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // 9. ORDEM CORRETA
      case 'correct_order': {
        const data: CorrectOrderCustomItem = typeof content === 'object' && content !== null && 'steps' in content
          ? content
          : { title: 'Procedimento Operacional Padrão', steps: Array.isArray(content) ? content : ['Passo 1', 'Passo 2', 'Passo 3', 'Passo 4'] };
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Título do Procedimento:
              </label>
              <input
                type="text"
                value={data.title || ''}
                placeholder="Ex: Procedimento de Bloqueio e Etiquetagem (LOTO)"
                onChange={(e) => {
                  setContent({ ...data, title: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  Passos na Sequência Correta ({data.steps?.length || 0}):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent({ ...data, steps: [...(data.steps || []), 'Novo passo'] });
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Passo</span>
                </button>
              </div>

              <div className="space-y-2">
                {data.steps?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => {
                        const copy = [...data.steps];
                        copy[idx] = e.target.value;
                        setContent({ ...data, steps: copy });
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setContent({ ...data, steps: data.steps.filter((_, i) => i !== idx) });
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // 10. DESAFIO DO COFRE
      case 'safe': {
        const data: SafeCustomConfig = typeof content === 'object' && content !== null && 'secretCode' in content
          ? content
          : { secretCode: '375', prizeName: 'Kit VIP da Marca', hints: ['Dica 1: Número ímpar menor que 5', 'Dica 2: Maior que 6', 'Dica 3: Número central entre 4 e 6'] };

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Código Secreto de Abertura (3 Dígitos):
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={data.secretCode || ''}
                  placeholder="Ex: 375"
                  onChange={(e) => {
                    setContent({ ...data, secretCode: e.target.value.replace(/\D/g, '').slice(0, 3) });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-mono font-black text-amber-600 tracking-widest focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Nome do Prêmio do Cofre:
                </label>
                <input
                  type="text"
                  value={data.prizeName || ''}
                  placeholder="Ex: Kit VIP Exclusivo da Marca"
                  onChange={(e) => {
                    setContent({ ...data, prizeName: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase">
                Dicas dos 3 Discos Numéricos:
              </label>
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                      Dica para o Disco {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={data.hints?.[idx] || ''}
                      placeholder={`Ex: Dica do disco ${idx + 1}`}
                      onChange={(e) => {
                        const copy = [...(data.hints || ['', '', ''])];
                        copy[idx] = e.target.value;
                        setContent({ ...data, hints: copy });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 11. ENCONTRE O ERRO
      case 'spot_error': {
        const data: SpotErrorCustomItem = typeof content === 'object' && content !== null && 'hazards' in content
          ? content
          : {
              scenarioTitle: 'Inspeção na Linha Operacional',
              hazards: [
                { name: 'Trabalhador sem óculos de proteção', description: 'Risco de estilhaços e partículas nos olhos' },
                { name: 'Cabo elétrico exposto e desencapado', description: 'Risco grave de choque elétrico e curto-circuito' },
                { name: 'Extintor de incêndio obstruído por caixas', description: 'Impede o acesso rápido em emergência' },
                { name: 'Líquido inflamável derramado no piso', description: 'Risco de escorregamento e combustão' },
              ],
            };

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Título do Cenário de Inspeção:
              </label>
              <input
                type="text"
                value={data.scenarioTitle || ''}
                placeholder="Ex: Inspeção no Canteiro de Obras"
                onChange={(e) => {
                  setContent({ ...data, scenarioTitle: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-800 uppercase">
                    Perigos e Irregularidades ({data.hazards?.length || 0})
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Cadastre os pontos de perigo que o participante deve identificar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setContent({
                      ...data,
                      hazards: [
                        ...(data.hazards || []),
                        { name: 'Novo Perigo Identificado', description: 'Descrição do risco de acidente' },
                      ],
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Perigo</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {data.hazards?.map((h, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 shadow-xs">
                    <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-mono font-black text-xs flex items-center justify-center flex-shrink-0 mt-1">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome da Irregularidade</label>
                        <input
                          type="text"
                          value={h.name}
                          onChange={(e) => {
                            const copy = [...data.hazards];
                            copy[idx].name = e.target.value;
                            setContent({ ...data, hazards: copy });
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Descrição do Risco / Consequência</label>
                        <input
                          type="text"
                          value={h.description}
                          onChange={(e) => {
                            const copy = [...data.hazards];
                            copy[idx].description = e.target.value;
                            setContent({ ...data, hazards: copy });
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setContent({
                          ...data,
                          hazards: data.hazards.filter((_, i) => i !== idx),
                        });
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg mt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // 12. QUEBRA-CABEÇA
      case 'puzzle': {
        const data: PuzzleCustomConfig = typeof content === 'object' && content !== null && 'pieceLabels' in content
          ? content
          : {
              puzzleTitle: 'Monte o Slogan Oficial',
              pieceLabels: ['A', 'Força', 'Dos', 'Seus', 'Sonhos', 'Em', 'Cada', 'Curva'],
            };

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Título do Quebra-Cabeça:
              </label>
              <input
                type="text"
                value={data.puzzleTitle || ''}
                placeholder="Ex: Monte o Slogan Oficial da Campanha"
                onChange={(e) => {
                  setContent({ ...data, puzzleTitle: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase">
                Texto das 8 Peças (em ordem de montagem):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-teal-700">Peça #{idx + 1}</span>
                    <input
                      type="text"
                      value={data.pieceLabels?.[idx] || ''}
                      onChange={(e) => {
                        const copy = [...(data.pieceLabels || ['', '', '', '', '', '', '', ''])];
                        copy[idx] = e.target.value;
                        setContent({ ...data, pieceLabels: copy });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 text-center focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // 13. ARRANCADA TURBO (SPEED)
      case 'speed': {
        const data: SpeedCustomConfig = typeof content === 'object' && content !== null && 'vehicleName' in content
          ? content
          : {
              vehicleName: 'Novo Civic Type R',
              category: 'Super Esportivo Turbo',
              targetKmh: 100,
              flavorText: 'Sinta a potência do motor Turbo na pista!',
            };

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Nome do Veículo:
                </label>
                <input
                  type="text"
                  value={data.vehicleName || ''}
                  placeholder="Ex: Civic Type R"
                  onChange={(e) => setContent({ ...data, vehicleName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Categoria do Veículo:
                </label>
                <input
                  type="text"
                  value={data.category || ''}
                  placeholder="Ex: Super Esportivo Turbo"
                  onChange={(e) => setContent({ ...data, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Velocidade Limite (Km/h):
                </label>
                <input
                  type="number"
                  value={data.targetKmh || 100}
                  onChange={(e) => setContent({ ...data, targetKmh: Number(e.target.value) || 100 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-red-600 focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Frase de Incentivo da Largada:
                </label>
                <input
                  type="text"
                  value={data.flavorText || ''}
                  placeholder="Ex: Pise fundo na aceleração!"
                  onChange={(e) => setContent({ ...data, flavorText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        );
      }

      // 14. CAÇA AOS ALVOS (TARGET)
      case 'target': {
        const items: TargetCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Tipos de Alvos Cadastrados ({items.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Edite os alvos que surgem na tela para o participante tocar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([...items, { name: 'Novo Alvo', symbol: '🎯', points: 100, isBonus: false }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Alvo</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs flex-wrap">
                  <div className="w-16">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Símbolo</label>
                    <input
                      type="text"
                      value={item.symbol}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].symbol = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full text-center py-1.5 bg-white border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome do Alvo</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].name = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Pontos</label>
                    <input
                      type="number"
                      value={item.points}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].points = Number(e.target.value);
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-red-600"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isBonus}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].isBonus = e.target.checked;
                          setContent(copy);
                        }}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>Bônus Especial</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(items.filter((_, i) => i !== idx));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-3 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 15. ESTOURA BALÕES (BALLOON)
      case 'balloon': {
        const items: BalloonCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Balões Cadastrados ({items.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Edite as cores, pontuações e tipos de balões que sobem na tela.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([...items, { name: 'Novo Balão', color: '#EF4444', points: 100, isGold: false }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Balão</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs flex-wrap">
                  <div className="w-14">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Cor</label>
                    <input
                      type="color"
                      value={item.color || '#EF4444'}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].color = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome do Balão</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].name = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Pontos</label>
                    <input
                      type="number"
                      value={item.points}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].points = Number(e.target.value);
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-red-600"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isGold}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].isGold = e.target.checked;
                          setContent(copy);
                        }}
                        className="rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>Dourado / Bônus</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(items.filter((_, i) => i !== idx));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-3 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 16. CHUVA DE BRINDES (CATCHER)
      case 'catcher': {
        const items: CatcherCustomItem[] = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Itens da Chuva de Brindes ({items.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Cadastre brindes, estrelas bônus e obstáculos que caem da tela.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([...items, { name: 'Novo Brinde', symbol: '🎁', points: 150, type: 'gift' }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs flex-wrap">
                  <div className="w-16">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Símbolo</label>
                    <input
                      type="text"
                      value={item.symbol}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].symbol = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full text-center py-1.5 bg-white border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].name = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="w-40">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Tipo do Item</label>
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].type = e.target.value as any;
                        setContent(copy);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="gift">🎁 Brinde / Presente</option>
                      <option value="star">⭐ Estrela Bônus</option>
                      <option value="hazard">💣 Perigo / Obstáculo</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Pontos</label>
                    <input
                      type="number"
                      value={item.points}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].points = Number(e.target.value);
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-red-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(items.filter((_, i) => i !== idx));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-3 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 17. SEQUÊNCIA LUMINOSA (GENIUS)
      case 'genius': {
        const pads: GeniusPadCustom[] = Array.isArray(content) && content.length === 4 ? content : [
          { id: 0, name: 'Modo Sustentável', color: '#10B981', symbol: '🌱' },
          { id: 1, name: 'Potência Turbo', color: '#EF4444', symbol: '🔥' },
          { id: 2, name: 'Design & Conforto', color: '#F59E0B', symbol: '⭐' },
          { id: 3, name: 'Conectividade Digital', color: '#3B82F6', symbol: '⚡' },
        ];
        return (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Os 4 Botões da Sequência Luminosa (Genius)
              </span>
              <p className="text-[11px] text-slate-500">
                Personalize os nomes, cores e símbolos dos 4 pilares iluminados.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {pads.map((pad, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs">
                  <div className="w-14">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Cor</label>
                    <input
                      type="color"
                      value={pad.color}
                      onChange={(e) => {
                        const copy = [...pads];
                        copy[idx].color = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="w-16">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Símbolo</label>
                    <input
                      type="text"
                      value={pad.symbol}
                      onChange={(e) => {
                        const copy = [...pads];
                        copy[idx].symbol = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full text-center py-1.5 bg-white border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome do Pilar #{idx + 1}</label>
                    <input
                      type="text"
                      value={pad.name}
                      onChange={(e) => {
                        const copy = [...pads];
                        copy[idx].name = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 18. MAPA DE EPI
      case 'map_epi': {
        const sectors = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Setores e EPIs Obrigatórios ({sectors.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Cadastre as áreas operacionais e os equipamentos de proteção correspondentes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([
                    ...sectors,
                    { id: `sec-${Date.now()}`, sectorName: 'Novo Setor', requiredEpi: 'EPI Necessário', epiEmoji: '🛡️', color: '#EF4444' },
                  ]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Setor</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {sectors.map((sec: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs flex-wrap">
                  <div className="w-14">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Emoji</label>
                    <input
                      type="text"
                      value={sec.epiEmoji || '🛡️'}
                      onChange={(e) => {
                        const copy = [...sectors];
                        copy[idx].epiEmoji = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full text-center py-1.5 bg-white border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome do Setor / Área</label>
                    <input
                      type="text"
                      value={sec.sectorName || ''}
                      onChange={(e) => {
                        const copy = [...sectors];
                        copy[idx].sectorName = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">EPI Obrigatório</label>
                    <input
                      type="text"
                      value={sec.requiredEpi || ''}
                      onChange={(e) => {
                        const copy = [...sectors];
                        copy[idx].requiredEpi = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(sectors.filter((_: any, i: number) => i !== idx));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-3 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 19. DEFAULT GENÉRICO
      default: {
        const items = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Itens Cadastrados ({items.length})
                </span>
                <p className="text-[11px] text-slate-500">
                  Edite os itens cadastrados deste desafio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([...items, { name: 'Novo Item', points: 100, symbol: '⭐' }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs flex-wrap">
                  <div className="w-20">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Símbolo</label>
                    <input
                      type="text"
                      value={item.symbol || ''}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].symbol = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full text-center py-1.5 bg-white border border-slate-300 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome / Rótulo</label>
                    <input
                      type="text"
                      value={item.name || item.label || ''}
                      onChange={(e) => {
                        const copy = [...items];
                        if ('name' in copy[idx]) copy[idx].name = e.target.value;
                        else copy[idx].label = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Pontos</label>
                    <input
                      type="number"
                      value={item.points || item.score || 100}
                      onChange={(e) => {
                        const copy = [...items];
                        if ('points' in copy[idx]) copy[idx].points = Number(e.target.value);
                        else copy[idx].score = Number(e.target.value);
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-red-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(items.filter((_: any, i: number) => i !== idx));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl text-slate-800">
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                Alimentar Conteúdo
              </span>
              <h3 className="text-xl font-black text-slate-900">{game.name}</h3>
              {currentCount > 0 && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {currentCount} {currentCount === 1 ? 'registro' : 'registros'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{meta?.description || game.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 active:scale-95 text-slate-600 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Modality Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('form');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'form'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Formulário Manual {currentCount > 0 ? `(${currentCount})` : ''}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('csv');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'csv'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Upload de CSV</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('ai');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'ai'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-pink-600" />
            <span>3. Gerar com IA (Gemini)</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SEÇÃO DE TEMPO CONFIGURÁVEL (DOIS CAMPOS INDEPENDENTES: RESPOSTA E DESAFIO INTEIRO) */}
          <div className="space-y-3">
            {/* 1. TEMPO PARA RESPONDER (POR PERGUNTA / RODADA) */}
            <div className="rounded-3xl border-2 border-amber-300/90 bg-amber-50/60 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-700" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-amber-950 tracking-wide">
                    Tempo para Responder
                  </h4>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    timeLimit === 0 ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-amber-200 text-amber-950'
                  }`}>
                    {timeLimit === 0 ? 'Sem Tempo' : `${timeLimit} Segundos`}
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed max-w-xl">
                  {isQuestionGame 
                    ? 'Defina o tempo por pergunta ou clique em "Sem Tempo" para responder com calma sem cronômetro.' 
                    : 'Defina o tempo por ação/rodada ou clique em "Sem Tempo" para jogar sem cronômetro.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTimeLimit(defaultTime);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    timeLimit === defaultTime && timeLimit > 0
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  Padrão ({defaultTime}s)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTimeLimit(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    timeLimit === 0
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200'
                  }`}
                >
                  <span>♾️ Sem Tempo</span>
                </button>

                <div className="flex items-center gap-1">
                  {[10, 15, 20, 30].filter(t => t !== defaultTime).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setTimeLimit(t);
                      }}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        timeLimit === t
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-10 text-center font-black text-sm text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">seg</span>
                </div>
              </div>
            </div>

            {/* 2. TEMPO DE DURAÇÃO DO DESAFIO INTEIRO (JOGO COMPLETO) */}
            <div className="rounded-3xl border-2 border-indigo-200 bg-indigo-50/40 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-800 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-indigo-700" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-indigo-950 tracking-wide">
                    Tempo do Desafio Inteiro
                  </h4>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    totalTimeLimit === 0 ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-indigo-200 text-indigo-950'
                  }`}>
                    {totalTimeLimit === 0 ? 'Sem Tempo' : `${totalTimeLimit} Segundos`}
                  </span>
                </div>
                <p className="text-xs text-indigo-900/80 leading-relaxed max-w-xl">
                  Defina o tempo total da partida inteira no totem ou clique em "Sem Tempo" para jogar a sessão inteira sem cronômetro.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                {(() => {
                  const defaultTotal = isQuestionGame ? 60 : (defaultTime ? defaultTime * 2 : 60);
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setTotalTimeLimit(defaultTotal);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                          totalTimeLimit === defaultTotal && totalTimeLimit > 0
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300'
                        }`}
                      >
                        Padrão ({defaultTotal}s)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setTotalTimeLimit(0);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          totalTimeLimit === 0
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200'
                        }`}
                      >
                        <span>♾️ Sem Tempo</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {[30, 45, 60, 90, 120].filter(t => t !== defaultTotal).map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setTotalTimeLimit(t);
                            }}
                            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                              totalTimeLimit === t
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {t}s
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs">
                        <input
                          type="number"
                          min={0}
                          max={600}
                          value={totalTimeLimit}
                          onChange={(e) => setTotalTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-10 text-center font-black text-sm text-slate-900 bg-transparent focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">seg</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* TAB 1: CSV */}
          {activeTab === 'csv' && (
            <div className="space-y-5">
              {currentCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Este jogo já contém <strong>{currentCount} itens</strong> cadastrados. Ao subir um novo arquivo CSV, os registros serão <strong>acrescentados</strong> à lista existente!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold hover:bg-emerald-100 text-[11px] whitespace-nowrap ml-2"
                  >
                    Ver Formulário
                  </button>
                </div>
              )}

              {/* Columns Table Guide */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Formato Obrigatório das Colunas do CSV:
                  </span>

                  <button
                    type="button"
                    onClick={() => downloadSampleCsv(game.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 transition-all border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-red-600" />
                    <span>Baixar Modelo CSV</span>
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Nome da Coluna</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5">Exemplo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {meta?.csvColumns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-red-600 font-bold">{col.name}</td>
                          <td className="p-2.5 text-slate-700 font-sans">{col.description}</td>
                          <td className="p-2.5 text-slate-500">{col.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Mode Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Modo de Importação do CSV:
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Escolha se o CSV deve substituir os registros atuais ou somar à lista existente.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCsvImportMode('replace');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      csvImportMode === 'replace'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Substituir Tudo (Recomendado)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCsvImportMode('append');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      csvImportMode === 'append'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Acrescentar ao Existente
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:border-red-500 transition-colors flex flex-col items-center justify-center">
                <FileText className="w-10 h-10 text-red-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">Selecione o arquivo CSV do seu computador</h4>
                <p className="text-xs text-slate-500 mb-4">
                  O arquivo deve conter o cabeçalho idêntico à tabela acima.
                </p>

                <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs uppercase tracking-wide transition-all shadow-xs">
                  <span>Escolher Arquivo CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL FORM */}
          {activeTab === 'form' && renderManualForm()}

          {/* TAB 3: GEMINI AI GENERATOR */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {currentCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>
                      Este jogo já possui <strong>{currentCount} itens</strong>. O conteúdo gerado pela IA será <strong>acrescentado</strong> aos itens existentes!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1 bg-white border border-purple-300 rounded-lg text-purple-800 font-bold hover:bg-purple-100 text-[11px] whitespace-nowrap ml-2"
                  >
                    Ver Formulário
                  </button>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-slate-50 border border-pink-200">
                <div className="flex items-center gap-2 text-pink-700 font-black text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Gerador Criativo com Inteligência Artificial (Google Gemini)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A IA analisa o nome da sua campanha, a marca do cliente e o tema visual para produzir perguntas, prêmios, itens de memória e desafios sob medida para este jogo!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="block font-bold text-slate-800 uppercase">Contexto da Campanha Reconhecido:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>Marca:</strong> {campaignContext.clientName}</div>
                  <div><strong>Campanha:</strong> {campaignContext.campaignName}</div>
                  <div className="col-span-2 truncate"><strong>Tema:</strong> {campaignContext.themeName}</div>
                </div>
              </div>

              {/* Quantidade de Conteúdos / Perguntas */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                      Quantidade de Conteúdos a Gerar
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {game.id === 'quiz' || game.id === 'speed_trivia'
                        ? 'Quantas perguntas você quer que a IA elabore?'
                        : game.id === 'truefalse'
                        ? 'Quantas afirmações de verdadeiro ou falso criar?'
                        : game.id === 'wheel'
                        ? 'Quantas opções/prêmios na roleta?'
                        : game.id === 'hangman'
                        ? 'Quantas palavras secretas da forca gerar?'
                        : 'Quantos itens ou desafios temáticos produzir?'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setAiItemCount((prev) => Math.max(3, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={3}
                      max={50}
                      value={aiItemCount}
                      onChange={(e) => setAiItemCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                      className="w-16 py-1 px-2 text-center font-black text-slate-900 bg-white border-2 border-pink-400 rounded-lg shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAiItemCount((prev) => Math.min(50, prev + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-xs"
                    >
                      +
                    </button>
                    <span className="text-xs font-bold text-slate-600">
                      {game.id === 'quiz' || game.id === 'speed_trivia' ? 'perguntas' : 'itens'}
                    </span>
                  </div>
                </div>

                {/* Quick Presets Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Atalhos rápidos:</span>
                  {[5, 10, 15, 20, 25].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAiItemCount(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                        aiItemCount === preset
                          ? 'bg-pink-600 text-white shadow-sm scale-105'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      {preset} {game.id === 'quiz' || game.id === 'speed_trivia' ? 'perguntas' : 'itens'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Instruções Adicionais para a IA (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Foque na saúde digestiva, prevenção, hábitos saudáveis e bem-estar..."
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Sparkles className={`w-5 h-5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Gerando Conteúdo com Gemini...' : 'Gerar e Acrescentar Conteúdo com Gemini AI'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {currentCount > 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{currentCount} {currentCount === 1 ? 'item pronto' : 'itens prontos'} para ser salvo</span>
              </span>
            ) : (
              <span>Nenhum conteúdo definido</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={currentCount === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wide shadow-md active:scale-95 disabled:opacity-50"
            >
              Aplicar Conteúdo ao Jogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
