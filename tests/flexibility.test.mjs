import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {freshState} from '../dist/engine.js';
import {FLEXIBILITY_CATALOG,FLEXIBILITY_PAGES,FLEXIBILITY_ROUTINES,FLEXIBILITY_RATINGS,buildFlexibilityPlan,startFlexibility,currentFlexibilityPosition,toggleFlexibilityTimer,elapsedFlexibilityTimer,flexibilityDurationStatus,previousFlexibilityPosition,completeFlexibilityPosition,abandonFlexibility} from '../dist/flexibility.js';
import {flexibilityOverviewStats,flexibilityExerciseStats} from '../dist/stats.js';
import {shouldPlayTimerSound} from '../dist/timer-sounds.js';

const orders={
  complete:['n1','n4','n10','n7','n15','n13','n17','n22','n24','n30','n33','n35'],
  short:['n1','n7','n13','n17','n22','n24','n30','n33'],
  upper:['n1','n3','n4','n7','n10','n14','n15'],
  lower:['n13','n16','n17','n22','n24','n30','n33','n35'],
  recovery:['n1','n7','n16','n17','n22','n33','n35']
};

test('le catalogue canonique contient exactement n1 à n35 sans trou ni doublon',()=>{
  const entries=Object.values(FLEXIBILITY_CATALOG),ids=entries.map(x=>x.id);
  assert.equal(entries.length,35);assert.equal(new Set(ids).size,35);assert.deepEqual(ids,Array.from({length:35},(_,i)=>`n${i+1}`));
  for(const exercise of entries){assert.equal(exercise.name,exercise.id);assert.ok(exercise.description.trim());assert.ok(exercise.zoneLabel.trim());assert.equal(exercise.sourceContext,'flexibility');assert.ok(['bilateral','sides','alternating'].includes(exercise.laterality));assert.equal(exercise.unilateral,exercise.laterality==='sides');}
});

test('les 10 pages et leur mapping canonique sont exacts',()=>{
  assert.equal(FLEXIBILITY_PAGES.length,10);assert.deepEqual(FLEXIBILITY_PAGES.map(x=>[x.page,x.bookPage,x.from,x.to]),[[1,118,1,4],[2,119,5,7],[3,120,8,12],[4,121,13,15],[5,122,16,19],[6,123,20,22],[7,124,23,26],[8,125,27,29],[9,126,30,31],[10,127,32,35]]);
  for(const [id,page] of Object.entries({n35:10,n32:10,n30:9,n27:8,n23:7,n22:6,n17:5,n13:4,n10:3,n5:2,n1:1}))assert.equal(FLEXIBILITY_CATALOG[id].page,page,id);
});

test('exactement 10 pages WebP locales sont livrées et précachées',async()=>{
  const files=(await readdir(new URL('../dist/assets/flexibility/pages/',import.meta.url))).filter(x=>x.endsWith('.webp')).sort();
  assert.deepEqual(files,Array.from({length:10},(_,i)=>`page-${String(i+1).padStart(2,'0')}.webp`));
  const sw=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');for(const file of files)assert.ok(sw.includes(`./assets/flexibility/pages/${file}`),file);
});

test('toutes les durées Souplesse respectent min <= cible <= max',()=>{for(const exercise of Object.values(FLEXIBILITY_CATALOG)){assert.ok(exercise.minUseful<=exercise.targetDuration&&exercise.targetDuration<=exercise.maxUseful,exercise.id);if(exercise.restPrescription){const p=exercise.restPrescription;assert.ok(p.minUseful<=p.targetDuration&&p.targetDuration<=p.maxUseful);assert.ok(p.maxUseful<=20);}}});
test('les seules images Souplesse sont les dix pages entières',()=>{for(const exercise of Object.values(FLEXIBILITY_CATALOG)){assert.match(exercise.pageAsset,/^\.\/assets\/flexibility\/pages\/page-\d{2}\.webp$/);assert.equal(exercise.pageAsset,FLEXIBILITY_PAGES[exercise.page-1].asset);assert.equal('illustration' in exercise,false);assert.equal('animation' in exercise,false);}});

test('les cinq routines ont exactement les numéros et l’ordre imposés',()=>{for(const [id,order] of Object.entries(orders))assert.deepEqual(FLEXIBILITY_ROUTINES[id].items.map(x=>x.id),order,id);});
test('la routine Complète développe 12 indices et 21 positions côté compris',()=>{const plan=buildFlexibilityPlan('complete');assert.equal(plan.length,21);assert.equal(plan[0].exerciseIndex,1);assert.equal(plan.at(-1).exerciseIndex,12);for(const id of orders.complete){const exercise=FLEXIBILITY_CATALOG[id],positions=plan.filter(x=>x.exerciseId===id);assert.equal(positions.length,exercise.unilateral?2:1,id);if(exercise.unilateral)assert.deepEqual(positions.map(x=>x.side),['left','right']);}});
test('les cibles propres aux routines sont conservées',()=>{assert.deepEqual(FLEXIBILITY_ROUTINES.complete.items.map(x=>x.targetDuration),[25,25,10,20,15,20,30,25,30,25,25,15]);assert.deepEqual(FLEXIBILITY_ROUTINES.short.items.map(x=>x.targetDuration),[15,15,15,20,20,20,20,20]);assert.equal(FLEXIBILITY_ROUTINES.recovery.notice,'Reste loin de ton amplitude maximale.');});
test('la routine Courte reste sous six minutes de positions',()=>{const plan=buildFlexibilityPlan('short'),seconds=plan.reduce((sum,x)=>sum+x.targetDuration,0);assert.ok(seconds<=300);});
test('les routines ciblées et chaque entrée Explorer sont immédiatement accessibles',()=>{for(const id of Object.keys(orders))assert.ok(buildFlexibilityPlan(id).length>0);for(let i=1;i<=35;i++)assert.equal(buildFlexibilityPlan(`explore:n${i}`)[0].exerciseId,`n${i}`);});

test('minUseful, cible et maxUseful sont distingués sans transition automatique',()=>{const state=freshState(1);startFlexibility(state,'explore:n1',10);const position=currentFlexibilityPosition(state);assert.equal(flexibilityDurationStatus(position,14),'before');assert.equal(flexibilityDurationStatus(position,15),'min');assert.equal(flexibilityDurationStatus(position,25),'target');assert.equal(flexibilityDurationStatus(position,31),'max');assert.equal(state.flexibility.active.cursor,0);});
test('le son cible est déclenché une seule fois au franchissement',()=>{const sounds={enabled:true,exercise:true};assert.equal(shouldPlayTimerSound(true,0,sounds,'exercise'),true);assert.equal(shouldPlayTimerSound(false,-1000,sounds,'exercise'),false);});
test('la durée réelle et le côté sont enregistrés même avant la cible',()=>{const state=freshState(1);startFlexibility(state,'explore:n15',10);toggleFlexibilityTimer(state,20);assert.equal(Math.round(elapsedFlexibilityTimer(state.flexibility.active.timer,5020)/1000),5);completeFlexibilityPosition(state,5020);const result=state.flexibility.active.results[0];assert.equal(result.exerciseId,'n15');assert.equal(result.side,'left');assert.equal(result.actualSeconds,5);assert.equal(currentFlexibilityPosition(state).side,'right');});

test('retour à la position précédente recule le compteur et restaure la saisie',()=>{const state=freshState(1);startFlexibility(state,'complete',10);state.flexibility.active.draft={rating:'Facile',note:'à corriger'};completeFlexibilityPosition(state,20);assert.equal(state.flexibility.active.cursor,1);assert.equal(previousFlexibilityPosition(state),true);assert.equal(state.flexibility.active.cursor,0);assert.equal(currentFlexibilityPosition(state).exerciseId,'n1');assert.equal(state.flexibility.active.results.length,0);assert.equal(state.flexibility.active.draft.note,'à corriger');});
test('retour au côté précédent puis correction remplace le résultat sans doublon',()=>{const state=freshState(1);startFlexibility(state,'explore:n15',10);toggleFlexibilityTimer(state,100);completeFlexibilityPosition(state,15100);assert.equal(currentFlexibilityPosition(state).side,'right');previousFlexibilityPosition(state);assert.equal(currentFlexibilityPosition(state).side,'left');state.flexibility.active.draft={rating:'Gêne',note:'corrigé'};completeFlexibilityPosition(state,16000);completeFlexibilityPosition(state,17000);const results=state.flexibility.history[0].results;assert.equal(results.length,2);assert.deepEqual(results.map(x=>x.positionIndex),[0,1]);assert.equal(results[0].rating,'Gêne');assert.equal(results[0].note,'corrigé');});

test('les ressentis Souplesse persistent sans influencer paliers ou cycle',()=>{for(const rating of FLEXIBILITY_RATINGS){const state=freshState(1),progress=structuredClone(state.progress),levels=structuredClone(state.levels),cycle=state.cycle;startFlexibility(state,'explore:n1',10);state.flexibility.active.draft={rating,note:`note ${rating}`};completeFlexibilityPosition(state,20);const result=state.flexibility.history[0].results[0];assert.equal(result.rating,rating);assert.equal(result.note,`note ${rating}`);assert.deepEqual(state.progress,progress);assert.deepEqual(state.levels,levels);assert.equal(state.cycle,cycle);}});
test('terminer une routine Souplesse n’avance aucun bloc musculaire',()=>{const state=freshState(1),before={next:state.next,cycle:state.cycle,registry:structuredClone(state.registry)};startFlexibility(state,'short',10);let now=20;while(state.flexibility.active)completeFlexibilityPosition(state,now++);assert.equal(state.flexibility.history.length,1);assert.equal(state.next,before.next);assert.equal(state.cycle,before.cycle);assert.deepEqual(state.registry,before.registry);});
test('une routine interrompue conserve les positions déjà terminées',()=>{const state=freshState(1);startFlexibility(state,'short',10);completeFlexibilityPosition(state,20);assert.equal(abandonFlexibility(state,30),true);assert.equal(state.flexibility.history[0].status,'interrupted');assert.equal(state.flexibility.history[0].results.length,1);});
test('les statistiques Souplesse comptent routines, temps, exercice, côté et ressenti',()=>{const state=freshState(1);startFlexibility(state,'explore:n15',10);toggleFlexibilityTimer(state,20);state.flexibility.active.draft.rating='Facile';completeFlexibilityPosition(state,15020);toggleFlexibilityTimer(state,16000);completeFlexibilityPosition(state,31000);const overview=flexibilityOverviewStats(state,'all',40000),detail=flexibilityExerciseStats(state,'n15','all',40000);assert.equal(overview.routines,1);assert.equal(overview.routineSeconds,30);assert.equal(detail.passages,2);assert.equal(detail.sideCounts.left,1);assert.equal(detail.sideCounts.right,1);assert.equal(detail.recentFeeling,'Correct');});
test('le temps de mobilité pendant les repos reste séparé du temps en routine',()=>{const state=freshState(1);state.history=[{startedAt:10,finishedAt:20,status:'complete',pausedMs:0,results:[],supplementary:[{id:'mobility:n10',mobilityId:'n10',supplementaryType:'mobility',actual:9,unit:'seconds',at:15}]}];const stats=flexibilityOverviewStats(state,'all',30);assert.equal(stats.routines,0);assert.equal(stats.routineSeconds,0);assert.equal(stats.mobilitySeconds,9);assert.equal(stats.totalFlexibilitySeconds,9);});

test('le viewer est une vue plein écran interne et conserve la routine et le chrono',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(app,/if\(imageViewer\)/);assert.match(app,/class="page-viewer"/);assert.match(app,/close-flex-page/);assert.match(app,/viewer-zoom/);assert.match(app,/toucher pour agrandir/);assert.doesNotMatch(html,/<dialog\b/i);assert.match(app,/if\(flex&&screen==='flex-session'\)/);});
