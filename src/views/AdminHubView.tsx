import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  ExternalLink, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Trophy, 
  Play, 
  Shield, 
  Key, 
  Layers, 
  Store, 
  Filter, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Globe, 
  Palette,
  Phone,
  Gamepad2,
  Share2
} from 'lucide-react';
import { Campaign, GameDefinition, Reseller } from '../types';
import { supabase, TABLES } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { GAMES_CATALOG, GAME_CATEGORIES } from '../lib/gamesCatalog';
import { CampaignFormModal } from '../components/CampaignFormModal';
import { ResellerFormModal } from '../components/ResellerFormModal';
import { SettingsModal } from '../components/SettingsModal';
import { GamePreviewModal } from '../games/GamePreviewModal';
import { sound } from '../lib/audio';
import { resellersService } from '../lib/resellersService';

interface AdminHubViewProps {
  onNavigateToCampaign: (slug: string) => void;
  onNavigateToPortfolio?: (slug: string) => void;
}

export const AdminHubView: React.FC<AdminHubViewProps> = ({ 
  onNavigateToCampaign,
  onNavigateToPortfolio,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('24658011');
  const [authError, setAuthError] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'campaigns' | 'resellers'>('campaigns');

  // Campaigns & Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [resellerFilter, setResellerFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showCreateResellerModal, setShowCreateResellerModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [previewGame, setPreviewGame] = useState<GameDefinition | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedResellerSlug, setCopiedResellerSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Check saved session or fetch master password from Supabase
  useEffect(() => {
    const fetchMasterPassword = async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.SETTINGS)
          .select('value')
          .eq('key', 'admin_password')
          .single();

        if (!error && data?.value) {
          setMasterPassword(data.value);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchMasterPassword();
    const sessionAuth = sessionStorage.getItem('hubtotens_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch campaigns and resellers
  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, resList] = await Promise.all([
        supabase
          .from(TABLES.CAMPAIGNS)
          .select('*')
          .order('created_at', { ascending: false }),
        resellersService.getResellers(),
      ]);

      if (!campRes.error && campRes.data) {
        const enrichedCampaigns = (campRes.data as Campaign[]).map((c) => ({
          ...c,
          reseller_id: c.reseller_id || c.games_config?.reseller_id,
          reseller_name: c.reseller_name || c.games_config?.reseller_name,
        }));
        setCampaigns(enrichedCampaigns);
      }
      setResellers(resList);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === masterPassword) {
      sound.playSuccess();
      setIsAuthenticated(true);
      sessionStorage.setItem('hubtotens_auth', 'true');
      setAuthError(false);
    } else {
      sound.playError();
      setAuthError(true);
    }
  };

  const handleSaveCampaign = async (data: Partial<Campaign>) => {
    // Strip unknown root table columns (reseller_id, reseller_name) so PostgreSQL doesn't reject with 400
    const { reseller_id, reseller_name, ...tablePayload } = data;
    const finalPayload = {
      ...tablePayload,
      games_config: {
        ...(tablePayload.games_config || {}),
        ...(reseller_id ? { reseller_id } : {}),
        ...(reseller_name ? { reseller_name } : {}),
      },
    };

    if (editingCampaign) {
      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .update({
          ...finalPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCampaign.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .insert({
          ...finalPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    setEditingCampaign(null);
    setShowCreateModal(false);
    fetchData();
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a campanha "${name}"?`)) return;
    sound.playClick();
    try {
      await supabase.from(TABLES.CAMPAIGNS).delete().eq('id', id);
      fetchData();
    } catch (err) {
      console.error(err);
      sound.playError();
    }
  };

  const handleDeleteReseller = async (id: string, name: string) => {
    if (!window.confirm(`Deseja remover o revendedor "${name}" e seu portfólio?`)) return;
    sound.playClick();
    try {
      await resellersService.deleteReseller(id);
      sound.playSuccess();
      fetchData();
    } catch (err) {
      console.error(err);
      sound.playError();
    }
  };

  const copyTotemLink = (slug: string) => {
    sound.playClick();
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const copyPortfolioLink = (slug: string) => {
    sound.playClick();
    const url = `${window.location.origin}/portfolio/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedResellerSlug(slug);
    setTimeout(() => setCopiedResellerSlug(null), 2000);
  };

  const filteredCampaigns = campaigns.filter((camp) => {
    if (resellerFilter === 'all') return true;
    if (resellerFilter === 'direct') return !camp.reseller_id && !camp.reseller_name;
    return camp.reseller_id === resellerFilter || camp.reseller_name === resellerFilter;
  });

  // 1. Password Protection Gate (LIGHT THEME)
  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-red-50/50 text-slate-900 p-4 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-red-200/40 blur-3xl pointer-events-none -top-24 -left-24" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-200/40 blur-3xl pointer-events-none -bottom-24 -right-24" />

        <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/25 mb-5">
            <Key className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
            Hub de Jogos para Totens
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Insira a senha de acesso para gerenciar as campanhas, revendedores e catálogo de jogos.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <input
                type="password"
                required
                placeholder="Senha de acesso..."
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setAuthError(false);
                }}
                className={`w-full px-4 py-3.5 bg-slate-50 border-2 rounded-xl text-center text-slate-900 placeholder-slate-400 font-mono text-lg tracking-widest focus:outline-none transition-colors ${
                  authError ? 'border-rose-500 shadow-rose-200' : 'border-slate-200 focus:border-red-500 focus:bg-white'
                }`}
              />
              {authError && (
                <span className="text-xs font-bold text-rose-600 mt-2 block">
                  Senha incorreta! Tente novamente.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/25 active:scale-95 transition-all"
            >
              Acessar Painel Principal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Main Admin Hub Dashboard (LIGHT THEME)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 px-6 py-4 bg-white/95 border-b border-slate-200 backdrop-blur-md flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-md shadow-red-500/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">Hub de Jogos para Totens</h1>
            <span className="text-[11px] text-slate-500 font-medium">Painel Geral de Campanhas, Revendedores &amp; Jogos</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 transition-all border border-slate-200"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Configurações &amp; Senha</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setEditingReseller(null);
              setShowCreateResellerModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 font-bold text-xs uppercase tracking-wide transition-all border border-blue-200"
          >
            <Store className="w-4 h-4 text-blue-600" />
            <span>Novo Revendedor</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setEditingCampaign(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wide shadow-md shadow-red-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        {/* Banner with Stats and Quick Start */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-red-50/40 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Totens &amp; Portfólios Conectados</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Gerenciador de Campanhas &amp; Revendedores
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Crie ativações para totens touch screen e cadastre revendedores com seus próprios portfólios personalizados, logotipo e catálogo de jogos exclusivo.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-center px-3">
              <span className="text-2xl font-black text-slate-900 font-mono">{campaigns.length}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Campanhas</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-2xl font-black text-blue-600 font-mono">{resellers.length}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Revendedores</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-2xl font-black text-red-600 font-mono">{GAMES_CATALOG.length}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Jogos</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('campaigns');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-red-600" />
              <span>Campanhas de Totem ({campaigns.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('resellers');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'resellers'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-blue-600" />
              <span>Revendedores &amp; Portfólios ({resellers.length})</span>
            </button>
          </div>

          {activeTab === 'campaigns' && resellers.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Filtrar por:</span>
              <select
                value={resellerFilter}
                onChange={(e) => setResellerFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 shadow-2xs cursor-pointer"
              >
                <option value="all">Todos os Revendedores ({campaigns.length})</option>
                <option value="direct">Plataforma Direta (Sem Revendedor)</option>
                {resellers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.company_name} ({campaigns.filter((c) => c.reseller_id === r.id || c.reseller_name === r.company_name).length})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: CAMPAIGNS LIST */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-600" />
                <span>
                  {resellerFilter !== 'all' ? 'Campanhas Filtradas' : 'Todas as Campanhas Ativas'}
                </span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Clique em &quot;Abrir Totem&quot; para abrir a rota da campanha
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto mb-3" />
                <span>Carregando campanhas...</span>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl shadow-xs">
                <p className="text-slate-500 text-sm mb-4">Nenhuma campanha encontrada com o filtro selecionado.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs uppercase text-white shadow-sm"
                >
                  Criar Nova Campanha
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredCampaigns.map((camp) => {
                  const themeMeta = THEMES[camp.theme_id] || THEMES['honda-red'];
                  const isCopied = copiedSlug === camp.slug;

                  return (
                    <div
                      key={camp.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden group"
                    >
                      {/* Splash banner thumbnail watermark */}
                      {camp.splash_image_url && (
                        <div className="absolute top-0 right-0 w-36 h-full opacity-10 pointer-events-none">
                          <img
                            src={camp.splash_image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {camp.client_name}
                            </span>

                            {camp.reseller_name && (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <Store className="w-3 h-3 text-blue-600" />
                                <span>{camp.reseller_name}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {camp.ranking_enabled && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                <span>Ranking Ativo</span>
                              </span>
                            )}
                            <span
                              style={{ backgroundColor: themeMeta.primary }}
                              className="w-3.5 h-3.5 rounded-full shadow"
                              title={`Tema: ${themeMeta.name}`}
                            />
                          </div>
                        </div>

                        <h4 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                          {camp.name}
                        </h4>

                        <div className="flex items-center gap-2 mt-2 font-mono text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-fit max-w-full truncate">
                          <span className="text-slate-400">Link Totem:</span>
                          <span className="text-red-600 font-bold truncate">/{camp.slug}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span>🎮 {camp.selected_games?.length || 0} Jogos</span>
                          <span>•</span>
                          {camp.games_config?.custom_colors?.enabled ? (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                              <span
                                style={{ backgroundColor: camp.games_config.custom_colors.primary }}
                                className="w-2.5 h-2.5 rounded-full shadow-xs"
                              />
                              <span>Cores Próprias</span>
                            </span>
                          ) : (
                            <span>🎨 Tema {themeMeta.name}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyTotemLink(camp.slug)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all border border-slate-200"
                            title="Copiar Link da Campanha"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{isCopied ? 'Copiado!' : 'Copiar Link'}</span>
                          </button>

                          <button
                            onClick={() => {
                              sound.playClick();
                              setEditingCampaign(camp);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-200"
                            title="Editar Campanha"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200"
                            title="Excluir Campanha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            sound.playClick();
                            onNavigateToCampaign(camp.slug);
                          }}
                          style={{ backgroundColor: themeMeta.primary }}
                          className="px-5 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 transition-all hover:brightness-105"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Abrir Totem</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESELLERS & PORTFOLIOS */}
        {activeTab === 'resellers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  <span>Revendedores Credenciados &amp; Portfólios</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cada revendedor possui uma landing page de portfólio exclusiva para divulgar os jogos aos seus clientes
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setEditingReseller(null);
                  setShowCreateResellerModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Revendedor</span>
              </button>
            </div>

            {resellers.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl shadow-xs">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-bold text-sm mb-1">Nenhum revendedor cadastrado ainda</p>
                <p className="text-slate-400 text-xs mb-4">
                  Cadastre parceiros para que eles tenham um portfólio próprio com jogos e contatos.
                </p>
                <button
                  onClick={() => setShowCreateResellerModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase text-white shadow-sm"
                >
                  Cadastrar Primeiro Revendedor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resellers.map((r) => {
                  const linkedCount = campaigns.filter(
                    (c) => c.reseller_id === r.id || c.reseller_name === r.company_name
                  ).length;
                  const isCopied = copiedResellerSlug === r.slug;

                  return (
                    <div
                      key={r.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                      {/* Top Brand Stripe */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: r.primary_color || '#2563EB' }}
                      />

                      <div>
                        {/* Header with logo & company */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3.5">
                            {r.logo_url ? (
                              <img
                                src={r.logo_url}
                                alt={r.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xs"
                                style={{ backgroundColor: r.primary_color || '#2563EB' }}
                              >
                                {r.name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="text-xl font-black text-slate-900 leading-tight">
                                {r.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {r.company_name || 'Revendedor Credenciado'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full shadow-xs"
                              style={{ backgroundColor: r.primary_color || '#2563EB' }}
                              title={`Cor Primária: ${r.primary_color}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full shadow-xs"
                              style={{ backgroundColor: r.secondary_color || '#1D4ED8' }}
                              title={`Cor Secundária: ${r.secondary_color}`}
                            />
                          </div>
                        </div>

                        {/* Portfolio link snippet */}
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-fit max-w-full truncate">
                          <span className="text-slate-400">Portfólio:</span>
                          <span className="text-blue-600 font-bold truncate">/portfolio/{r.slug}</span>
                        </div>

                        {/* Description */}
                        {r.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                            {r.description}
                          </p>
                        )}

                        {/* Badges Info */}
                        <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>{linkedCount} Campanhas Vinculadas</span>
                          </span>

                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center gap-1.5">
                            <Gamepad2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{r.enabled_games?.length || GAMES_CATALOG.length} Jogos no Catálogo</span>
                          </span>

                          {r.city_state && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{r.city_state}</span>
                            </span>
                          )}

                          {r.contact_whatsapp && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyPortfolioLink(r.slug)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all border border-slate-200"
                            title="Copiar Link do Portfólio"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{isCopied ? 'Copiado!' : 'Copiar Link'}</span>
                          </button>

                          <button
                            onClick={() => {
                              sound.playClick();
                              setEditingReseller(r);
                              setShowCreateResellerModal(true);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-200"
                            title="Editar Revendedor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteReseller(r.id, r.name)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200"
                            title="Excluir Revendedor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            sound.playClick();
                            if (onNavigateToPortfolio) {
                              onNavigateToPortfolio(r.slug);
                            } else {
                              window.location.href = `/portfolio/${r.slug}`;
                            }
                          }}
                          className="px-5 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 transition-all hover:brightness-105"
                          style={{ backgroundColor: r.primary_color || '#2563EB' }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Abrir Portfólio</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Interactive Games Catalog Section with Quick Previews */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600 fill-current" />
                <span>Catálogo Geral de {GAMES_CATALOG.length} Jogos para Totens</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Navegue pelas categorias e clique em qualquer jogo para testar a jogabilidade no emulador
              </p>
            </div>
            <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto">
              {GAMES_CATALOG.length} Desafios Disponíveis
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'all' ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {GAMES_CATALOG.length}
              </span>
            </button>

            {GAME_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = GAMES_CATALOG.filter((g) => g.categoryId === cat.id || g.category === cat.name).length;
              if (count === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtered Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {GAMES_CATALOG.filter(
              (g) => selectedCategory === 'all' || g.categoryId === selectedCategory || g.category === selectedCategory
            ).map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  sound.playClick();
                  setPreviewGame(game);
                }}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-400 hover:shadow-md cursor-pointer transition-all active:scale-95 group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {game.category}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-2 group-hover:text-red-600 transition-colors">
                    {game.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {game.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-red-600 font-bold text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">⏱️ {game.estimatedTime}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Jogar</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {(showCreateModal || editingCampaign) && (
        <CampaignFormModal
          key={editingCampaign ? editingCampaign.id : 'new-campaign'}
          campaignToEdit={editingCampaign}
          existingCampaigns={campaigns}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCampaign(null);
          }}
          onSave={handleSaveCampaign}
          onCampaignUpdated={(campaignId, updatedGamesConfig) => {
            setCampaigns((prev) =>
              prev.map((c) =>
                c.id === campaignId ? { ...c, games_config: updatedGamesConfig } : c
              )
            );
            setEditingCampaign((prev) =>
              prev && prev.id === campaignId
                ? { ...prev, games_config: updatedGamesConfig }
                : prev
            );
          }}
        />
      )}

      {/* Reseller Modal */}
      {(showCreateResellerModal || editingReseller) && (
        <ResellerFormModal
          resellerToEdit={editingReseller}
          existingResellers={resellers}
          onClose={() => {
            setShowCreateResellerModal(false);
            setEditingReseller(null);
          }}
          onSaved={() => {
            fetchData();
          }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          currentPassword={masterPassword}
          onClose={() => setShowSettingsModal(false)}
          onPasswordUpdated={(newP) => setMasterPassword(newP)}
        />
      )}

      {previewGame && (
        <GamePreviewModal
          game={previewGame}
          onClose={() => setPreviewGame(null)}
        />
      )}
    </div>
  );
};
