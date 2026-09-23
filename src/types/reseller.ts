export interface Reseller {
  id: string;
  name: string; // Nome fantasia / Marca do revendedor
  slug: string; // Link único do portfólio (ex: agencia-pulse)
  company_name?: string; // Razão social
  logo_url?: string; // Logotipo da empresa
  description?: string; // Apresentação / Sobre a empresa
  contact_whatsapp?: string; // WhatsApp comercial com DDD (apenas números ou formatado)
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  city_state?: string; // Ex: São Paulo - SP
  primary_color?: string; // Cor primária da marca do revendedor
  secondary_color?: string; // Cor secundária
  theme_mode?: 'dark' | 'light';
  enabled_games?: string[]; // IDs dos jogos habilitados no catálogo do revendedor
  active: boolean;
  created_at: string;
  updated_at: string;
}
