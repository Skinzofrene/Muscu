import {exercises,initialLevels,blocks} from './program.js';
import {assertState,buildCycleRegistry,freshState,initializeHypertrophyLevels} from './engine.js';
import {defaultSchedulerSettings,workMetadata} from './scheduler.js';
import {reconcileObjectiveUnits} from './objective-planner.js';
import {defaultObjectives,freshHypertrophyInitialized,freshHypertrophyLevels,freshHypertrophyRotation,objectiveSnapshot} from './objectives.js';
export const DATABASE_VERSION=7;
export const freshDatabase=(now=Date.now())=>({schemaVersion:DATABASE_VERSION,revision:0,activeProfile:'principal',profiles:{principal:freshState(now),test:null},resetBackup:null});
const clone=value=>structuredClone(value);
const legacyMap={pullup:[0,0,1,2,3,4],hang:[0,0,1,2,2],split:[0,0,1,2],calf:[0,0,1,2],pushup:[0,0,1,2],dip:[0,0,1,2,3],row:[0,0,1,2],leg:[0,1,2,3],bridge:[0,1,2,3,4],tibialis:[0,0,1,1]};
const mapped=(id,level)=>legacyMap[id]?.[level]??0;

const legacySnapshot=item=>({...objectiveSnapshot(item.id,item.mode||'force','strength','canonical'),countsTowardHypertrophyVolume:false});
function migrateItem(item){const e=exercises[item.id],level=mapped(item.id,item.level),step=e.modes.force.steps[level]||e.modes.force.steps[0],base={...item,lineId:e.lineId,mode:'force',level,stepKey:step.key,variantId:step.variantId,variantName:step.variantName,rest:step.rest,instruction:step.instruction,stop:step.stop||null,alternate:null,kind:'program'};return{...base,...legacySnapshot(base)};}
function migrateLegacySession(session){const block=blocks[session.block],plan=(session.plan||[]).map(migrateItem),results=(session.results||[]).map(x=>({...migrateItem(x),actual:x.actual,rating:x.rating,note:x.note||'',at:x.at,timedSeconds:x.timedSeconds??null,modifiedAt:x.modifiedAt}));return{...session,blockId:block?.id||'A',blockVariant:null,phaseId:'phase1',phaseCycle:session.cycle||1,exerciseOrder:block?.ids||[],lineModes:Object.fromEntries((block?.ids||[]).map(id=>[exercises[id].lineId,'force'])),plan,results};}
function legacyProfileV2(old,now=Date.now()){if(!old||old.version!==1)throw Error('Version de sauvegarde non reconnue.');const next={...freshState(old.createdAt||now),schemaVersion:2,registry:undefined,settings:undefined,pendingPhase:undefined};next.revision=Number.isInteger(old.revision)?old.revision:0;next.next=old.next;next.cycle=old.cycle;next.phaseCycle=old.cycle;next.createdAt=old.createdAt||now;for(const [id,level]of Object.entries(old.levels||{})){const e=exercises[id];if(!e)continue;const value=mapped(id,level);if(e.major)next.progress[e.lineId].force=value;else next.levels[id]=value;}next.levelChanges=(old.levelChanges||[]).filter(c=>exercises[c.id]).map(c=>({id:c.id,lineId:exercises[c.id].lineId,mode:'force',from:mapped(c.id,c.from),to:mapped(c.id,c.to),at:c.at}));next.history=(old.history||[]).map(migrateLegacySession);next.active=old.active?migrateLegacySession(old.active):null;return next;}

const mergeSettings=old=>{const base=defaultSchedulerSettings(),value=old||{};return{...base,...value,expressAllowed:{...base.expressAllowed,...value.expressAllowed},fillerAllowed:{...base.fillerAllowed,...value.fillerAllowed},mobilityAllowed:{...base.mobilityAllowed,...value.mobilityAllowed},sounds:{...base.sounds,...value.sounds}};};
const historicalItem=(item,index=0,session={})=>{const base={...item,kind:item.kind||'program',officialId:item.officialId||`history:${session.id||session.startedAt}:${index}`};return base.kind==='supplementary'?base:{...base,...legacySnapshot(base)};};
function historicalSession(session){return{...session,plan:(session.plan||[]).map((r,i)=>historicalItem(r,i,session)),results:(session.results||[]).map((r,i)=>historicalItem(r,i,session)),supplementary:(session.supplementary||[]).map(r=>({...r,kind:'supplementary',supplementaryType:r.supplementaryType||'strength'})),modeChanges:session.modeChanges||[]};}
function matchUnit(registry,item,blockId){return registry.units.find(x=>x.blockId===blockId&&x.id===item.id&&x.series===item.series&&x.mode===(item.mode||'force'))||registry.units.find(x=>x.blockId===blockId&&x.id===item.id&&x.series===item.series);}

export function migrateProfileV2(old,now=Date.now()){
  if(!old||old.schemaVersion!==2)throw Error('Profil V2 invalide.');
  const next=freshState(old.createdAt||now);
  for(const key of ['revision','createdAt','next','cycle','phaseCycle','phase','progress','modeUnlocks','modeRotation','levelChanges','phaseChanges','alternations'])if(old[key]!==undefined)next[key]=clone(old[key]);next.levels={...initialLevels,...clone(old.levels||{})};
  next.schemaVersion=7;next.pendingPhase=null;next.settings=mergeSettings(old.settings);next.history=(old.history||[]).map(historicalSession);next.registry=buildCycleRegistry(next,now);
  if(old.active){
    const source=old.active,blockId=source.blockId||blocks[source.block]?.id||'A',plan=(source.plan||[]).map((item,index)=>{let unit=matchUnit(next.registry,item,blockId);if(!unit){unit={...item,kind:'program',blockId,blockIndex:source.block??next.next,order:next.registry.units.length,status:'pending',officialId:`migrated:${source.id}:${index}`,workMeta:workMetadata(item),...legacySnapshot(item)};next.registry.units.push(unit);}return{...unit};});
    const results=(source.results||[]).map((r,index)=>{const unit=matchUnit(next.registry,r,blockId)||plan[index];if(unit)unit.status='completed';const base={...r,kind:'program',officialId:r.officialId||unit?.officialId||`migrated-result:${source.id}:${index}`};return{...base,...legacySnapshot(base)};});
    const cursor=Math.min(source.cursor??results.length,Math.max(0,plan.length-1));if(source.stage==='set'&&plan[cursor]){const unit=next.registry.units.find(x=>x.officialId===plan[cursor].officialId);if(unit&&unit.status!=='completed')unit.status='in_progress';}
    const owner=results.at(-1);next.active={...source,blockId,plan,results,supplementary:[],cursor,mainRest:source.stage==='rest'&&owner?{ownerId:owner.officialId,ownerName:owner.variantName,until:source.restUntil,index:++next.registry.restCount}:null,intermediate:null,suggestion:null,excludedSuggestions:[],suppressSuggestions:false,modeChanges:[]};
  }
  return assertState(next);
}

export function migrateLegacyProfile(old,now=Date.now()){return migrateProfileV2(legacyProfileV2(old,now),now);}
function withV7Structures(profile,now=Date.now(),preserveV6=false){
  const next=profile;next.schemaVersion=7;next.levels={...initialLevels,...(next.levels||{})};next.objectives=next.objectives||defaultObjectives();next.hypertrophyLevels={...freshHypertrophyLevels(),...(next.hypertrophyLevels||{})};next.hypertrophyRotation={...freshHypertrophyRotation(),...(next.hypertrophyRotation||{})};next.hypertrophyInitialized={...freshHypertrophyInitialized(),...(next.hypertrophyInitialized||{})};next.hypertrophyLevelChanges=next.hypertrophyLevelChanges||[];next.settings=mergeSettings(next.settings);if(!preserveV6){next.history=(next.history||[]).map(historicalSession);if(next.active)next.active=historicalSession(next.active);}
  if(!next.registry)next.registry=buildCycleRegistry(next,now);else{if(!preserveV6)next.registry.units=(next.registry.units||[]).map(unit=>({...unit,...legacySnapshot(unit),workMeta:unit.workMeta||workMetadata(unit)}));else next.registry.units=(next.registry.units||[]).map(unit=>({...unit,workMeta:unit.workMeta||workMetadata(unit)}));next.registry.fillers=(next.registry.fillers||[]).map(x=>({...x,supplementaryType:x.supplementaryType||'strength'}));next.registry.activityOffers=next.registry.activityOffers||[];next.registry.finalizedBlocks=next.registry.finalizedBlocks||[];next.registry.rotationConsumptions=next.registry.rotationConsumptions||[];}
  if(next.objectives.zones.glutes==='hypertrophy')initializeHypertrophyLevels(next,undefined,now,false);
  if(preserveV6&&!next.active){const previous=next.registry,fresh=buildCycleRegistry(next,now);next.registry=previous;reconcileObjectiveUnits(next,now,fresh);}
  return next;
}
export function migrateProfileV6(old,now=Date.now()){if(!old||old.schemaVersion!==6)throw Error('Profil V6 invalide.');return assertState(withV7Structures(clone(old),now,true));}
export function migrateProfileV5(old,now=Date.now()){if(!old||old.schemaVersion!==5)throw Error('Profil V5 invalide.');return assertState(withV7Structures(clone(old),now));}
export function migrateProfileV3(old,now=Date.now()){if(!old||old.schemaVersion!==3)throw Error('Profil V3 invalide.');const next=clone(old);next.settings=mergeSettings(old.settings);next.flexibility={history:[],active:null};return assertState(withV7Structures(next,now));}
const legacyFlexSession=(session,now,status=session.status)=>({...session,legacy:true,sourceContext:'flexibility-legacy',status:status==='active'?'interrupted':status,finishedAt:session.finishedAt||(status==='active'?now:null),results:(session.results||[]).map(result=>({...result,legacy:true,legacyId:result.exerciseId||result.id,sourceContext:'flexibility-legacy'}))});
export function migrateProfileV4(old,now=Date.now()){
  if(!old||old.schemaVersion!==4)throw Error('Profil V4 invalide.');const next=clone(old);next.settings=mergeSettings(old.settings);
  const flex=old.flexibility||{history:[],active:null},history=(flex.history||[]).map(session=>legacyFlexSession(session,now));if(flex.active)history.push(legacyFlexSession(flex.active,now,'active'));next.flexibility={history,active:null};
  if(next.active?.suggestion?.item?.supplementaryType==='mobility')next.active.suggestion=null;return assertState(withV7Structures(next,now));
}
export function assertDatabase(db){if(!db||db.schemaVersion!==DATABASE_VERSION||!Number.isInteger(db.revision)||!['principal','test'].includes(db.activeProfile)||!db.profiles?.principal)throw Error('Sauvegarde globale incompatible ou endommagée.');assertState(db.profiles.principal);if(db.profiles.test)assertState(db.profiles.test);if(db.activeProfile==='test'&&!db.profiles.test)throw Error('Le profil Test actif est absent.');if(db.resetBackup){if(!Number.isFinite(db.resetBackup.savedAt)||!db.resetBackup.profile)throw Error('Sauvegarde avant reset invalide.');assertState(db.resetBackup.profile);}return db;}
export function migrateData(value,now=Date.now()){const original=clone(value);try{
  if(value?.schemaVersion===DATABASE_VERSION&&value?.profiles)return assertDatabase(clone(value));
  if(value?.schemaVersion===DATABASE_VERSION&&value?.history)return assertDatabase({schemaVersion:DATABASE_VERSION,revision:0,activeProfile:'principal',profiles:{principal:assertState(clone(value)),test:null},resetBackup:null});
  const migrateProfile=version=>version===6?(p=>migrateProfileV6(p,now)):version===5?(p=>migrateProfileV5(p,now)):version===4?(p=>migrateProfileV4(p,now)):version===3?(p=>migrateProfileV3(p,now)):version===2?(p=>migrateProfileV2(p,now)):null,version=value?.schemaVersion,migrate=migrateProfile(version);
  if(migrate&&value?.profiles)return assertDatabase({schemaVersion:DATABASE_VERSION,revision:value.revision||0,activeProfile:value.activeProfile||'principal',profiles:{principal:migrate(value.profiles.principal),test:value.profiles.test?migrate(value.profiles.test):null},resetBackup:value.resetBackup?{...value.resetBackup,profile:migrate(value.resetBackup.profile)}:null});
  if(migrate&&value?.history)return assertDatabase({schemaVersion:DATABASE_VERSION,revision:0,activeProfile:'principal',profiles:{principal:migrate(value),test:null},resetBackup:null});
  if(value?.version===1)return assertDatabase({schemaVersion:DATABASE_VERSION,revision:0,activeProfile:'principal',profiles:{principal:migrateLegacyProfile(value,now),test:null},resetBackup:null});
  throw Error('Version de sauvegarde non reconnue.');
}catch(error){error.original=original;throw error;}}
export function parseImport(text,now=Date.now()){let parsed;try{parsed=JSON.parse(text);}catch{throw Error('Ce fichier ne contient pas de JSON valide.');}return migrateData(parsed,now);}
export function activeState(db){return db.profiles[db.activeProfile];}
export function createTestProfile(db,copyPrincipal=false,now=Date.now()){db.profiles.test=copyPrincipal?clone(db.profiles.principal):freshState(now);db.profiles.test.revision=0;db.activeProfile='test';}
export function switchProfile(db,name){if(name==='test'&&!db.profiles.test)throw Error('Crée d’abord le profil Test.');if(!['principal','test'].includes(name))throw Error('Profil inconnu.');db.activeProfile=name;}
export function resetTest(db,now=Date.now()){db.profiles.test=freshState(now);db.activeProfile='test';}
export function resetPrincipal(db,choice='auto',now=Date.now()){if(!db.resetBackup)db.resetBackup={savedAt:now,profile:clone(db.profiles.principal)};else if(choice==='replace')db.resetBackup={savedAt:now,profile:clone(db.profiles.principal)};else if(choice==='delete')db.resetBackup=null;else if(choice!=='keep')throw Error('Choix de reset invalide.');db.profiles.principal=freshState(now);db.activeProfile='principal';}
export function restoreBackup(db){if(!db.resetBackup)throw Error('Aucune sauvegarde avant reset.');db.profiles.principal=clone(db.resetBackup.profile);db.profiles.principal.revision++;db.activeProfile='principal';}
export function deleteBackup(db){db.resetBackup=null;}
export function exportPayload(db,scope='current'){if(scope==='all')return clone(db);if(scope==='backup'){if(!db.resetBackup)throw Error('Aucune sauvegarde avant reset.');return clone(db.resetBackup.profile);}const name=scope==='principal'?'principal':scope==='test'?'test':db.activeProfile;const profile=db.profiles[name];if(!profile)throw Error('Profil absent.');return clone(profile);}
