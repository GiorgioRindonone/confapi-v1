document.addEventListener('DOMContentLoaded', () => {
  const date = document.getElementById('edition-date');
  if (date) date.textContent = new Intl.DateTimeFormat('it-IT', { dateStyle: 'full', timeZone: 'Europe/Rome' }).format(new Date());
});

function renderFeaturedArticle() {
  const target = document.getElementById('featured-story');
  if (!target) return;
  const art = globalArticles.find(a => a.id === 'art-confapi-865') || globalArticles[0];
  if (!art) { target.innerHTML = '<h1 class="lead-headline">Notizie dalle imprese</h1><p>Nessun articolo pubblicato.</p>'; return; }
  const href = '/articolo/' + encodeURIComponent(art.id);
  target.innerHTML = `<div class="kicker">${escapeHtml(art.category)} · In primo piano</div>
    <h1 class="lead-headline"><a href="${href}" style="color:inherit">${escapeHtml(art.title)}</a></h1>
    <div class="lead-meta">${escapeHtml(art.publishDate)} · ${escapeHtml(art.author)} · ${escapeHtml(art.readTime)}</div>
    <a class="lead-image-wrap" href="${href}" style="display:block"><img src="${escapeHtml(art.featuredImage)}" alt="Ricostruzione nelle aree del cratere sismico del Lazio" style="width:100%;height:auto;max-height:340px;object-fit:cover"></a>
    <p class="lead-paragraph">${escapeHtml(art.summary)}</p>
    <a class="btn-editorial-navy" href="${href}">Leggi il bando completo →</a>
    <a href="#adesione" style="display:inline-block;margin:1rem 0 0;font-weight:700">Richiedi informazioni alla segreteria →</a>`;
}

function showAcquisitionSuccess(lead) {
  let panel = document.getElementById('acquisition-success');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'acquisition-success';
    panel.setAttribute('role','status');
    panel.tabIndex = -1;
    panel.style.cssText = 'margin:1.5rem 0;padding:1.5rem;background:#eef8f3;border-left:4px solid #16704a;line-height:1.6';
    document.getElementById('editorial-lead-form').before(panel);
  }
  panel.innerHTML = `<strong style="font-size:1.2rem;color:#125438">Richiesta ricevuta</strong><p>La richiesta di <strong>${escapeHtml(lead.companyName)}</strong> è stata registrata ed è disponibile alla segreteria.</p><p style="font-size:.85rem">Riferimento: ${escapeHtml(lead.id)}</p><a class="btn-editorial-navy" href="/admin/#richieste">Visualizza nell’area di gestione →</a>`;
  panel.focus();
  panel.scrollIntoView({block:'center',behavior:'smooth'});
}
