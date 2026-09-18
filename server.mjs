import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    // Same files available under a subpath for GitHub Pages compatibility tests.
    let name=decodeURIComponent(url.pathname).replace(/^\/muscu-test\//,'/');
    if(name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html')){res.writeHead(403);return res.end();}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':(types[path.extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-cache'});res.end(body);
  }catch{res.writeHead(404);res.end('Introuvable');}
}).listen(port,'0.0.0.0',()=>console.log(`Muscu prêt : http://localhost:${port}`));
