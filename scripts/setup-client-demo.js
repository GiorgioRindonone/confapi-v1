const fs = require('fs');
const db = 'backend/data/articles.json';
const articles = JSON.parse(fs.readFileSync(db, 'utf8'));
const id = 'art-confapi-865';
if (!articles.some(a => a.id === id)) {
  fs.copyFileSync(db, db + '.before-client-demo.bak');
  articles.unshift({id, slug:'bando-pmi-aree-cratere-sismico-lazio',title:'Bando PMI aree cratere sismico Lazio: contributi a fondo perduto fino all’80%',category:'Finanza, Bandi & Fisco',summary:'Dal 1° Settembre al 28 Settembre p.v. potranno essere presentate progetti e domande per accedere ai contributi per le micro, piccole e medie imprese con sede operativa in uno dei comuni indicati dal bando della regione Lazio (la sede legale può anche essere fuori dal cratere) per progetti connessi alla ricostruzione.',content:fs.readFileSync('backend/data/bando-cratere-originale.md','utf8'),publishDate:'2026-09-03',status:'published',author:'Confapi Roma',readTime:'3 min',views:0,tags:['Bandi','Lazio','Ricostruzione'],featuredImage:'https://www.confapiroma.it/images/confapi/archivio-news/2022/JPG/ricostruzione-privata.jpg',originalUrl:'https://www.confapiroma.it/index.php/news/istituzioni/865-bando-pmi-aree-cratere-sismico-lazio'});
  fs.writeFileSync(db, JSON.stringify(articles,null,2));
}
let home = fs.readFileSync('public/index.html','utf8');
home = home.replace('let feedLimit = 8;', 'let feedLimit = 5;\n    let feedOffset = 0;\n    let feedQuery = "";');
home = home.replace(/function showAllArticles\(event\) \{[^\n]*\}/, 'function showAllArticles(event) { event.preventDefault(); const matches = getFeedMatches(); feedOffset = feedOffset + 5 >= matches.length ? 0 : feedOffset + 5; renderFeed(matches); document.getElementById("notiziario").scrollIntoView({block:"start"}); }\n    function getFeedMatches() { const q = feedQuery.toLowerCase().trim(); return globalArticles.filter(a => [a.title,a.summary,a.category,a.content].some(v => String(v || "").toLowerCase().includes(q))); }');
home = home.replace('>Tutti gli Articoli →', '>Altri articoli →');
home = home.replace('articles.slice(0, feedLimit)', 'articles.slice(feedOffset, feedOffset + feedLimit)');
home = home.replace("window.filterFeed = function(query) {", 'window.filterFeed = function(query) {\n      feedQuery = query || ""; feedOffset = 0;');
home = home.replace('renderFeed(globalArticles);\n        }', 'renderFeed(globalArticles);\n          renderFeaturedArticle();\n        }');
home = home.replace(/<article class="lead-story">[\s\S]*?<\/article>/, `<article class="lead-story" id="featured-story" aria-label="Articolo in primo piano"><div class="kicker">In primo piano</div><h1 class="lead-headline">Bando PMI aree cratere sismico Lazio</h1><p>Caricamento dell’articolo…</p></article>`);
home = home.replace("alert('Richiesta salvata in questa anteprima locale. Nessuna email è stata inviata.');", "showAcquisitionSuccess(json.data);");
home = home.replace('href="#adesione"', 'href="#adesione"');
fs.writeFileSync('public/index.html',home);
