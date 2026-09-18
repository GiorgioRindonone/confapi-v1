let currentArticles = [];
let editingArticleId = null;

// DOM Elements
const articlesTableBody = document.getElementById('articles-table-body');
const leadsTableBody = document.getElementById('leads-table-body');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const filterSort = document.getElementById('filter-sort');

const statTotalArticles = document.getElementById('stat-total-articles');
const statPublishedArticles = document.getElementById('stat-published-articles');
const statCategories = document.getElementById('stat-categories');
const statLeads = document.getElementById('stat-leads');

// Modal Elements
const editorModal = document.getElementById('editor-modal');
const modalEditorTitle = document.getElementById('modal-editor-title');
const editTitle = document.getElementById('edit-title');
const editCategory = document.getElementById('edit-category');
const editAuthor = document.getElementById('edit-author');
const editStatus = document.getElementById('edit-status');
const editContent = document.getElementById('edit-content');
const editPreview = document.getElementById('edit-preview');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const readTimeEst = document.getElementById('read-time-est');

const btnNewArticle = document.getElementById('btn-new-article');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const btnSaveArticle = document.getElementById('btn-save-article');

// Tabs
const tabArticlesBtn = document.getElementById('tab-articles-btn');
const tabLeadsBtn = document.getElementById('tab-leads-btn');
const sectionArticles = document.getElementById('section-articles');
const sectionLeads = document.getElementById('section-leads');

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadArticles();
  loadLeads();
  setupEventListeners();
  if (location.hash === '#richieste') tabLeadsBtn.click();
  window.addEventListener('focus', () => { loadStats(); if (sectionLeads.style.display !== 'none') loadLeads(); });
});

function setupEventListeners() {
  // Filters
  searchInput.addEventListener('input', debounce(loadArticles, 250));
  filterCategory.addEventListener('change', loadArticles);
  filterStatus.addEventListener('change', loadArticles);
  filterSort.addEventListener('change', loadArticles);

  // Tabs
  tabArticlesBtn.addEventListener('click', () => {
    tabArticlesBtn.classList.add('active');
    tabLeadsBtn.classList.remove('active');
    sectionArticles.style.display = 'block';
    sectionLeads.style.display = 'none';
  });

  tabLeadsBtn.addEventListener('click', () => {
    tabLeadsBtn.classList.add('active');
    tabArticlesBtn.classList.remove('active');
    sectionArticles.style.display = 'none';
    sectionLeads.style.display = 'block';
    loadLeads();
    loadStats();
  });

  // Modal actions
  btnNewArticle.addEventListener('click', () => openEditor());
  btnCloseModal.addEventListener('click', closeEditor);
  btnCancelEdit.addEventListener('click', closeEditor);
  btnSaveArticle.addEventListener('click', saveArticle);

  // Live markdown preview
  editContent.addEventListener('input', updateMarkdownPreview);
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    if (json.success) {
      const { totalArticles, publishedArticles, categoryDistribution, totalLeads } = json.data;
      statTotalArticles.innerText = totalArticles;
      statPublishedArticles.innerText = publishedArticles;
      statCategories.innerText = Object.keys(categoryDistribution).length;
      statLeads.innerText = totalLeads;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadArticles() {
  articlesTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Caricamento articoli...</td></tr>`;
  
  const search = encodeURIComponent(searchInput.value.trim());
  const category = encodeURIComponent(filterCategory.value);
  const status = encodeURIComponent(filterStatus.value);
  const sort = encodeURIComponent(filterSort.value);

  try {
    const res = await fetch(`/api/articles?search=${search}&category=${category}&status=${status}&sort=${sort}`);
    const json = await res.json();
    
    if (json.success) {
      currentArticles = json.data;
      renderArticlesTable(currentArticles);
    }
  } catch (err) {
    articlesTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red; padding: 2rem;">Errore durante il caricamento degli articoli.</td></tr>`;
  }
}

function renderArticlesTable(articles) {
  if (!articles || articles.length === 0) {
    articlesTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #64748B;">Nessun articolo trovato con i filtri selezionati.</td></tr>`;
    return;
  }

  articlesTableBody.innerHTML = articles.map(a => {
    const isPub = a.status === 'published';
    const statusBadge = isPub 
      ? `<span class="badge badge-published">● Pubblicato</span>`
      : `<span class="badge badge-draft">○ Bozza</span>`;

    return `
      <tr>
        <td><strong style="color: #64748B;">#${a.id.replace('art-', '')}</strong></td>
        <td class="art-title-cell">
          <div class="art-title">${escapeHtml(a.title)}</div>
          <div class="art-excerpt">${escapeHtml(a.summary || '')}</div>
        </td>
        <td><span class="badge badge-cat">${escapeHtml(a.category)}</span></td>
        <td style="white-space: nowrap; color: #64748B;">${escapeHtml(a.publishDate || '')}</td>
        <td style="color: #64748B;">⏱️ ${a.readTime || '3 min'}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn btn-outline btn-sm" style="color: #1D4ED8; border-color: #BFDBFE;" onclick="editArticle('${a.id}')">✏️ Modifica</button>
            <button class="btn btn-danger btn-sm" onclick="deleteArticle('${a.id}', '${escapeHtml(a.title)}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadLeads() {
  try {
    const res = await fetch('/api/membership');
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      leadsTableBody.innerHTML = json.data.map(l => `
        <tr>
          <td style="white-space: nowrap;">${new Date(l.submittedAt).toLocaleDateString('it-IT')}</td>
          <td><strong>${escapeHtml(l.companyName)}</strong></td>
          <td>${escapeHtml(l.contactPerson || '-')}</td>
          <td>
            <div>📧 <a href="mailto:${escapeHtml(l.email)}">${escapeHtml(l.email)}</a></div>
            <div style="font-size: 0.8rem; color: #64748B;">📞 ${escapeHtml(l.phone || 'Non indicato')}</div>
          </td>
          <td>${escapeHtml(l.sector)}<div style="font-size:.8rem;color:#64748b">Dipendenti: ${escapeHtml(l.employeesCount)}</div></td>
          <td><span class="badge badge-cat">${escapeHtml(l.servicesOfInterest.map(s => ({'5.0':'Finanza agevolata e bandi','ccnl':'Contratti CCNL e relazioni sindacali','fondapi':'Formazione finanziata','aniem':'Edilizia e appalti','welfare':'Welfare sanitario'}[s] || s)).join(', '))}</span></td>
          <td><span class="badge badge-published">${escapeHtml(l.status)}</span></td>
        </tr>
      `).join('');
    } else {
      leadsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #64748B;">Nessuna richiesta di adesione pervenuta al momento.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading leads:', err);
  }
}

// Editor Modal Management
function openEditor(article = null) {
  if (article) {
    editingArticleId = article.id;
    modalEditorTitle.innerText = `✏️ Modifica Articolo [${article.id}]`;
    editTitle.value = article.title || '';
    editCategory.value = article.category || 'Attualità PMI';
    editAuthor.value = article.author || 'Redazione Confapi Roma';
    editStatus.value = article.status || 'published';
    editContent.value = article.content || '';
    document.getElementById('edit-summary').value = article.summary || '';
  } else {
    editingArticleId = null;
    document.getElementById('edit-summary').value = '';
    modalEditorTitle.innerText = '➕ Crea Nuovo Articolo Corporate';
    editTitle.value = '';
    editCategory.value = 'Finanza, Bandi & Fisco';
    editAuthor.value = 'Redazione Confapi Roma';
    editStatus.value = 'published';
    editContent.value = `# Titolo del Nuovo Articolo

> **Area Tematica**: Finanza, Bandi & Fisco  
> **A cura di**: Dipartimento Studi & Relazioni Istituzionali Confapi Roma

---

## 📌 Sintesi Esecutiva
Inserisci qui un riassunto dei benefici principali per le PMI associate.

---

## 🔍 Quadro Normativo & Opportunità
Dettaglio dei requisiti, agevolazioni fiscali e scadenze...

### Punti Chiave per l'Azienda:
- **Opportunità di Finanziamento**: ...
- **Sgravi Contributivi**: ...

> [!NOTE]
> Gli uffici territoriali di Confapi Roma forniscono assistenza completa per la compilazione della domanda.

---

## 🛠️ Come Richiedere Assistenza
Contatta la segreteria tecnica all'indirizzo [segreteria@confapiroma.it](mailto:segreteria@confapiroma.it).`;
  }

  updateMarkdownPreview();
  editorModal.classList.add('active');
}

function closeEditor() {
  editorModal.classList.remove('active');
  editingArticleId = null;
}

function updateMarkdownPreview() {
  const text = editContent.value;
  
  // Update counters
  const charLength = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estMinutes = Math.max(1, Math.ceil(words / 200));

  charCount.innerText = `${charLength} caratteri`;
  wordCount.innerText = `${words} parole`;
  readTimeEst.innerText = `~${estMinutes} min lettura`;

  // Render markdown with marked.js
  if (typeof marked !== 'undefined') {
    let parsedHtml = marked.parse(text);
    // Support GitHub Alert Callouts
    parsedHtml = parsedHtml.replace(/<blockquote>\s*<p>\[!NOTE\]/g, '<blockquote class="alert-note"><p><strong>📘 NOTA OPERATIVA:</strong>');
    parsedHtml = parsedHtml.replace(/<blockquote>\s*<p>\[!IMPORTANT\]/g, '<blockquote class="alert-important"><p><strong>⚠️ IMPORTANTE:</strong>');
    parsedHtml = parsedHtml.replace(/<blockquote>\s*<p>\[!TIP\]/g, '<blockquote class="alert-tip"><p><strong>💡 CONSIGLIO:</strong>');
    editPreview.innerHTML = parsedHtml;
  } else {
    editPreview.innerText = text;
  }
}

// Markdown Toolbar Helper
window.insertMarkdown = function(prefix, suffix) {
  const textarea = editContent;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = prefix + (selected || 'testo') + suffix;

  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
  updateMarkdownPreview();
};

// Global actions
window.editArticle = function(id) {
  const art = currentArticles.find(a => a.id === id);
  if (art) openEditor(art);
};

window.openEditor = openEditor;
window.closeEditor = closeEditor;

window.deleteArticle = async function(id, title) {
  if (!confirm(`Sei sicuro di voler eliminare definitivamente l'articolo:\n"${title}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      alert('Articolo eliminato con successo!');
      loadStats();
      loadArticles();
    } else {
      alert(`Errore: ${json.message}`);
    }
  } catch (err) {
    alert('Errore di comunicazione con il server.');
  }
};

async function saveArticle() {
  const title = editTitle.value.trim();
  const category = editCategory.value;
  const author = editAuthor.value.trim();
  const status = editStatus.value;
  const content = editContent.value;

  if (!title) {
    alert('Il titolo dell\'articolo è obbligatorio.');
    editTitle.focus();
    return;
  }

  const payload = {
    title,
    category,
    author,
    status,
    content,
    summary: document.getElementById('edit-summary').value.trim() || content.replace(/#+.*?\n/g, '').replace(/<[^>]+>/g, '').trim().substring(0, 180)
  };

  btnSaveArticle.disabled = true;
  btnSaveArticle.innerText = 'Salvataggio in corso...';

  try {
    let res;
    if (editingArticleId) {
      // Update
      res = await fetch(`/api/articles/${editingArticleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create
      res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const json = await res.json();
    if (json.success) {
      alert(editingArticleId ? 'Articolo aggiornato con successo!' : 'Nuovo articolo creato con successo!');
      closeEditor();
      loadStats();
      loadArticles();
    } else {
      alert(`Errore: ${json.message}`);
    }
  } catch (err) {
    alert('Errore di salvataggio nel database.');
  } finally {
    btnSaveArticle.disabled = false;
    btnSaveArticle.innerText = '💾 Salva Articolo nel Database';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
