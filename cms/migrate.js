// Idempotent, V1-only migration. Original JSON and signed PDFs are retained.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sql=require('./db'),config=require('./config'),security=require('./security');
const dataRoot=path.resolve(process.env.V1_DATA_DIR||path.join(config.root,'backend/data'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function migrate(){
 if(sql.get("SELECT value FROM settings WHERE key='v1_editorial_import'"))return;
 const source=path.join(dataRoot,'editorial-demo.json'),leadSource=path.join(dataRoot,'editorial-requests.json');
 const articles=fs.existsSync(source)?JSON.parse(fs.readFileSync(source,'utf8')):[];
 const leads=fs.existsSync(leadSource)?JSON.parse(fs.readFileSync(leadSource,'utf8')):[];
 const script=fs.readFileSync(path.join(config.root,'public/js/magazine.js'),'utf8');
 const services=JSON.parse(script.match(/(?:const|let) serviceList=(\[.*?\]);/)[1].replace(/'/g,'"'));
 sql.transaction(()=>{
  for(const [slug,name,summary,,] of services)sql.run('INSERT OR IGNORE INTO services(id,slug,name,summary,position) VALUES(?,?,?,?,?)',slug,slug,name,summary,services.findIndex(s=>s[0]===slug));
  for(const a of articles){
   const now=new Date().toISOString(),date=a.date?a.date+'T12:00:00.000Z':null;
   const channel=/aniem/i.test(a.category)?'aniem':a.type==='Servizio'?'servizi':'confapi';
   const html=security.cleanHTML(a.richHTML||String(a.content||'').split(/\n\s*\n/).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join(''));
   sql.run('INSERT OR IGNORE INTO articles(id,slug,title,summary,html,channel,status,image,image_alt,published_at,created_at,updated_at,source_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',a.id,a.id,a.title,a.summary||'',html,channel,a.status==='published'?'published':'draft',a.image||'',a.image_alt||'',date,date||now,a.updatedAt||date||now,a.source||null);
   sql.run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)','legacy_article:'+a.id,JSON.stringify(a));
   // Assign only explicit editorial topics, never unrelated recent articles.
   const related=a.category==='Lavoro e welfare'?'lavoro':a.category==='Mercati esteri'?'estero':a.category==='Bandi e opportunità'?'credito':null;
   if(related)sql.run('INSERT OR IGNORE INTO article_services VALUES(?,?)',a.id,related);
  }
  for(const l of leads){const created=l.date||new Date().toISOString();sql.run('INSERT OR IGNORE INTO leads(id,association,name,company,email,phone,message,status,notes,created_at,consent_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',l.id,/aniem/i.test(l.interest)?'aniem':'confapi',l.name,l.company,l.email,l.phone||'',(l.interest?'Interesse: '+l.interest+'\n\n':'')+(l.message||''),l.status||'Nuova',l.notes||'',created,created);sql.run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)','legacy_lead:'+l.id,JSON.stringify(l));}
  sql.run("INSERT INTO settings(key,value) VALUES('v1_editorial_import',?)",JSON.stringify({at:new Date().toISOString(),articles:articles.length,leads:leads.length}));
 });
}
async function importMedia(){
 const sharp=require('sharp');
 if(sql.get("SELECT value FROM settings WHERE key='v1_media_import'"))return;
 const images=new Set(sql.all('SELECT image FROM articles').map(a=>a.image).filter(p=>p.startsWith('/assets/')));
 for(const a of sql.all('SELECT html FROM articles'))for(const match of a.html.matchAll(/src="(\/assets\/[^"<>]+)"/g))images.add(match[1]);
 for(const source of images){
  const file=path.resolve(config.root,'public','.'+source),publicRoot=path.join(config.root,'public')+path.sep;
  if(!file.startsWith(publicRoot)||!fs.existsSync(file))continue;
  const id=crypto.createHash('sha256').update(source).digest('hex').slice(0,32);
  if(sql.get('SELECT id FROM media WHERE id=?',id))continue;
  const {data,info}=await sharp(file,{limitInputPixels:40000000}).rotate().resize({width:2200,height:2200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer({resolveWithObject:true});
  const filename=id+'.webp';fs.writeFileSync(path.join(config.dataDir,'uploads',filename),data);
  sql.run('INSERT INTO media(id,filename,original_name,mime,width,height,alt,size,created_at) VALUES(?,?,?,?,?,?,?,?,?)',id,filename,path.basename(file),'image/webp',info.width,info.height,'Immagine archivio V1 · '+path.basename(file,path.extname(file)),data.length,new Date().toISOString());
 }
 sql.run("INSERT INTO settings(key,value) VALUES('v1_media_import',?)",new Date().toISOString());
}
module.exports={migrate,importMedia};
