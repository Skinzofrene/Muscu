import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json'};
const preferredPort=Number(process.env.MUSCU_PREVIEW_PORT||process.env.PORT||4173);
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    // Same files available under a subpath for GitHub Pages compatibility tests.
    let name=decodeURIComponent(url.pathname).replace(/^\/muscu-test\//,'/');
    if(name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html')){res.writeHead(403);return res.end();}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':(types[path.extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-cache','X-Muscu-App':'6.2'});res.end(body);
  }catch{res.writeHead(404);res.end('Introuvable');}
});
function existingMuscu(port){return new Promise(resolve=>{const request=http.get({hostname:'127.0.0.1',port,path:'/',timeout:1200},response=>{response.resume();resolve(response.headers['x-muscu-app']==='6.2');});request.on('timeout',()=>{request.destroy();resolve(false);});request.on('error',()=>resolve(false));});}
function listen(port){
  const onListening=()=>{server.off('error',onError);const address=server.address();console.log(`Muscu prêt : http://localhost:${address.port}`);};
  const onError=async error=>{
    server.off('listening',onListening);
    if(error.code==='EADDRINUSE'&&!process.env.PORT&&await existingMuscu(port)){console.log(`Muscu déjà lancé : http://localhost:${port}`);return;}
    if(error.code==='EADDRINUSE'&&!process.env.PORT){console.error(`Le port stable ${port} est utilisé par une autre application. Ferme-la ou définis explicitement PORT avant de relancer Muscu.`);process.exitCode=1;return;}
    console.error(`Impossible de démarrer Muscu : ${error.message}`);process.exitCode=1;
  };
  server.once('error',onError);server.once('listening',onListening);server.listen(port,'0.0.0.0');
}
listen(preferredPort);
