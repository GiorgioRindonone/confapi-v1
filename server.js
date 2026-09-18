const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// API Routes
const articlesRouter = require('./backend/routes/articles');
const categoriesRouter = require('./backend/routes/categories');
const membershipRouter = require('./backend/routes/membership');
const statsRouter = require('./backend/routes/stats');

app.use('/api/articles', articlesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/membership', membershipRouter);
app.use('/api/stats', statsRouter);

// Dedicated Page Routes
app.get('/articolo/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'articolo.html'));
});

app.get('/chi-siamo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chi-siamo.html'));
});

app.get('/convenzioni', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'convenzioni.html'));
});

app.get('/come-associarsi', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'come-associarsi.html'));
});

app.get('/diventa-socio', (req, res) => {
  res.redirect('/come-associarsi');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const server = app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`🏛️ CONFAPI ROMA - PORTALE CORPORATE 20K & CMS ENGINE`);
  console.log(`🌐 Frontend Portale:   http://localhost:${PORT}`);
  console.log(`🛠️ Pannello Admin CMS: http://localhost:${PORT}/admin`);
  console.log(`📡 REST API Endpoint:  http://localhost:${PORT}/api/articles`);
  console.log(`====================================================`);
});

module.exports = app;
