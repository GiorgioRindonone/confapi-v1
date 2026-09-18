const express=require('express'),crypto=require('crypto'),{rateLimit}=require('express-rate-limit');
const sql=require('./db'),security=require('./security');
const router=express.Router();
router.use('/api/demo',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
function magazineArticle(a){
 const saved=sql.get('SELECT value FROM settings WHERE key=?','legacy_article:'+a.id);
 const legacy=saved?JSON.parse(saved.value):{};
 const category=a.channel==='aniem'?'ANIEM Lazio':a.channel==='servizi'?(a.services[0]?.name||'Servizi alle imprese'):legacy.category==='ANIEM Lazio'?'Vita associativa':legacy.category||'Vita associativa';
 return {...legacy,id:a.id,slug:a.slug,title:a.title,summary:a.summary,content:security.plain(a.html),richHTML:a.html,category,type:legacy.type||'Articolo',status:a.status,date:a.published_at?.slice(0,10)||'',image:a.image||'/assets/editorial/industria.jpg',image_alt:a.image_alt,author:legacy.author||'Redazione CONFAPI Roma',updatedAt:a.updated_at,channel:a.channel,featured:!!a.featured,services:a.services,needsReview:a.version>1?false:!!legacy.needsReview};
}
router.get('/api/demo/articles',(req,res,next)=>{
 if(req.query.studio==='1')return security.session(req,res,()=>security.requireUser(req,res,()=>res.json(sql.all("SELECT * FROM articles WHERE status<>'trash' ORDER BY COALESCE(published_at,created_at) DESC").map(sql.hydrate).map(magazineArticle))));
 res.set('Cache-Control','no-store').json(sql.all("SELECT * FROM articles WHERE status='published' ORDER BY featured DESC,COALESCE(published_at,created_at) DESC").map(sql.hydrate).map(magazineArticle));
});
router.get('/api/demo/services',(req,res)=>res.set('Cache-Control','no-store').json(sql.activeServices()));
// The former unauthenticated demo endpoints cannot mutate content or expose leads.
router.all('/api/demo/articles',security.session,security.requireUser,(req,res)=>res.status(410).json({error:'Utilizza il nuovo pannello di redazione /admin.'}));
router.get('/api/demo/requests',security.session,security.requireUser,(req,res)=>res.json(sql.all('SELECT * FROM leads ORDER BY created_at DESC')));
router.patch('/api/demo/requests/:id',security.session,security.requireUser,security.csrf,(req,res)=>res.status(410).json({error:'Utilizza /admin/richieste.'}));
router.post('/api/demo/requests',rateLimit({windowMs:900000,limit:30}), (req,res)=>{
 const b=req.body;if(typeof b.name!=='string'||!b.name.trim()||typeof b.company!=='string'||!b.company.trim()||!/^\S+@\S+\.\S+$/.test(b.email||'')||b.consent!==true)return res.status(400).json({error:'Completa i campi obbligatori e il consenso.'});
 const id=crypto.randomUUID(),now=new Date().toISOString();sql.run('INSERT INTO leads(id,association,name,company,email,phone,message,created_at,consent_at) VALUES(?,?,?,?,?,?,?,?,?)',id,b.association==='aniem'||/aniem/i.test(b.interest)?'aniem':'confapi',b.name.trim().slice(0,100),b.company.trim().slice(0,150),String(b.email).slice(0,200),String(b.phone||'').slice(0,30),(b.interest?'Interesse: '+String(b.interest).slice(0,100)+'\n\n':'')+String(b.message||'').slice(0,5000),now,now);res.status(201).json({success:true,reference:id.slice(0,8)});
});
module.exports={router,magazineArticle};
