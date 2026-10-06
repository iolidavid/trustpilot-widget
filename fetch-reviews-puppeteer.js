/**
 * Trustpilot Scraper — asuntosdigitales.com
 * Obtiene las últimas reseñas de 5★ y las publica en GitHub Pages.
 *
 * CONFIGURACIÓN INICIAL (una sola vez):
 *   1. Ve a https://github.com/settings/tokens/new
 *   2. Nombre: "Trustpilot Widget", scope: "Contents" (read & write)
 *   3. Copia el token y pégalo en GITHUB_TOKEN abajo
 *
 * USO MANUAL:
 *   node fetch-reviews-puppeteer.js
 *
 * AUTOMÁTICO (Windows Task Scheduler corre este script cada semana):
 *   Ver setup-scheduler.ps1
 */

const puppeteer      = require('puppeteer-extra');
const StealthPlugin  = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs             = require('fs');
const path           = require('path');
const https          = require('https');

// ─────────────────────────────────────────────
//  CONFIGURACIÓN
// ─────────────────────────────────────────────
const DOMAIN       = 'asuntosdigitales.com';
const BASE_URL     = `https://www.trustpilot.com/review/${DOMAIN}`;
const OUTPUT       = 'reviews.json';
const MAX_REVIEWS  = 9;
const PAGES        = 2;

// GitHub Pages — datos del repositorio destino
const GITHUB_USER  = 'mauricio-dev-ad';
const GITHUB_REPO  = 'trustpilot-widget';

// El token NO se escribe aquí (el repo es público).
// Se toma de: 1) la variable de entorno GITHUB_TOKEN, o
//             2) el archivo local "github-token.txt" (ignorado por git).
function loadToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) {
    return process.env.GITHUB_TOKEN.trim();
  }
  try {
    const p = path.join(__dirname, 'github-token.txt');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  } catch { /* sin archivo de token */ }
  return '';
}
const GITHUB_TOKEN = loadToken();
// ─────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseReview(r) {
  const stars   = typeof r.rating === 'number' ? r.rating : (r.rating?.stars ?? 5);
  const pubDate = r.dates?.publishedDate || null;
  const expDate = r.dates?.experiencedDate || null;
  const rawDate = pubDate || expDate || null;
  const date    = rawDate
    ? new Date(rawDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    : '';
  const vLevel  = r.labels?.verification?.verificationLevel || '';
  return {
    id:          r.id || '',
    stars,
    title:       r.title || '',
    text:        r.text  || r.body || '',
    author:      r.consumer?.displayName || 'Anónimo',
    country:     r.consumer?.countryCode || '',
    reviewCount: typeof r.consumer?.numberOfReviews === 'number' ? r.consumer.numberOfReviews : 0,
    date,
    publishedISO:  pubDate,   // fecha de publicación (ISO) → para mostrar arriba
    experienceISO: expDate,   // fecha de experiencia (ISO) → para mostrar abajo
    verified:      ['confirmed', 'invited'].includes(vLevel),
    publishedDate: pubDate,   // usado solo para ordenar
  };
}

async function pushToGitHub(content) {
  if (!GITHUB_TOKEN) {
    console.log('  (sin GITHUB_TOKEN — solo guardado local)');
    return false;
  }
  const encoded = Buffer.from(content).toString('base64');
  const apiUrl  = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/reviews.json`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent':    'trustpilot-widget-bot',
    'Content-Type':  'application/json',
    'Accept':        'application/vnd.github+json',
  };

  // Obtener SHA del archivo actual (necesario para actualizarlo)
  let sha;
  try {
    const getRes = await new Promise((resolve, reject) => {
      https.get(apiUrl, { headers }, res => {
        let b = ''; res.on('data', c => b += c);
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }).on('error', reject);
    });
    if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;
  } catch { /* archivo nuevo */ }

  return new Promise((resolve) => {
    const body = JSON.stringify({
      message: `chore: update reviews ${new Date().toISOString().slice(0, 10)}`,
      content: encoded,
      ...(sha ? { sha } : {}),
    });
    const req = https.request(apiUrl, {
      method:  'PUT',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => {
        if ([200, 201].includes(res.statusCode)) {
          console.log(`  ✓ GitHub Pages actualizado → https://${GITHUB_USER}.github.io/${GITHUB_REPO}/reviews.json`);
          resolve(true);
        } else {
          console.error(`  ✗ GitHub error ${res.statusCode}: ${b.slice(0, 200)}`);
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.error('  ✗ Error GitHub:', e.message); resolve(false); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\n=== Trustpilot Scraper — Asuntos Digitales ===');
  console.log(`    ${new Date().toLocaleString('es-ES')}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-419,es;q=0.9' });

  // Paso 1: cargar la página ordenada por más recientes (sort=recency)
  console.log('  [1/2] Cargando reseñas más recientes...');
  await page.goto(`${BASE_URL}?languages=all&sort=recency`, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(2500);

  const page1Data = await page.evaluate(() => {
    const el = document.getElementById('__NEXT_DATA__');
    return el ? JSON.parse(el.textContent) : null;
  });
  if (!page1Data) {
    console.error('  ✗ No se pudo leer __NEXT_DATA__');
    await browser.close();
    process.exit(1);
  }

  const buildId = page1Data.buildId;
  const bu = page1Data?.props?.pageProps?.businessUnit || {};
  const businessInfo = {
    name:         bu.displayName  || DOMAIN,
    score:        bu.trustScore   || 0,
    stars:        bu.stars        || 0,
    totalReviews: typeof bu.numberOfReviews === 'number' ? bu.numberOfReviews : (bu.numberOfReviews?.total || 0),
    url:          BASE_URL,
    fetchedAt:    new Date().toISOString(),
  };

  console.log(`\n  Negocio:       ${businessInfo.name}`);
  console.log(`  TrustScore:    ${businessInfo.score} (${businessInfo.stars}★)`);
  console.log(`  Total reseñas: ${businessInfo.totalReviews}\n`);

  // Paso 2: leer reseñas directamente del SSR (página 1 = las más recientes)
  console.log('  [2/2] Extrayendo reseñas del SSR...');
  let allReviews = (page1Data?.props?.pageProps?.reviews || []).map(parseReview);
  console.log(`    SSR página 1: ${allReviews.length} reseñas`);

  // Si el SSR trae pocas, completar con _next/data página 2 (sort=recency)
  if (allReviews.length < MAX_REVIEWS && buildId) {
    const nextDataBase = `https://www.trustpilot.com/_next/data/${buildId}/review/${DOMAIN}.json`;
    for (let p = 2; p <= PAGES + 1 && allReviews.length < MAX_REVIEWS; p++) {
      await sleep(900 + Math.random() * 600);
      const raw = await page.evaluate(async (url) => {
        const res = await fetch(url, { headers: { 'x-nextjs-data': '1', 'Accept': 'application/json' } });
        return res.ok ? res.json() : null;
      }, `${nextDataBase}?languages=all&sort=recency&page=${p}&businessUnit=${DOMAIN}`);
      const more = (raw?.pageProps?.reviews || []).map(parseReview);
      allReviews.push(...more);
      console.log(`    _next/data página ${p}: ${more.length} reseñas | Total: ${allReviews.length}`);
      if (more.length === 0) break;
    }
  }

  await browser.close();

  // Ordenar más recientes primero y tomar las primeras 9
  const latestReviews = allReviews
    .sort((a, b) => {
      if (!a.publishedDate && !b.publishedDate) return 0;
      if (!a.publishedDate) return 1;
      if (!b.publishedDate) return -1;
      return new Date(b.publishedDate) - new Date(a.publishedDate);
    })
    .slice(0, MAX_REVIEWS)
    .map(r => { delete r.publishedDate; return r; });

  console.log(`\n  Últimas ${latestReviews.length} reseñas capturadas`);

  const output = {
    business: businessInfo,
    count:    latestReviews.length,
    reviews:  latestReviews,
  };
  const jsonContent = JSON.stringify(output, null, 2);
  fs.writeFileSync(OUTPUT, jsonContent, 'utf8');
  console.log(`  ✓ Guardado: ${OUTPUT}`);

  // Push a GitHub Pages
  console.log('\n  Publicando en GitHub Pages...');
  const publicado = await pushToGitHub(jsonContent);

  // Preview
  console.log('\n--- Últimas 3 reseñas capturadas ---');
  latestReviews.slice(0, 3).forEach((r, i) => {
    console.log(`\n[${i+1}] ${r.stars}★ — ${r.author} (${r.date})${r.verified ? ' ✓' : ''}`);
    console.log(`    "${r.title}"`);
    console.log(`    ${(r.text || '').slice(0, 100)}`);
  });

  if (!publicado) {
    console.error('\n[ERROR] NO se publico en GitHub Pages: el widget seguira mostrando las resenas anteriores.');
    console.error('  Revisa el token (github-token.txt o GITHUB_TOKEN) y que el repo exista.');
    process.exit(1);
  }

  console.log('\n✓ Completado.\n');
}

main().catch(err => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
