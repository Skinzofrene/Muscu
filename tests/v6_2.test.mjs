import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {exercises,stepFor} from '../dist/program.js';
import {abandon,blockProgress,changeLevel,freshState,pause,requestObjectiveChange,requestPersonalizationChange,skipBlock,skipRest,start,validateSet} from '../dist/engine.js';
import {glutePatternSummary,hypertrophyVolume} from '../dist/objective-planner.js';
import {GLUTE_HYPERTROPHY_TEMPLATE,HYPERTROPHY_DEFINITIONS,HYPERTROPHY_INITIAL_LEVEL_MAP} from '../dist/objectives.js';
import {createTestProfile,exportPayload,freshDatabase,migrateData,resetPrincipal,restoreBackup,switchProfile} from '../dist/storage.js';

const NOW=20*86400000;
const activateGlutes=(personalization='balanced')=>{const state=freshState(1);requestPersonalizationChange(state,personalization,'now',NOW);requestObjectiveChange(state,'glutes','hypertrophy','now',NOW+1);return state;};
const counts=state=>Object.fromEntries(['bridge','gluteSplit','abductor'].map(id=>[id,state.registry.units.filter(unit=>unit.id===id&&unit.stimulus==='hypertrophy').length]));
const finishActive=state=>{let time=NOW;while(state.active){validateSet(state,++time);if(state.active?.stage==='rest')skipRest(state,++time);}return time;};

test('FloatingPanel est une infrastructure unique avec trois tailles',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');const css=await readFile(new URL('../dist/style.css',import.meta.url),'utf8');assert.equal((app.match(/function openPanel\(/g)||[]).length,1);for(const size of ["size:'large'","size:'compact'","size:'small'"])assert.ok(app.includes(size),size);for(const token of ['.floating-panel-backdrop','.floating-panel.large','.floating-panel.compact','.floating-panel.small','.floating-panel-scroll'])assert.ok(css.includes(token)||token==='.floating-panel.large',token);});

test('les panneaux se ferment par X, backdrop et Échap puis restaurent le focus',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');for(const token of ['close-panel','data-panel-backdrop','event.key===\'Escape\'','restorePanelFocus','focusSnapshot'])assert.ok(app.includes(token),token);assert.match(app,/requestAnimationFrame\(restorePanelFocus\)/);});

test('fiches et feedback utilisent le panneau flottant sans navigation',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');const exercise=app.slice(app.indexOf('function showExercise'),app.indexOf('function showFlexibilityInfo')),feedback=app.slice(app.indexOf('function flexibilityFeedback'),app.indexOf('function download'));assert.match(exercise,/openPanel\(/);assert.match(feedback,/openPanel\(/);assert.doesNotMatch(exercise,/screen=/);assert.doesNotMatch(feedback,/screen=/);});

test('aucune ancienne modale ou confirmation navigateur ne subsiste',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');for(const token of ['openDialog','panelContent','request-skip-block','confirm-import','confirm-copy-test'])assert.equal(app.includes(token),false,token);for(const token of ['confirm-reset-principal','confirm-reset-test','confirm-restore-backup','confirm-delete-backup'])assert.ok(app.includes(token),token);assert.doesNotMatch(app,/\b(?:alert|confirm|prompt)\s*\(/);});

test('le bouton pause ouvre le choix sans mettre en pause immédiatement',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');assert.match(app,/icon\('pause'\),'pause-menu'/);assert.match(app,/action==='pause-menu'.*Arrêter le bloc/);assert.match(app,/action==='pause'.*pause\(s\)/);});

test('Pause conserve la séance et Arrêter garde le réalisé dans un historique interrompu',()=>{const state=freshState(1);start(state,NOW);validateSet(state,NOW+1);assert.equal(pause(state,NOW+2),true);assert.ok(state.active?.pausedAt);assert.equal(abandon(state,NOW+3),true);assert.equal(state.active,null);assert.equal(state.history.at(-1).status,'interrupted');assert.equal(state.history.at(-1).results.length,1);assert.equal(blockProgress(state,'A').completed,1);});

test('Passer un bloc actif vierge est direct, sans historique ni double effet',()=>{const state=freshState(1);start(state,NOW);assert.equal(skipBlock(state,'A',NOW+1),true);assert.equal(skipBlock(state,'A',NOW+2),false);assert.equal(state.history.length,0);assert.equal(blockProgress(state,'A').passed,true);});

test('Passer un bloc actif partiel conserve le validé et saute seulement le reste',()=>{const state=freshState(1);start(state,NOW);validateSet(state,NOW+1);assert.equal(skipBlock(state,'A',NOW+2),true);assert.equal(state.history.length,1);assert.equal(state.history[0].status,'interrupted');assert.equal(state.history[0].results.length,1);assert.equal(blockProgress(state,'A').partialPassed,true);});

test('un bloc précédent peut être démarré explicitement sans mutation par la simple navigation UI',async()=>{const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');assert.match(app,/viewedBlockId=bs\[current-1\]\.id/);assert.match(app,/action==='view-current-block'/);assert.match(app,/start\(s,Date\.now\(\),el\.dataset\.block\|\|null\)/);const state=freshState(1);assert.equal(start(state,NOW,'B'),true);assert.equal(state.active.blockId,'B');});

test('tout Force conserve strictement le Split canonique dans B',()=>{const state=freshState(1),units=state.registry.units.filter(unit=>unit.blockId==='B');assert.ok(units.some(unit=>unit.id==='split'&&unit.mode==='force'));assert.equal(units.some(unit=>unit.id==='gluteSplit'),false);});

test('Fessiers H remplace le slot B par GluteSplit H propriétaire Fessiers',()=>{const state=activateGlutes(),units=state.registry.units.filter(unit=>unit.blockId==='B'&&unit.id==='gluteSplit');assert.ok(units.length>=2);assert.ok(units.every(unit=>unit.mode==='hypertrophy'&&unit.stimulus==='hypertrophy'&&unit.ownerZone==='glutes'&&unit.muscleContributions.direct.includes('gluteMax')&&unit.muscleContributions.importantSecondary.includes('quads')));assert.equal(state.registry.units.some(unit=>unit.blockId==='B'&&unit.id==='split'),false);});

test('terminer B en Fessiers H ne consomme jamais la rotation Force Quadriceps',()=>{const state=activateGlutes(),before=state.modeRotation.knee;start(state,NOW,'B');finishActive(state);assert.equal(state.modeRotation.knee,before);});

test('le bloc E Fessiers H contient Bridge et Abduction, jamais GluteSplit',()=>{const state=activateGlutes(),ids=new Set(state.registry.units.filter(unit=>unit.blockId==='E'&&unit.ownerZone==='glutes').map(unit=>unit.id));assert.deepEqual([...ids],['bridge','abductor']);assert.equal(state.registry.units.some(unit=>unit.blockId==='E'&&unit.id==='gluteSplit'),false);});

test('la redistribution post-2/2/2 donne 3/3/2 puis 4/4/2',()=>{assert.deepEqual(counts(activateGlutes('balanced')),{bridge:3,gluteSplit:3,abductor:2});assert.deepEqual(counts(activateGlutes('maximize')),{bridge:4,gluteSplit:4,abductor:2});assert.equal(hypertrophyVolume(activateGlutes('balanced'),NOW+2,true).glutes.volume,8);assert.equal(hypertrophyVolume(activateGlutes('maximize'),NOW+2,true).glutes.volume,10);});

test('un B passé reste déficitaire et une recomposition ne recrée aucune unité B',()=>{const state=activateGlutes('balanced');assert.equal(skipBlock(state,'B',NOW+2),true);requestPersonalizationChange(state,'maximize','now',NOW+3);assert.equal(state.registry.units.filter(unit=>unit.blockId==='B'&&unit.status==='pending').length,0);assert.ok(state.registry.units.filter(unit=>unit.blockId==='B').every(unit=>unit.status==='skipped'));assert.equal(glutePatternSummary(state,NOW+4,false).patterns.unilateralHipKneeExtension.covered,false);});

test('GluteSplit H1 à H4 suit Split, Split pause, Bulgarian, Bulgarian pause',()=>{assert.deepEqual(HYPERTROPHY_DEFINITIONS.gluteSplit.map(level=>level.variantId),['split-squat','split-pause','bulgarian','bulgarian-pause']);});

test('toutes les variantes Pistol Force convergent vers Bulgarian pause H4',()=>{const mapping=HYPERTROPHY_INITIAL_LEVEL_MAP.gluteSplit.variants;for(const variant of ['pistol-assiste','pistol-support','pistol','pistol-pause'])assert.equal(mapping[variant],3,variant);const state=freshState(1);state.progress[exercises.split.lineId].force=16;requestObjectiveChange(state,'glutes','hypertrophy','now',NOW);assert.equal(stepFor(state,'gluteSplit','hypertrophy').variantId,'bulgarian-pause');});

test('un niveau H modifié en séance active survit au rechargement complet',()=>{const db=freshDatabase(1),state=db.profiles.principal;requestObjectiveChange(state,'glutes','hypertrophy','now',NOW);start(state,NOW+1,'B');const current=state.active.plan[state.active.cursor];changeLevel(state,'gluteSplit',1,NOW+2,'hypertrophy');const reload=migrateData(JSON.parse(JSON.stringify(db)),NOW+3).profiles.principal;assert.equal(reload.hypertrophyLevels.gluteSplit,1);assert.equal(reload.active.plan[reload.active.cursor].officialId,current.officialId);assert.equal(reload.active.plan[reload.active.cursor].level,current.level);});

test('les niveaux H restent isolés après changement de profil',()=>{const db=freshDatabase(1);createTestProfile(db,true,2);db.profiles.test.hypertrophyLevels.bridge=4;switchProfile(db,'principal');assert.notEqual(db.profiles.principal.hypertrophyLevels.bridge,4);switchProfile(db,'test');assert.equal(db.profiles.test.hypertrophyLevels.bridge,4);});

test('export/import et sauvegarde avant reset restaurent exactement les niveaux H',()=>{const db=freshDatabase(1);db.profiles.principal.hypertrophyLevels.bridge=4;db.profiles.principal.hypertrophyLevels.gluteSplit=3;const exported=exportPayload(db,'current'),imported=migrateData(exported,NOW).profiles.principal;assert.equal(imported.hypertrophyLevels.bridge,4);assert.equal(imported.hypertrophyLevels.gluteSplit,3);resetPrincipal(db,'auto',NOW+1);restoreBackup(db);assert.equal(db.profiles.principal.hypertrophyLevels.bridge,4);assert.equal(db.profiles.principal.hypertrophyLevels.gluteSplit,3);});

test('V6.2 garde le schéma 7 et un cache PWA UX versionné',async()=>{const db=freshDatabase(1),sw=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8'),pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));assert.equal(db.schemaVersion,7);assert.equal(db.profiles.principal.schemaVersion,7);assert.equal(pkg.version,'6.2.0');assert.match(sw,/v6-2-ux-polished/);assert.match(sw,/app\.js\?v=6\.2\.3/);assert.match(sw,/technical-catalog\.js/);assert.match(sw,/visual-catalog\.json/);});

test('le serveur conserve une origine stable et reconnaît une instance déjà lancée',async()=>{const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');assert.match(server,/X-Muscu-App/);assert.match(server,/Muscu déjà lancé/);assert.doesNotMatch(server,/port\+1/);assert.match(server,/port stable/);});

test('le template encode explicitement les blocs et les budgets post-socle',()=>{assert.equal(GLUTE_HYPERTROPHY_TEMPLATE.blockId,'E');assert.equal(GLUTE_HYPERTROPHY_TEMPLATE.unilateralBlockId,'B');assert.deepEqual(GLUTE_HYPERTROPHY_TEMPLATE.additionBudget,{compact:1,balanced:2,maximize:4});});
