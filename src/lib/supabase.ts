import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czympfukmtglynkuyybe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eW1wZnVrbXRnbHlua3V5eWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzODMxNTUsImV4cCI6MjAyMTk1OTE1NX0.eT73t8NPm5ON1QIpTMk36WU1uNRDyW250n5GDxmVEkc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Table name constants with mandatory prefix 'hubtotens_'
export const TABLES = {
  SETTINGS: 'hubtotens_settings',
  CAMPAIGNS: 'hubtotens_campaigns',
  GAMES: 'hubtotens_games',
  RANKINGS: 'hubtotens_rankings',
  ANALYTICS: 'hubtotens_analytics',
} as const;

export const BUCKETS = {
  SPLASHES: 'hubtotens_splashes',
} as const;

