import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const outputsDir=path.dirname(projectDir);
const sourceDir=path.join(outputsDir,'exercise-visual-resolution-v5');
const sourceMap=path.join(sourceDir,'visual-map-v5.json');
const assetRoot=path.join(projectDir,'dist','assets','exercises');
const customRoot=path.join(assetRoot,'custom');

const customFiles=[
  'copenhagen-high.webp',
  'copenhagen-low.webp',
  'reverse-crunch-long-high.webp',
  'reverse-crunch-long-low.webp',
  'tibialis-wall-low.webp',
  'tibialis-wall-high.webp'
];

if(!fs.existsSync(sourceMap))throw new Error(`Catalogue V5 absent: ${sourceMap}`);
for(const name of customFiles)if(!fs.existsSync(path.join(customRoot,name)))throw new Error(`Image custom WebP sans perte absente: ${name}`);

fs.mkdirSync(assetRoot,{recursive:true});
fs.cpSync(path.join(sourceDir,'assets'),assetRoot,{recursive:true});
fs.mkdirSync(customRoot,{recursive:true});
fs.copyFileSync(path.join(sourceDir,'ATTRIBUTION.md'),path.join(assetRoot,'ATTRIBUTION.md'));
fs.copyFileSync(path.join(sourceDir,'source-provenance.json'),path.join(assetRoot,'source-provenance.json'));

const records=JSON.parse(fs.readFileSync(sourceMap,'utf8'));
const toRuntimePath=value=>value.replace(/^assets\//,'./assets/exercises/');
function candidateFrames(candidate){
  if(!candidate?.frames)return[];
  if(Array.isArray(candidate.frames))return candidate.frames.map(frame=>toRuntimePath(frame.path)).filter(Boolean);
  return [candidate.frames.start,candidate.frames.peak,candidate.frames.main].filter(Boolean).map(toRuntimePath);
}
const KEEP_THREE_FRAMES=new Set([
  'visual-pushup-archer',
  'visual-hamstring-walkout',
  'visual-hamstring-walkout-bilateral',
  'visual-reverse-snow-angel',
  'visual-bird-dog',
  'visual-shoulder-taps'
]);

const STATIC_FRAME_OVERRIDES={
  'visual-front-plank':'frame-1.svg',
  'visual-wall-handstand-hold':'frame-3.svg'
};

function selectAuditedFrames(visualId,animationMode,frames){
  if(!frames.length)return[];
  if(animationMode==='STATIC'){
    const wanted=STATIC_FRAME_OVERRIDES[visualId];
    return[wanted?frames.find(frame=>frame.endsWith(`/${wanted}`))||frames[0]:frames[0]];
  }
  if(frames.length<=2||KEEP_THREE_FRAMES.has(visualId))return frames;
  if(visualId==='visual-pushup-explosive')return[frames.at(-1),frames[0]];
  return[frames[0],frames.at(-1)];
}

function forwardSequence(frames){return frames.map((_,index)=>index);}
function directAnimation(record,frames){
  if(record.movementType==='isometric'||frames.length<=1)return{animationMode:'STATIC',sequence:forwardSequence(frames)};
  return{animationMode:frames.length===2?'DYNAMIC_SIMPLE':'DYNAMIC_COMPLEX',sequence:forwardSequence(frames)};
}

const custom={
  'visual-tibialis-wall-raise':{source:'custom',resolutionStatus:'MATCH_ACCEPTABLE',frames:['./assets/exercises/custom/tibialis-wall-low.webp','./assets/exercises/custom/tibialis-wall-high.webp'],animationMode:'DYNAMIC_SIMPLE',sequence:[0,1],alt:'Relevé tibial au mur, position basse puis pointes relevées',originalFiles:['Standing Tibialis Raise Wall Supported.png','Standing Tibialis Raise Wall Supported2.png']},
  'visual-tibialis-single-leg':{source:'custom',resolutionStatus:'MATCH_ACCEPTABLE',frames:['./assets/exercises/custom/tibialis-wall-low.webp','./assets/exercises/custom/tibialis-wall-high.webp'],animationMode:'DYNAMIC_SIMPLE',sequence:[0,1],alt:'Relevé tibial une jambe au mur, position basse puis pointes relevées',originalFiles:['Standing Tibialis Raise Wall Supported.png','Standing Tibialis Raise Wall Supported2.png']},
  'visual-copenhagen-short':{source:'custom',resolutionStatus:'MATCH_ACCEPTABLE',frames:['./assets/exercises/custom/copenhagen-high.webp'],animationMode:'STATIC',sequence:[0],alt:'Copenhagen levier court, bassin haut en position de maintien',originalFiles:['Copenhagen1.png']},
  'visual-copenhagen-dynamic':{source:'custom',resolutionStatus:'MATCH_ACCEPTABLE',frames:['./assets/exercises/custom/copenhagen-low.webp','./assets/exercises/custom/copenhagen-high.webp'],animationMode:'DYNAMIC_SIMPLE',sequence:[0,1],alt:'Copenhagen dynamique, bassin bas puis bassin haut',originalFiles:['Copenhagen2.png','Copenhagen1.png']},
  'visual-reverse-crunch-long-lever':{source:'custom',resolutionStatus:'MATCH_EXACT',frames:['./assets/exercises/custom/reverse-crunch-long-low.webp','./assets/exercises/custom/reverse-crunch-long-high.webp'],animationMode:'DYNAMIC_SIMPLE',sequence:[0,1],alt:'Reverse crunch jambes tendues, bassin posé puis sacrum décollé',originalFiles:['StraightLegReverseCrunch.png','StraightLegReverseCrunch2.png']}
};

const catalog={};
const variantIndex={};
for(const record of records){
  const customRecord=custom[record.visualId];
  let entry;
  if(customRecord){
    entry={visualId:record.visualId,...customRecord,frameDuration:1050,parentVisualId:null,variantKeys:[...record.muscuVariants]};
  }else if(record.finalStatus==='USE_PARENT_VISUAL'){
    entry={visualId:record.visualId,resolutionStatus:'USE_PARENT_VISUAL',source:null,frames:[],animationMode:'STATIC',sequence:[],frameDuration:1050,alt:record.muscuName,parentVisualId:record.parentVisualId,variantKeys:[...record.muscuVariants]};
  }else if(record.finalStatus==='TEXT_SUFFICIENT'){
    entry={visualId:record.visualId,resolutionStatus:'TEXT_SUFFICIENT',source:null,frames:[],animationMode:'STATIC',sequence:[],frameDuration:1050,alt:record.muscuName,parentVisualId:null,variantKeys:[...record.muscuVariants]};
  }else{
    const candidate=candidateFrames(record.selectedCandidate);
    const initialMode=record.movementType==='isometric'||candidate.length<=1?'STATIC':candidate.length===2?'DYNAMIC_SIMPLE':'DYNAMIC_COMPLEX';
    const frames=selectAuditedFrames(record.visualId,initialMode,candidate),animation=directAnimation(record,frames);
    entry={visualId:record.visualId,resolutionStatus:record.finalStatus,source:record.selectedCandidate?.source||record.bestOverallSource||null,frames,...animation,frameDuration:1050,alt:record.muscuName,parentVisualId:null,variantKeys:[...record.muscuVariants]};
  }
  catalog[entry.visualId]=entry;
  for(const key of entry.variantKeys){
    if(variantIndex[key])throw new Error(`Variante dupliquée dans le catalogue: ${key}`);
    variantIndex[key]=entry.visualId;
  }
}

const referencedAssets=new Set(Object.values(catalog).flatMap(item=>item.frames));
for(const source of ['workout-guide','repdb','free-exercise-db','custom']){
  const directory=path.join(assetRoot,source);
  for(const file of fs.readdirSync(directory,{recursive:true,withFileTypes:true})){
    if(!file.isFile()||!/\.(?:svg|png|webp|jpe?g)$/i.test(file.name))continue;
    const absolute=path.join(file.parentPath||file.path,file.name);
    const relative=`./assets/exercises/${path.relative(assetRoot,absolute).replaceAll('\\','/')}`;
    if(!referencedAssets.has(relative))fs.rmSync(absolute);
  }
}

const counts=Object.values(catalog).reduce((result,item)=>{result[item.resolutionStatus]=(result[item.resolutionStatus]||0)+1;return result;},{});
const sources=Object.values(catalog).reduce((result,item)=>{if(item.source)result[item.source]=(result[item.source]||0)+1;return result;},{});
const assetFiles=Object.fromEntries(['workout-guide','repdb','free-exercise-db','custom'].map(source=>[source,new Set(Object.values(catalog).filter(item=>item.source===source).flatMap(item=>item.frames)).size]));
assetFiles.total=Object.values(assetFiles).reduce((total,count)=>total+count,0);
const summary={visualMovements:Object.keys(catalog).length,variants:Object.keys(variantIndex).length,counts,sources,assetFiles,missing:0,humanReviewRequired:0,dedicatedVisualRequired:0};
if(summary.visualMovements!==86||summary.variants!==159)throw new Error(`Couverture inattendue: ${summary.visualMovements} visuels / ${summary.variants} variantes`);

const json={catalog,variantIndex,summary};
fs.writeFileSync(path.join(projectDir,'dist','visual-catalog.json'),JSON.stringify(json,null,2));
const moduleSource=`// Catalogue visuel final généré depuis exercise-visual-resolution-v5.\nexport const VISUAL_CATALOG=Object.freeze(${JSON.stringify(catalog,null,2)});\nexport const VARIANT_VISUAL_INDEX=Object.freeze(${JSON.stringify(variantIndex,null,2)});\nexport const VISUAL_SUMMARY=Object.freeze(${JSON.stringify(summary,null,2)});\nexport const VISUAL_ATTRIBUTIONS=Object.freeze([\n  {source:'Workout Guide',license:'CC BY-SA 4.0',credit:'Illustrations par Bryl Lim; certaines sources Everkinetic sont adaptées conformément à CC BY-SA 4.0.'},\n  {source:'RepDB',license:'Free Tier attribution',credit:'Données et visuels RepDB utilisés selon les obligations documentées par l’audit.'},\n  {source:'Free Exercise DB',license:'Unlicense / domaine public',credit:'Visuels Free Exercise DB conservés localement.'},\n  {source:'Custom',license:'Fourni pour ce projet',credit:'Six images fournies directement pour Muscu; aucune capture tierce intégrée.'}\n+]);\nexport function playbackSequence(visual){\n  const forward=visual?.sequence||[];\n  if(forward.length<=2)return[...forward];\n  return[...forward,...forward.slice(1,-1).reverse()];\n}\nfunction resolveEntry(entry,seen=new Set()){\n  if(!entry)return null;\n  if(entry.resolutionStatus!=='USE_PARENT_VISUAL')return entry;\n  if(seen.has(entry.visualId))throw new Error(\`Boucle de visuel parent: \${entry.visualId}\`);\n  seen.add(entry.visualId);\n  return resolveEntry(VISUAL_CATALOG[entry.parentVisualId],seen);\n}\nexport function visualFor(exerciseId,variantId){\n  const key=\`\${exerciseId}:\${variantId}\`,requestedVisualId=VARIANT_VISUAL_INDEX[key],requested=VISUAL_CATALOG[requestedVisualId];\n  if(!requested)return null;\n  const effective=resolveEntry(requested);\n  return{...effective,requestedVisualId,effectiveVisualId:effective.visualId,resolutionStatus:requested.resolutionStatus,parentVisualId:requested.parentVisualId||null};\n}\n`;
fs.writeFileSync(path.join(projectDir,'dist','visual-catalog.js'),moduleSource.replace('\n+]);','\n]);').replace('Données et visuels RepDB utilisés selon les obligations documentées par l’audit.','Exercise data by RepDB (repdb.co). Les contraintes de la Free Tier restent applicables.'));
console.log(JSON.stringify(summary,null,2));
