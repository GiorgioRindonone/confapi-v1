const fs = require('fs');
const pages = ['index', 'chi-siamo', 'convenzioni', 'come-associarsi', 'articolo'];
for (const page of pages) {
  const file = `public/${page}.html`;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace('</head>', '<link rel="stylesheet" href="/css/presentation-fixes.css">\n<script src="/js/presentation-fixes.js" defer></script>\n</head>');
  html = html.replace(/href="(\/?#)(servizi|finanza|fondapi|welfare)"/g, (_, prefix, section) => `href="${prefix}${section === 'finanza' ? 'notiziario' : section === 'servizi' ? 'unioni' : 'sistema-confapi'}"`);
  html = html.replace(/<label([^>]*)>([^<]*)<\/label>(\s*<(?:input|select)[^>]*id="([^"]+)")/g, '<label$1 for="$4">$2</label>$3');
  html = html.replace(/Formazione FONDAPI/g, 'Formazione FAPI').replace(/Formazione Finanziata FONDAPI/g, 'Formazione Finanziata FAPI').replace(/formazione continua FONDAPI/g, 'formazione continua');
  if (page === 'index') {
    html = html.replace('<span>Sabato, 22 Agosto 2026</span>', '<span id="edition-date"></span>');
    html = html.replace('href="/admin" style="font-size: 0.75rem; font-weight: 700; color: var(--confapi-blue);">Tutti gli Articoli', 'href="#notiziario" onclick="showAllArticles(event)" style="font-size: 0.75rem; font-weight: 700; color: var(--confapi-blue);">Tutti gli Articoli');
    html = html.replace('let globalArticles = [];', 'let globalArticles = [];\n    let feedLimit = 8;\n    function showAllArticles(event) { event.preventDefault(); feedLimit = globalArticles.length; document.querySelector(\'[oninput="filterFeed(this.value)"]\').value = ""; renderFeed(globalArticles); document.getElementById("notiziario").scrollIntoView(); }');
    html = html.replace('articles.slice(0, 8)', 'articles.slice(0, feedLimit)');
    html = html.replace('CIRCOLARE N. ${78 - idx}/2026 •', '${escapeHtml(art.category || "Archivio")} •');
    html = html.replace(/<h1 class="lead-headline"[^>]*>[\s\S]*?<\/h1>/, '<h1 class="lead-headline">Notizie, servizi e rappresentanza per le imprese di Roma e del Lazio</h1>');
    html = html.replace(/<p class="lead-paragraph">[\s\S]*?<\/p>/, '<p class="lead-paragraph">Consulta le pubblicazioni, scopri le unioni di categoria e accedi ai contatti dell’associazione. Un punto di accesso alle informazioni e ai servizi per la tua impresa.</p>');
    html = html.replace(/<div class="lead-meta">[\s\S]*?<\/div>/, '<div class="lead-meta">CONFAPI ROMA E LAZIO • Informazione e servizi alle imprese</div>');
    html = html.replace(/<div class="lead-image-caption">[\s\S]*?<\/div>/, '<div class="lead-image-caption">Immagine illustrativa del settore industriale.</div>');
    html = html.replace('oninput="filterFeed(this.value)"', 'aria-label="Cerca articoli" oninput="filterFeed(this.value)"');
    html = html.replace("console.error('Error fetching articles:', e);", "document.getElementById('editorial-feed-container').textContent = 'Notizie non disponibili. Ricarica la pagina per riprovare.';");
    html = html.replace('Richiesta di adesione inviata con successo! La Segreteria di Confapi Roma ti contatterà entro 24 ore.', 'Richiesta salvata in questa anteprima locale. Nessuna email è stata inviata.');
  }
  if (page === 'come-associarsi') {
    html = html.replace('Stima Risparmio Annuo', 'Il profilo della tua impresa').replace('Quanto Risparmia la Tua Impresa con Confapi?', 'Da dove iniziamo?');
    html = html.replace('Seleziona la dimensione del tuo organico per calcolare i vantaggi su formazione a costo zero FONDAPI e tariffe CCNL:', 'Seleziona il numero di dipendenti per precompilare la richiesta. Servizi, quote e condizioni saranno definiti con la segreteria.');
    html = html.replace('Valore Medio di Risparmio Annuo', 'Dimensione selezionata').replace('€ 3.200 / anno', '1–5 dipendenti').replace('Include corsi sicurezza 81/08 gratuiti e welfare contrattuale.', 'Il valore dei servizi dipende dalle esigenze della tua impresa.');
    html = html.replace('`€ ${amount.toLocaleString(\'it-IT\')} / anno`', '` ${tier} dipendenti`');
    html = html.replace(/<div class="calc-pill-opt([^"]*)" onclick="([^"]*)">([^<]*)<\/div>/g, '<button type="button" class="calc-pill-opt$1" onclick="$2">$3</button>');
    html = html.replace('Scheda associativa trasmessa con successo! La Segreteria Generale di Confapi Roma ti contatterà per completare la procedura.', 'Scheda salvata in questa anteprima locale. Nessuna email è stata inviata.');
  }
  if (page === 'articolo') {
    html = html.replace('Recupero del documento in tempo reale dal database Node.js...', 'Caricamento del documento...');
    html = html.replace('/api/articles?category=', '/api/articles?status=published&category=');
    html = html.replace("document.getElementById('art-title').innerText = 'Errore di connessione';", "document.getElementById('art-title').innerText = 'Errore di connessione'; document.getElementById('art-body').textContent = 'Ricarica la pagina per riprovare.'; document.getElementById('related-articles-list').textContent = 'Contenuti non disponibili.';");
  }
  fs.writeFileSync(file, html);
}
