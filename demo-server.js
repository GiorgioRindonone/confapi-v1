const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = express();
const dataRoot = path.resolve(process.env.V1_DATA_DIR || path.join(__dirname, 'backend/data'));
const file = path.join(dataRoot, 'editorial-demo.json');
const leadsFile = path.join(dataRoot, 'editorial-requests.json');
app.use(express.json({limit:'4mb'}));
app.use((req,res,next)=>{
  res.set('X-Content-Type-Options','nosniff');
  const origin = req.headers.origin;
  if(!['GET','HEAD','OPTIONS'].includes(req.method) && origin){
    const host = req.headers.host;
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const allowed = [`http://${host}`, `https://${host}`, appUrl].filter(Boolean);
    if(!allowed.includes(origin)) return res.status(403).json({error:'Origine non consentita'});
  }
  next();
});
require('./cms/migrate').migrate();
app.use(require('./cms/router'));
app.use(require('./cms/public-api').router);
app.use(require('./membership/router'));
app.get('/studio',(req,res)=>res.redirect('/admin'));
app.get('/articoli/:slug',(req,res)=>{const a=require('./cms/db').article(req.params.slug);return a&&a.status==='published'?res.redirect('/notizie/'+encodeURIComponent(a.id)):res.sendStatus(404);});
app.get(['/','/sistema-confapi','/sistema-confapi/:section','/aniem','/notizie','/notizie/:id','/servizi','/servizi/:id','/chi-siamo','/convenzioni','/associarsi','/contatti','/analisi'],(req,res)=>res.sendFile(path.join(__dirname,'public/demo.html')));

app.use(express.static(path.join(__dirname,'public'),{index:false}));
app.use((err,req,res,next)=>{console.error(err.message);res.status(500).json({error:'Salvataggio non riuscito. Riprova.'});});
const port=process.env.DEMO_PORT||3081;
if(require.main===module)app.listen(port,'127.0.0.1',()=>console.log(`CONFAPI demo pronta: http://localhost:${port}`));
module.exports={app};
