import { supabase, TABLES } from './supabase';
import { Reseller } from '../types';
import { GAMES_CATALOG } from './gamesCatalog';

const LOCAL_STORAGE_KEY = 'hubtotens_resellers_store';

const DEFAULT_SAMPLE_RESELLERS: Reseller[] = [
  {
    id: 'reseller-pulse-demo',
    name: 'Pulse Interativa',
    slug: 'pulse-interativa',
    company_name: 'Pulse Soluções Audiovisuais & Totens LTDA',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&q=80',
    description: 'Especialistas em ativações de marcas, eventos corporativos e totens interativos de alto impacto para feiras, lançamentos e shoppings em todo o Brasil.',
    contact_whatsapp: '5511999998888',
    contact_email: 'contato@pulseinterativa.com.br',
    contact_phone: '(11) 3200-4000',
    website: 'https://pulseinterativa.com.br',
    city_state: 'São Paulo - SP',
    primary_color: '#2563EB',
    secondary_color: '#1D4ED8',
    theme_mode: 'dark',
    enabled_games: GAMES_CATALOG.map((g) => g.id),
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function normalizeReseller(r: Reseller): Reseller {
  const catalogIds = GAMES_CATALOG.map((g) => g.id);

  // If enabled_games is missing, undefined, or empty, activate all catalog games
  if (!r.enabled_games || !Array.isArray(r.enabled_games) || r.enabled_games.length === 0) {
    return {
      ...r,
      enabled_games: catalogIds,
    };
  }

  // If the reseller had a broad/standard portfolio (10 or more games enabled),
  // automatically include newly released catalog games (like plinko, top_gear, etc.)
  if (r.enabled_games.length >= 10) {
    const merged = Array.from(new Set([...r.enabled_games, ...catalogIds]));
    return {
      ...r,
      enabled_games: merged,
    };
  }

  return r;
}

function getLocalResellers(): Reseller[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = DEFAULT_SAMPLE_RESELLERS.map(normalizeReseller);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: Reseller[] = JSON.parse(raw);
    const updated = parsed.map(normalizeReseller);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SAMPLE_RESELLERS.map(normalizeReseller);
  }
}

function setLocalResellers(resellers: Reseller[]) {
  try {
    const normalized = resellers.map(normalizeReseller);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.error('Error saving resellers to localStorage:', err);
  }
}

export const resellersService = {
  async getResellers(): Promise<Reseller[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESELLERS)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const normalized = (data as Reseller[]).map(normalizeReseller);
        setLocalResellers(normalized);
        return normalized;
      }
    } catch {
      // Supabase table may not exist yet; use local cache
    }
    return getLocalResellers();
  },

  async getResellerBySlug(slug: string): Promise<Reseller | null> {
    const cleanSlug = slug.trim().toLowerCase();
    try {
      const { data, error } = await supabase
        .from(TABLES.RESELLERS)
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (!error && data) {
        return normalizeReseller(data as Reseller);
      }
    } catch {
      // fallback
    }

    const local = getLocalResellers();
    const found = local.find((r) => r.slug.toLowerCase() === cleanSlug) || null;
    return found ? normalizeReseller(found) : null;
  },

  async getResellerById(id: string): Promise<Reseller | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESELLERS)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return normalizeReseller(data as Reseller);
      }
    } catch {
      // fallback
    }

    const local = getLocalResellers();
    const found = local.find((r) => r.id === id) || null;
    return found ? normalizeReseller(found) : null;
  },

  async saveReseller(reseller: Partial<Reseller>): Promise<Reseller> {
    const now = new Date().toISOString();
    const isEdit = !!reseller.id;
    const cleanSlug = (reseller.slug || reseller.name || 'revendedor')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const record: Reseller = {
      id: reseller.id || `reseller_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: (reseller.name || 'Novo Revendedor').trim(),
      slug: cleanSlug,
      company_name: reseller.company_name?.trim() || '',
      logo_url: reseller.logo_url?.trim() || '',
      description: reseller.description?.trim() || '',
      contact_whatsapp: reseller.contact_whatsapp?.trim() || '',
      contact_email: reseller.contact_email?.trim() || '',
      contact_phone: reseller.contact_phone?.trim() || '',
      website: reseller.website?.trim() || '',
      city_state: reseller.city_state?.trim() || '',
      primary_color: reseller.primary_color || '#2563EB',
      secondary_color: reseller.secondary_color || '#1D4ED8',
      theme_mode: reseller.theme_mode || 'dark',
      enabled_games: reseller.enabled_games || GAMES_CATALOG.map((g) => g.id),
      active: reseller.active !== undefined ? reseller.active : true,
      created_at: reseller.created_at || now,
      updated_at: now,
    };

    // Try Supabase first
    try {
      if (isEdit) {
        await supabase
          .from(TABLES.RESELLERS)
          .update(record)
          .eq('id', record.id);
      } else {
        await supabase.from(TABLES.RESELLERS).insert(record);
      }
    } catch {
      // table might not exist; local persistence will handle it
    }

    // Always update local cache
    const currentList = getLocalResellers();
    const existingIndex = currentList.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      currentList[existingIndex] = record;
    } else {
      currentList.unshift(record);
    }
    setLocalResellers(currentList);

    return record;
  },

  async deleteReseller(id: string): Promise<boolean> {
    try {
      await supabase.from(TABLES.RESELLERS).delete().eq('id', id);
    } catch {
      // ignore
    }

    const currentList = getLocalResellers();
    const filtered = currentList.filter((r) => r.id !== id);
    setLocalResellers(filtered);
    return true;
  },
};
