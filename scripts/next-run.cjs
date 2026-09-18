const {spawn}=require('node:child_process');
const path=require('node:path');
const mode=process.argv[2]||'dev',port=process.env.PORT||'3081';
if(!['dev','build','start'].includes(mode))throw Error('Usa dev, build o start.');
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'};
env.DATA_DIR=env.DATA_DIR||'./data';
env.APP_URL=env.APP_URL||'http://localhost:'+port;
if(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.APP_URL))env.CONFAPI_LOCAL_PREVIEW='1';
const args=[mode];
if(mode==='build')args.push('--webpack');
else args.push('--port',port,'--hostname',process.env.HOST||'127.0.0.1');
const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),...args],{cwd:path.join(__dirname,'..'),env,stdio:'inherit',windowsHide:true});
child.on('exit',code=>process.exit(code??1));
child.on('error',error=>{console.error(error);process.exit(1);});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));

