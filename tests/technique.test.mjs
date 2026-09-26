import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,techniqueFor,VALIDATED_VARIANT_COUNT,variantCatalog} from '../dist/program.js';
import {MODE_INSTRUCTIONS,MOVEMENT_TYPES,validateTechniqueCatalog} from '../dist/technique.js';
import {freshState,start,validateSet,skipRest,currentSetDetails} from '../dist/engine.js';

const text=technique=>[...technique.position,...technique.execution,...technique.modeInstructions,...technique.mistakes,technique.stop].join(' ').toLowerCase();
const dynamicPattern=/descends sous contrôle · remonte fort|1–3 reps propres/;

test('Suspension ne reçoit jamais une consigne dynamique Force',()=>{
  const t=techniqueFor('hang','suspension','force');
  assert.equal(t.type,'isometric');
  assert.deepEqual(t.compatibleModes,[]);
  assert.deepEqual(t.modeInstructions,[]);
  assert.doesNotMatch(text(t),dynamicPattern);
});

test('Hollow et planche ne reçoivent jamais une consigne de descente ou remontée',()=>{
  for(const id of ['planche','hollow-tuck','une-jambe','complet']){
    const t=techniqueFor('hollow',id,'force');
    assert.equal(t.type,'isometric');
    assert.deepEqual(t.modeInstructions,[]);
    assert.doesNotMatch(text(t),dynamicPattern);
  }
});

test('Scapular pull-up et tibial antérieur n’héritent pas de Force dynamique',()=>{
  const scap=techniqueFor('scapPull','controle','force'),tibial=techniqueFor('tibialis','mur-proche','force');
  assert.equal(scap.type,'control_health');
  assert.equal(tibial.type,'control_health');
  assert.deepEqual(scap.modeInstructions,[]);
  assert.deepEqual(tibial.modeInstructions,[]);
  assert.doesNotMatch(text(scap),/torse vers la barre|1–3 reps/);
  assert.doesNotMatch(text(tibial),dynamicPattern);
});

test('Pompes Force, Endurance et Puissance reçoivent uniquement leur adaptation',()=>{
  const force=techniqueFor('pushup','classique','force');
  const endurance=techniqueFor('pushup','classique-endurance','endurance');
  const power=techniqueFor('pushup','rapide-sol','power');
  assert.deepEqual(force.modeInstructions,MODE_INSTRUCTIONS.force);
  assert.deepEqual(endurance.modeInstructions,MODE_INSTRUCTIONS.endurance);
  assert.deepEqual(power.modeInstructions,MODE_INSTRUCTIONS.power);
});

test('Traction Puissance reçoit l’adaptation Puissance',()=>{
  const t=techniqueFor('pullup','intention-vitesse','power');
  assert.equal(t.type,'explosive');
  assert.deepEqual(t.modeInstructions,MODE_INSTRUCTIONS.power);
});

test('changer de variante change la technique, changer de palier la conserve',()=>{
  const steps=exercises.row.modes.force.steps;
  const standard=steps.filter(s=>s.variantId==='actuel');
  const pause=steps.find(s=>s.variantId==='pause-poitrine');
  assert.ok(standard.length>1);
  assert.strictEqual(standard[0].technique,standard[1].technique);
  assert.notDeepEqual(standard[0].technique.execution,pause.technique.execution);
  assert.match(pause.technique.execution.join(' '),/pause en haut/);
});

test('les 214 variantes V6.1 ont des consignes canoniques et tous les paliers pointent vers une variante valide',()=>{
  assert.equal(VALIDATED_VARIANT_COUNT,214);
  assert.equal(Object.keys(variantCatalog).length,214);
  assert.equal(validateTechniqueCatalog(exercises),214);
  for(const [exerciseId,e]of Object.entries(exercises))for(const [modeId,m]of Object.entries(e.modes)){
    const ids=new Set(m.variants.map(v=>v.id));
    for(const v of m.variants){
      assert.ok(v.id);
      assert.ok(MOVEMENT_TYPES.includes(v.technique.type));
      assert.ok(v.technique.position.length&&v.technique.execution.length&&v.technique.mistakes.length);
      assert.equal(v.technique.exerciseId,exerciseId);
    }
    for(const step of m.steps)assert.ok(ids.has(step.variantId),`${exerciseId}/${modeId}/${step.variantId}`);
  }
});

test('aucun overlay de mode incompatible ne peut être composé',()=>{
  for(const [key,t]of Object.entries(variantCatalog)){
    const mode=key.split(':')[1];
    if(t.modeInstructions.length)assert.ok(t.compatibleModes.includes(mode),key);
    else if(!t.compatibleModes.includes(mode))assert.deepEqual(t.modeInstructions,[],key);
  }
});

test('la transition Traction vers Suspension remplace entièrement les consignes',()=>{
  const state=freshState(1);start(state,10);
  const pullup=currentSetDetails(state);
  while(state.active&&currentSetDetails(state).id==='pullup'){
    validateSet(state,20);
    if(state.active?.stage==='rest')skipRest(state);
  }
  const hang=currentSetDetails(state);
  assert.equal(hang.id,'hang');
  assert.notEqual(hang.technique.id,pullup.technique.id);
  assert.match(text(hang.technique),/prise.*glisse|prise glisse/);
  assert.doesNotMatch(text(hang.technique),/tire les coudes|torse vers la barre|1–3 reps/);
});
