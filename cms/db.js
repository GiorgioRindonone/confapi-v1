const fs=require('fs');const path=require('path');const {DatabaseSync}=require('node:sqlite');const config=require('./config');
fs.mkdirSync(config.dataDir,{recursive:true,mode:0o700});
for(const d of ['uploads','memberships','backups'])fs.mkdirSync(path.join(config.dataDir,d),{recursive:true,mode:0o700});
const db=new DatabaseSync(path.join(config.dataDir,'memberships.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'editor',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS services(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,name TEXT NOT NULL,summary TEXT NOT NULL DEFAULT '',html TEXT NOT NULL DEFAULT '',source_url TEXT,active INTEGER NOT NULL DEFAULT 1,position INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS articles(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,title TEXT NOT NULL,summary TEXT NOT NULL DEFAULT '',html TEXT NOT NULL DEFAULT '',channel TEXT NOT NULL CHECK(channel IN ('confapi','aniem','servizi')),status TEXT NOT NULL CHECK(status IN ('draft','published','trash')),image TEXT NOT NULL DEFAULT '',image_alt TEXT NOT NULL DEFAULT '',published_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,author_id TEXT REFERENCES users(id),source_url TEXT,featured INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS article_services(article_id TEXT REFERENCES articles(id) ON DELETE CASCADE,service_id TEXT REFERENCES services(id),PRIMARY KEY(article_id,service_id));
CREATE TABLE IF NOT EXISTS revisions(id INTEGER PRIMARY KEY AUTOINCREMENT,article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,user_id TEXT,data TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,filename TEXT UNIQUE NOT NULL,original_name TEXT NOT NULL,mime TEXT NOT NULL,width INTEGER,height INTEGER,alt TEXT NOT NULL DEFAULT '',size INTEGER NOT NULL,created_at TEXT NOT NULL,user_id TEXT REFERENCES users(id));
CREATE TABLE IF NOT EXISTS pages(slug TEXT PRIMARY KEY,title TEXT NOT NULL,html TEXT NOT NULL,summary TEXT NOT NULL DEFAULT '',image TEXT NOT NULL DEFAULT '',source_url TEXT,kind TEXT NOT NULL DEFAULT 'page',updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS leads(id TEXT PRIMARY KEY,association TEXT NOT NULL,name TEXT NOT NULL,company TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Nuova',notes TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,consent_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS memberships(id TEXT PRIMARY KEY,company TEXT NOT NULL,email TEXT NOT NULL,fields TEXT NOT NULL,pdf_filename TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Ricevuta',created_at TEXT NOT NULL,consent_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,action TEXT NOT NULL,target_id TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
`);
const all=(sql,...params)=>db.prepare(sql).all(...params);const get=(sql,...params)=>db.prepare(sql).get(...params);const run=(sql,...params)=>db.prepare(sql).run(...params);
function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}
function audit(user,action,target){run('INSERT INTO audit(user_id,action,target_id,created_at) VALUES(?,?,?,?)',user||null,action,target||null,new Date().toISOString());}
function hydrate(a){if(!a)return null;return {...a,services:all('SELECT s.id,s.name,s.slug FROM services s JOIN article_services j ON j.service_id=s.id WHERE j.article_id=?',a.id)};}
function article(id){return hydrate(get('SELECT * FROM articles WHERE id=? OR slug=?',id,id));}
function activeServices(){return all('SELECT * FROM services WHERE active=1 ORDER BY position,name');}
module.exports={db,all,get,run,transaction,audit,hydrate,article,activeServices};
