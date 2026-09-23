import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Sparkles, 
  Play, 
  ExternalLink, 
  CheckCircle2, 
  MessageCircle, 
  Gamepad2, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Award,
  Clock,
  Flame
} from 'lucide-react';
import { Reseller, Campaign, GameDefinition } from '../types';
import { resellersService } from '../lib/resellersService';
import { GAMES_CATALOG, GAME_CATEGORIES } from '../lib/gamesCatalog';
import { supabase, TABLES } from '../lib/supabase';
import { GamePreviewModal } from '../games/GamePreviewModal';
import { GameCardThumbnail } from '../components/GameCardThumbnail';
import { sound } from '../lib/audio';

interface ResellerPortfolioViewProps {
  slug: string;
  onNavigate?: (path: string) => void;
}

export const ResellerPortfolioView: React.FC<ResellerPortfolioViewProps> = ({
  slug,
  onNavigate,
}) => {
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewGame, setPreviewGame] = useState<GameDefinition | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPortfolioData() {
      setLoading(true);
      try {
        const found = await resellersService.getResellerBySlug(slug);
        if (!isMounted) return;
        setReseller(found);

        if (found) {
          // Fetch campaigns associated with this reseller
          const { data } = await supabase
            .from(TABLES.CAMPAIGNS)
            .select('*');

          if (data && isMounted) {
            const matches = (data as Campaign[]).filter((c) => {
              const rId = c.reseller_id || c.games_config?.reseller_id;
              const rName = c.reseller_name || c.games_config?.reseller_name;
              return rId === found.id || rName === found.company_name || rName === found.name;
            });
            setCampaigns(matches);
          }
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPortfolioData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400">Carregando portfólio interativo...</p>
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">Portfólio Não Encontrado</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Não localizamos nenhum revendedor credenciado com o link &quot;{slug}&quot;. Verifique o endereço digitado.
        </p>
        <button
          onClick={() => {
            if (onNavigate) onNavigate('/admin');
            else window.location.href = '/admin';
          }}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white"
        >
          Voltar ao Painel Geral
        </button>
      </div>
    );
  }

  const primaryColor = reseller.primary_color || '#2563EB';
  const secondaryColor = reseller.secondary_color || '#1D4ED8';
  const isDark = reseller.theme_mode !== 'light';

  // Games offered by this reseller
  const availableGames = GAMES_CATALOG.filter(
    (g) => !reseller.enabled_games || reseller.enabled_games.includes(g.id)
  );

  const filteredGames =
    selectedCategory === 'all'
      ? availableGames
      : availableGames.filter((g) => g.category === selectedCategory);

  const whatsappClean = reseller.contact_whatsapp?.replace(/\D/g, '') || '';
  const whatsappUrl = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
        `Olá! Vi o portfólio de totens da ${reseller.name} e gostaria de solicitar um orçamento para o meu evento/empresa.`
      )}`
    : null;

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } flex flex-col selection:bg-blue-500 selection:text-white relative`}
    >
      {/* Dynamic Background Atmosphere Glows */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-15"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          isDark
            ? 'bg-slate-950/80 border-slate-800/80 shadow-2xl shadow-black/40'
            : 'bg-white/85 border-slate-200 shadow-xs'
        } px-6 py-4 transition-colors`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {reseller.logo_url ? (
              <img
                src={reseller.logo_url}
                alt={reseller.name}
                className="w-11 h-11 rounded-2xl object-cover border border-white/20 shadow-md"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {reseller.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg md:text-xl tracking-tight leading-none">
                  {reseller.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Credenciado
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {reseller.company_name || 'Totens Interativos & Ativações de Marca'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSuccess()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all hover:brightness-110"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Solicitar Orçamento</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-12 space-y-12">
        {/* Hero Section */}
        <section
          className={`relative p-8 md:p-12 rounded-3xl border overflow-hidden ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 shadow-2xl'
              : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border-slate-200 shadow-xl'
          }`}
        >
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Catálogo Exclusivo de Jogos para Totens</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Ativações Interativas que Impressionam e Convertem
            </h2>

            <p
              className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {reseller.description ||
                'Oferecemos a melhor experiência touch screen para stands de eventos, feiras de negócios, lançamentos imobiliários, concessionárias e lojas em todo o país.'}
            </p>

            {/* Quick Badges & Contacts */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
              {reseller.city_state && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{reseller.city_state}</span>
                </div>
              )}

              {reseller.contact_phone && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{reseller.contact_phone}</span>
                </div>
              )}

              {reseller.contact_email && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{reseller.contact_email}</span>
                </div>
              )}

              {reseller.website && (
                <a
                  href={reseller.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border hover:underline ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  <span>Visitar Website</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Section: Games Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-500 mb-1">
                <Gamepad2 className="w-4 h-4" />
                <span>Experiências Gamificadas</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black">
                Catálogo de Jogos Interativos Touch
              </h3>
              <p
                className={`text-sm mt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Clique em qualquer jogo para experimentar o teste interativo em tempo real
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory('all');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'all'
                    ? 'text-white shadow-md'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                style={
                  selectedCategory === 'all'
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                <span>Todos</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({availableGames.length})
                </span>
              </button>

              {GAME_CATEGORIES.map((cat) => {
                const count = availableGames.filter((g) => g.category === cat.id).length;
                if (count === 0) return null;
                const isCatSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isCatSelected
                        ? 'text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    style={
                      isCatSelected
                        ? { backgroundColor: primaryColor }
                        : {}
                    }
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-80 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Games Grid - High Quality Visual Cards with Thumbnails */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    sound.playClick();
                    setPreviewGame(game);
                  }}
                  className={`group relative rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xl'
                  }`}
                >
                  {/* Subtle top color bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                    style={{ backgroundColor: primaryColor }}
                  />

                  <div>
                    {/* Top row with Game Miniature Preview */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            borderColor: `${primaryColor}40`,
                          }}
                        >
                          {game.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-lg leading-tight group-hover:text-blue-400 transition-colors">
                            {game.name}
                          </h4>
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {game.category}
                          </span>
                        </div>
                      </div>

                      {/* Animated miniature card thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm">
                        <GameCardThumbnail game={game} themePrimary={primaryColor} isLight={!isDark} />
                      </div>
                    </div>

                    <p
                      className={`text-xs leading-relaxed line-clamp-3 mb-4 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {game.description}
                    </p>
                  </div>

                  <div
                    className={`pt-3 border-t flex items-center justify-between text-xs font-bold ${
                      isDark ? 'border-slate-800/80 text-blue-400' : 'border-slate-100 text-blue-600'
                    }`}
                  >
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Testar Jogo Interativo
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Showcase of Client Campaigns */}
        {campaigns.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-500 mb-1">
                <Layers className="w-4 h-4" />
                <span>Casos Reais & Ativações</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black">
                Campanhas Vinculadas a este Parceiro ({campaigns.length})
              </h3>
              <p
                className={`text-sm mt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Conheça as campanhas e totens operados por {reseller.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {camp.client_name}
                    </span>
                    <h4 className="text-xl font-black mt-2">{camp.name}</h4>
                    {camp.description && (
                      <p
                        className={`text-xs mt-1 line-clamp-2 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {camp.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs opacity-75 font-mono">
                      <span>🎮 {camp.selected_games?.length || 0} jogos configurados</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono opacity-60">
                      Link Totem: /{camp.slug}
                    </span>
                    <a
                      href={`/${camp.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:brightness-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Totem</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Contact CTA */}
        <section
          className="p-8 md:p-12 rounded-3xl text-white text-center space-y-6 relative overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">
              Pronto para ativar a sua marca com totens interativos?
            </h3>
            <p className="text-sm md:text-base text-white/90 leading-relaxed">
              Entre em contato direto com a equipe de {reseller.name} para customizar jogos, 
              inserir suas perguntas e prêmios, e alugar totens para o seu próximo grande evento.
            </p>

            {whatsappUrl && (
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-wider shadow-2xl active:scale-95 transition-all hover:bg-slate-100"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600 fill-current" />
                  <span>Conversar no WhatsApp Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`py-8 px-6 text-center text-xs border-t ${
          isDark
            ? 'border-slate-800 text-slate-500 bg-slate-950'
            : 'border-slate-200 text-slate-400 bg-slate-100'
        }`}
      >
        <p>
          © {new Date().getFullYear()} {reseller.name} • Portfólio Powered by Hub Totens
        </p>
      </footer>

      {/* Live Interactive Game Emulator Modal */}
      {previewGame && (
        <GamePreviewModal
          game={previewGame}
          onClose={() => setPreviewGame(null)}
          gameLayout="modern_glass"
        />
      )}
    </div>
  );
};
