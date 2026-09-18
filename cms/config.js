const path=require('path');
const membership=require('../membership/config');
module.exports={...membership,appURL:(process.env.APP_URL||'http://localhost:3081').replace(/\/$/,''),trustProxy:false};
