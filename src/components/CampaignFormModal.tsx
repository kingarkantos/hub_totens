import React, { useState } from 'react';
import { X, Play, Image as ImageIcon, Sparkles, Trophy, Check, Layers, FileSpreadsheet, UploadCloud, Loader2, Database, CheckCircle2 } from 'lucide-react';
import { Campaign, GameDefinition, ThemeId } from '../types';
import { THEME_LIST, THEMES } from '../lib/themes';
import { GAMES_CATALOG } from '../lib/gamesCatalog';
import { GamePreviewModal } from '../games/GamePreviewModal';
import { GameContentEditorModal } from './GameContentEditorModal';
import { sound } from '../lib/audio';
import { supabase, BUCKETS } from '../lib/supabase';

interface CampaignFormModalProps {
  campaignToEdit?: Campaign | null;
  onClose: () => void;
  onSave: (campaignData: Partial<Campaign>) => Promise<void>;
}

const SPLASH_PRESETS = [
  { label: 'Automotivo Showroom', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Pista & Velocidade', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Cyber Neon Lights', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Festival & Evento', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80' },
  { label: 'Eco & Sustentável', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1920&q=80' },
];

export const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  campaignToEdit,
  onClose,
  onSave,
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
    campaignToEdit?.selected_games || GAMES_CATALOG.map((g) => g.id)
  );
  const [gamesConfig, setGamesConfig] = useState<Record<string, any>>(
    campaignToEdit?.games_config || {}
  );
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
      alert('Erro ao enviar imagem para o Supabase Storage: ' + (err.message || 'Tente novamente.'));
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
      alert('Não foi possível transferir imagem externa para o Supabase (bloqueio CORS da origem). Faça o upload do arquivo local diretamente!');
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
    if (!name.trim() || !slug.trim()) return;
    if (selectedGames.length === 0) {
      alert('Selecione pelo menos 1 jogo para a campanha!');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        client_name: clientName.trim(),
        description: description.trim(),
        splash_image_url: splashUrl.trim(),
        theme_id: themeId,
        selected_games: selectedGames,
        games_config: gamesConfig,
        ranking_enabled: rankingEnabled,
        active: true,
      });
      sound.playSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      sound.playError();
      alert('Erro ao salvar campanha no Supabase.');
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campanha Honda Festival 2026"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm font-semibold"
                  />
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Slug da URL do Totem (Identificador Único) *
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 overflow-hidden focus-within:border-red-500 focus-within:bg-white">
                    <span className="px-3.5 py-3 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                      hub-totens.vercel.app/
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

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Descrição ou Regras da Ativação (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Ativação interativa de estande no Salão do Automóvel..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Splash Image Section with Supabase Storage Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>2. Imagem de Splash Screen do Totem (Supabase Storage)</span>
                </div>
                {splashUrl.includes('supabase.co') && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs animate-in fade-in">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hospedada no Supabase</span>
                  </span>
                )}
              </div>

              {/* Upload to Supabase Box */}
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
                        <span className="text-xs font-bold">Enviando imagem para o Supabase Storage...</span>
                        <span className="text-[10px] text-slate-400 mt-1">Aguarde a geração da URL pública</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform mb-2 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Clique ou Arraste uma Imagem para o Supabase
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          Formatos: PNG, JPG, WebP (Máx: 10MB) • Salvo no Bucket do Supabase
                        </span>
                      </div>
                    )}
                  </label>

                  {uploadSuccess && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Upload concluído! A imagem foi salva no Supabase Storage da campanha.</span>
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
                          title="Fazer cópia e hospedar esta imagem no Supabase Storage"
                        >
                          <Database className="w-3.5 h-3.5 text-amber-400" />
                          <span>Salvar no Supabase</span>
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

            {/* Design System Themes Section (10 Themes) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>3. Estilo Visual do Design System (10 Temas)</span>
                </div>
                <span className="text-xs text-slate-500">
                  Selecionado: <strong className="text-slate-900">{THEME_LIST.find((t) => t.id === themeId)?.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {THEME_LIST.map((theme) => {
                  const isSelected = themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setThemeId(theme.id);
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-red-600 scale-[1.02] shadow-md bg-red-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}

                      <div>
                        {/* Palette preview pills */}
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <div
                            style={{ backgroundColor: theme.primary }}
                            className="w-5 h-5 rounded-full shadow-xs"
                          />
                          <div
                            style={{ backgroundColor: theme.secondary }}
                            className="w-4 h-4 rounded-full shadow-xs"
                          />
                          <div
                            style={{ backgroundColor: theme.accent }}
                            className="w-3.5 h-3.5 rounded-full shadow-xs"
                          />
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{theme.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-2">
                          {theme.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span
                          style={{ backgroundColor: theme.primary }}
                          className="w-full py-1 rounded-md text-[10px] font-black text-center text-white"
                        >
                          Amostra de Botão
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Games Catalog Section (Grid with Previews & Content) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
                  <Play className="w-4 h-4" />
                  <span>4. Lista de Jogos do Totem (Selecione &amp; Alimente Conteúdo)</span>
                </div>
                <span className="text-xs text-slate-500 font-bold">
                  {selectedGames.length} de {GAMES_CATALOG.length} jogos selecionados
                </span>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {GAMES_CATALOG.map((game) => {
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
                        <span className="text-[10px] text-slate-500 font-mono">
                          ⏱️ {game.estimatedTime}
                        </span>

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
                            <span>{hasCustomContent ? 'Editado ✓' : 'Conteúdo'}</span>
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
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-black text-sm text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
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
        />
      )}

      {/* Game Content Editor Modal (CSV, Manual Form, Gemini AI) */}
      {editingContentGame && (
        <GameContentEditorModal
          game={editingContentGame}
          currentContent={gamesConfig[editingContentGame.id]}
          campaignContext={{
            campaignName: name,
            clientName: clientName,
            description: description,
            themeName: THEMES[themeId]?.name,
          }}
          onClose={() => setEditingContentGame(null)}
          onSave={(gameId, updatedContent) => {
            setGamesConfig((prev) => ({
              ...prev,
              [gameId]: updatedContent,
            }));
            setEditingContentGame(null);
          }}
        />
      )}
    </>
  );
};
