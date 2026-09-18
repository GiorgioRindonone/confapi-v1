const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.confapiroma.it';
const OUTPUT_DIR = path.join(__dirname, 'data');
const ASSETS_DIR = path.join(__dirname, 'assets');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(ASSETS_DIR, 'logos'), { recursive: true });
fs.mkdirSync(path.join(ASSETS_DIR, 'images'), { recursive: true });
fs.mkdirSync(path.join(ASSETS_DIR, 'css'), { recursive: true });

async function getSitemapUrls() {
  const urls = new Set();
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });
    const xml = await res.text();
    const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      urls.add(match[1].trim());
    }
  } catch (err) {
    console.error('Error fetching sitemap:', err.message);
  }

  // Common main routes
  const manual = [
    'https://www.confapiroma.it/',
    'https://www.confapiroma.it/index.php/chi-siamo',
    'https://www.confapiroma.it/index.php/chi-siamo/la-storia',
    'https://www.confapiroma.it/index.php/chi-siamo/la-governance/il-presidente',
    'https://www.confapiroma.it/index.php/chi-siamo/lo-statuto-confapi',
    'https://www.confapiroma.it/index.php/sistema-confapi',
    'https://www.confapiroma.it/index.php/sistema-confapi/unioni-di-categoria',
    'https://www.confapiroma.it/index.php/sistema-confapi/federazioni-regionali',
    'https://www.confapiroma.it/index.php/sistema-confapi/associazioni-territoriali',
    'https://www.confapiroma.it/index.php/sistema-confapi/associazioni-di-categoria',
    'https://www.confapiroma.it/index.php/sistema-confapi/enti-bilaterali',
    'https://www.confapiroma.it/index.php/sistema-confapi/video',
    'https://www.confapiroma.it/index.php/i-servizi',
    'https://www.confapiroma.it/index.php/i-servizi/relazioni-sindacali-e-industriali',
    'https://www.confapiroma.it/index.php/i-servizi/internazionalizzazione',
    'https://www.confapiroma.it/index.php/i-servizi/internazionalizzazione/programmi-e-progetti',
    'https://www.confapiroma.it/index.php/i-servizi/credito-e-fisco',
    'https://www.confapiroma.it/index.php/i-servizi/formazione',
    'https://www.confapiroma.it/index.php/i-servizi/sicurezza-e-qualita',
    'https://www.confapiroma.it/index.php/i-servizi/ambiente-e-territorio',
    'https://www.confapiroma.it/index.php/come-associarsi',
    'https://www.confapiroma.it/index.php/convenzioni',
    'https://www.confapiroma.it/index.php/convenzioni/leonardo-international-investigation',
    'https://www.confapiroma.it/index.php/convenzioni/unipolsai',
    'https://www.confapiroma.it/index.php/convenzioni/italgas',
    'https://www.confapiroma.it/index.php/convenzioni/tim',
    'https://www.confapiroma.it/index.php/convenzioni/enel-energia',
    'https://www.confapiroma.it/index.php/rassegna-stampa',
    'https://www.confapiroma.it/index.php/comunicati-stampa',
    'https://www.confapiroma.it/index.php/eventi-e-news',
    'https://www.confapiroma.it/index.php/contatti',
    'https://www.confapiroma.it/index.php/privacy-policy'
  ];
  manual.forEach(u => urls.add(u));
  return Array.from(urls);
}

function cleanHtmlText(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html, name) {
  const match = html.match(new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
                html.match(new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i')) ||
                html.match(new RegExp(`<meta\\s+[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'));
  return match ? match[1] : '';
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].replace(' - Confapi Roma', '').trim() : '';
}

function extractHeadings(html, tag) {
  const res = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = cleanHtmlText(match[1]);
    if (text && text.length > 1) res.push(text);
  }
  return res;
}

function extractLinksAndImages(html, pageUrl) {
  const links = new Set();
  const images = new Set();
  
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];
    if (!href.startsWith('#') && !href.startsWith('javascript:')) {
      try {
        const fullUrl = new URL(href, pageUrl).toString();
        if (fullUrl.includes('confapiroma.it')) {
          links.add(fullUrl.split('#')[0]);
        }
      } catch (e) {}
    }
  }

  const imgRegex = /src=["']([^"']+)["']/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    try {
      const fullImg = new URL(src, pageUrl).toString();
      images.add(fullImg);
    } catch (e) {}
  }

  return { links: Array.from(links), images: Array.from(images) };
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return { url, ok: false, status: res.status };
    const html = await res.text();
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return { url, ok: false, status: 'not-html' };
    }

    const { links, images } = extractLinksAndImages(html, url);
    const title = extractTitle(html);
    const description = extractMeta(html, 'description') || extractMeta(html, 'og:description');
    const keywords = extractMeta(html, 'keywords');
    const h1 = extractHeadings(html, 'h1');
    const h2 = extractHeadings(html, 'h2');
    const h3 = extractHeadings(html, 'h3');
    const fullText = cleanHtmlText(html);

    // Identify if it's an article/news post
    const isArticle = url.includes('/rassegna-stampa/') || 
                      url.includes('/comunicati-stampa/') || 
                      url.includes('/eventi-e-news/') ||
                      url.includes('/notizie/') ||
                      url.includes('/primo-piano/') ||
                      /\d{4}[-/]\d{2}/.test(url);

    return {
      url,
      ok: true,
      status: res.status,
      title,
      description,
      keywords,
      h1,
      h2,
      h3,
      links,
      images,
      fullText,
      textSample: fullText.substring(0, 1000),
      isArticle
    };
  } catch (err) {
    return { url, ok: false, error: err.message };
  }
}

async function main() {
  console.log('--- STEP 1: Fetching initial URLs ---');
  const initialUrls = await getSitemapUrls();
  console.log(`Found ${initialUrls.length} URLs to crawl.`);

  const crawled = new Map();
  const allDiscoveredImages = new Set();
  const batchSize = 10;

  for (let i = 0; i < initialUrls.length; i += batchSize) {
    const batch = initialUrls.slice(i, i + batchSize);
    console.log(`Crawling batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(initialUrls.length / batchSize)} (${batch.length} URLs)...`);
    const results = await Promise.all(batch.map(u => fetchPage(u)));
    for (const r of results) {
      if (r.ok) {
        crawled.set(r.url, r);
        r.images.forEach(img => allDiscoveredImages.add(img));
      }
    }
  }

  console.log(`\nCrawling completed. Successfully parsed ${crawled.size} pages.`);
  const pagesList = Array.from(crawled.values());

  // Save all pages
  fs.writeFileSync(path.join(OUTPUT_DIR, 'all_pages.json'), JSON.stringify(pagesList, null, 2), 'utf-8');

  // Filter articles and categories
  const articles = pagesList.filter(p => p.isArticle || p.url.split('/').length > 5 || p.h1.length > 0 && (p.url.includes('/notiz') || p.url.includes('/comunicat') || p.url.includes('/stampa')));
  console.log(`Detected ${articles.length} potential articles/news posts.`);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8');

  // Save images list
  fs.writeFileSync(path.join(OUTPUT_DIR, 'images_list.json'), JSON.stringify(Array.from(allDiscoveredImages), null, 2), 'utf-8');

  // Download key logo assets
  console.log('\n--- STEP 2: Downloading Brand Assets ---');
  const brandLogos = [
    'https://www.confapiroma.it/images/confapi/logo/logo-confapi_1000.png',
    'https://www.confapiroma.it/images/confapi/logo/logo-confapi_800.png',
    'https://www.confapiroma.it/templates/shaper_finance/images/favicon.ico',
    'https://www.confapiroma.it/templates/shaper_finance/css/presets/preset7.css',
    'https://www.confapiroma.it/templates/shaper_finance/css/template.css'
  ];

  for (const assetUrl of brandLogos) {
    try {
      const res = await fetch(assetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const parsed = new URL(assetUrl);
        const baseName = path.basename(parsed.pathname);
        const targetDir = baseName.endsWith('.css') ? path.join(ASSETS_DIR, 'css') : path.join(ASSETS_DIR, 'logos');
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(path.join(targetDir, baseName), buf);
        console.log(`Downloaded: ${baseName} (${buf.length} bytes)`);
      }
    } catch (e) {
      console.log(`Error downloading ${assetUrl}:`, e.message);
    }
  }

  console.log('\n--- EXTRACTION COMPLETE! Data written to analisi/data/ ---');
}

main().catch(err => {
  console.error('Fatal error:', err);
});
