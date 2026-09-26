import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,techniqueFor} from '../dist/program.js';
import {DECISION_VARIANTS} from '../dist/technique.js';

const getVariant=(exerciseId,modeId,variantId)=>exercises[exerciseId].modes[modeId].variants.find(v=>v.id===variantId);
const words=t=>[t.name,t.canonicalName,t.globalOrientation,t.support,...Object.values(t.startPosition),...t.execution,t.endPosition,t.rangeOfMotion,...t.fixedBodyParts,...t.commonErrors,...t.stopCriteria,...t.visualSignature.frames].filter(Boolean).join(' ').toLowerCase();

test('D01 à D12 sont fermées et les anciens noms vagues ne sont plus affichés',()=>{
  assert.deepEqual(DECISION_VARIANTS,{});
  const locked=[
    ['pullup','endurance','angle-ajuste-endurance'],['pushup','endurance','classique-endurance'],['pushup','endurance','pause-endurance'],['row','endurance','accessible-endurance'],['row','endurance','angle-endurance'],['pike','endurance','pike-endurance'],['pike','endurance','pike-exigeante-endurance'],['pike','power','pike-explosive'],['split','power','sauts-replaces'],['split','power','unilateral-progressif'],['antiRotation','force','asymetrique'],['abductor','force','avancee']
  ];
  const vague=/plus difficile|avancée contrôlée|angle ajusté|avec remise en place|unilatéral progressif|contrôle asymétrique avancé/i;
  for(const [exerciseId,modeId,variantId]of locked){
    const variant=getVariant(exerciseId,modeId,variantId);
    assert.ok(variant,`${exerciseId}:${variantId}`);
    assert.equal(variant.technique.status,'CORRECTED',`${exerciseId}:${variantId}`);
    assert.doesNotMatch(variant.name,vague,`${exerciseId}:${variantId}`);
  }
});

test('les tractions assistées deux pieds et un pied sont techniquement distinctes',()=>{
  const two=techniqueFor('pullup','stricte-endurance','endurance'),one=techniqueFor('pullup','angle-ajuste-endurance','endurance');
  assert.match(two.name,/deux pieds/);assert.match(one.name,/un pied/);
  assert.match(two.startPosition.feet,/deux pieds/);assert.match(one.startPosition.feet,/un pied.*seconde jambe libre/);
  assert.notDeepEqual(two.visualSignature,one.visualSignature);
  assert.equal(two.status,'CORRECTED');assert.equal(one.status,'CORRECTED');
});

test('la pompe accessible Endurance est inclinée à hauteur de hanches et jamais sur les genoux',()=>{
  const t=techniqueFor('pushup','classique-endurance','endurance'),text=words(t);
  assert.match(t.name,/Pompe inclinée/);assert.match(t.support,/hauteur de hanches/);
  assert.match(text,/poitrine vers le support/);assert.doesNotMatch(`${t.startPosition.knees} ${t.execution.join(' ')}`,/genoux au sol/);
});

test('la pompe Endurance plus difficile doit sa difficulté à une pause basse exacte de 1 seconde',()=>{
  const t=techniqueFor('pushup','pause-endurance','endurance'),text=words(t);
  assert.match(t.name,/pause basse 1 s/);assert.match(text,/exactement 1 seconde/);
  assert.match(text,/sans poser le torse ni le bassin/);assert.match(t.tempoPrinciple,/exactement 1 seconde/);
});

test('les deux rowings Endurance distinguent genoux fléchis et jambes tendues',()=>{
  const easy=techniqueFor('row','accessible-endurance','endurance'),hard=techniqueFor('row','angle-endurance','endurance');
  assert.match(easy.startPosition.knees,/90/);assert.match(easy.startPosition.feet,/à plat/);
  assert.match(hard.startPosition.knees,/tendus/);assert.match(hard.startPosition.feet,/talons/);
  assert.notDeepEqual(easy.visualSignature,hard.visualSignature);
});

test('les Pike Endurance accessible et plus verticale restent au sol mais ont des leviers distincts',()=>{
  const easy=techniqueFor('pike','pike-endurance','endurance'),hard=techniqueFor('pike','pike-exigeante-endurance','endurance');
  assert.match(easy.startPosition.feet,/éloignés des mains/);assert.match(hard.startPosition.feet,/rapprochés des mains/);
  assert.match(easy.support,/mains et pieds au sol/);assert.match(hard.support,/sans support surélevé/);
  assert.notDeepEqual(easy.visualSignature,hard.visualSignature);
});

test('Pike rapide garde les mains au sol tandis que Pike plyométrique les décolle réellement',()=>{
  const fast=techniqueFor('pike','pike-rapide','power'),plyo=techniqueFor('pike','pike-explosive','power');
  assert.match(words(fast),/deux mains restent entièrement au sol/);
  assert.match(words(plyo),/deux mains quittent brièvement le sol/);
  assert.match(plyo.stopCriteria.join(' '),/mains ne décollent plus réellement/);
  assert.notDeepEqual(fast.visualSignature,plyo.visualSignature);
});

test('le Split jump échange les jambes et stabilise la fente opposée',()=>{
  const t=techniqueFor('split','sauts-replaces','power'),text=words(t);
  assert.equal(t.name,'Split jump alterné');assert.match(text,/échange les jambes/);
  assert.match(text,/fente b/);assert.match(text,/stabilis/);
});

test('le saut unipodal réceptionne sur la même jambe avant toute répétition',()=>{
  const t=techniqueFor('split','unilateral-progressif','power'),text=words(t);
  assert.equal(t.unilateral,true);assert.match(text,/même jambe/);
  assert.match(text,/stabilise-toi complètement/);assert.doesNotMatch(t.execution.join(' '),/bond vers l’avant|hops rapides/);
});

test('la Planche diagonale reste une planche haute à deux appuis et non un Bird Dog',()=>{
  const diagonal=techniqueFor('antiRotation','asymetrique','force'),bird=techniqueFor('antiRotation','bird-dog','force');
  assert.equal(diagonal.name,'Planche diagonale');assert.match(diagonal.globalOrientation,/planche haute à deux appuis/);
  assert.match(words(diagonal),/bras droit.*jambe gauche/);assert.match(diagonal.commonErrors.join(' '),/Bird Dog/);
  assert.notEqual(diagonal.globalOrientation,bird.globalOrientation);assert.notDeepEqual(diagonal.visualSignature,bird.visualSignature);
});

test('l’abduction avancée réutilise le side plank complet avec une pause haute exacte de 2 secondes',()=>{
  const base=techniqueFor('abductor','side-complet','force'),advanced=techniqueFor('abductor','avancee','force');
  assert.equal(advanced.name,'Side plank complet + abduction + pause');
  assert.equal(advanced.support,base.support);assert.equal(advanced.globalOrientation,base.globalOrientation);
  assert.match(words(advanced),/exactement 2 secondes/);assert.deepEqual(advanced.visualSignature.frames.slice(0,1),base.visualSignature.frames.slice(0,1));
});

test('les nouvelles signatures visuelles décrivent les quatre géométries réellement distinctes',()=>{
  for(const [exerciseId,variantId,modeId,pattern]of [
    ['pike','pike-explosive','power',/phase aérienne/],['split','sauts-replaces','power',/échange des jambes/],['split','unilateral-progressif','power',/même jambe/],['antiRotation','asymetrique','force',/bras droit et jambe gauche/]
  ]){
    const t=techniqueFor(exerciseId,variantId,modeId);
    assert.equal(t.visualSignature.framesNeeded,3);assert.match(t.visualSignature.frames.join(' '),pattern);
  }
});

test('les prescriptions historiques des décisions fermées sont strictement conservées',()=>{
  const expected={
    'pullup:endurance:stricte-endurance':[['reps',[6,6]],['reps',[8,8]],['reps',[10,10]],['reps',[12,12]]],
    'pullup:endurance:angle-ajuste-endurance':[['reps',[6,6]],['reps',[8,8]],['reps',[10,10]],['reps',[12,12]]],
    'pushup:endurance:classique-endurance':[['reps',[12,12]],['reps',[15,15]],['reps',[20,20]]],
    'pushup:endurance:pause-endurance':[['reps',[12,12]],['reps',[15,15]],['reps',[20,20]]],
    'row:endurance:accessible-endurance':[['reps',[12,12]],['reps',[15,15]],['reps',[20,20]]],
    'row:endurance:angle-endurance':[['reps',[12,12]],['reps',[15,15]],['reps',[20,20]]],
    'pike:endurance:pike-endurance':[['reps',[10,10]],['reps',[12,12]],['reps',[15,15]]],
    'pike:endurance:pike-exigeante-endurance':[['reps',[10,10]],['reps',[12,12]],['reps',[15,15]]],
    'pike:power:pike-explosive':[['reps',[3,3,3]],['reps',[4,4,4]]],
    'split:power:sauts-replaces':[['reps',[4,4,4]]],
    'split:power:unilateral-progressif':[['side',[3,3,3]]],
    'antiRotation:force:asymetrique':[['side',[5,5]]],
    'abductor:force:avancee':[['side',[8,8]]]
  };
  for(const [key,value]of Object.entries(expected)){
    const [exerciseId,modeId,variantId]=key.split(':'),variant=getVariant(exerciseId,modeId,variantId);
    assert.deepEqual(variant.prescriptions.map(p=>[p.unit,p.targets]),value,key);
  }
});
