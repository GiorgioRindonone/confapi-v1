const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'articles.json');

function readArticles() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading articles database:', err);
    return [];
  }
}

function writeArticles(articles) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(articles, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing articles database:', err);
    return false;
  }
}

function calculateReadingTime(text) {
  if (!text) return '2 min';
  const words = text.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

// GET /api/articles - List articles with search, category & pagination
router.get('/', (req, res) => {
  let articles = readArticles();
  const { category, search, status, tag, limit, offset, sort } = req.query;

  // Filter by status (default: all for admin, published for frontend if specified)
  if (status && status !== 'all') {
    articles = articles.filter(a => a.status === status);
  }

  // Filter by Category
  if (category && category !== 'Tutte' && category !== 'all') {
    articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by Tag
  if (tag) {
    articles = articles.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  // Search by keyword in title, summary, or content
  if (search) {
    const q = search.toLowerCase().trim();
    articles = articles.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === 'views') {
    articles.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sort === 'oldest') {
    articles.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
  } else {
    // Default newest first (or ID desc)
    articles.sort((a, b) => {
      const dateA = new Date(a.publishDate || 0);
      const dateB = new Date(b.publishDate || 0);
      if (dateB - dateA !== 0) return dateB - dateA;
      const idA = parseInt((a.id || '').replace('art-', '')) || 0;
      const idB = parseInt((b.id || '').replace('art-', '')) || 0;
      return idB - idA;
    });
  }

  const total = articles.length;
  const pageOffset = parseInt(offset) || 0;
  const pageLimit = parseInt(limit) || articles.length;
  const paginated = articles.slice(pageOffset, pageOffset + pageLimit);

  res.json({
    success: true,
    total,
    count: paginated.length,
    offset: pageOffset,
    limit: pageLimit,
    data: paginated
  });
});

// GET /api/articles/:id - Get single article by ID or slug
router.get('/:id', (req, res) => {
  const articles = readArticles();
  const idOrSlug = req.params.id;
  const article = articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Articolo non trovato' });
  }

  // Increment view counter
  article.views = (article.views || 0) + 1;
  writeArticles(articles);

  res.json({ success: true, data: article });
});

// POST /api/articles - Create new article
router.post('/', (req, res) => {
  const { title, category, summary, content, featuredImage, author, status, tags, publishDate } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Il titolo è obbligatorio' });
  }

  const articles = readArticles();
  const nextId = 'art-' + (Date.now());
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newArticle = {
    id: nextId,
    slug: slug || nextId,
    title: title.trim(),
    category: category || 'Attualità PMI',
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    summary: summary ? summary.trim() : (content ? content.substring(0, 180) + '...' : ''),
    content: content || `# ${title}\n\nInserisci qui il contenuto dell'articolo in formato Markdown.`,
    author: author || 'Redazione Confapi Roma',
    publishDate: publishDate || new Date().toISOString().split('T')[0],
    readTime: calculateReadingTime(content),
    status: status || 'published',
    views: 1,
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['PMI', 'Confapi']),
    createdAt: new Date().toISOString()
  };

  articles.unshift(newArticle);
  writeArticles(articles);

  res.status(201).json({
    success: true,
    message: 'Articolo creato con successo',
    data: newArticle
  });
});

// PUT /api/articles/:id - Update existing article
router.put('/:id', (req, res) => {
  const articles = readArticles();
  const index = articles.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Articolo non trovato' });
  }

  const current = articles[index];
  const { title, category, summary, content, featuredImage, author, status, tags, publishDate } = req.body;

  const updatedArticle = {
    ...current,
    title: title !== undefined ? title.trim() : current.title,
    category: category !== undefined ? category : current.category,
    summary: summary !== undefined ? summary.trim() : current.summary,
    content: content !== undefined ? content : current.content,
    featuredImage: featuredImage !== undefined ? featuredImage : current.featuredImage,
    author: author !== undefined ? author : current.author,
    status: status !== undefined ? status : current.status,
    tags: tags !== undefined ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : current.tags,
    publishDate: publishDate !== undefined ? publishDate : current.publishDate,
    readTime: content !== undefined ? calculateReadingTime(content) : current.readTime,
    updatedAt: new Date().toISOString()
  };

  articles[index] = updatedArticle;
  writeArticles(articles);

  res.json({
    success: true,
    message: 'Articolo aggiornato con successo',
    data: updatedArticle
  });
});

// DELETE /api/articles/:id - Delete an article
router.delete('/:id', (req, res) => {
  let articles = readArticles();
  const initialLen = articles.length;
  articles = articles.filter(a => a.id !== req.params.id);

  if (articles.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Articolo non trovato' });
  }

  writeArticles(articles);
  res.json({
    success: true,
    message: 'Articolo eliminato con successo'
  });
});

module.exports = router;
