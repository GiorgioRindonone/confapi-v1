let allPublishedArticles = [];
let currentCategory = 'Tutte';
let selectedEmployees = '1-5';
let estimatedSavings = 2800;
let selectedSector = 'Metalmeccanica & Manifattura';

// DOM Elements
const newsGridContainer = document.getElementById('news-grid-container');
const readerModal = document.getElementById('reader-modal');
const readerCategory = document.getElementById('reader-category');
const readerMeta = document.getElementById('reader-meta');
const readerBodyContent = document.getElementById('reader-body-content');

// Wizard Elements
const calcSavingsEl = document.getElementById('calc-savings');
const membershipForm = document.getElementById('membership-form');

document.addEventListener('DOMContentLoaded', () => {
  fetchNews();
  setupWizard();
});

async function fetchNews() {
  try {
    const res = await fetch('/api/articles?status=published');
    const json = await res.json();
    if (json.success) {
      allPublishedArticles = json.data;
      renderNewsGrid();
    }
  } catch (err) {
    newsGridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red; padding: 2rem;">Errore di caricamento delle notizie dal backend Node.js.</div>`;
  }
}

function renderNewsGrid() {
  let filtered = allPublishedArticles;
  if (currentCategory !== 'Tutte') {
    filtered = allPublishedArticles.filter(a => a.category === currentCategory);
  }

  if (filtered.length === 0) {
    newsGridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748B;">Nessun articolo trovato in questa categoria.</div>`;
    return;
  }

  newsGridContainer.innerHTML = filtered.slice(0, 12).map(art => {
    return `
      <article class="news-card" onclick="openReader('${art.id}')">
        <img src="${art.featuredImage}" alt="${escapeHtml(art.title)}" class="news-card-img" onerror="this.src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'">
        <div class="news-card-body">
          <div class="news-meta">
            <span class="badge-pill badge-royal" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">${escapeHtml(art.category)}</span>
            <span>⏱️ ${art.readTime || '3 min'}</span>
          </div>
          <h3>${escapeHtml(art.title)}</h3>
          <p>${escapeHtml(art.summary || '')}</p>
          <div class="news-card-footer">
            <span>📅 ${escapeHtml(art.publishDate || '')}</span>
            <span>Leggi Approfondimento →</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

window.filterNews = function(category) {
  currentCategory = category;
  document.querySelectorAll('.filter-pill').forEach(btn => {
    if (btn.innerText.includes(category) || (category === 'Tutte' && btn.innerText.includes('Tutte'))) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderNewsGrid();
};

window.openReader = function(id) {
  const art = allPublishedArticles.find(a => a.id === id);
  if (!art) return;

  readerCategory.innerText = art.category;
  readerMeta.innerText = `📅 ${art.publishDate || ''} • ✍️ ${art.author || 'Confapi Roma'} • ⏱️ ${art.readTime || '3 min'} • 👁️ ${art.views || 1} visualizzazioni`;

  let parsed = art.content || '';
  if (typeof marked !== 'undefined') {
    parsed = marked.parse(parsed);
    parsed = parsed.replace(/<blockquote>\s*<p>\[!NOTE\]/g, '<blockquote class="alert-note"><p><strong>📘 NOTA OPERATIVA:</strong>');
    parsed = parsed.replace(/<blockquote>\s*<p>\[!IMPORTANT\]/g, '<blockquote class="alert-important"><p><strong>⚠️ IMPORTANTE:</strong>');
  }
  readerBodyContent.innerHTML = parsed;
  readerModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeReader = function() {
  readerModal.classList.remove('active');
  document.body.style.overflow = 'auto';
};

// Wizard Logic
function setupWizard() {
  if (membershipForm) {
    membershipForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-lead');
      btn.disabled = true;
      btn.innerText = 'Invio in corso...';

      const payload = {
        companyName: document.getElementById('lead-company').value,
        contactPerson: document.getElementById('lead-contact').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        employeesCount: selectedEmployees,
        sector: selectedSector,
        servicesOfInterest: ['Consulenza Fiscale', 'CCNL PMI', 'FONDAPI']
      };

      try {
        const res = await fetch('/api/membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          alert('Grazie per la richiesta! La Segreteria di Confapi Roma ti contatterà entro 24 ore lavorative.');
          membershipForm.reset();
          goToStep(1);
        } else {
          alert('Errore: ' + json.message);
        }
      } catch (err) {
        alert('Errore di connessione al server.');
      } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Invia Richiesta e Richiedi Contatto Ufficiale';
      }
    });
  }
}

window.selectEmployees = function(el, count, savings) {
  document.querySelectorAll('#wizard-step-1 .selectable-box').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedEmployees = count;
  estimatedSavings = savings;
  calcSavingsEl.innerText = `€ ${savings.toLocaleString('it-IT')}`;
};

window.selectSector = function(el, sector) {
  document.querySelectorAll('#wizard-step-2 .selectable-box').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedSector = sector;
};

window.goToStep = function(step) {
  // Update indicator
  document.querySelectorAll('.step-indicator').forEach((ind, idx) => {
    if (idx + 1 === step) {
      ind.classList.add('active');
    } else {
      ind.classList.remove('active');
    }
  });

  // Update content
  document.querySelectorAll('.wizard-step-content').forEach((c, idx) => {
    if (idx + 1 === step) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
};

window.handleContactSubmit = function(e) {
  e.preventDefault();
  alert('Grazie per il tuo messaggio. La segreteria di Confapi Roma ti risponderà al più presto.');
  e.target.reset();
};

window.handleNewsletter = function(e) {
  e.preventDefault();
  alert('Iscrizione alla newsletter completata con successo!');
  e.target.reset();
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
