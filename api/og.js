const SUPABASE_URL = 'https://czympfukmtglynkuyybe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eW1wZnVrbXRnbHlua3V5eWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzODMxNTUsImV4cCI6MjAyMTk1OTE1NX0.eT73t8NPm5ON1QIpTMk36WU1uNRDyW250n5GDxmVEkc';

const DEFAULT_TITLE = 'Hub de Jogos para Totens | Experiências Interativas';
const DEFAULT_DESCRIPTION =
  'Participe dos jogos interativos e ativações promocionais no Hub de Totens!';

let cachedIndexHtml = null;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanDescription(text, fallback) {
  const cleaned = String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return fallback;
  return cleaned.length > 200 ? `${cleaned.slice(0, 197)}...` : cleaned;
}

function resolveOgImageUrl(rawUrl, origin, type, slug) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.startsWith('data:image/')) {
    return `${origin}/api/og-image?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`;
  }
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`;
  }
  return '';
}

function detectImageMime(url) {
  const lower = String(url || '').toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function fetchIndexHtml(origin) {
  if (cachedIndexHtml) return cachedIndexHtml;
  const resp = await fetch(`${origin}/index.html`, {
    headers: { 'User-Agent': 'HubTotens-OG-Renderer/1.0' },
  });
  if (!resp.ok) {
    throw new Error(`Falha ao carregar index.html (${resp.status})`);
  }
  const html = await resp.text();
  cachedIndexHtml = html;
  return html;
}

async function fetchCampaignMeta(slug) {
  const url = `${SUPABASE_URL}/rest/v1/hubtotens_campaigns?slug=eq.${encodeURIComponent(
    slug
  )}&select=slug,name,client_name,description,splash_image_url,games_config&limit=1`;

  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!resp.ok) return null;
  const rows = await resp.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function fetchPortfolioMeta(slug) {
  const url = `${SUPABASE_URL}/rest/v1/hubtotens_resellers?slug=eq.${encodeURIComponent(
    slug
  )}&select=slug,name,company_name,description,logo_url&limit=1`;

  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!resp.ok) return null;
  const rows = await resp.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function injectMetaTags(html, meta) {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeUrl = escapeHtml(meta.url);
  const safeSite = escapeHtml(meta.siteName);
  const safeImg = meta.imageUrl ? escapeHtml(meta.imageUrl) : '';
  const safeImgType = meta.imageUrl ? escapeHtml(detectImageMime(meta.imageUrl)) : '';

  const ogTags = [
    `<meta name="description" content="${safeDesc}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:site_name" content="${safeSite}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    safeImg ? `<meta property="og:image" content="${safeImg}" />` : '',
    safeImg ? `<meta property="og:image:secure_url" content="${safeImg}" />` : '',
    safeImg ? `<meta property="og:image:type" content="${safeImgType}" />` : '',
    safeImg ? `<meta property="og:image:alt" content="${safeTitle}" />` : '',
    safeImg ? `<link rel="image_src" href="${safeImg}" />` : '',
    `<meta name="twitter:card" content="${safeImg ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    safeImg ? `<meta name="twitter:image" content="${safeImg}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  // Remove tags OG/Twitter/description padrão existentes para evitar duplicidade
  let output = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']image_src["'][^>]*>\s*/gi, '');

  // Se houver imagem, atualiza também o favicon para o logo da campanha
  if (safeImg) {
    output = output.replace(
      /<link\s+rel=["']icon["'][^\n]*?\/>/i,
      `<link rel="icon" href="${safeImg}" />`
    );
  }

  return output.replace(/<\/head>/i, `    ${ogTags}\n  </head>`);
}

export default async function handler(req, res) {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'hubtotens.myappsdesign.com.br')
    .split(',')[0]
    .trim();
  const origin = `${proto}://${host}`;

  const rawSlug = Array.isArray(req.query?.slug) ? req.query.slug[0] : req.query?.slug || '';
  const type = Array.isArray(req.query?.type) ? req.query.type[0] : req.query?.type || 'campaign';
  const slug = String(rawSlug).replace(/^\/+|\/+$/g, '').trim();

  const canonicalPath = type === 'portfolio' ? `/portfolio/${slug}` : `/${slug}`;
  const canonicalUrl = `${origin}${canonicalPath}`;

  let meta = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: 'Hub de Totens',
    url: canonicalUrl,
    imageUrl: '',
  };

  try {
    const [baseHtml, record] = await Promise.all([
      fetchIndexHtml(origin),
      slug
        ? type === 'portfolio'
          ? fetchPortfolioMeta(slug)
          : fetchCampaignMeta(slug)
        : Promise.resolve(null),
    ]);

    if (record) {
      if (type === 'portfolio') {
        const displayName = record.company_name || record.name || 'Portfólio Interativo';
        meta = {
          title: `${displayName} | Portfólio de Jogos Interativos`,
          description: cleanDescription(
            record.description,
            `Conheça os jogos interativos para totens de ${displayName}.`
          ),
          siteName: displayName,
          url: canonicalUrl,
          imageUrl: resolveOgImageUrl(record.logo_url, origin, 'portfolio', slug),
        };
      } else {
        const campName = (record.name || '').trim();
        const clientName = (record.client_name || '').trim();
        const fullTitle =
          campName && clientName && campName.toLowerCase() !== clientName.toLowerCase()
            ? `${campName} — ${clientName}`
            : campName || clientName || DEFAULT_TITLE;

        // Prioriza o logo/banner descritivo da campanha; se não existir, usa a imagem de capa (splash)
        const rawLogo =
          record.games_config?.description_image_url ||
          record.splash_image_url ||
          '';

        meta = {
          title: fullTitle,
          description: cleanDescription(
            record.description,
            `Participe dos jogos interativos da campanha ${campName || fullTitle}${
              clientName && !fullTitle.includes(clientName) ? ` — ${clientName}` : ''
            }!`
          ),
          siteName: clientName || campName || 'Hub de Totens',
          url: canonicalUrl,
          imageUrl: resolveOgImageUrl(rawLogo, origin, 'campaign', slug),
        };
      }
    }

    const finalHtml = injectMetaTags(baseHtml, meta);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(finalHtml);
  } catch (err) {
    console.error('Erro ao renderizar OG tags:', err);
    // Fallback mínimo garantindo sempre HTML válido
    const fallbackHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
  </head>
  <body></body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallbackHtml);
  }
}
