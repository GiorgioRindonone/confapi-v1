const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = 'http://127.0.0.1:3082';
(async () => {
  const routes = ['/', '/chi-siamo', '/convenzioni', '/come-associarsi', '/articolo/art-1', '/admin/'];
  let assets = new Set();
  for (const route of routes) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
    for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|css|js)\/[^"?#]+)"/g)) assets.add(match[1]);
    console.log('PASS page + inline JS', route);
  }
  for (const asset of assets) assert.equal((await fetch(base + asset)).status, 200, asset);
  console.log('PASS local assets', assets.size);
  const invalid = await fetch(base + '/api/membership', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({companyName:42,email:'invalid'})});
  assert.equal(invalid.status,400);
  // Exercise persistence with an isolated temporary fixture, never the real lead database.
  const source = fs.readFileSync('backend/routes/membership.js','utf8');
  const temp = fs.mkdtempSync(path.join(require('node:os').tmpdir(),'confapi-membership-'));
  const routesMap = {};
  const sandbox = {require:(name)=>name==='express'?{Router:()=>({get(){},post:(r,fn)=>routesMap.post=fn})}:require(name),__dirname:path.join(temp,'routes'),module:{exports:{}}};
  fs.mkdirSync(path.join(temp,'data'));
  vm.runInNewContext(source,sandbox);
  let result;
  const res={status(code){this.code=code;return this},json(body){result=body;return this}};
  routesMap.post({body:{companyName:'Demo QA',email:'qa@example.invalid',vatNumber:'TEST',address:'Indirizzo di prova',pec:'qa@example.invalid'}},res);
  assert.equal(res.code,201);
  const saved = JSON.parse(fs.readFileSync(path.join(temp,'data/membership_leads.json')))[0];
  assert.equal(saved.vatNumber,'TEST');assert.equal(saved.address,'Indirizzo di prova');assert.equal(saved.pec,'qa@example.invalid');
  console.log('PASS validation and isolated membership persistence');
})().catch(e=>{console.error(e);process.exitCode=1});
