const fs=require('fs');
const assert=require('assert/strict');
const base='http://localhost:3081';
const articleFile='backend/data/editorial-demo.json';
const requestFile='backend/data/editorial-requests.json';
let articleId,requestId;
async function api(route,method='GET',body){const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
(async()=>{try{
 for(const route of ['/','/notizie','/servizi','/chi-siamo','/convenzioni','/associarsi','/contatti','/studio','/analisi','/audit-content.html','/assets/editorial/industria.jpg','/assets/editorial/territorio.jpg','/assets/editorial/lavoro.jpg','/assets/editorial/usa.jpg','/assets/docs/Scheda-adesione-CONFAPI-ROMA.pdf']){const r=await fetch(base+route);assert.equal(r.status,200,route);}
 assert.equal((await api('/api/demo/articles','POST',{title:'x'})).status,400);
 let result=await api('/api/demo/articles','POST',{title:'Test tecnico temporaneo',content:'Contenuto di verifica della persistenza.',summary:'Verifica automatizzata',status:'draft'});assert.equal(result.status,200);articleId=result.data.id;
 assert.ok(!(await api('/api/demo/articles')).data.some(x=>x.id===articleId),'La bozza non deve comparire nel magazine');
 assert.ok(JSON.parse(fs.readFileSync(articleFile)).some(x=>x.id===articleId&&x.status==='draft'),'Bozza salvata su disco');
 result=await api('/api/demo/articles','POST',{...result.data,status:'published'});assert.equal(result.status,200);assert.ok((await api('/api/demo/articles')).data.some(x=>x.id===articleId),'Pubblicazione visibile');
 assert.equal((await api('/api/demo/requests','POST',{name:'Test'})).status,400);
 const res=await api('/api/demo/requests','POST',{name:'Verifica tecnica',company:'Azienda test temporaneo',email:'test@example.invalid',interest:'Verifica demo',consent:true});assert.equal(res.status,201);
 const reqs=(await api('/api/demo/requests')).data;requestId=reqs.find(x=>x.company==='Azienda test temporaneo').id;
 assert.equal((await api('/api/demo/requests/'+requestId,'PATCH',{status:'In lavorazione'})).status,200);
 assert.equal(JSON.parse(fs.readFileSync(requestFile)).find(x=>x.id===requestId).status,'In lavorazione');
 console.log('PASS: 15 pagine/asset; validazioni; bozza privata nel catalogo pubblico; persistenza; pubblicazione; richiesta CRM e cambio stato.');
 }finally{
 if(articleId)fs.writeFileSync(articleFile,JSON.stringify(JSON.parse(fs.readFileSync(articleFile)).filter(x=>x.id!==articleId),null,2));
 if(requestId)fs.writeFileSync(requestFile,JSON.stringify(JSON.parse(fs.readFileSync(requestFile)).filter(x=>x.id!==requestId),null,2));
 console.log('Record temporanei di verifica rimossi.');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
