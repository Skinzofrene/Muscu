import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldPlayTimerSound} from '../dist/timer-sounds.js';

const enabled={enabled:true,rest:true,exercise:true,volume:'low'};

test('la fin de repos déclenche un son au franchissement de zéro',()=>{
  assert.equal(shouldPlayTimerSound(true,0,enabled,'rest'),true);
  assert.equal(shouldPlayTimerSound(false,0,enabled,'rest'),false);
});

test('la fin du chrono exercice déclenche son signal dédié',()=>{
  assert.equal(shouldPlayTimerSound(true,-1,enabled,'exercise'),true);
  assert.equal(shouldPlayTimerSound(true,1,enabled,'exercise'),false);
});

test('sons désactivés ou signal individuel coupé ne produit aucun son',()=>{
  assert.equal(shouldPlayTimerSound(true,0,{...enabled,enabled:false},'rest'),false);
  assert.equal(shouldPlayTimerSound(true,0,{...enabled,exercise:false},'exercise'),false);
});
