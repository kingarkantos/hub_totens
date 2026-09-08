export type ThemeId = 
  | 'honda-red'
  | 'cyberpunk-neon'
  | 'emerald-eco'
  | 'luxury-gold'
  | 'deep-ocean'
  | 'sunset-electric'
  | 'ultra-dark'
  | 'candy-pastel'
  | 'high-tech-silver'
  | 'solar-blaze';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  badgeBg: string;
  buttonGradient: string;
  fontClass: string;
  glowColor: string;
}

export interface GameDefinition {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  estimatedTime: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  previewBg: string;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  client_name: string;
  description?: string;
  splash_image_url?: string;
  theme_id: ThemeId;
  selected_games: string[];
  games_config?: Record<string, any>;
  ranking_enabled: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RankingEntry {
  id: string;
  campaign_id: string;
  game_id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export interface SystemSettings {
  admin_password: string;
  idle_timeout_seconds: number;
  sound_enabled_default: boolean;
}
