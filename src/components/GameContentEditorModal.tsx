import React, { useState } from 'react';
import { X, FileText, Download, Upload, Sparkles, Plus, Trash2, Check, AlertCircle, Bot, Sliders } from 'lucide-react';
import { GameDefinition } from '../types';
import { GAME_CONTENT_SCHEMAS } from '../types/gameContent';
import { parseGameCSV, downloadSampleCsv } from '../lib/csvParser';
import { generateGameContentWithAI, CampaignAIContext } from '../lib/gemini';
import { sound } from '../lib/audio';

interface GameContentEditorModalProps {
  game: GameDefinition;
  currentContent: any;
  campaignContext: CampaignAIContext;
  onClose: () => void;
  onSave: (gameId: string, updatedContent: any) => void;
}

export const GameContentEditorModal: React.FC<GameContentEditorModalProps> = ({
  game,
  currentContent,
  campaignContext,
  onClose,
  onSave,
}) => {
  const meta = GAME_CONTENT_SCHEMAS[game.id];
  const [activeTab, setActiveTab] = useState<'csv' | 'form' | 'ai'>('csv');
  const [content, setContent] = useState<any>(currentContent || null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');

  // Handle CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGameCSV(game.id, text);
        setContent(parsed);
        sound.playSuccess();
        setSuccessMsg(`CSV importado com sucesso! (${Array.isArray(parsed) ? parsed.length : 1} itens carregados)`);
        setErrorMsg('');
      } catch (err: any) {
        sound.playError();
        setErrorMsg(err.message || 'Erro ao processar o arquivo CSV.');
      }
    };
    reader.readAsText(file);
  };

  // Handle AI Generation
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setErrorMsg('');
    setSuccessMsg('');
    sound.playEngineRev();

    try {
      const generated = await generateGameContentWithAI(game.id, {
        ...campaignContext,
        userPrompt: aiCustomPrompt.trim() || undefined,
      });

      setContent(generated);
      sound.playSuccess();
      setSuccessMsg('Conteúdo temático gerado com Inteligência Artificial (Gemini)!');
      setActiveTab('form');
    } catch (err: any) {
      console.error(err);
      sound.playError();
      setErrorMsg(err.message || 'Falha ao conectar com o Google Gemini.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    if (!content) {
      alert('Nenhum conteúdo configurado ainda!');
      return;
    }
    sound.playSuccess();
    onSave(game.id, content);
    onClose();
  };

  // Helper to render dynamic form controls based on game type (LIGHT THEME)
  const renderManualForm = () => {
    switch (game.id) {
      case 'wheel': {
        const items = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Fatias / Prêmios da Roleta ({items.length})</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([...items, { label: 'Novo Prêmio', score: 300, color: '#DC2626' }]);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Fatia</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Nome do Prêmio</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].label = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Pontos</label>
                    <input
                      type="number"
                      value={item.score}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].score = Number(e.target.value);
                        setContent(copy);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-red-600 font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Cor</label>
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].color = e.target.value;
                        setContent(copy);
                      }}
                      className="w-full h-8 bg-transparent border-0 cursor-pointer rounded"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContent(items.filter((_: any, i: number) => i !== idx));
                    }}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 mt-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'quiz': {
        const questions = Array.isArray(content) ? content : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Perguntas do Quiz ({questions.length})</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContent([
                    ...questions,
                    {
                      question: 'Nova Pergunta?',
                      options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
                      correct: 0,
                    },
                  ]);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Pergunta</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-red-600">Questão #{qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setContent(questions.filter((_: any, i: number) => i !== qIdx));
                      }}
                      className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.question}
                    placeholder="Texto da pergunta..."
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[qIdx].question = e.target.value;
                      setContent(copy);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                          q.correct === optIdx ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correct === optIdx}
                          onChange={() => {
                            const copy = [...questions];
                            copy[qIdx].correct = optIdx;
                            setContent(copy);
                          }}
                          className="text-emerald-600 focus:ring-0"
                          title="Marcar como alternativa correta"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const copy = [...questions];
                            copy[qIdx].options[optIdx] = e.target.value;
                            setContent(copy);
                          }}
                          className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-700">
              Dados do Jogo (JSON Editável)
            </span>
            <textarea
              rows={10}
              value={content ? JSON.stringify(content, null, 2) : ''}
              onChange={(e) => {
                try {
                  setContent(JSON.parse(e.target.value));
                  setErrorMsg('');
                } catch (err: any) {
                  setErrorMsg('JSON inválido.');
                }
              }}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                Alimentar Conteúdo
              </span>
              <h3 className="text-xl font-black text-slate-900">{game.name}</h3>
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
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
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
              setActiveTab('form');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'form'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Formulário Manual</span>
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

        {/* Modal Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: CSV UPLOAD */}
          {activeTab === 'csv' && (
            <div className="space-y-6">
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

              {/* Preview of loaded content */}
              {content && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[11px] font-bold text-emerald-700 mb-2">
                    ✓ Conteúdo Atualmente Carregado para este Jogo:
                  </span>
                  <pre className="text-[11px] text-slate-700 font-mono overflow-x-auto max-h-40 bg-white p-2 rounded-lg border border-slate-200">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL FORM */}
          {activeTab === 'form' && renderManualForm()}

          {/* TAB 3: GEMINI AI GENERATOR */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Instruções Adicionais para a IA (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Destaque a nova linha de carros híbridos e esportivos da Honda..."
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
                <span>{isGeneratingAI ? 'Gerando Conteúdo com Gemini...' : 'Gerar Conteúdo com Gemini AI'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {content ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Conteúdo pronto para ser salvo</span>
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
              disabled={!content}
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
