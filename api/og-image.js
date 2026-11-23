const SUPABASE_URL = 'https://czympfukmtglynkuyybe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eW1wZnVrbXRnbHlua3V5eWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzODMxNTUsImV4cCI6MjAyMTk1OTE1NX0.eT73t8NPm5ON1QIpTMk36WU1uNRDyW250n5GDxmVEkc';

/**
 * Fallback de imagem Open Graph para campanhas/portfólios que tenham o logo salvo como Data URL (base64).
 * Decodifica o base64 e serve como imagem binária HTTP válida para WhatsApp/Telegram/redes sociais.
 */
export default async function handler(req, res) {
  const rawSlug = Array.isArray(req.query?.slug) ? req.query.slug[0] : req.query?.slug || '';
  const type = Array.isArray(req.query?.type) ? req.query.type[0] : req.query?.type || 'campaign';
  const slug = String(rawSlug).replace(/^\/+|\/+$/g, '').trim();

  if (!slug) {
    return res.status(400).send('Missing slug');
  }

  try {
    const endpoint =
      type === 'portfolio'
        ? `${SUPABASE_URL}/rest/v1/hubtotens_resellers?slug=eq.${encodeURIComponent(slug)}&select=logo_url&limit=1`
        : `${SUPABASE_URL}/rest/v1/hubtotens_campaigns?slug=eq.${encodeURIComponent(
            slug
          )}&select=splash_image_url,games_config&limit=1`;

    const resp = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!resp.ok) {
      return res.status(404).send('Not found');
    }

    const rows = await resp.json();
    const record = Array.isArray(rows) ? rows[0] : null;
    if (!record) {
      return res.status(404).send('Not found');
    }

    const rawImg =
      type === 'portfolio'
        ? record.logo_url
        : record.games_config?.description_image_url || record.splash_image_url || '';

    if (!rawImg || typeof rawImg !== 'string') {
      return res.status(404).send('No image');
    }

    if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.redirect(302, rawImg);
    }

    const match = rawImg.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return res.status(404).send('Unsupported image format');
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Erro em /api/og-image:', err);
    return res.status(500).send('Internal error');
  }
}
