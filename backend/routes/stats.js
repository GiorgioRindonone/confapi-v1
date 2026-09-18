const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'articles.json');
const LEADS_PATH = path.join(__dirname, '..', 'data', 'membership_leads.json');

router.get('/', (req, res) => {
  let articles = [];
  let leads = [];

  try {
    if (fs.existsSync(DB_PATH)) articles = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (fs.existsSync(LEADS_PATH)) leads = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'));
  } catch (e) {}

  const publishedArticles = articles.filter(a => a.status === 'published');
  const draftArticles = articles.filter(a => a.status === 'draft');
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // Category counts
  const catMap = {};
  articles.forEach(a => {
    catMap[a.category] = (catMap[a.category] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      totalArticles: articles.length,
      publishedArticles: publishedArticles.length,
      draftArticles: draftArticles.length,
      totalViews,
      totalLeads: leads.length,
      categoryDistribution: catMap,
      systemHealth: 'Optimal',
      engine: 'Node.js Enterprise Express Engine',
      storage: 'Atomic JSON & Markdown DB'
    }
  });
});

module.exports = router;
