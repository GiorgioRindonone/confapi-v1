import path from 'node:path';
const nativeRequire=process.getBuiltinModule('module').createRequire(path.join(process.cwd(),'package.json'));
let ready;
export const config={api:{bodyParser:false,externalResolver:true,responseLimit:false}};
export default async function handler(req,res){
 const segments=Array.isArray(req.query.path)?req.query.path:[];
 const query=new URLSearchParams();
 for(const [key,value] of Object.entries(req.query)){
  if(key==='path'||key==='legacyPath')continue;
  for(const item of Array.isArray(value)?value:[value])if(item!==undefined)query.append(key,item);
 }
 req.url='/'+segments.map(encodeURIComponent).join('/')+(query.size?'?'+query:'');
 req.originalUrl=req.url;
 // Next's helpers capture the native res methods. Remove them before Express
 // installs its response prototype, avoiding JSON/send recursion.
 for(const key of ['status','send','json','redirect','setPreviewData','clearPreviewData','setDraftMode','revalidate'])delete res[key];
 const application=nativeRequire(path.join(process.cwd(),'demo-server.js'));
 
 return new Promise((resolve,reject)=>{
  res.once('finish',resolve);res.once('close',resolve);
  application.app(req,res);
 });
}
