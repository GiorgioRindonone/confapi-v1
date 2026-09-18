const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'articles.json');

const CATEGORIES_METADATA = [
  {
    id: 'cat-1',
    name: 'Finanza, Bandi & Fisco',
    description: 'Agevolazioni, Nuova Sabatini, Crediti di imposta, Fondo di Garanzia PMI e novità fiscali.',
    icon: '💰',
    color: '#D97706'
  },
  {
    id: 'cat-2',
    name: 'Lavoro, Contratti & Welfare',
    description: 'CCNL Confapi, Enti bilaterali ENFEA, sanità integrativa, cassa integrazione e welfare aziendale.',
    icon: '👥',
    color: '#2563EB'
  },
  {
    id: 'cat-3',
    name: 'Edilizia, Appalti & Territorio (ANIEM)',
    description: 'Codice Appalti, DGUE, sicurezza nei cantieri, qualificazione SOA e circolari operative ANIEM.',
    icon: '🏗️',
    color: '#059669'
  },
  {
    id: 'cat-4',
    name: 'Innovazione, Digitale & Transizione 5.0',
    description: 'Voucher digitali, Industria 5.0, intelligenza artificiale per PMI e Fondo Creatività Lazio.',
    icon: '🚀',
    color: '#7C3AED'
  },
  {
    id: 'cat-5',
    name: 'Istituzioni, Normativa & Comunicati',
    description: 'Rapporti con Roma Capitale, Regione Lazio, audizioni parlamentari e comunicati stampa ufficiali.',
    icon: '🏛️',
    color: '#0B192C'
  },
  {
    id: 'cat-6',
    name: 'Europa & Internazionalizzazione',
    description: 'Programmi europei, tutela export PMI, progetti ELSS e scambi commerciali internazionali.',
    icon: '🌍',
    color: '#0284C7'
  },
  {
    id: 'cat-7',
    name: 'Attualità PMI',
    description: 'Notizie di scenario economico, interviste, report territoriali e dossier.',
    icon: '📊',
    color: '#475569'
  }
];

router.get('/', (req, res) => {
  let articles = [];
  try {
    if (fs.existsSync(DB_PATH)) {
      articles = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {}

  const categoriesWithCounts = CATEGORIES_METADATA.map(cat => {
    const count = articles.filter(a => a.category === cat.name && a.status === 'published').length;
    const totalCount = articles.filter(a => a.category === cat.name).length;
    return {
      ...cat,
      publishedCount: count,
      totalCount: totalCount
    };
  });

  res.json({
    success: true,
    data: categoriesWithCounts
  });
});

module.exports = router;
