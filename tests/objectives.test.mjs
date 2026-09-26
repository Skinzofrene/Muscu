import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {blocksFor} from '../dist/program.js';
import {assertState,buildCycleRegistry,changeLevel,freshState,recommendation,requestObjectiveChange,requestPersonalizationChange,setExecutionMode,start,validateSet,skipRest} from '../dist/engine.js';
import {createTestProfile,freshDatabase,migrateData} from '../dist/storage.js';
import {HYPERTROPHY_DEFINITIONS,MUSCLE_MAP,ZONE_ORDER,objectiveSnapshot} from '../dist/objectives.js';
import {contributionByZone,hypertrophyVolume,objectiveZoneSummary} from '../dist/objective-planner.js';

const signature=state=>state.registry.units.map(x=>[x.blockId,x.id,x.mode,x.variantId,x.series,x.total,x.target,x.unit,x.rest]);
const V5_PHASE1=[
  ['A','pullup','force','stricte',1,3,1,'reps',120],['A','pullup','force','stricte',2,3,1,'reps',120],['A','pullup','force','stricte',3,3,1,'reps',120],
  ['A','hang','force','suspension',1,2,12,'seconds',60],['A','hang','force','suspension',2,2,12,'seconds',60],
  ['B','split','force','split-squat',1,2,6,'side',90],['B','split','force','split-squat',2,2,6,'side',90],['B','calf','force','base',1,2,8,'side',45],['B','calf','force','base',2,2,8,'side',45],
  ['C','pushup','force','classique',1,2,6,'reps',90],['C','pushup','force','classique',2,2,6,'reps',90],['C','dip','force','stricts',1,2,2,'reps',120],['C','dip','force','stricts',2,2,2,'reps',120],
  ['D','row','force','actuel',1,2,8,'reps',90],['D','row','force','actuel',2,2,8,'reps',90],['D','leg','force','jambes-chaise',1,2,5,'reps',60],['D','leg','force','jambes-chaise',2,2,5,'reps',60],
  ['E','bridge','force','deux-jambes',1,2,8,'reps',60],['E','bridge','force','deux-jambes',2,2,8,'reps',60],['E','tibialis','force','mur-proche',1,2,10,'reps',40],['E','tibialis','force','mur-proche',2,2,10,'reps',40]
];

test('baseline tout Force reproduit strictement le programme sportif V5',()=>{
  const state=freshState(1);
  assert.deepEqual(Object.values(state.objectives.zones),Array(11).fill('strength'));
  assert.equal(state.objectives.personalization,'balanced');
  assert.deepEqual(blocksFor(state).map(b=>[b.id,b.ids]),[['A',['pullup','hang']],['B',['split','calf']],['C',['pushup','dip']],['D',['row','leg']],['E',['bridge','tibialis']]]);
  assert.deepEqual(signature(state),V5_PHASE1);
  assert.ok(state.registry.units.every(x=>x.source==='canonical'&&x.priorityAtCreation==='strength'&&!x.countsTowardHypertrophyVolume));
});

test('catalogue H n’utilise que les variantes canoniques sûres et sépare les niveaux',()=>{
  const forbidden=/archer|une-main|un-bras|pistol|handstand|hspu/;
  for(const [id,levels]of Object.entries(HYPERTROPHY_DEFINITIONS)){assert.equal(levels.length,id==='gluteSplit'?4:5,id);assert.ok(levels.every(level=>level.targetMin<=level.targetMax&&!forbidden.test(level.variantId)),id);}
  const state=freshState(1);state.progress.horizontalPush.force=5;assert.equal(state.hypertrophyLevels.pushup,0);changeLevel(state,'pushup',1,2,'hypertrophy');assert.equal(state.progress.horizontalPush.force,5);assert.equal(state.hypertrophyLevels.pushup,1);
});

test('carte musculaire crédite une zone une seule fois et les secondaires à 0,5',()=>{
  const row={id:'row',stimulus:'hypertrophy',countsTowardHypertrophyVolume:true,muscleContributions:MUSCLE_MAP.row};
  assert.deepEqual(contributionByZone(row),{back:1,biceps:.5,shoulders:.5,forearms:.5});
  const pushup={id:'pushup',stimulus:'hypertrophy',countsTowardHypertrophyVolume:true,muscleContributions:MUSCLE_MAP.pushup};
  assert.deepEqual(contributionByZone(pushup),{chest:1,triceps:.5,shoulders:.5});
});

test('les contributions légères et tous les stimuli non H valent zéro',()=>{
  const item={id:'pushup',stimulus:'hypertrophy',countsTowardHypertrophyVolume:true,muscleContributions:{direct:['pecs'],importantSecondary:['triceps'],lightSecondary:['frontDelt']}};
  assert.deepEqual(contributionByZone(item),{chest:1,triceps:.5,shoulders:0});
  for(const stimulus of ['force','endurance','power'])assert.deepEqual(contributionByZone({...item,stimulus,countsTowardHypertrophyVolume:false}),{});
});

test('rotation H suit H H F H H E H H F H H P quand tout est débloqué',()=>{
  const state=freshState(1);requestObjectiveChange(state,'back','hypertrophy','now',2);state.modeUnlocks.verticalPull.endurance=true;state.modeUnlocks.verticalPull.power=true;state.objectives.personalization='compact';
  const seen=[];for(let i=0;i<12;i++){state.registry=buildCycleRegistry(state,100+i);const unit=state.registry.units.find(x=>x.id==='pullup');seen.push(unit.mode);const plan=unit.objectiveRotation,rotation=state.hypertrophyRotation.pullup;rotation.slot=(rotation.slot+1)%3;if(plan.consumeMaintenance)rotation.maintenance=(plan.maintenanceIndex+1)%4;}
  assert.deepEqual(seen,['hypertrophy','hypertrophy','force','hypertrophy','hypertrophy','endurance','hypertrophy','hypertrophy','force','hypertrophy','hypertrophy','power']);
});

test('maintenance verrouillée revient à Force sans consommer son curseur, mode impossible est sauté',()=>{
  const locked=freshState(1);requestObjectiveChange(locked,'back','hypertrophy','now',2);locked.hypertrophyRotation.pullup={slot:2,maintenance:1};locked.registry=buildCycleRegistry(locked,3);let unit=locked.registry.units.find(x=>x.id==='pullup');assert.equal(unit.mode,'force');assert.equal(unit.objectiveRotation.consumeMaintenance,false);assert.equal(locked.hypertrophyRotation.pullup.maintenance,1);
  locked.modeUnlocks.verticalPull.endurance=true;locked.registry=buildCycleRegistry(locked,4);unit=locked.registry.units.find(x=>x.id==='pullup');assert.equal(unit.mode,'endurance');assert.equal(unit.objectiveRotation.consumeMaintenance,true);
  const impossible=freshState(1);requestObjectiveChange(impossible,'glutes','hypertrophy','now',2);impossible.hypertrophyRotation.bridge={slot:2,maintenance:3};impossible.registry=buildCycleRegistry(impossible,5);unit=impossible.registry.units.find(x=>x.id==='bridge');assert.equal(unit.mode,'force');assert.equal(unit.objectiveRotation.maintenanceIndex,0);
});

function hResult(id,at,extra={}){return{id,at,stimulus:'hypertrophy',mode:'hypertrophy',countsTowardHypertrophyVolume:true,muscleContributions:MUSCLE_MAP[id],...extra};}
test('volume H utilise une fenêtre glissante exacte de 7×24 h et ignore les autres stimuli',()=>{
  const now=10*86400000,state=freshState(1);state.registry.units=[];state.history=[{results:[hResult('pushup',now-7*86400000),hResult('pushup',now-7*86400000+1),{...hResult('pushup',now-1),stimulus:'force',mode:'force',countsTowardHypertrophyVolume:false}]}];
  const summary=hypertrophyVolume(state,now,false);assert.equal(summary.chest.volume,1);assert.equal(summary.triceps.volume,.5);
});

test('les états de volume sont construction, cible puis élevé sans culpabilisation',()=>{
  const now=10*86400000,state=freshState(1);state.registry.units=[];state.objectives.zones.chest='hypertrophy';
  state.history=[{results:Array.from({length:7},(_,i)=>hResult('pushup',now-i-1))}];assert.equal(objectiveZoneSummary(state,'chest',now).status,'building');
  state.history=[{results:Array.from({length:8},(_,i)=>hResult('pushup',now-i-1))}];assert.equal(objectiveZoneSummary(state,'chest',now).status,'target');
  state.history=[{results:Array.from({length:13},(_,i)=>hResult('pushup',now-i-1))}];assert.equal(objectiveZoneSummary(state,'chest',now).status,'high');
});

test('couverture composite reste incomplète si une sous-zone directe manque',()=>{
  const now=10*86400000,state=freshState(1);state.registry.units=[];state.history=[{results:Array.from({length:10},(_,i)=>hResult('abductor',now-i-1))}];
  const glutes=hypertrophyVolume(state,now,false).glutes;assert.equal(glutes.volume,10);assert.ok(glutes.missing.includes('gluteMax'));
  const shoulders=objectiveZoneSummary(Object.assign(state,{objectives:{...state.objectives,zones:{...state.objectives.zones,shoulders:'hypertrophy'}}}),'shoulders',now);assert.equal(shoulders.capability,'partial');assert.ok(shoulders.missing.includes('sideDelt'));
});

test('planner recycle les lignes, plafonne les ajouts et ne top-up pas une maintenance',()=>{
  const state=freshState(1);requestObjectiveChange(state,'glutes','hypertrophy','now',2);let bridge=state.registry.units.filter(x=>x.id==='bridge');assert.equal(bridge.filter(x=>x.source==='canonical').length,2);assert.equal(bridge.filter(x=>x.source==='objective-extra').length,1);
  requestPersonalizationChange(state,'compact','now',3);bridge=state.registry.units.filter(x=>x.id==='bridge');assert.ok(bridge.filter(x=>x.source!=='canonical').length<=1);
  state.hypertrophyRotation.bridge={slot:2,maintenance:0};state.registry=buildCycleRegistry(state,4);bridge=state.registry.units.filter(x=>x.id==='bridge');assert.ok(bridge.every(x=>x.mode==='force'));assert.equal(bridge.some(x=>x.source==='objective-extra'),false);
});

test('les budgets Compact, Équilibré et Maximiser bornent chaque bloc',()=>{
  for(const [personalization,limit] of [['compact',1],['balanced',2],['maximize',4]]){
    const state=freshState(1);state.objectives.personalization=personalization;for(const zone of ZONE_ORDER)state.objectives.zones[zone]='hypertrophy';state.registry=buildCycleRegistry(state,2);
    for(const blockId of ['A','B','C','D','E']){const effectiveLimit=blockId==='E'?{compact:3,balanced:4,maximize:6}[personalization]:limit;assert.ok(state.registry.units.filter(unit=>unit.blockId===blockId&&unit.source!=='canonical').length<=effectiveLimit,`${personalization}/${blockId}`);}
    const zoneCounts=new Map();for(const unit of state.registry.units.filter(unit=>unit.source!=='canonical')){const key=`${unit.blockId}:${unit.ownerZone}`;zoneCounts.set(key,(zoneCounts.get(key)||0)+1);}for(const [key,count]of zoneCounts)assert.ok(key==='E:glutes'?count<={compact:3,balanced:4,maximize:6}[personalization]:count<=2,key);
  }
});

test('à douze séries récentes le planner n’ajoute aucun top-up automatique',()=>{
  const now=10*86400000,state=freshState(1);state.history=[{results:Array.from({length:12},(_,i)=>hResult('bridge',now-i-1))}];requestObjectiveChange(state,'glutes','hypertrophy','now',now);assert.equal(state.registry.units.some(unit=>unit.ownerZone==='glutes'&&unit.source==='objective-extra'),false);
});

test('le tri du planner est strictement déterministe',()=>{
  const make=()=>{const state=freshState(1);for(const zone of ZONE_ORDER)state.objectives.zones[zone]='hypertrophy';state.registry=buildCycleRegistry(state,2);return state.registry.units.map(unit=>[unit.officialId,unit.order,unit.source]);};assert.deepEqual(make(),make());
});

test('Chin-up et Reverse crunch sont absents en Force et ajoutés seulement pour leur objectif',()=>{
  const state=freshState(1);assert.equal(state.registry.units.some(x=>['chinup','reverseCrunch'].includes(x.id)),false);
  requestObjectiveChange(state,'biceps','hypertrophy','now',2);assert.equal(state.registry.units.filter(x=>x.id==='chinup').length,2);assert.ok(state.registry.units.filter(x=>x.id==='chinup').every(x=>x.blockId==='A'&&x.source==='objective-line'));
  requestObjectiveChange(state,'core','hypertrophy','now',3);assert.ok(state.registry.units.some(x=>x.id==='reverseCrunch'&&x.blockId==='D'&&x.source==='objective-line'));
});

test('une série propriétaire H crédite une zone H secondaire sans modifier son propriétaire Force',()=>{
  const state=freshState(1);requestObjectiveChange(state,'chest','hypertrophy','now',2);const pushup=state.registry.units.find(unit=>unit.id==='pushup'),dip=state.registry.units.find(unit=>unit.id==='dip');assert.equal(pushup.stimulus,'hypertrophy');assert.equal(contributionByZone(pushup).triceps,.5);assert.equal(state.objectives.zones.triceps,'strength');assert.equal(dip.stimulus,'force');
});

test('Qualité, Express, Densité et Hybride ne changent jamais le stimulus officiel',()=>{
  const state=freshState(1);requestObjectiveChange(state,'biceps','hypertrophy','now',2);const before=state.registry.units.map(unit=>[unit.officialId,unit.stimulus]);for(const mode of ['express','density','hybrid','quality']){setExecutionMode(state,mode,3);assert.deepEqual(state.registry.units.map(unit=>[unit.officialId,unit.stimulus]),before);}
});

test('le curseur Force reste figé pendant H puis reprend intact',()=>{
  const state=freshState(1),forceCursor=state.modeRotation.verticalPull;requestObjectiveChange(state,'back','hypertrophy','now',2);const hCursor=state.hypertrophyRotation.pullup.slot;start(state,3);while(state.active){if(state.active.stage==='rest')skipRest(state);else validateSet(state,4);}assert.equal(state.modeRotation.verticalPull,forceCursor);assert.notEqual(state.hypertrophyRotation.pullup.slot,hCursor);requestObjectiveChange(state,'back','strength','now',5);state.registry.units.forEach(unit=>{unit.status='completed';});start(state,6);assert.equal(state.modeRotation.verticalPull,forceCursor);assert.equal(state.registry.units.find(unit=>unit.id==='pullup').stimulus,'force');
});

test('changement Maintenant conserve completed, current et chronos puis recompose pending',()=>{
  const state=freshState(1);state.next=4;start(state,10);validateSet(state,20);skipRest(state);const completed=structuredClone(state.active.results),current=structuredClone(state.active.plan[state.active.cursor]);state.active.timer={elapsedMs:1234,runningSince:null};
  requestObjectiveChange(state,'glutes','hypertrophy','now',30);assert.deepEqual(state.active.results,completed);assert.deepEqual(state.active.plan[state.active.cursor],current);assert.deepEqual(state.active.timer,{elapsedMs:1234,runningSince:null});assert.ok(state.registry.units.some(x=>x.id==='bridge'&&x.mode==='hypertrophy'&&x.status==='pending'));assertState(state);
});

test('Prochain cycle ne modifie rien immédiatement puis s’applique à la bascule',()=>{
  const state=freshState(1),before=signature(state);requestObjectiveChange(state,'glutes','hypertrophy','next',2);assert.deepEqual(signature(state),before);assert.equal(state.objectives.zones.glutes,'strength');assert.equal(state.objectives.pendingChanges.zones.glutes,'hypertrophy');
  state.registry.units.forEach(unit=>{unit.status='completed';});start(state,3);assert.equal(state.cycle,2);assert.equal(state.objectives.zones.glutes,'hypertrophy');assert.equal(state.objectives.pendingChanges,null);assert.ok(state.registry.units.some(unit=>unit.id==='bridge'&&unit.mode==='hypertrophy'));
});

test('progression H suggère + ou − après deux expositions sans changement automatique',()=>{
  const state=freshState(1);requestObjectiveChange(state,'chest','hypertrophy','now',2);const step=state.registry.units.find(x=>x.id==='pushup'&&x.mode==='hypertrophy'),make=(id,rating,actual,at,level=step.level)=>({id,startedAt:at,finishedAt:at+1,status:'complete',results:[{...step,level,actual,rating,note:'',at}],supplementary:[]});state.history=[make('a','Correct',step.targetMax,10),make('b','Facile',step.targetMax,20)];assert.equal(recommendation(state,'pushup','hypertrophy').kind,'up');assert.equal(state.hypertrophyLevels.pushup,0);state.history=[make('c','Trop dur',step.targetMin-1,30,1),make('d','Trop dur',step.targetMin-1,40,1)];state.hypertrophyLevels.pushup=1;assert.equal(recommendation(state,'pushup','hypertrophy').kind,'down');
});

test('une douleur récente interdit toute suggestion de hausse H',()=>{
  const state=freshState(1);requestObjectiveChange(state,'chest','hypertrophy','now',2);const step=state.registry.units.find(x=>x.id==='pushup'&&x.mode==='hypertrophy'),make=(id,rating,at)=>({id,startedAt:at,finishedAt:at+1,status:'complete',results:[{...step,actual:step.targetMax,rating,note:'',at}],supplementary:[]});state.history=[make('a','Correct',10),make('b','Douleur / gêne',20)];assert.notEqual(recommendation(state,'pushup','hypertrophy')?.kind,'up');
});

test('Principal et Test isolent objectifs, niveaux et rotations H',()=>{
  const db=freshDatabase(1);createTestProfile(db,false,2);requestObjectiveChange(db.profiles.test,'chest','hypertrophy','now',3);db.profiles.test.hypertrophyLevels.pushup=3;db.profiles.test.hypertrophyRotation.pushup.slot=2;assert.equal(db.profiles.principal.objectives.zones.chest,'strength');assert.equal(db.profiles.principal.hypertrophyLevels.pushup,0);assert.equal(db.profiles.principal.hypertrophyRotation.pushup.slot,0);
});

test('migration V5 initialise Force et ne crédite jamais rétroactivement l’historique',()=>{
  const fresh=freshState(1),v5=structuredClone(fresh);v5.schemaVersion=5;delete v5.objectives;delete v5.hypertrophyLevels;delete v5.hypertrophyRotation;delete v5.hypertrophyLevelChanges;v5.history=[{id:'old',startedAt:2,finishedAt:3,status:'complete',pausedMs:0,results:[{...v5.registry.units[0],actual:1,rating:'Correct',note:'',at:3}],supplementary:[]}];
  const migrated=migrateData(v5,4).profiles.principal;assert.ok(ZONE_ORDER.every(zone=>migrated.objectives.zones[zone]==='strength'));assert.equal(migrated.history[0].results[0].countsTowardHypertrophyVolume,false);assert.equal(hypertrophyVolume(migrated,4,false).back.volume,0);assertState(migrated);
});

test('migration V2 complète les niveaux des exercices ajoutés en V6',()=>{
  const v2=freshState(1);v2.schemaVersion=2;delete v2.levels.chinup;delete v2.levels.reverseCrunch;delete v2.objectives;delete v2.hypertrophyLevels;delete v2.hypertrophyRotation;delete v2.hypertrophyLevelChanges;
  const migrated=migrateData(v2,4).profiles.principal;assert.equal(migrated.levels.chinup,0);assert.equal(migrated.levels.reverseCrunch,0);assertState(migrated);
});

test('UI V6 expose les contrôles segmentés, la vue Objectifs et les modules hors ligne',async()=>{
  const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),sw=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8'),css=await readFile(new URL('../dist/style.css',import.meta.url),'utf8');for(const token of ['Objectifs musculaires','select-objective','data-zone','Prochain cycle','Maintenant','Optimisation partielle','progress-section','set-personalization'])assert.ok(app.includes(token),token);for(const asset of ['./objectives.js','./objective-planner.js'])assert.ok(sw.includes(asset),asset);assert.ok(css.includes('@media(max-width:430px)'));assert.equal(/\b(alert|confirm|prompt)\s*\(/.test(app),false);
});
