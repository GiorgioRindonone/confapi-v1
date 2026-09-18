/** Next.js owns HTTP routing; existing templates and APIs remain byte-faithful. */
module.exports={
 outputFileTracingRoot:__dirname,
 turbopack:{root:__dirname},
 poweredByHeader:false,
 experimental:{cpus:2},
 async rewrites(){return {beforeFiles:[
  {source:'/',destination:'/api/__legacy'},
  {source:'/:legacyPath((?!_next/|api/__legacy).+)',destination:'/api/__legacy/:legacyPath'}
 ]};}
};
