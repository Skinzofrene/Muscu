import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,start,validateSet,skipRest,currentSet,currentSetDetails,changeLevel} from '../dist/engine.js';
import {overviewStats,exerciseStats,performedExerciseIds,resultAmount} from '../dist/stats.js';

const now=new Date(2026,8,18,12).getTime();
const daysAgo=n=>now-n*86400000;
const result=(id,actual,at,unit='reps',extra={})=>({id,actual,at,unit,...extra});
const session=(id,at,results,status='complete')=>({id,startedAt:at-1000,finishedAt:at,phaseId:'phase1',phaseCycle:1,status,results});

test('agrège les répétitions par exercice sans utiliser les objectifs',()=>{
  const state=freshState(1);
  state.history=[session('a',daysAgo(1),[result('pushup',7,daysAgo(1)),result('pushup',5,daysAgo(1))])];
  const stats=exerciseStats(state,'pushup','week',now);
  assert.equal(stats.total,12);
  assert.equal(stats.sets,2);
  assert.equal(stats.passages,1);
});

test('agrège aujourd’hui, 7 jours, 30 jours et tout avec des jours sans entraînement',()=>{
  const state=freshState(1);
  state.history=[
    session('today',daysAgo(0),[result('pushup',10,daysAgo(0))]),
    session('week',daysAgo(6),[result('pushup',20,daysAgo(6))]),
    session('month',daysAgo(20),[result('pushup',30,daysAgo(20))]),
    session('old',daysAgo(50),[result('pushup',40,daysAgo(50))])
  ];
  assert.equal(exerciseStats(state,'pushup','today',now).total,10);
  assert.equal(exerciseStats(state,'pushup','week',now).total,30);
  assert.equal(exerciseStats(state,'pushup','month',now).total,60);
  assert.equal(exerciseStats(state,'pushup','all',now).total,100);
  assert.equal(exerciseStats(state,'pushup','week',now).averagePerPeriodDay,30/7);
  assert.equal(exerciseStats(state,'pushup','week',now).averagePerActiveDay,15);
});

test('les exercices chronométrés additionnent uniquement les secondes réalisées',()=>{
  const state=freshState(1);
  state.history=[session('hang',daysAgo(2),[result('hang',20,daysAgo(2),'seconds'),result('hang',25,daysAgo(2),'seconds')])];
  const stats=exerciseStats(state,'hang','week',now);
  assert.equal(stats.kind,'time');
  assert.equal(stats.total,45);
  assert.equal(stats.averagePerPassage,45);
});

test('les exercices unilatéraux exposent le total et chaque côté disponible',()=>{
  assert.deepEqual(resultAmount(result('split',8,now,'side')),{kind:'reps',total:16,perSide:{left:8,right:8}});
  assert.deepEqual(resultAmount(result('split',0,now,'side',{leftActual:7,rightActual:9})),{kind:'reps',total:16,perSide:{left:7,right:9}});
});

test('historique vide et anciennes données restent lisibles',()=>{
  const empty=freshState(1);
  assert.deepEqual(performedExerciseIds(empty),[]);
  assert.equal(overviewStats(empty,'all',now).sets,0);
  empty.history=[session('legacy',daysAgo(50),[result('pushup',4,daysAgo(50))])];
  assert.equal(exerciseStats(empty,'pushup','all',now).total,4);
});

test('la consigne courante suit exercice, bloc et variante depuis le plan actif',()=>{
  const state=freshState(1);
  start(state,10);
  assert.equal(currentSet(state).id,'pullup');
  const pullupCue=currentSetDetails(state).cues[0];
  while(state.active&&currentSet(state).id==='pullup'){
    validateSet(state,20);
    if(state.active?.stage==='rest')skipRest(state);
  }
  assert.equal(currentSet(state).id,'hang');
  assert.notEqual(currentSetDetails(state).cues[0],pullupCue);
  while(state.active){validateSet(state,30);if(state.active?.stage==='rest')skipRest(state);}
  start(state,40);
  assert.equal(currentSet(state).id,'split');
  const before=currentSet(state).variantId;
  for(let i=0;i<4&&currentSet(state).variantId===before;i++)changeLevel(state,'split',1,50+i,'force');
  assert.notEqual(currentSet(state).variantId,before);
});
