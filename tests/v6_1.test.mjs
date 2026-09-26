import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {exercises,stepFor} from '../dist/program.js';
import {assertState,blockProgress,freshState,initializeHypertrophyLevels,registryPending,reopenBlock,requestObjectiveChange,requestPersonalizationChange,setExecutionMode,skipBlock,start,validateSet,abandon,restSuggestion} from '../dist/engine.js';
import {createTestProfile,exportPayload,freshDatabase,migrateData,parseImport} from '../dist/storage.js';
import {overviewStats} from '../dist/stats.js';
import {glutePatternSummary,hypertrophyVolume,objectiveZoneSummary} from '../dist/objective-planner.js';
import {GLUTE_HYPERTROPHY_TEMPLATE,HYPERTROPHY_INITIAL_LEVEL_MAP,MUSCLE_MAP,objectiveSnapshot} from '../dist/objectives.js';

const DAY=86400000;
const now=10*DAY;
const hResult=(id,at=now-1,extra={})=>({id,at,mode:'hypertrophy',stimulus:'hypertrophy',countsTowardHypertrophyVolume:true,muscleContributions:MUSCLE_MAP[id],objectivePattern:objectiveSnapshot(id,'hypertrophy').objectivePattern,unit:extra.unit||'reps',...extra});
const historyOf=results=>[{id:'history',startedAt:now-100,finishedAt:now,status:'complete',pausedMs:0,results,supplementary:[]}];
const activateGlutes=(personalization='balanced')=>{const state=freshState(1);state.objectives.personalization=personalization;requestObjectiveChange(state,'glutes','hypertrophy','now',now);return state;};
const gluteUnits=state=>state.registry.units.filter(unit=>unit.ownerZone==='glutes'&&unit.stimulus==='hypertrophy');

test('le template Fessiers reste inactif en Force et le baseline sportif demeure canonique',()=>{
  const state=freshState(1);
  assert.equal(state.objectives.zones.glutes,'strength');
  assert.equal(state.registry.units.some(unit=>unit.id==='gluteSplit'||(unit.id==='abductor'&&unit.source==='objective-line')),false);
  assert.deepEqual(state.registry.units.filter(unit=>unit.blockId==='E').map(unit=>[unit.id,unit.mode,unit.variantId]),[
    ['bridge','force','deux-jambes'],['bridge','force','deux-jambes'],['tibialis','force','mur-proche'],['tibialis','force','mur-proche']
  ]);
});

test('Fessiers H répartit Unilatéral en B et Extension + Abduction en E',()=>{
  const state=activateGlutes(),units=gluteUnits(state),patterns=glutePatternSummary(state,now,true);
  assert.deepEqual([...new Set(units.map(unit=>unit.id))],['gluteSplit','bridge','abductor']);
  assert.ok(units.filter(unit=>unit.id==='gluteSplit').every(unit=>unit.blockId==='B'&&unit.stimulus==='hypertrophy'));
  assert.ok(units.filter(unit=>['bridge','abductor'].includes(unit.id)).every(unit=>unit.blockId==='E'&&unit.stimulus==='hypertrophy'));
  assert.equal(patterns.covered,true);
  assert.ok(hypertrophyVolume(state,now,true).glutes.volume>=8);
});

test('huit Bridges ne couvrent pas le template malgré un volume brut suffisant',()=>{
  const state=freshState(1);state.registry.units=[];state.objectives.zones.glutes='hypertrophy';state.history=historyOf(Array.from({length:8},(_,i)=>hResult('bridge',now-i-1)));
  const patterns=glutePatternSummary(state,now),summary=objectiveZoneSummary(state,'glutes',now);
  assert.equal(patterns.patterns.hipExtension.count,8);assert.equal(patterns.covered,false);assert.deepEqual(patterns.missing,['unilateralHipKneeExtension','hipAbduction']);assert.equal(summary.status,'coverage');
});

test('2/2/2 couvre les trois patterns mais laisse le volume global en construction',()=>{
  const state=freshState(1);state.registry.units=[];state.objectives.zones.glutes='hypertrophy';state.history=historyOf(['bridge','bridge','gluteSplit','gluteSplit','abductor','abductor'].map((id,i)=>hResult(id,now-i-1,{unit:id==='bridge'?'reps':'side'})));
  assert.equal(glutePatternSummary(state,now).covered,true);const summary=objectiveZoneSummary(state,'glutes',now);assert.equal(summary.volume,6);assert.equal(summary.status,'building');
});

test('4/2/2 atteint le floor avec chaque pattern couvert',()=>{
  const state=freshState(1);state.registry.units=[];state.objectives.zones.glutes='hypertrophy';state.history=historyOf(['bridge','bridge','bridge','bridge','gluteSplit','gluteSplit','abductor','abductor'].map((id,i)=>hResult(id,now-i-1)));
  const summary=objectiveZoneSummary(state,'glutes',now);assert.equal(summary.volume,8);assert.equal(summary.patterns.covered,true);assert.equal(summary.status,'target');
});

test('deux séries unilatérales par côté comptent deux séries, jamais quatre',()=>{
  const state=freshState(1);state.registry.units=[];state.history=historyOf([hResult('gluteSplit',now-2,{unit:'side',leftActual:12,rightActual:12}),hResult('gluteSplit',now-1,{unit:'side',leftActual:12,rightActual:12})]);
  assert.equal(glutePatternSummary(state,now).patterns.unilateralHipKneeExtension.count,2);assert.equal(hypertrophyVolume(state,now,false).glutes.volume,2);
});

test('Split Quad Force ne crédite pas le pattern et GluteSplit H remplace toujours son slot',()=>{
  const state=freshState(1);state.registry.units=[];state.history=historyOf([hResult('split',now-2,{mode:'force',stimulus:'force',countsTowardHypertrophyVolume:false}),hResult('split',now-1,{mode:'force',stimulus:'force',countsTowardHypertrophyVolume:false})]);
  assert.equal(glutePatternSummary(state,now).patterns.unilateralHipKneeExtension.count,0);
  const recycled=freshState(1);requestObjectiveChange(recycled,'quads','hypertrophy','now',now);requestObjectiveChange(recycled,'glutes','hypertrophy','now',now+1);
  assert.equal(recycled.registry.units.some(unit=>unit.id==='split'),false);assert.ok(recycled.registry.units.filter(unit=>unit.id==='gluteSplit'&&unit.blockId==='B'&&unit.stimulus==='hypertrophy').length>=2);
});

test('GluteSplit H remplace le Split Quad Force exactement dans le bloc B',()=>{
  const state=activateGlutes();const split=state.registry.units.filter(unit=>unit.id==='split'),gluteSplit=state.registry.units.filter(unit=>unit.id==='gluteSplit');
  assert.equal(split.length,0);assert.ok(gluteSplit.length>=2&&gluteSplit.every(unit=>unit.mode==='hypertrophy'&&unit.blockId==='B'));
});

test('le planner conserve le slot B et complète l’Abduction sans doublon GluteSplit en E',()=>{
  const state=freshState(1);state.history=historyOf(Array.from({length:6},(_,i)=>hResult('bridge',now-i-1)));requestObjectiveChange(state,'glutes','hypertrophy','now',now);
  const extras=state.registry.units.filter(unit=>unit.source!=='canonical'&&unit.ownerZone==='glutes');assert.equal(extras.some(unit=>unit.id==='bridge'),false);assert.ok(state.registry.units.some(unit=>unit.id==='gluteSplit'&&unit.blockId==='B'));assert.equal(state.registry.units.some(unit=>unit.id==='gluteSplit'&&unit.blockId==='E'),false);assert.ok(extras.some(unit=>unit.id==='abductor'));
});

test('Compact étale, Équilibré couvre, Maximiser approche la cible plus vite',()=>{
  const compact=activateGlutes('compact'),balanced=activateGlutes('balanced'),maximize=activateGlutes('maximize');
  assert.deepEqual(Object.fromEntries(['bridge','gluteSplit','abductor'].map(id=>[id,gluteUnits(compact).filter(unit=>unit.id===id).length])),{bridge:3,gluteSplit:2,abductor:2});assert.equal(glutePatternSummary(compact,now,true).covered,true);
  assert.equal(glutePatternSummary(balanced,now,true).covered,true);assert.equal(hypertrophyVolume(balanced,now,true).glutes.volume,8);
  assert.equal(glutePatternSummary(maximize,now,true).covered,true);assert.ok(hypertrophyVolume(maximize,now,true).glutes.volume>hypertrophyVolume(balanced,now,true).glutes.volume);
});

test('le plafond automatique 12 reste absolu même si un pattern manque',()=>{
  const state=freshState(1);state.history=historyOf(Array.from({length:12},(_,i)=>hResult('bridge',now-i-1)));requestObjectiveChange(state,'glutes','hypertrophy','now',now);
  assert.equal(hypertrophyVolume(state,now,true).glutes.volume,12);assert.equal(state.registry.units.some(unit=>unit.ownerZone==='glutes'&&unit.source!=='canonical'),false);
});

test('le template n’est pas généralisé aux autres zones H',()=>{
  const state=freshState(1);requestObjectiveChange(state,'chest','hypertrophy','now',now);const extras=state.registry.units.filter(unit=>unit.source!=='canonical');
  assert.ok(extras.length<=2);assert.equal(extras.some(unit=>['gluteSplit','abductor'].includes(unit.id)),false);assert.equal(state.registry.units.filter(unit=>unit.id==='pushup'&&unit.mode==='hypertrophy').length,3);
});

test('les trois minima et budgets du template sont des données explicites',()=>{
  assert.equal(GLUTE_HYPERTROPHY_TEMPLATE.minimumPerPattern,2);assert.equal(GLUTE_HYPERTROPHY_TEMPLATE.unilateralBlockId,'B');assert.deepEqual(GLUTE_HYPERTROPHY_TEMPLATE.fixedOrder,['hipExtension','unilateralHipKneeExtension','hipAbduction']);assert.deepEqual(GLUTE_HYPERTROPHY_TEMPLATE.additionBudget,{compact:1,balanced:2,maximize:4});
});

test('initialisation H débutante, intermédiaire et avancée suit les mappings explicites',()=>{
  const beginner=freshState(1);initializeHypertrophyLevels(beginner,undefined,now);assert.equal(beginner.hypertrophyLevels.bridge,0);assert.equal(beginner.hypertrophyLevels.gluteSplit,0);assert.equal(beginner.hypertrophyLevels.abductor,0);
  const intermediate=freshState(1);intermediate.progress[exercises.bridge.lineId].force=3;intermediate.progress[exercises.split.lineId].force=5;intermediate.levels.abductor=1;initializeHypertrophyLevels(intermediate,undefined,now);assert.equal(stepFor(intermediate,'bridge','force').variantId,'une-jambe');assert.equal(intermediate.hypertrophyLevels.bridge,1);assert.equal(intermediate.hypertrophyLevels.gluteSplit,2);assert.equal(intermediate.hypertrophyLevels.abductor,1);
  const advanced=freshState(1);advanced.progress[exercises.bridge.lineId].force=10;advanced.progress[exercises.split.lineId].force=16;advanced.levels.abductor=4;initializeHypertrophyLevels(advanced,undefined,now);assert.notEqual(advanced.hypertrophyLevels.bridge,0);assert.equal(advanced.hypertrophyLevels.gluteSplit,3);assert.equal(advanced.hypertrophyLevels.abductor,4);
});

test('la table Bridge/Split/Abductor couvre explicitement toutes les variantes Force',()=>{
  for(const [target,mapping]of Object.entries(HYPERTROPHY_INITIAL_LEVEL_MAP)){const variants=exercises[mapping.sourceId].modes.force.variants.map(value=>value.id);assert.deepEqual(Object.keys(mapping.variants).sort(),variants.sort(),target);for(const level of Object.values(mapping.variants))assert.ok(Number.isInteger(level)&&level>=0);}
});

test('migration V6 initialise un H jamais validé mais conserve un niveau H réellement utilisé',()=>{
  const unused=freshState(1);unused.schemaVersion=6;unused.objectives.zones.glutes='hypertrophy';unused.progress[exercises.bridge.lineId].force=10;unused.hypertrophyLevels.bridge=0;delete unused.hypertrophyInitialized;delete unused.registry.rotationConsumptions;
  const mapped=migrateData(unused,now).profiles.principal;assert.equal(mapped.schemaVersion,7);assert.ok(mapped.hypertrophyLevels.bridge>0);
  const used=freshState(1);requestObjectiveChange(used,'glutes','hypertrophy','now',now);const usedUnit=used.registry.units.find(unit=>unit.id==='bridge'&&unit.stimulus==='hypertrophy');used.schemaVersion=6;used.progress[exercises.bridge.lineId].force=10;used.hypertrophyLevels.bridge=1;used.history=[{id:'used-h',startedAt:now-10,finishedAt:now,status:'complete',pausedMs:0,results:[{...usedUnit,actual:usedUnit.target,rating:'Correct',note:'',at:now}],supplementary:[]}];delete used.hypertrophyInitialized;delete used.registry.rotationConsumptions;
  const preserved=migrateData(used,now).profiles.principal;assert.equal(preserved.hypertrophyLevels.bridge,1);
});

test('passer un bloc vierge avance sans historique, volume, progression ni rotation',()=>{
  const state=freshState(1),modes=structuredClone(state.modeRotation),hRotation=structuredClone(state.hypertrophyRotation),levels=structuredClone(state.progress);assert.equal(skipBlock(state,'A',now),true);
  assert.equal(state.next,1);assert.equal(blockProgress(state,'A').passed,true);assert.ok(state.registry.units.filter(unit=>unit.blockId==='A').every(unit=>unit.status==='skipped'));assert.equal(state.history.length,0);assert.equal(hypertrophyVolume(state,now,false).back.volume,0);assert.deepEqual(state.progress,levels);assert.deepEqual(state.modeRotation,modes);assert.deepEqual(state.hypertrophyRotation,hRotation);
});

test('une unité skipped disparaît de tous les candidats Programme Express et Hybride',()=>{
  const state=freshState(1);skipBlock(state,'A',now);const skippedIds=new Set(state.registry.units.filter(unit=>unit.status==='skipped').map(unit=>unit.officialId));assert.ok(registryPending(state).every(unit=>!skippedIds.has(unit.officialId)));
  start(state,now+1);validateSet(state,now+2);for(const mode of ['express','hybrid']){setExecutionMode(state,mode,now+3);const suggestion=restSuggestion(state,now+3);if(suggestion?.kind==='program')assert.equal(skippedIds.has(suggestion.item.officialId),false);}
});

test('une séance active peut être passée directement sans faux historique',()=>{
  const state=freshState(1);start(state,now);assert.equal(skipBlock(state,'A',now+1),true);assert.equal(state.active,null);assert.equal(state.history.length,0);assert.ok(state.registry.units.filter(unit=>unit.blockId==='A').every(unit=>unit.status==='skipped'));
});

test('bloc partiel puis passé conserve completed et marque seulement le reste skipped',()=>{
  const state=freshState(1);start(state,now);validateSet(state,now+1);abandon(state,now+2);const completedIds=state.registry.units.filter(unit=>unit.blockId==='A'&&unit.status==='completed').map(unit=>unit.officialId);assert.equal(skipBlock(state,'A',now+3),true);assert.ok(completedIds.length);assert.ok(completedIds.every(id=>state.registry.units.find(unit=>unit.officialId===id).status==='completed'));assert.equal(blockProgress(state,'A').partialPassed,true);assert.equal(state.history.flatMap(session=>session.results).length,completedIds.length);
});

test('Réouvrir remet uniquement skipped en pending avec les mêmes IDs sans doublon',()=>{
  const state=freshState(1);skipBlock(state,'B',now);const before=state.registry.units.filter(unit=>unit.blockId==='B').map(unit=>[unit.officialId,unit.status]);assert.equal(reopenBlock(state,'B'),true);const after=state.registry.units.filter(unit=>unit.blockId==='B');assert.deepEqual(after.map(unit=>unit.officialId),before.map(([id])=>id));assert.ok(after.every(unit=>unit.status==='pending'));assert.equal(new Set(after.map(unit=>unit.officialId)).size,after.length);assert.equal(state.next,1);
});

test('la recomposition ne recrée pas immédiatement les unités du bloc passé',()=>{
  const state=activateGlutes();skipBlock(state,'E',now+1);const skipped=state.registry.units.filter(unit=>unit.blockId==='E').map(unit=>unit.officialId);requestPersonalizationChange(state,'balanced','now',now+2);const sameBlock=state.registry.units.filter(unit=>unit.blockId==='E');assert.ok(skipped.every(id=>sameBlock.find(unit=>unit.officialId===id)?.status==='skipped'));assert.equal(sameBlock.some(unit=>unit.status==='pending'),false);assert.equal(new Set(sameBlock.map(unit=>unit.officialId)).size,sameBlock.length);
});

test('un cycle entièrement passé avance sans consommer les rotations',()=>{
  const state=activateGlutes(),force=structuredClone(state.modeRotation),hypertrophy=structuredClone(state.hypertrophyRotation);for(const id of ['A','B','C','D','E'])assert.equal(skipBlock(state,id,now+id.charCodeAt(0)),true);assert.equal(state.cycle,2);assert.equal(state.history.length,0);assert.deepEqual(state.modeRotation,force);assert.deepEqual(state.hypertrophyRotation,hypertrophy);assert.equal(hypertrophyVolume(state,now+100,false).glutes.volume,0);
});

test('skipped reste isolé entre Principal et Test',()=>{
  const db=freshDatabase(1);createTestProfile(db,false,2);skipBlock(db.profiles.test,'A',now);assert.equal(blockProgress(db.profiles.test,'A').passed,true);assert.equal(blockProgress(db.profiles.principal,'A').passed,false);
});

test('reload, export/import et migration conservent skipped sans créer de statistiques',()=>{
  const db=freshDatabase(1);skipBlock(db.profiles.principal,'B',now);const raw=JSON.stringify(db),reload=migrateData(JSON.parse(raw),now+1),exported=exportPayload(reload,'current'),imported=parseImport(JSON.stringify(exported),now+2).profiles.principal;
  for(const state of [reload.profiles.principal,imported]){assertState(state);assert.ok(state.registry.units.filter(unit=>unit.blockId==='B').every(unit=>unit.status==='skipped'));assert.equal(overviewStats(state,'all',now+3).sets,0);}
});

test('l’interface expose Passé, Partiel · Passé, réouverture et skip direct',async()=>{
  const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');const css=await readFile(new URL('../dist/style.css',import.meta.url),'utf8');for(const token of ['Passer le bloc','Réouvrir le bloc','Partiel · Passé','skip-block','reopen-block','session-skip'])assert.ok(app.includes(token),token);assert.ok(css.includes('.cycle-step.passed'));assert.equal(/\b(confirm|alert|prompt)\s*\(/.test(app),false);
});
