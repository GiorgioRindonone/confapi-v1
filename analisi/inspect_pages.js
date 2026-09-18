const fs = require('fs');
const pages = JSON.parse(fs.readFileSync('analisi/data/all_pages.json', 'utf8'));

console.log('Total pages:', pages.length);
pages.forEach((p, idx) => {
  console.log((idx + 1) + '. [' + p.title + '] (' + (p.h1.join(', ') || 'No H1') + ') -> ' + p.url);
});
