import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,techniqueFor,variantCatalog} from '../dist/program.js';
import {CANONICAL_TECHNIQUES,DECISION_VARIANTS,TECHNICAL_STATUSES} from '../dist/technique.js';
import {workMetadata,workCompatibility} from '../dist/scheduler.js';

const distinctVariants=()=>{
  const rows=new Map();
  for(const [exerciseId,exercise]of Object.entries(exercises))for(const [modeId,mode]of Object.entries(exercise.modes))for(const variant of mode.variants)rows.set(`${exerciseId}:${variant.id}`,{exerciseId,modeId,variant,technique:variant.technique});
  return[...rows.values()];
};

test('les 24 mouvements possèdent le référentiel technique long complet',()=>{
  assert.equal(Object.keys(CANONICAL_TECHNIQUES).length,24);
  const bodyParts=['feet','knees','hips','pelvis','trunk','scapulae','shoulders','elbows','wrists','headNeck','supports'];
  for(const [id,t]of Object.entries(CANONICAL_TECHNIQUES)){
    for(const field of ['canonicalName','movementType','globalOrientation','support','endPosition','rangeOfMotion','breathing','tempoPrinciple'])assert.ok(t[field],`${id}/${field}`);
    assert.deepEqual(Object.keys(t.startPosition),bodyParts,id);
    for(const field of ['execution','fixedBodyParts','commonErrors','stopCriteria','primaryMuscles','secondaryMuscles','stabilizers'])assert.ok(Array.isArray(t[field]),`${id}/${field}`);
    assert.ok(t.execution.length>=3,id);
    assert.ok([2,3].includes(t.visualSignature.framesNeeded),id);
    assert.equal(t.visualSignature.frames.length,t.visualSignature.framesNeeded,id);
  }
});

test('les 159 variantes techniques distinctes sont classées avec des consignes dérivées',()=>{
  const rows=distinctVariants();
  assert.equal(rows.length,159);
  for(const {exerciseId,variant,technique:t}of rows){
    assert.ok(TECHNICAL_STATUSES.includes(t.status),`${exerciseId}:${variant.id}`);
    assert.ok(t.sessionCue.length>20,`${exerciseId}:${variant.id}`);
    assert.ok(t.detailedInstructions.length>=10,`${exerciseId}:${variant.id}`);
    assert.ok(t.primaryMuscles.length,`${exerciseId}:${variant.id}`);
  }
});

test('la planche ventrale ne peut plus hériter du hollow dorsal',()=>{
  for(const id of ['planche','levier-long']){
    const t=techniqueFor('hollow',id,'force');
    assert.match(`${t.globalOrientation} ${t.support}`.toLowerCase(),/ventral/);
    assert.doesNotMatch(t.detailedInstructions.join(' ').toLowerCase(),/bas du dos contre le sol|lombaires au sol/);
    assert.equal(t.status,'CORRECTED');
  }
});

test('wall slide, adduction allongée et handstand possèdent leurs propres appuis',()=>{
  const wall=techniqueFor('scapPush','wall-slide','force');
  assert.match(`${wall.globalOrientation} ${wall.support}`.toLowerCase(),/debout.*mur/);
  assert.doesNotMatch(wall.detailedInstructions.join(' ').toLowerCase(),/orteils.*sol/);
  const adduction=techniqueFor('adductor','allonge','force');
  assert.match(adduction.globalOrientation.toLowerCase(),/latéral/);
  assert.doesNotMatch(adduction.execution.join(' ').toLowerCase(),/lève le bassin/);
  const handstand=techniqueFor('pike','handstand-mur','force');
  assert.equal(handstand.type,'isometric');
  assert.match(handstand.support.toLowerCase(),/mur/);
  assert.doesNotMatch(handstand.execution.join(' ').toLowerCase(),/plie les coudes|tête vers le sol/);
});

test('squat jumps, shoulder taps, side-plank abduction et HSPU n’héritent plus d’appuis incompatibles',()=>{
  const jump=techniqueFor('split','squat-jump','power');
  assert.match(jump.globalOrientation,/bilatéral/);
  assert.doesNotMatch(jump.startPosition.feet,/avant-arrière/);
  const tap=techniqueFor('antiRotation','shoulder-taps','force');
  assert.match(tap.globalOrientation,/planche haute/);
  assert.doesNotMatch(tap.support,/genoux/);
  const abduction=techniqueFor('abductor','side-complet','force');
  assert.match(abduction.globalOrientation,/gainage/);
  const hspu=techniqueFor('pike','hspu-mur','force');
  assert.match(hspu.globalOrientation,/renversé/);
  assert.match(hspu.support,/mur/);
  const bulgarian=techniqueFor('split','bulgarian','force');
  assert.match(bulgarian.startPosition.feet,/support stable/);
  assert.match(bulgarian.startPosition.supports,/pied arrière/);
});

test('le walkout endurance décrit bien un aller-retour des talons',()=>{
  const t=techniqueFor('bridge','walkout-endurance','endurance');
  assert.match(t.execution.join(' ').toLowerCase(),/avance les talons.*petits pas/);
  assert.match(t.execution.join(' ').toLowerCase(),/ramène les pieds/);
  assert.equal(t.status,'CORRECTED');
});

test('les décisions humaines D01 à D12 sont toutes fermées',()=>{
  assert.equal(Object.keys(DECISION_VARIANTS).length,0);
  assert.equal(Object.values(variantCatalog).filter(item=>item.status==='DECISION_REQUIRED').length,0);
});

test('le scheduler connaît les familles secondaires de prise et de dos',()=>{
  const pull=workMetadata({id:'pullup',variantId:'stricte',mode:'force',target:5,unit:'reps'});
  const hang=workMetadata({id:'hang',variantId:'suspension',mode:'force',target:20,unit:'seconds'});
  const row=workMetadata({id:'row',variantId:'actuel',mode:'force',target:8,unit:'reps'});
  assert.deepEqual(pull.secondary,['GR','SC']);
  assert.ok(hang.secondary.includes('TV'));
  assert.ok(row.secondary.includes('GR'));
  assert.equal(workCompatibility(pull,row),'RED');
  assert.equal(workMetadata({id:'hollow',variantId:'planche',mode:'force',target:20,unit:'seconds'}).family,'ST');
});
