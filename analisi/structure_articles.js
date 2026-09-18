const fs = require('fs');
const path = require('path');

const pages = JSON.parse(fs.readFileSync('analisi/data/all_pages.json', 'utf8'));

// Filter out actual news and article pages
const articlePages = pages.filter(p => {
  return p.url.includes('/news/') || 
         p.url.includes('/news-') || 
         p.url.includes('/archivio-news') ||
         p.url.match(/\/\d+-[a-z0-9-]+$/i);
});

console.log(`Found ${articlePages.length} specific article pages.`);

function determineCategory(url, title, text) {
  const low = (url + ' ' + title + ' ' + text).toLowerCase();
  if (low.includes('aniem') || low.includes('edilizia') || low.includes('appalt') || low.includes('lavori pubblici')) return 'Edilizia & Appalti';
  if (low.includes('sabatini') || low.includes('fisco') || low.includes('bando') || low.includes('voucher') || low.includes('fatturazion') || low.includes('inail')) return 'Finanza, Bandi & Fisco';
  if (low.includes('enfea') || low.includes('salute') || low.includes('sicurezza') || low.includes('ammortizzatori') || low.includes('ebm') || low.includes('sindac')) return 'Lavoro & Welfare';
  if (low.includes('europa') || low.includes('elss') || low.includes('parlamento europeo') || low.includes('internazional')) return 'Europa & Internazionalizzazione';
  if (low.includes('presidente') || low.includes('elezione') || low.includes('governo') || low.includes('conte') || low.includes('casasco') || low.includes('comunicato')) return 'Istituzioni & Relazioni';
  if (low.includes('digitale') || low.includes('innovazione') || low.includes('creativit')) return 'Innovazione & Digitale';
  return 'Attualità PMI';
}

function calculateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}

function cleanTitle(title, url) {
  let t = title || '';
  t = t.replace(' - Confapi Roma', '').replace('Confapi Roma', '').trim();
  if (!t || t === 'Home') {
    const slug = url.split('/').pop() || '';
    t = slug.replace(/^\d+-/, '').replace(/-/g, ' ');
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }
  return t;
}

const structuredArticles = [];

articlePages.forEach((p, idx) => {
  const title = cleanTitle(p.title, p.url);
  const category = determineCategory(p.url, title, p.fullText);
  const readTime = calculateReadingTime(p.fullText);
  
  // Extract date from text if available (e.g. DD/MM/YYYY or DD Month YYYY)
  const dateMatch = p.fullText.match(/(\d{1,2}\s+(?:Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre|\d{1,2})\s+\d{4})/i) ||
                    p.fullText.match(/(\d{2}\/\d{2}\/\d{4})/);
  const publishDate = dateMatch ? dateMatch[1] : '2024-03-15';

  structuredArticles.push({
    id: `art-${idx + 1}`,
    slug: (p.url.split('/').pop() || `articolo-${idx + 1}`).replace(/\.html?$/, ''),
    title: title,
    category: category,
    originalUrl: p.url,
    originalText: p.fullText,
    summary: p.description || p.fullText.substring(0, 220) + '...',
    readTime: `${readTime} min`,
    publishDate: publishDate,
    author: 'Redazione Confapi Roma',
    status: 'published',
    tags: [category.split(' ')[0], 'PMI', 'Roma', 'Imprese']
  });
});

fs.writeFileSync('analisi/data/structured_articles.json', JSON.stringify(structuredArticles, null, 2), 'utf-8');
console.log(`Saved ${structuredArticles.length} structured articles to analisi/data/structured_articles.json`);
