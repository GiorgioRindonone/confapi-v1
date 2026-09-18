const fs=require('fs'),path=require('path'),{DatabaseSync}=require('node:sqlite'),config=require('./config');
fs.mkdirSync(path.join(config.dataDir,'memberships'),{recursive:true,mode:0o700});
const db=new DatabaseSync(path.join(config.dataDir,'memberships.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'admin',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS memberships(id TEXT PRIMARY KEY,company TEXT NOT NULL,email TEXT NOT NULL,fields TEXT NOT NULL,pdf_filename TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Ricevuta',created_at TEXT NOT NULL,consent_at TEXT NOT NULL);`);
module.exports={db,all:(s,...p)=>db.prepare(s).all(...p),get:(s,...p)=>db.prepare(s).get(...p),run:(s,...p)=>db.prepare(s).run(...p)};
