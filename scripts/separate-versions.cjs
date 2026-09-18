const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {DatabaseSync,backup}=require('node:sqlite');
const root=path.resolve(__dirname,'..');
const archive=path.join(root,'archivio-originali-2026-09-14');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const ignored=new Set(['node_modules','.next','.git']);
const entries=[];
function copyTree(source,target,prefix){
 fs.mkdirSync(target,{recursive:true});
 for(const entry of fs.readdirSync(source,{withFileTypes:true})){
  if(ignored.has(entry.name)||entry.name==='confapi.sqlite'||entry.name==='confapi.sqlite-wal'||entry.name==='confapi.sqlite-shm')continue;
  const src=path.join(source,entry.name),dest=path.join(target,entry.name),relative=prefix+'/'+entry.name;
  if(entry.isSymbolicLink())throw Error('Collegamento da verificare: '+src);
  if(entry.isDirectory())copyTree(src,dest,relative);
  else{const bytes=fs.readFileSync(src);fs.writeFileSync(dest,bytes);entries.push({source:path.relative(root,src),archive:relative,size:bytes.length,sha256:hash(bytes)});}
 }
}
async function main(){
 for(const name of ['sito v1','sito v2','archivio-originali-2026-09-14'])if(fs.existsSync(path.join(root,name)))throw Error('La cartella esiste già: '+name);
 fs.mkdirSync(archive);
 const v1=path.join(archive,'sito v1'),v2=path.join(archive,'sito v2');fs.mkdirSync(v1);
 for(const entry of fs.readdirSync(root,{withFileTypes:true})){
  if(ignored.has(entry.name)||['propostav2','sito v1','sito v2',path.basename(archive)].includes(entry.name))continue;
  const src=path.join(root,entry.name),dest=path.join(v1,entry.name);
  if(entry.isDirectory())copyTree(src,dest,'sito v1/'+entry.name);
  else{const bytes=fs.readFileSync(src);fs.writeFileSync(dest,bytes);entries.push({source:entry.name,archive:'sito v1/'+entry.name,size:bytes.length,sha256:hash(bytes)});}
 }
 copyTree(path.join(root,'propostav2'),v2,'sito v2');
 const sourceDb=new DatabaseSync(path.join(root,'propostav2/data/confapi.sqlite'),{readOnly:true});
 await backup(sourceDb,path.join(v2,'data/confapi.sqlite'));
 sourceDb.close();
 const snapshot=new DatabaseSync(path.join(v2,'data/confapi.sqlite'),{readOnly:true});
 const tables=snapshot.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(t=>({table:t.name,rows:snapshot.prepare('SELECT COUNT(*) n FROM "'+t.name+'"').get().n}));
 const integrity=snapshot.prepare('PRAGMA integrity_check').get();snapshot.close();
 let mismatches=0;for(const e of entries)if(hash(fs.readFileSync(path.join(archive,e.archive)))!==e.sha256)mismatches++;
 if(mismatches)throw Error('Copie non corrispondenti: '+mismatches);
 fs.writeFileSync(path.join(archive,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),root,excludedRegenerable:['node_modules','.next','.git'],files:entries,database:{method:'SQLite online backup',integrity,tables}},null,2));
 fs.cpSync(v1,path.join(root,'sito v1'),{recursive:true,errorOnExist:true,force:false});
 fs.cpSync(v2,path.join(root,'sito v2'),{recursive:true,errorOnExist:true,force:false});
 console.log(JSON.stringify({archive,verifiedFiles:entries.length,mismatches,database:{integrity,tables}},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
