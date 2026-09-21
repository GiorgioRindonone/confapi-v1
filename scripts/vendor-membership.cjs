const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'node_modules/pdfjs-dist'),target=path.join(root,'public/vendor/pdfjs');
fs.mkdirSync(target,{recursive:true});
for(const name of ['pdf.min.mjs','pdf.worker.min.mjs']){fs.copyFileSync(path.join(source,'build',name),path.join(target,name));fs.copyFileSync(path.join(source,'build',name),path.join(target,name.replace(/\.mjs$/,'.js')))}
for(const name of ['standard_fonts','cmaps','wasm'])fs.cpSync(path.join(source,name),path.join(target,name),{recursive:true});
fs.copyFileSync(path.join(source,'LICENSE'),path.join(target,'LICENSE'));
