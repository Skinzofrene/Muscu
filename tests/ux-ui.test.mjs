import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readdir} from 'node:fs/promises';

const source=async name=>readFile(new URL(`../dist/${name}`,import.meta.url),'utf8');

test('les confirmations de succès ne déclenchent plus de toast',async()=>{const app=await source('app.js');for(const fragment of ['Bloc ${blockId} passé','Phase prévue au prochain cycle','Fichier de sauvegarde créé','Palier supérieur appliqué','Profil Test créé et activé'])assert.ok(!app.includes(fragment),fragment);});
test('les réglages utilisent les contrôles Muscu',async()=>{const app=await source('app.js');assert.doesNotMatch(app,/<select\b/i);assert.doesNotMatch(app,/type="checkbox"/i);assert.match(app,/role="switch"/);assert.match(app,/class="segmented"/);});
test('le palier partagé et le chrono central sont présents',async()=>{const app=await source('app.js');assert.match(app,/class="tier-control/);assert.match(app,/id="exercise-clock"/);assert.doesNotMatch(app,/<span id="exercise-clock"/);});
test('la progression reste synthétique et la fiche est structurée',async()=>{const app=await source('app.js');assert.doesNotMatch(app,/class="execution-copy"/);assert.match(app,/class="sheet-section" open/);assert.match(app,/>Amplitude, respiration et tempo</);});
test('les actions destructrices passent par une confirmation',async()=>{const app=await source('app.js');for(const action of ['confirm-reset-test','confirm-reset-principal','confirm-restore-backup','confirm-delete-backup'])assert.ok(app.includes(action),action);});
test('le cache UX et les 95 médias du catalogue restent livrés',async()=>{const sw=await source('sw.js'),files=await readdir(new URL('../dist/assets/exercises/',import.meta.url),{recursive:true,withFileTypes:true}),media=/\.(?:svg|webp|png|jpe?g)$/i;assert.match(sw,/v6-2-ux-polished/);assert.match(sw,/style\.css\?v=6\.2\.3/);assert.match(sw,/app\.js\?v=6\.2\.3/);assert.equal(files.filter(file=>file.isFile()&&media.test(file.name)).length,95);});
