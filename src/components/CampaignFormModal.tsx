import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Image as ImageIcon, Sparkles, Trophy, Check, Layers, FileSpreadsheet, UploadCloud, Loader2, Database, CheckCircle2, Palette, Sun, Moon, RotateCcw, Shuffle, Clock, Gamepad2, LayoutGrid, Gem, Box, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, List, AlertTriangle, Store } from 'lucide-react';
import { Campaign, GameDefinition, ThemeId, CustomColorsConfig, GameLayoutId, GAME_LAYOUTS, Reseller, SplashButtonStyleId, SPLASH_BUTTON_STYLES } from '../types';
import { BackgroundEffectId, BACKGROUND_EFFECTS } from './BackgroundEffectOverlay';
import { THEME_LIST, THEMES } from '../lib/themes';
import { GAMES_CATALOG, GAME_CATEGORIES } from '../lib/gamesCatalog';
import { GamePreviewModal } from '../games/GamePreviewModal';
import { GameContentEditorModal, getContentCount } from './GameContentEditorModal';
import { sound } from '../lib/audio';
import { supabase, TABLES, BUCKETS } from '../lib/supabase';
import { resellersService } from '../lib/resellersService';
import { QUICK_HUE_PRESETS, generateLayoutPalette, getDefaultHueForLayout } from '../lib/colorHarmony';

interface CampaignFormModalProps {
  campaignToEdit?: Campaign | null;
  onClose: () => void;
  onSave: (campaignData: Partial<Campaign>) => Promise<void>;
  onCampaignUpdated?: (campaignId: string, gamesConfig: Record<string, any>) => void;
  existingCampaigns?: Campaign[];
}

const SPLASH_PRESETS = [
  { label: 'Automotivo Showroom', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Pista & Velocidade', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Cyber Neon Lights', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Festival & Evento', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Eco & Sustentável', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1920&q=80' },
];

const COLOR_PRESETS = [
  { name: 'Honda Racing', primary: '#DC2626', secondary: '#991B1B', glow: '#DC2626' },
  { name: 'Azul Elétrico', primary: '#2563EB', secondary: '#1D4ED8', glow: '#38BDF8' },
  { name: 'Verde Eco', primary: '#059669', secondary: '#047857', glow: '#10B981' },
  { name: 'Cyber Neon', primary: '#9333EA', secondary: '#7E22CE', glow: '#C084FC' },
  { name: 'Dourado VIP', primary: '#D97706', secondary: '#B45309', glow: '#FBBF24' },
  { name: 'Laranja Solar', primary: '#EA580C', secondary: '#C2410C', glow: '#FB923C' },
  { name: 'Rosa Vibrante', primary: '#DB2777', secondary: '#BE185D', glow: '#F472B6' },
  { name: 'Ciano High-Tech', primary: '#0891B2', secondary: '#0E7490', glow: '#22D3EE' },
];

export const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  campaignToEdit,
  onClose,
  onSave,
  onCampaignUpdated,
  existingCampaigns = [],
}) => {
  const [name, setName] = useState(campaignToEdit?.name || '');
  const [slug, setSlug] = useState(campaignToEdit?.slug || '');
  const [clientName, setClientName] = useState(campaignToEdit?.client_name || '');
  const [description, setDescription] = useState(campaignToEdit?.description || '');
  const [splashUrl, setSplashUrl] = useState(
    campaignToEdit?.splash_image_url || SPLASH_PRESETS[0].url
  );
  const [themeId, setThemeId] = useState<ThemeId>(campaignToEdit?.theme_id || 'honda-red');
  const [selectedGames, setSelectedGames] = useState<string[]>(
    campaignToEdit?.selected_games || []
  );
  const [gamesConfig, setGamesConfig] = useState<Record<string, any>>(() => {
    const raw = campaignToEdit?.games_config;
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return { ...raw };
  });
  const initialThemeMode: 'light' | 'dark' = 
    campaignToEdit?.theme_mode || 
    campaignToEdit?.games_config?.theme_mode || 
    (campaignToEdit?.games_config?.custom_colors?.bgType === 'light' ? 'light' : 'dark') || 
    'dark';
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(initialThemeMode);
  // Per-game orderMode and questionsCount are configured in each game's content editor modal
  const initialLayout: GameLayoutId = campaignToEdit?.games_config?.game_layout || 'neon_arcade';
  const [gameLayout, setGameLayout] = useState<GameLayoutId>(initialLayout);

  const initialLayoutHue: number =
    campaignToEdit?.games_config?.layout_color_hue !== undefined
      ? Number(campaignToEdit.games_config.layout_color_hue)
      : getDefaultHueForLayout(initialLayout);
  const [layoutColorHue, setLayoutColorHue] = useState<number>(initialLayoutHue);

  const activeLayoutPalette = useMemo(() => {
    return generateLayoutPalette(layoutColorHue, themeMode === 'light');
  }, [layoutColorHue, themeMode]);

  const [gameCategoryFilter, setGameCategoryFilter] = useState<string>('all');
  const [descriptionAlign, setDescriptionAlign] = useState<'left' | 'center' | 'right' | 'justify'>(
    campaignToEdit?.games_config?.description_align || 'left'
  );
  const [descriptionSize, setDescriptionSize] = useState<'sm' | 'md' | 'lg'>(
    campaignToEdit?.games_config?.description_size || 'md'
  );
  const [splashButtonStyle, setSplashButtonStyle] = useState<SplashButtonStyleId>(
    campaignToEdit?.games_config?.splash_button_style || 'default'
  );
  const [splashBgEffect, setSplashBgEffect] = useState<BackgroundEffectId>(
    campaignToEdit?.games_config?.splash_bg_effect || 'none'
  );
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [selectedResellerId, setSelectedResellerId] = useState<string>(
    campaignToEdit?.reseller_id || campaignToEdit?.games_config?.reseller_id || ''
  );

  useEffect(() => {
    resellersService.getResellers().then(setResellers).catch(console.error);
  }, []);

  const isNameDuplicate = useMemo(() => {
    const clean = name.trim().toLowerCase();
    if (!clean) return false;
    return (existingCampaigns || []).some(
      (c) => c.id !== campaignToEdit?.id && c.name.trim().toLowerCase() === clean
    );
  }, [name, existingCampaigns, campaignToEdit]);

  const initialCustomColors: CustomColorsConfig = campaignToEdit?.games_config?.custom_colors || {
    enabled: false,
    primary: THEMES[campaignToEdit?.theme_id || 'honda-red']?.primary || '#DC2626',
    secondary: THEMES[campaignToEdit?.theme_id || 'honda-red']?.secondary || '#991B1B',
    accent: THEMES[campaignToEdit?.theme_id || 'honda-red']?.accent || '#F59E0B',
    glowColor: THEMES[campaignToEdit?.theme_id || 'honda-red']?.glowColor || '#DC2626',
    bgType: initialThemeMode === 'light' ? 'light' : 'dark',
    bgFrom: '#0F172A',
    bgTo: '#020617',
  };
  const [customColors, setCustomColors] = useState<CustomColorsConfig>(initialCustomColors);
  const [rankingEnabled, setRankingEnabled] = useState(
    campaignToEdit ? campaignToEdit.ranking_enabled : false
  );
  const [previewingGame, setPreviewingGame] = useState<GameDefinition | null>(null);
  const [editingContentGame, setEditingContentGame] = useState<GameDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Upload image directly to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 10MB.');
      return;
    }

    setUploadingImage(true);
    setUploadSuccess(false);
    sound.playClick();
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const safeName = slug ? slug.trim().toLowerCase() : 'splash';
      const fileName = `${safeName}_${Date.now()}.${fileExt}`;
      const filePath = `splashes/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKETS.SPLASHES)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKETS.SPLASHES)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setSplashUrl(publicUrlData.publicUrl);
        setUploadSuccess(true);
        sound.playSuccess();
      }
    } catch (err: any) {
      console.error('Error uploading splash to Supabase:', err);
      sound.playError();
      alert('Erro ao enviar imagem: ' + (err.message || 'Tente novamente.'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Mirror external or preset URL to Supabase Storage
  const handleMirrorToSupabase = async () => {
    if (!splashUrl || splashUrl.includes('supabase.co')) return;
    setUploadingImage(true);
    sound.playClick();
    try {
      const res = await fetch(splashUrl);
      const blob = await res.blob();
      const safeName = slug ? slug.trim().toLowerCase() : 'splash';
      const fileName = `${safeName}_preset_${Date.now()}.jpg`;
      const filePath = `splashes/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKETS.SPLASHES)
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKETS.SPLASHES)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setSplashUrl(publicUrlData.publicUrl);
        setUploadSuccess(true);
        sound.playSuccess();
      }
    } catch (err: any) {
      console.error('Error mirroring to Supabase:', err);
      sound.playError();
      alert('Não foi possível transferir imagem externa (bloqueio CORS da origem). Faça o upload do arquivo local diretamente!');
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto-generate slug from name if new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!campaignToEdit) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const toggleGame = (id: string) => {
    sound.playClick();
    setSelectedGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameDuplicate) {
      alert('Já existe uma campanha cadastrada com este mesmo nome! Escolha um nome exclusivo.');
      return;
    }
    if (!name.trim() || !slug.trim()) return;
    if (selectedGames.length === 0) {
      alert('Selecione pelo menos 1 jogo para a campanha!');
      return;
    }

    setSaving(true);
    try {
      const chosenReseller = resellers.find((r) => r.id === selectedResellerId);
      const finalPalette = generateLayoutPalette(layoutColorHue, themeMode === 'light');
      await onSave({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        client_name: clientName.trim(),
        description: description.trim(),
        splash_image_url: splashUrl.trim(),
        theme_id: campaignToEdit?.theme_id || 'honda-red',
        selected_games: selectedGames,
        games_config: {
          ...gamesConfig,
          reseller_id: selectedResellerId || undefined,
          reseller_name: chosenReseller?.company_name || undefined,
          theme_mode: themeMode,
          order_mode: gamesConfig?.order_mode || 'random',
          game_layout: gameLayout,
          layout_color_hue: layoutColorHue,
          description_align: descriptionAlign,
          description_size: descriptionSize,
          splash_button_style: splashButtonStyle,
          splash_bg_effect: splashBgEffect,
          custom_colors: {
            enabled: true,
            primary: finalPalette.primary,
            secondary: finalPalette.secondary,
            accent: finalPalette.accent,
            glowColor: finalPalette.glowColor,
            bgType: themeMode === 'light' ? 'light' : 'dark',
            bgFrom: '#0F172A',
            bgTo: '#020617',
          },
        },
        ranking_enabled: rankingEnabled,
        active: true,
      });
      sound.playSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      sound.playError();
      alert('Erro ao salvar campanha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl text-slate-800">
          {/* Top Header */}
          <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                {campaignToEdit ? 'Editar Campanha de Totem' : 'Criar Nova Campanha de Totem'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure os dados da ativação, tema visual, imagem de splash e catálogo de jogos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 active:scale-95 text-slate-600 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>1. Dados da Campanha</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Nome da Campanha *
                    </label>
                    {isNameDuplicate && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600 animate-pulse" />
                        Nome já em uso!
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campanha Honda Festival 2026"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white text-sm font-semibold transition-colors ${
                      isNameDuplicate
                        ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20'
                        : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                  {isNameDuplicate && (
                    <div className="mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-amber-800 leading-tight">
                        Já existe uma campanha com este nome. Adicione um ano ou termo:
                      </p>
                      <button
                        type="button"
                        onClick={() => handleNameChange(`${name} ${new Date().getFullYear()}`)}
                        className="text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-2 py-1 rounded transition-colors whitespace-nowrap"
                      >
                        + Ano ({new Date().getFullYear()})
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cliente / Marca Promocional *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Honda Automóveis & Motos"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-blue-600" />
                    <span>Revendedor / Parceiro Responsável</span>
                  </label>
                  <select
                    value={selectedResellerId}
                    onChange={(e) => setSelectedResellerId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold cursor-pointer"
                  >
                    <option value="">Plataforma Direta (Sem Revendedor)</option>
                    {resellers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.company_name} {r.city_state ? `(${r.city_state})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ao associar um revendedor, esta campanha será exibida e agrupada no portfólio dele.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Slug da URL do Totem (Identificador Único) *
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 overflow-hidden focus-within:border-red-500 focus-within:bg-white">
                    <span className="px-3.5 py-3 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                      hub.totens.app/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="campanha-honda"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-4 py-3 bg-transparent text-red-600 font-mono text-sm font-bold focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Este será o link exclusivo acessado nos totens do evento.
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Descrição ou Regras da Ativação (Opcional)
                    </label>

                    {/* Simple Formatting Toolbar */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
                      {/* Alignment Options */}
                      <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setDescriptionAlign('left');
                          }}
                          className={`p-1.5 rounded-md transition-all ${
                            descriptionAlign === 'left' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Alinhar à Esquerda"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setDescriptionAlign('center');
                          }}
                          className={`p-1.5 rounded-md transition-all ${
                            descriptionAlign === 'center' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Centralizar Texto"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setDescriptionAlign('justify');
                          }}
                          className={`p-1.5 rounded-md transition-all ${
                            descriptionAlign === 'justify' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Justificar Texto"
                        >
                          <AlignJustify className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setDescriptionAlign('right');
                          }}
                          className={`p-1.5 rounded-md transition-all ${
                            descriptionAlign === 'right' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Alinhar à Direita"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-px h-4 bg-slate-300 mx-0.5" />

                      {/* Text Style Helpers */}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setDescription((prev) => prev ? `${prev}\n- ` : '- ');
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95"
                        title="Inserir item de lista com marcador (- item)"
                      >
                        <List className="w-3.5 h-3.5 text-red-600" />
                        <span>Lista (- )</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setDescription((prev) => prev ? `${prev} **Destaque** ` : '**Destaque** ');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 text-xs font-black shadow-2xs active:scale-95"
                        title="Inserir Negrito (**texto**)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setDescription((prev) => prev ? `${prev} *Itálico* ` : '*Itálico* ');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 text-xs font-black shadow-2xs active:scale-95"
                        title="Inserir Itálico (*texto*)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-px h-4 bg-slate-300 mx-0.5" />

                      {/* Font Size Selector */}
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <span className="text-slate-400 uppercase text-[9px] mr-0.5">Tam:</span>
                        {(['sm', 'md', 'lg'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setDescriptionSize(sz);
                            }}
                            className={`px-1.5 py-0.5 rounded-md transition-all ${
                              descriptionSize === sz
                                ? 'bg-red-600 text-white font-black'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {sz === 'sm' ? 'P' : sz === 'md' ? 'M' : 'G'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Ex: Ativação interativa de estande no Salão do Automóvel...&#10;- Regra 1: Toque na tela para iniciar&#10;- Regra 2: Cada acerto pontua no ranking"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      textAlign: descriptionAlign === 'justify' ? 'justify' : descriptionAlign,
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm font-medium leading-relaxed shadow-inner ${
                      descriptionAlign === 'center' ? 'text-center' : descriptionAlign === 'right' ? 'text-right' : descriptionAlign === 'justify' ? 'text-justify' : 'text-left'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500">
                    Dica: Quebras de linha e tópicos iniciados com hífen (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">- item</code>) serão preservados exatamente como formatado na tela de início do totem.
                  </p>
                </div>
              </div>
            </div>

            {/* Splash Image Section with Cloud Storage Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>2. Imagem de Splash Screen do Totem</span>
                </div>
                {splashUrl.includes('supabase.co') && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs animate-in fade-in">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hospedada na Nuvem</span>
                  </span>
                )}
              </div>

              {/* Upload Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-7 flex flex-col gap-3">
                  <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-red-300 hover:border-red-500 hover:bg-red-50/40 rounded-2xl cursor-pointer transition-all bg-slate-50 group">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center py-2 text-red-600">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs font-bold">Enviando imagem...</span>
                        <span className="text-[10px] text-slate-400 mt-1">Aguarde a geração da URL pública</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform mb-2 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Clique ou Arraste uma Imagem
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          Formatos: PNG, JPG, WebP (Máx: 10MB) • Armazenamento em Nuvem
                        </span>
                      </div>
                    )}
                  </label>

                  {uploadSuccess && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Upload concluído! A imagem foi salva na campanha.</span>
                    </div>
                  )}

                  {/* Manual URL input fallback & mirror button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      URL da Imagem de Splash:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        placeholder="https://..."
                        value={splashUrl}
                        onChange={(e) => setSplashUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-xs font-mono"
                      />
                      {!splashUrl.includes('supabase.co') && splashUrl && (
                        <button
                          type="button"
                          onClick={handleMirrorToSupabase}
                          disabled={uploadingImage}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          title="Fazer cópia e hospedar esta imagem na nuvem"
                        >
                          <Database className="w-3.5 h-3.5 text-amber-400" />
                          <span>Salvar na Nuvem</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Splash Preview Thumbnail */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full h-44 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-950 relative shadow-md group">
                    <img
                      src={splashUrl}
                      alt="Preview Splash"
                      className="w-full h-full object-cover brightness-[0.7]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SPLASH_PRESETS[0].url;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        {clientName || 'Cliente'}
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight truncate">
                        {name || 'Nome da Campanha'}
                      </h4>
                      <span className="text-[9px] text-slate-300 mt-0.5">
                        Preview no Totem Touch
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <span className="block text-xs text-slate-500 font-bold uppercase mb-2">
                  Ou escolha uma imagem preset de alta resolução:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {SPLASH_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSplashUrl(preset.url);
                        setUploadSuccess(false);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 group flex flex-col text-left ${
                        splashUrl === preset.url
                          ? 'border-red-600 scale-[1.03] shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <span className="text-[10px] font-bold text-slate-700 truncate mt-1 px-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Splash Screen Customization: Button Style & Background Overlay Animation */}
            <div className="space-y-6 p-6 rounded-3xl bg-slate-50 border-2 border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Personalização da Tela de Abertura (Splash Screen)</span>
                </div>
                <span className="text-xs text-slate-500">
                  Botão de início e partículas animadas em overlay
                </span>
              </div>

              {/* 1. Estilo do Botão "Toque para Jogar" */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Estilo do Botão "Toque para Jogar"</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    Estilo ativo: <strong className="text-slate-900">{SPLASH_BUTTON_STYLES.find(s => s.id === splashButtonStyle)?.name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SPLASH_BUTTON_STYLES.map((styleDef) => {
                    const isSelected = splashButtonStyle === styleDef.id;
                    return (
                      <button
                        key={styleDef.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSplashButtonStyle(styleDef.id);
                        }}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? 'border-red-600 bg-white shadow-md ring-2 ring-red-500/20'
                            : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{styleDef.icon}</span>
                            <div>
                              <div className="text-xs font-black text-slate-900">{styleDef.name}</div>
                              <div className="text-[10px] text-slate-500">{styleDef.tagline}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Visual Miniature Button Preview */}
                        <div className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold shadow-2xs truncate select-none border border-slate-200 bg-slate-900">
                          <span className={`w-full py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${styleDef.previewClass}`}>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Jogar</span>
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-tight">
                          {styleDef.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Efeito de Animação de Fundo (Sobreposição / Overlay) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Animação de Fundo (Sobreposição / Overlay)</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    Efeito ativo: <strong className="text-slate-900">{BACKGROUND_EFFECTS.find(e => e.id === splashBgEffect)?.name}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-500 -mt-1">
                  Efeitos visuais animados em tempo real que ficam sobre a imagem de fundo:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                  {BACKGROUND_EFFECTS.map((eff) => {
                    const isSelected = splashBgEffect === eff.id;
                    return (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSplashBgEffect(eff.id);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 relative ${
                          isSelected
                            ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{eff.icon}</span>
                            <div>
                              <div className="text-xs font-black text-slate-900">{eff.name}</div>
                              <div className="text-[10px] text-slate-500">{eff.tagline}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                          {eff.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Design & Layout dos Jogos com Variação de Cores em Tempo Real */}
            <div className="space-y-5 p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 text-sm sm:text-base font-black text-red-600 uppercase tracking-wider">
                  <Palette className="w-5 h-5" />
                  <span>3. Design &amp; Layout dos Jogos (12 Estilos Exclusivos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    Estilo Selecionado: <strong className="text-red-600">{GAME_LAYOUTS.find((l) => l.id === gameLayout)?.name}</strong>
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed -mt-2">
                Escolha o design visual exclusivo para todos os jogos da campanha. Você pode variar as cores em tempo real arrastando o controle deslizante abaixo sem precisar escolher cor por cor!
              </p>

              {/* Modo Visual do Totem: Tema Claro vs Tema Escuro */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/90 border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    {themeMode === 'light' ? (
                      <Sun className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-indigo-500" />
                    )}
                    <h4 className="text-sm font-black text-slate-900">
                      Modo Visual do Totem &amp; Jogos
                    </h4>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      themeMode === 'light' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    }`}>
                      {themeMode === 'light' ? '☀️ Modo Claro Ativo' : '🌙 Modo Escuro Ativo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Alterne entre o tema <strong>Claro Clean</strong> (fundo branco/claro com alto contraste) ou <strong>Escuro Neon</strong> (fundo dark com efeitos luminosos) para as telas e desafios da campanha.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-200/90 p-1.5 rounded-2xl w-full sm:w-auto flex-shrink-0 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setThemeMode('light');
                    }}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                      themeMode === 'light'
                        ? 'bg-white text-slate-900 shadow-md ring-2 ring-amber-500/30 scale-[1.03]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>☀️ Tema Claro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setThemeMode('dark');
                    }}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                      themeMode === 'dark'
                        ? 'bg-slate-950 text-white shadow-md ring-2 ring-indigo-500/30 scale-[1.03]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                    <span>🌙 Tema Escuro</span>
                  </button>
                </div>
              </div>

              {/* Grid dos 12 Estilos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {GAME_LAYOUTS.map((layoutDef) => {
                  const isSelected = layoutDef.id === gameLayout;
                  return (
                    <button
                      key={layoutDef.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setGameLayout(layoutDef.id);
                        setLayoutColorHue(getDefaultHueForLayout(layoutDef.id));
                        setGamesConfig((prev) => {
                          const updated: Record<string, any> = {
                            ...prev,
                            game_layout: layoutDef.id,
                          };
                          GAMES_CATALOG.forEach((g) => {
                            updated[`${g.id}_layout`] = layoutDef.id;
                          });
                          return updated;
                        });
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 active:scale-[0.98] relative ${
                        isSelected
                          ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-500/20 scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${layoutDef.previewBg} text-white shadow-sm`}>
                          {layoutDef.id === 'neon_arcade' ? (
                            <Gamepad2 className="w-5 h-5" />
                          ) : layoutDef.id === 'bento_tech' ? (
                            <LayoutGrid className="w-5 h-5" />
                          ) : layoutDef.id === 'neumorphic_luxe' ? (
                            <Gem className="w-5 h-5" />
                          ) : layoutDef.id === 'spatial_3d' ? (
                            <Box className="w-5 h-5" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                        </div>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                          {layoutDef.name}
                        </h4>
                        <span className="text-[10px] font-black text-red-600 block mt-0.5 mb-1.5 uppercase tracking-wide">
                          {layoutDef.tagline}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {layoutDef.description}
                        </p>
                      </div>

                      {/* Botão no card para variar cores quando selecionado */}
                      {isSelected ? (
                        <div className="mt-2 pt-2.5 border-t border-red-200/80 flex items-center justify-between">
                          <span className="text-[11px] font-black text-red-700 flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5" />
                            Cores Personalizadas
                          </span>
                          <span
                            style={{ backgroundColor: activeLayoutPalette.primary }}
                            className="w-4 h-4 rounded-full shadow-xs border border-white"
                            title={`Cor ativa: ${activeLayoutPalette.primary}`}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-[10px] font-bold text-slate-400">
                          Clique para selecionar
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Painel de Variação de Cores com Slider e Mini Preview em Cima */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-black border-2 border-slate-800 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: activeLayoutPalette.primary, boxShadow: `0 0 15px ${activeLayoutPalette.glowColor}` }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-all duration-300"
                    >
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black flex items-center gap-2">
                        <span>Variação de Cores do Estilo:</span>
                        <span style={{ color: activeLayoutPalette.primary }} className="transition-colors duration-300">
                          {GAME_LAYOUTS.find((l) => l.id === gameLayout)?.name}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Deslize a barra para mudar todas as cores de uma vez só (bordas, neon, botões e auras)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setLayoutColorHue(getDefaultHueForLayout(gameLayout));
                    }}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-slate-300 hover:text-white border border-white/15 flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Cor Original</span>
                  </button>
                </div>

                {/* 1. Mini Preview em Cima Mostrando a Variação naquele Tema */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>PRÉ-VISUALIZAÇÃO EM TEMPO REAL NO ESTILO ESCOLHIDO:</span>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <span style={{ backgroundColor: activeLayoutPalette.primary }} className="w-2.5 h-2.5 rounded-full" />
                        {activeLayoutPalette.primary}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <span style={{ backgroundColor: activeLayoutPalette.secondary }} className="w-2.5 h-2.5 rounded-full" />
                        {activeLayoutPalette.secondary}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      borderColor: activeLayoutPalette.primary,
                      boxShadow: `0 0 30px ${activeLayoutPalette.glowColor}, inset 0 0 20px ${activeLayoutPalette.glowColor}25`,
                    }}
                    className="p-5 rounded-3xl bg-black/60 border-2 flex flex-col md:flex-row items-center justify-between gap-5 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Ambient glow accent inside preview */}
                    <div
                      style={{ backgroundColor: activeLayoutPalette.primary }}
                      className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-300"
                    />

                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                      <div
                        style={{
                          borderColor: activeLayoutPalette.primary,
                          color: activeLayoutPalette.primary,
                          boxShadow: `0 0 15px ${activeLayoutPalette.glowColor}`,
                        }}
                        className="w-14 h-14 rounded-2xl bg-white/5 border-2 flex items-center justify-center font-black text-2xl flex-shrink-0 transition-all duration-300"
                      >
                        ?
                      </div>

                      <div>
                        <div
                          style={{
                            color: activeLayoutPalette.primary,
                            borderColor: activeLayoutPalette.primary,
                            backgroundColor: `${activeLayoutPalette.primary}20`,
                          }}
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider mb-1 border transition-all duration-300"
                        >
                          ⚡ {GAME_LAYOUTS.find((l) => l.id === gameLayout)?.name.toUpperCase()} ⚡
                        </div>
                        <h5 className="text-sm sm:text-base font-black text-white leading-tight">
                          Quiz &amp; Desafios da Campanha
                        </h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Bordas, botões, barras de progresso e luzes sincronizadas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end relative z-10">
                      <button
                        type="button"
                        style={{
                          background: `linear-gradient(to right, ${activeLayoutPalette.primary}, ${activeLayoutPalette.secondary})`,
                          boxShadow: `0 0 25px ${activeLayoutPalette.glowColor}`,
                        }}
                        className="w-full md:w-auto px-7 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>JOGAR AGORA</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Barra de Arrastar (Slider Horizontal Esquerda <-> Direita) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-2">
                      <span>🎨 Barra de Arrastar para Variar Cores:</span>
                      <span
                        style={{ backgroundColor: activeLayoutPalette.primary }}
                        className="px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs font-mono"
                      >
                        {layoutColorHue}° MATIZ
                      </span>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ← Arraste para Esquerda ou Direita →
                    </span>
                  </div>

                  <div className="relative flex items-center py-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={layoutColorHue}
                      onChange={(e) => {
                        setLayoutColorHue(Number(e.target.value));
                      }}
                      className="w-full h-4 rounded-full appearance-none cursor-pointer focus:outline-none shadow-inner"
                      style={{
                        background:
                          'linear-gradient(to right, #EF4444 0%, #F97316 14%, #F59E0B 28%, #10B981 42%, #06B6D4 56%, #3B82F6 70%, #8B5CF6 84%, #EC4899 94%, #EF4444 100%)',
                      }}
                    />
                  </div>

                  {/* 3. Atalhos Rápidos de Cores em 1-Clique */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Tons Rápidos:
                    </span>
                    {QUICK_HUE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setLayoutColorHue(preset.hue);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                          Math.abs(layoutColorHue - preset.hue) <= 15
                            ? 'bg-white text-slate-900 border-white shadow-md scale-105'
                            : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: preset.previewHex }}
                          className="w-3 h-3 rounded-full shadow-xs"
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Games Catalog Section (Grid with Previews & Content) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                  <Play className="w-4 h-4" />
                  <span>4. Lista de Jogos do Totem (Selecione &amp; Alimente Conteúdo)</span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGames(GAMES_CATALOG.map((g) => g.id));
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline active:scale-95 transition-all"
                  >
                    Marcar Todos
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGames([]);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline active:scale-95 transition-all"
                  >
                    Desmarcar Todos
                  </button>
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {selectedGames.length} de {GAMES_CATALOG.length} selecionados
                  </span>
                </div>
              </div>

              {/* Category Filter Pills & Category Quick Action */}
              <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setGameCategoryFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      gameCategoryFilter === 'all'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    <span>Todos</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      gameCategoryFilter === 'all' ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {GAMES_CATALOG.length}
                    </span>
                  </button>

                  {GAME_CATEGORIES.map((cat) => {
                    const isSelected = gameCategoryFilter === cat.id;
                    const catGames = GAMES_CATALOG.filter((g) => g.categoryId === cat.id || g.category === cat.name);
                    const count = catGames.length;
                    const selectedCount = catGames.filter((g) => selectedGames.includes(g.id)).length;
                    if (count === 0) return null;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setGameCategoryFilter(cat.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {selectedCount}/{count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Category Selection Helper */}
                {gameCategoryFilter !== 'all' && (() => {
                  const catGames = GAMES_CATALOG.filter(
                    (g) => g.categoryId === gameCategoryFilter || g.category === gameCategoryFilter
                  );
                  const allCatSelected = catGames.every((g) => selectedGames.includes(g.id));

                  return (
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          if (allCatSelected) {
                            // Unselect this category
                            const ids = catGames.map((g) => g.id);
                            setSelectedGames((prev) => prev.filter((id) => !ids.includes(id)));
                          } else {
                            // Select all in this category
                            const ids = catGames.map((g) => g.id);
                            setSelectedGames((prev) => Array.from(new Set([...prev, ...ids])));
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-red-400 active:scale-95 text-[11px] font-bold text-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-red-600" />
                        <span>{allCatSelected ? 'Desmarcar Categoria' : 'Marcar Esta Categoria'}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {GAMES_CATALOG.filter(
                  (g) => gameCategoryFilter === 'all' || g.categoryId === gameCategoryFilter || g.category === gameCategoryFilter
                ).map((game) => {
                  const isSelected = selectedGames.includes(game.id);
                  const hasCustomContent = !!gamesConfig[game.id];

                  return (
                    <div
                      key={game.id}
                      className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-red-400 bg-white shadow-sm'
                          : 'border-slate-200 bg-slate-50/70 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {game.category}
                          </span>

                          {/* Checkbox toggle */}
                          <button
                            type="button"
                            onClick={() => toggleGame(game.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-red-600 border-red-600 text-white shadow-xs'
                                : 'bg-white border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>

                        <h4 className="text-sm font-black text-slate-900">{game.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                        {(() => {
                          const cfgTime = gamesConfig[`${game.id}_time_limit`];
                          const cfgTotal = gamesConfig[`${game.id}_total_time_limit`];
                          const isQuestionGame = ['quiz', 'truefalse', 'speed_trivia', 'complete_phrase'].includes(game.id);

                          let timeDisplay = game.estimatedTime;
                          if (cfgTime !== undefined) {
                            timeDisplay = cfgTime === 0 
                              ? (cfgTotal ? `${cfgTotal}s total` : 'Sem tempo') 
                              : (isQuestionGame ? `${cfgTime}s / perg` : `${cfgTime}s`);
                          } else if (cfgTotal !== undefined) {
                            timeDisplay = `${cfgTotal}s total`;
                          }

                          const qCount = gamesConfig[`${game.id}_questions_count`];
                          const gOrder = gamesConfig[`${game.id}_order_mode`];

                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">
                                ⏱️ {timeDisplay}
                              </span>
                              {qCount && qCount > 0 ? (
                                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200 w-fit">
                                  {qCount} por partida ({gOrder === 'ordered' ? 'fixas' : 'sorteadas'})
                                </span>
                              ) : null}
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-1.5">
                          {/* Content Customization Button */}
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setEditingContentGame(game);
                            }}
                            className={`px-2 py-1.5 rounded-lg active:scale-95 text-[11px] font-bold flex items-center gap-1 transition-all border ${
                              hasCustomContent
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                            title="Alimentar conteúdo por CSV, Formulário ou IA"
                          >
                            <FileSpreadsheet className="w-3 h-3 text-red-600" />
                            <span>
                              {hasCustomContent 
                                ? `Editado (${getContentCount(gamesConfig[game.id])}) ✓` 
                                : 'Conteúdo'}
                            </span>
                          </button>

                          {/* Interactive Preview Button */}
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setPreviewingGame(game);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-[11px] flex items-center gap-1 transition-all border border-slate-200"
                          >
                            <Play className="w-3 h-3 text-amber-600 fill-current" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Ranking Toggle Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ativar Ranking dos Jogos</h4>
                  <p className="text-xs text-slate-500">
                    Os jogos não terão ranking a menos que ativado aqui. Permite registrar pontuações no totem.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rankingEnabled}
                  onChange={(e) => {
                    sound.playClick();
                    setRankingEnabled(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700 active:scale-95 transition-all border border-slate-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving || isNameDuplicate}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-black text-sm text-white shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : campaignToEdit ? 'Salvar Alterações' : 'Criar Campanha'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Game Preview Modal inside Form */}
      {previewingGame && (
        <GamePreviewModal
          game={previewingGame}
          onClose={() => setPreviewingGame(null)}
          customContent={gamesConfig[previewingGame.id]}
          gameLayout={gameLayout || gamesConfig[`${previewingGame.id}_layout`] || gamesConfig?.game_layout || 'modern_glass'}
          orderMode={gamesConfig[`${previewingGame.id}_order_mode`] || 'random'}
          questionsCount={Number(gamesConfig[`${previewingGame.id}_questions_count`]) || undefined}
          theme={THEMES[themeId]}
          themePrimary={THEMES[themeId]?.primary || customColors.primary}
          themeMode={themeMode}
          isLight={themeMode === 'light'}
          onLayoutChange={(newLayout) => {
            setGameLayout(newLayout);
            setGamesConfig((prev) => ({
              ...prev,
              [`${previewingGame.id}_layout`]: newLayout,
              game_layout: newLayout,
            }));
          }}
        />
      )}

      {/* Game Content Editor Modal (CSV, Manual Form, Gemini AI) */}
      {editingContentGame && (
        <GameContentEditorModal
          game={editingContentGame}
          currentContent={gamesConfig[editingContentGame.id]}
          currentTimeLimit={gamesConfig[`${editingContentGame.id}_time_limit`]}
          currentTotalTimeLimit={gamesConfig[`${editingContentGame.id}_total_time_limit`]}
          currentLayout={gamesConfig[`${editingContentGame.id}_layout`] || gamesConfig?.game_layout || gameLayout || 'modern_glass'}
          currentOrderMode={gamesConfig[`${editingContentGame.id}_order_mode`] || 'random'}
          currentQuestionsCount={Number(gamesConfig[`${editingContentGame.id}_questions_count`]) || 0}
          campaignContext={{
            campaignName: name,
            clientName: clientName,
            description: description,
            themeName: THEMES[themeId]?.name,
          }}
          onClose={() => setEditingContentGame(null)}
          onSave={async (gameId, updatedContent, timeLimit, totalTimeLimit, layout, gameOrderMode, gameQuestionsCount) => {
            const nextGamesConfig = {
              ...gamesConfig,
              [gameId]: updatedContent,
              [`${gameId}_time_limit`]: timeLimit,
              [`${gameId}_total_time_limit`]: totalTimeLimit,
              [`${gameId}_layout`]: layout,
              [`${gameId}_order_mode`]: gameOrderMode,
              [`${gameId}_questions_count`]: gameQuestionsCount,
            };
            setGamesConfig(nextGamesConfig);
            setEditingContentGame(null);

            const completeGamesConfig = {
              ...nextGamesConfig,
              theme_mode: themeMode,
              game_layout: layout || gameLayout,
              custom_colors: {
                ...customColors,
                bgType: customColors.enabled ? customColors.bgType : (themeMode === 'light' ? 'light' : 'dark'),
              },
            };

            // Update in-memory reference of campaignToEdit so re-opening content retains all edits
            if (campaignToEdit) {
              campaignToEdit.games_config = completeGamesConfig;
            }

            // Auto-persist directly to database if editing existing campaign
            if (campaignToEdit?.id) {
              try {
                await supabase
                  .from(TABLES.CAMPAIGNS)
                  .update({
                    games_config: completeGamesConfig,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', campaignToEdit.id);

                onCampaignUpdated?.(campaignToEdit.id, completeGamesConfig);
              } catch (err) {
                console.error('Error auto-persisting game content to database:', err);
              }
            }
          }}
        />
      )}
    </>
  );
};
