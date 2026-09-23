import React, { useState } from 'react';
import { X, Store, Sparkles, Phone, Mail, Globe, MapPin, Palette, CheckCircle2, ShieldCheck, Check, UploadCloud } from 'lucide-react';
import { Reseller } from '../types';
import { GAMES_CATALOG } from '../lib/gamesCatalog';
import { sound } from '../lib/audio';
import { resellersService } from '../lib/resellersService';

interface ResellerFormModalProps {
  resellerToEdit?: Reseller | null;
  onClose: () => void;
  onSaved: (reseller: Reseller) => void;
  existingResellers?: Reseller[];
}

const PRESET_LOGOS = [
  { label: 'Tech & Digital', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
  { label: 'Eventos & Mídia', url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80' },
  { label: 'Interativo VIP', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80' },
  { label: 'Agência Neon', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80' },
];

const PRESET_COLORS = [
  { name: 'Azul Corporativo', primary: '#2563EB', secondary: '#1D4ED8' },
  { name: 'Roxo Criativo', primary: '#7C3AED', secondary: '#6D28D9' },
  { name: 'Verde Tech', primary: '#059669', secondary: '#047857' },
  { name: 'Vermelho Impacto', primary: '#DC2626', secondary: '#B91C1C' },
  { name: 'Laranja Dinâmico', primary: '#EA580C', secondary: '#C2410C' },
  { name: 'Cyan Moderno', primary: '#0891B2', secondary: '#0E7490' },
];

export const ResellerFormModal: React.FC<ResellerFormModalProps> = ({
  resellerToEdit,
  onClose,
  onSaved,
  existingResellers = [],
}) => {
  const [name, setName] = useState(resellerToEdit?.name || '');
  const [slug, setSlug] = useState(resellerToEdit?.slug || '');
  const [companyName, setCompanyName] = useState(resellerToEdit?.company_name || '');
  const [logoUrl, setLogoUrl] = useState(resellerToEdit?.logo_url || PRESET_LOGOS[0].url);
  const [description, setDescription] = useState(
    resellerToEdit?.description || 'Especialistas em ativações de marcas interativas com totens para feiras, eventos corporativos e lojas.'
  );
  const [whatsapp, setWhatsapp] = useState(resellerToEdit?.contact_whatsapp || '');
  const [email, setEmail] = useState(resellerToEdit?.contact_email || '');
  const [phone, setPhone] = useState(resellerToEdit?.contact_phone || '');
  const [website, setWebsite] = useState(resellerToEdit?.website || '');
  const [cityState, setCityState] = useState(resellerToEdit?.city_state || 'São Paulo - SP');
  const [primaryColor, setPrimaryColor] = useState(resellerToEdit?.primary_color || '#2563EB');
  const [secondaryColor, setSecondaryColor] = useState(resellerToEdit?.secondary_color || '#1D4ED8');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(resellerToEdit?.theme_mode || 'dark');
  const [enabledGames, setEnabledGames] = useState<string[]>(
    resellerToEdit?.enabled_games || GAMES_CATALOG.map((g) => g.id)
  );
  const [saving, setSaving] = useState(false);

  // Auto-slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!resellerToEdit) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const isSlugDuplicate = existingResellers.some(
    (r) => r.id !== resellerToEdit?.id && r.slug.trim().toLowerCase() === slug.trim().toLowerCase()
  );

  const toggleGame = (id: string) => {
    sound.playClick();
    setEnabledGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const selectAllGames = () => {
    sound.playClick();
    setEnabledGames(GAMES_CATALOG.map((g) => g.id));
  };

  const deselectAllGames = () => {
    sound.playClick();
    setEnabledGames([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert('Preencha o nome do revendedor e o slug da página.');
      return;
    }

    if (isSlugDuplicate) {
      alert('Já existe outro revendedor com este link (slug)! Escolha um identificador diferente.');
      return;
    }

    setSaving(true);
    sound.playClick();
    try {
      const saved = await resellersService.saveReseller({
        id: resellerToEdit?.id,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        company_name: companyName.trim() || name.trim(),
        logo_url: logoUrl.trim(),
        description: description.trim(),
        contact_whatsapp: whatsapp.replace(/\D/g, ''),
        contact_email: email.trim(),
        contact_phone: phone.trim(),
        website: website.trim(),
        city_state: cityState.trim(),
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        theme_mode: themeMode,
        enabled_games: enabledGames,
        active: true,
      });

      sound.playSuccess();
      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error(err);
      sound.playError();
      alert('Erro ao salvar revendedor: ' + (err.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black">
                {resellerToEdit ? 'Editar Revendedor & Portfólio' : 'Cadastrar Novo Revendedor'}
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Crie um catálogo exclusivo e portfólio personalizado para o seu parceiro comercial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Section 1: Dados da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>1. Informações da Empresa & Marca</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome da Marca / Fantasia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pulse Interativa, Agência Start..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Razão Social (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pulse Mídia e Eventos LTDA"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Link do Portfólio (Slug Único) *
                  </label>
                  {isSlugDuplicate && (
                    <span className="text-xs font-bold text-red-600">Este link já está em uso!</span>
                  )}
                </div>
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 overflow-hidden focus-within:border-blue-500 focus-within:bg-white">
                  <span className="px-3.5 py-3 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                    hub.totens.app/portfolio/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="sua-agencia"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-4 py-3 bg-transparent text-blue-600 font-mono text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cidade / Estado</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo - SP, Curitiba - PR..."
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Logotipo (URL da Imagem)
                </label>
                <input
                  type="url"
                  placeholder="https://sua-empresa.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>

              {/* Logo presets */}
              <div className="md:col-span-2">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Ou selecione uma imagem de demonstração para o Logo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_LOGOS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setLogoUrl(item.url);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                        logoUrl === item.url
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img src={item.url} alt={item.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sobre a Empresa / Bio de Apresentação
                </label>
                <textarea
                  rows={3}
                  placeholder="Apresente os serviços de totens interativos oferecidos pelo revendedor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contatos */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
              <Phone className="w-4 h-4" />
              <span>2. Canais de Contato & Conversão</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Comercial (com DDD) *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 11999998888 ou (11) 99999-8888"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Os clientes do portfólio clicarão em &quot;Solicitar Ativação&quot; para conversar diretamente no seu WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>E-mail de Contato</span>
                </label>
                <input
                  type="email"
                  placeholder="contato@suaempresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Telefone Fixo / Comercial</span>
                </label>
                <input
                  type="text"
                  placeholder="(11) 3300-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Website Oficial (Opcional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://suaempresa.com.br"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Identidade Visual */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>3. Identidade Visual do Portfólio</span>
            </div>

            {/* Presets */}
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Paletas Pré-definidas:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {PRESET_COLORS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                      primaryColor === preset.primary
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-xs shrink-0"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-11 p-1 bg-white border border-slate-300 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-11 p-1 bg-white border border-slate-300 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tema Base do Portfólio
                </label>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 h-11">
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      themeMode === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Escuro (Dark)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      themeMode === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Claro (Light)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Catálogo de Jogos Habilitados */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Catálogo de Jogos do Portfólio ({enabledGames.length}/{GAMES_CATALOG.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllGames}
                  className="text-xs font-bold text-blue-600 hover:underline px-2 py-1"
                >
                  Selecionar Todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAllGames}
                  className="text-xs font-bold text-slate-500 hover:underline px-2 py-1"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Escolha quais jogos serão apresentados para os clientes no catálogo público deste revendedor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {GAMES_CATALOG.map((game) => {
                const isSelected = enabledGames.includes(game.id);
                return (
                  <div
                    key={game.id}
                    onClick={() => toggleGame(game.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{game.icon}</span>
                        <h4 className="font-bold text-sm text-slate-900 truncate">{game.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{game.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
              disabled={saving || isSlugDuplicate}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-black text-sm text-white shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : resellerToEdit ? 'Atualizar Revendedor' : 'Criar Revendedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
