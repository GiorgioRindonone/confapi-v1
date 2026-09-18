const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=path.join(root,'public/cms-assets/vendor');
fs.mkdirSync(target,{recursive:true});
for(const name of ['quill.js','quill.snow.css'])fs.copyFileSync(path.join(root,'node_modules/quill/dist',name),path.join(target,name));
