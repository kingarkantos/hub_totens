import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Search, RefreshCw } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { RankingEntry } from '../types';
import { GAMES_CATALOG } from '../lib/gamesCatalog';

interface LeaderboardModalProps {
  campaignId: string;
  gameId?: string;
  onClose: () => void;
  themePrimary?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  campaignId,
  gameId,
  onClose,
  themePrimary = '#DC2626',
}) => {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>(gameId || 'all');
  const [search, setSearch] = useState('');

  const fetchRankings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from(TABLES.RANKINGS)
        .select('*')
        .eq('campaign_id', campaignId)
        .order('score', { ascending: false })
        .limit(50);

      if (selectedGame !== 'all') {
        query = query.eq('game_id', selectedGame);
      }

      const { data, error } = await query;
      if (!error && data) {
        setEntries(data as RankingEntry[]);
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [campaignId, selectedGame]);

  const filtered = entries.filter((e) =>
    e.player_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-white/20 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-950 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Quadro de Líderes do Totem</h3>
              <p className="text-xs text-slate-400">Melhores pontuações registradas nesta campanha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-900/90 border-b border-white/10 flex flex-wrap gap-3 items-center justify-between">
          {/* Game selector */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
          >
            <option value="all">Todos os Jogos</option>
            {GAMES_CATALOG.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={fetchRankings}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300"
            title="Atualizar ranking"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Carregando classificações...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center">
              <Medal className="w-10 h-10 text-slate-600 mb-2" />
              <span>Nenhum recorde registrado ainda para esta seleção.</span>
              <span className="text-xs text-slate-500 mt-1">Seja o primeiro a jogar e garantir seu lugar!</span>
            </div>
          ) : (
            filtered.map((entry, index) => {
              const gameMeta = GAMES_CATALOG.find((g) => g.id === entry.game_id);
              const isTop3 = index < 3;
              const badgeColors = [
                'from-amber-400 to-yellow-600 text-slate-950 border-amber-300',
                'from-slate-300 to-zinc-400 text-slate-950 border-slate-200',
                'from-amber-700 to-orange-800 text-white border-amber-600',
              ];

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isTop3
                      ? 'bg-slate-800/90 border-white/20 shadow-md'
                      : 'bg-slate-950/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                        isTop3
                          ? `bg-gradient-to-tr ${badgeColors[index]} shadow-md`
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {entry.player_name}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400">🎮</span>
                        {gameMeta?.name || entry.game_id}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-amber-400">
                      {entry.score.toLocaleString()} <span className="text-[10px] text-slate-400">pts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
