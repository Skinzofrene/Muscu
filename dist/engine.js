import {blocksFor,exercises,initialLevels,majorLines,phaseOrder,phases,stepFor,techniqueFor} from './program.js';
import {EXECUTION_MODES,defaultSchedulerSettings,selectRestActivity,workMetadata} from './scheduler.js';
import {FLEXIBILITY_RATINGS,assertFlexibilityState,freshFlexibilityState} from './flexibility.js';
import {HYPERTROPHY_IDS,HYPERTROPHY_INITIAL_LEVEL_MAP,MUSCLE_MAP,OBJECTIVE_VALUES,PERSONALIZATION_VALUES,ZONE_ORDER,defaultObjectives,freshHypertrophyInitialized,freshHypertrophyLevels,freshHypertrophyRotation,objectiveSnapshot} from './objectives.js';
import {applyObjectivePlanner,reconcileObjectiveUnits} from './objective-planner.js';

export const RATINGS=['Facile','Correct','Trop dur','Douleur / gêne'];
export const KEY='muscu-cycle-data';
export const LEGACY_KEY='muscu-cycle-v1';
const day=86400000;
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const freshProgress=()=>Object.fromEntries(majorLines.map(line=>[line,{force:0,endurance:0,power:0}]));
const freshUnlocks=()=>Object.fromEntries(majorLines.map(line=>[line,{force:true,endurance:false,power:false}]));

export function rotationPattern(unlocks){if(unlocks?.power)return['force','force','endurance','force','power'];if(unlocks?.endurance)return['force','force','endurance','force','force'];return['force'];}
export function nextModeForLine(state,line){const pattern=rotationPattern(state.modeUnlocks[line]);return pattern[(state.modeRotation[line]||0)%pattern.length];}
function lineMode(state,id){const e=exercises[id];return e.major?nextModeForLine(state,e.lineId):'force';}
function levelIndex(state,id,modeId){const e=exercises[id];return modeId==='hypertrophy'?(state.hypertrophyLevels[id]||0):e.major?state.progress[e.lineId][modeId]:state.levels[id];}
function officialId(state,blockId,item){return`${state.phase.id}_cycle${state.cycle}_${blockId}_${item.id}_${item.mode}_${item.variantId}_set${item.series}`;}

const maintenanceQueue=['force','endurance','force','power'];
function stimulusDecision(state,id){
  const e=exercises[id],map=MUSCLE_MAP[id],priority=map?.ownerZone?state.objectives?.zones?.[map.ownerZone]||'strength':'strength';
  if(priority!=='hypertrophy'||!e.modes.hypertrophy)return{mode:lineMode(state,id),priority,rotation:null};
  const rotation=state.hypertrophyRotation[id]||{slot:0,maintenance:0};
  if(rotation.slot%3<2)return{mode:'hypertrophy',priority,rotation:{key:id,consumeMaintenance:false}};
  let cursor=rotation.maintenance%maintenanceQueue.length,requested=maintenanceQueue[cursor],skipped=0;
  while(!e.modes[requested]&&skipped<maintenanceQueue.length){cursor=(cursor+1)%maintenanceQueue.length;requested=maintenanceQueue[cursor];skipped++;}
  const unlocked=requested==='force'||!e.major||state.modeUnlocks[e.lineId]?.[requested];
  return{mode:unlocked?requested:'force',priority,rotation:{key:id,consumeMaintenance:unlocked,maintenanceIndex:cursor,requested}};
}

function planItems(state,id,modeId,completed=0,block=null,orderStart=0,decision=null){
  const e=exercises[id],step=stepFor(state,id,modeId);let alternate=null;
  if(id==='calf'&&phaseOrder.indexOf(state.phase.id)>=phaseOrder.indexOf('phase2b'))alternate=state.alternations.calfNext;
  return step.targets.slice(completed).map((target,index)=>{
    const item={id,lineId:e.lineId,mode:modeId,level:levelIndex(state,id,modeId),stepKey:step.key,variantId:step.variantId,variantName:step.variantName,series:completed+index+1,total:step.targets.length,target,targetMin:step.targetMin,targetMax:step.targetMax,unit:step.unit,rest:step.rest,instruction:step.instruction,stop:step.stop,technique:step.technique,alternate,blockId:block?.id||null,blockIndex:block?.index??null,order:orderStart+index,status:'pending',kind:'program',objectiveRotation:decision?.rotation||null,...objectiveSnapshot(id,modeId,decision?.priority||'strength','canonical')};
    item.officialId=officialId(state,item.blockId||'session',item);item.workMeta=workMetadata(item);return item;
  });
}

export function buildCycleRegistry(state,now=Date.now()){
  let order=0;const units=[];
  blocksFor(state).forEach((block,blockIndex)=>{
    const descriptor={...block,index:blockIndex};
    for(const sourceId of block.ids){const replaceSplit=sourceId==='split'&&state.objectives?.zones?.glutes==='hypertrophy',id=replaceSplit?'gluteSplit':sourceId,decision=replaceSplit?{mode:'hypertrophy',priority:'hypertrophy',rotation:null}:stimulusDecision(state,id),items=planItems(state,id,decision.mode,0,descriptor,order,decision);units.push(...items);order+=items.length;}
  });
  return applyObjectivePlanner(state,{id:`${state.phase.id}:cycle${state.cycle}`,cycle:state.cycle,phaseId:state.phase.id,units,availability:{},fillers:[],activityOffers:[],restCount:0,finalizedBlocks:[],rotationConsumptions:[]},now);
}

export function ensureRegistry(state){if(!state.registry||state.registry.cycle!==state.cycle||state.registry.phaseId!==state.phase.id)state.registry=buildCycleRegistry(state);return state.registry;}
export const registryPending=state=>ensureRegistry(state).units.filter(x=>['pending','in_progress'].includes(x.status));
export function blockProgress(state,blockId){const units=ensureRegistry(state).units.filter(x=>x.blockId===blockId),completed=units.filter(x=>x.status==='completed').length,skipped=units.filter(x=>x.status==='skipped').length,resolved=completed+skipped,done=units.length>0&&resolved===units.length;return{completed,skipped,resolved,total:units.length,done,partial:completed>0&&resolved<units.length,passed:done&&skipped>0&&completed===0,partialPassed:done&&skipped>0&&completed>0};}
export const cycleComplete=state=>ensureRegistry(state).units.length>0&&ensureRegistry(state).units.every(x=>['completed','skipped'].includes(x.status));
function registryUnit(state,id){return ensureRegistry(state).units.find(x=>x.officialId===id);}
function markStatus(state,id,status){const unit=registryUnit(state,id);if(unit)unit.status=status;return unit;}

export function freshState(now=Date.now()){
  const state={schemaVersion:7,revision:0,createdAt:now,next:0,cycle:1,phaseCycle:1,phase:{id:'phase1',activatedAt:now},pendingPhase:null,levels:{...initialLevels},progress:freshProgress(),modeUnlocks:freshUnlocks(),modeRotation:Object.fromEntries(majorLines.map(line=>[line,0])),objectives:defaultObjectives(),hypertrophyLevels:freshHypertrophyLevels(),hypertrophyRotation:freshHypertrophyRotation(),hypertrophyInitialized:freshHypertrophyInitialized(),hypertrophyLevelChanges:[],history:[],flexibility:freshFlexibilityState(),levelChanges:[],phaseChanges:[],alternations:{gNext:'G1',calfNext:'genou-tendu'},settings:defaultSchedulerSettings(),registry:null,active:null};
  state.registry=buildCycleRegistry(state);return state;
}

export function planFor(state){const block=blocksFor(state)[state.next];return ensureRegistry(state).units.filter(x=>x.blockId===block.id&&x.status==='pending').map(x=>({...x}));}
function nextPendingBlockIndex(state,start=0){const blocks=blocksFor(state);for(let offset=0;offset<blocks.length;offset++){const index=(start+offset)%blocks.length;if(!blockProgress(state,blocks[index].id).done)return index;}return-1;}
function resetDraft(a){a.draft={rating:'Correct',note:'',actual:null};a.timer=null;}

export function start(state,now=Date.now(),requestedBlockId=null){
  if(state.active||state.flexibility?.active)return false;ensureRegistry(state);
  if(cycleComplete(state))advanceCycle(state,now);
  const requestedIndex=requestedBlockId===null?-1:blocksFor(state).findIndex(block=>block.id===requestedBlockId),index=requestedIndex>=0&&!blockProgress(state,requestedBlockId).done?requestedIndex:nextPendingBlockIndex(state,state.next);if(index<0)return false;state.next=index;
  const block=blocksFor(state)[index],plan=ensureRegistry(state).units.filter(x=>x.blockId===block.id&&x.status==='pending').map(x=>({...x}));if(!plan.length)return false;
  const exerciseOrder=[...new Set(plan.map(x=>x.id))],lineModes=Object.fromEntries(exerciseOrder.map(id=>[exercises[id].lineId,plan.find(x=>x.id===id)?.mode||lineMode(state,id)]));
  state.active={id:uid(),blockId:block.id,blockVariant:block.variant||null,block:index,phaseId:state.phase.id,phaseCycle:state.phaseCycle,cycle:state.cycle,startedAt:now,finishedAt:null,exerciseOrder,lineModes,plan,cursor:0,results:[],supplementary:[],stage:'set',restUntil:null,mainRest:null,intermediate:null,suggestion:null,excludedSuggestions:[],suppressSuggestions:false,timer:null,draft:{rating:'Correct',note:'',actual:null},pausedAt:null,pausedMs:0,modeChanges:[]};
  markStatus(state,plan[0].officialId,'in_progress');return true;
}

export function setExecutionMode(state,mode,now=Date.now()){if(!EXECUTION_MODES[mode])return false;const before=state.settings.executionMode;if(before===mode)return true;state.settings.executionMode=mode;if(state.active){state.active.modeChanges.push({from:before,to:mode,at:now});state.active.suggestion=null;state.active.excludedSuggestions=[];state.active.suppressSuggestions=false;}return true;}

const hasValidatedHypertrophy=(state,id)=>[...(state.history||[]),...(state.active?[state.active]:[])].some(session=>(session.results||[]).some(result=>result.id===id&&result.stimulus==='hypertrophy'&&result.countsTowardHypertrophyVolume));
export function initializeHypertrophyLevels(state,ids=Object.keys(HYPERTROPHY_INITIAL_LEVEL_MAP),now=Date.now(),record=true){
  state.hypertrophyInitialized={...freshHypertrophyInitialized(),...(state.hypertrophyInitialized||{})};
  for(const id of ids){if(state.hypertrophyInitialized[id])continue;if(hasValidatedHypertrophy(state,id)){state.hypertrophyInitialized[id]=true;continue;}const mapping=HYPERTROPHY_INITIAL_LEVEL_MAP[id];if(!mapping)continue;const variantId=stepFor(state,mapping.sourceId,'force').variantId,mapped=mapping.variants[variantId];if(!Number.isInteger(mapped))throw Error(`Initialisation H non définie : ${id}/${variantId}.`);const before=state.hypertrophyLevels[id]??0,after=Math.max(0,Math.min(mapped,exercises[id].modes.hypertrophy.steps.length-1));state.hypertrophyLevels[id]=after;state.hypertrophyInitialized[id]=true;if(record&&before!==after)state.hypertrophyLevelChanges.push({id,lineId:exercises[id].lineId,mode:'hypertrophy',from:before,to:after,at:now,reason:'initial-force-map'});}
  return state;
}

function recomposeObjectivesNow(state,now){
  const previous=state.registry,fresh=buildCycleRegistry(state,now);state.registry=previous;reconcileObjectiveUnits(state,now,fresh);
  const a=state.active;if(a){const fixed=a.plan.filter(item=>state.registry.units.find(unit=>unit.officialId===item.officialId)?.status!=='pending'),pending=state.registry.units.filter(unit=>unit.blockId===a.blockId&&unit.status==='pending').map(unit=>({...unit}));a.plan=[...fixed,...pending];a.exerciseOrder=[...new Set(a.plan.map(x=>x.id))];a.lineModes=Object.fromEntries(a.exerciseOrder.map(id=>[exercises[id].lineId,a.plan.find(x=>x.id===id)?.mode||'force']));const current=a.plan.findIndex(item=>state.registry.units.find(unit=>unit.officialId===item.officialId)?.status==='in_progress');a.cursor=current>=0?current:Math.min(a.cursor,Math.max(0,a.plan.length-1));a.suggestion=null;a.excludedSuggestions=[];}
  state.next=Math.max(0,nextPendingBlockIndex(state,state.next));
}
export function requestObjectiveChange(state,zone,value,apply='next',now=Date.now()){
  if(!ZONE_ORDER.includes(zone)||!OBJECTIVE_VALUES.includes(value)||!['next','now'].includes(apply))return false;
  if(apply==='next'){const pending=state.objectives.pendingChanges||{zones:{}};pending.zones={...(pending.zones||{}),[zone]:value};state.objectives.pendingChanges=pending;return true;}
  state.objectives.zones[zone]=value;if(zone==='glutes'&&value==='hypertrophy')initializeHypertrophyLevels(state,undefined,now);recomposeObjectivesNow(state,now);return true;
}
export function requestPersonalizationChange(state,value,apply='now',now=Date.now()){
  if(!PERSONALIZATION_VALUES.includes(value)||!['next','now'].includes(apply))return false;
  if(apply==='next'){const pending=state.objectives.pendingChanges||{zones:{}};pending.personalization=value;state.objectives.pendingChanges=pending;return true;}
  state.objectives.personalization=value;recomposeObjectivesNow(state,now);return true;
}

export function elapsedTimer(timer,now=Date.now()){return timer?timer.elapsedMs+(timer.runningSince===null?0:Math.max(0,now-timer.runningSince)):null;}
export function toggleTimer(state,now=Date.now()){const a=state.active,item=currentSet(state);if(!a||a.stage!=='set'||a.pausedAt!==null||!item||!['seconds','side-seconds'].includes(item.unit))return false;if(!a.timer)a.timer={elapsedMs:0,runningSince:now};else if(a.timer.runningSince!==null)a.timer={elapsedMs:elapsedTimer(a.timer,now),runningSince:null};else a.timer.runningSince=now;return true;}
export function pause(state,now=Date.now()){const a=state.active;if(!a||a.pausedAt!==null)return false;if(a.timer?.runningSince!==null)a.timer={elapsedMs:elapsedTimer(a.timer,now),runningSince:null};a.pausedAt=now;return true;}
export function resume(state,now=Date.now()){const a=state.active;if(!a||a.pausedAt===null)return false;a.pausedMs+=Math.max(0,now-a.pausedAt);a.pausedAt=null;return true;}
export function duration(a,now=Date.now()){return Math.max(0,(a.finishedAt||a.pausedAt||now)-a.startedAt-a.pausedMs);}

function finalizeCompletedBlocks(state){
  const finalized=new Set(state.registry.finalizedBlocks||[]),consumed=new Set(state.registry.rotationConsumptions||[]);
  for(const block of blocksFor(state))if(!finalized.has(block.id)&&blockProgress(state,block.id).done){
    finalized.add(block.id);const completed=state.registry.units.filter(x=>x.blockId===block.id&&x.status==='completed');
    const strengthLines=new Set(completed.filter(x=>exercises[x.id]?.major&&x.priorityAtCreation==='strength').map(x=>x.lineId));for(const line of strengthLines){const key=`${block.id}:strength:${line}`;if(consumed.has(key))continue;state.modeRotation[line]=(state.modeRotation[line]||0)+1;consumed.add(key);}
    const rotations=new Map();for(const unit of completed)if(unit.objectiveRotation?.key&&!rotations.has(unit.objectiveRotation.key))rotations.set(unit.objectiveRotation.key,unit.objectiveRotation);
    for(const [id,plan]of rotations){const key=`${block.id}:hypertrophy:${id}`;if(consumed.has(key))continue;const rotation=state.hypertrophyRotation[id]||{slot:0,maintenance:0};rotation.slot=(rotation.slot+1)%3;if(plan.consumeMaintenance)rotation.maintenance=(plan.maintenanceIndex+1)%maintenanceQueue.length;state.hypertrophyRotation[id]=rotation;consumed.add(key);}
    if(completed.some(x=>x.id==='calf')&&phaseOrder.indexOf(state.phase.id)>=phaseOrder.indexOf('phase2b')&&!consumed.has(`${block.id}:alternate:calf`)){state.alternations.calfNext=state.alternations.calfNext==='genou-tendu'?'genou-flechi':'genou-tendu';consumed.add(`${block.id}:alternate:calf`);}
    if(block.id==='G'&&completed.length&&!consumed.has('G:alternate')){state.alternations.gNext=state.alternations.gNext==='G1'?'G2':'G1';consumed.add('G:alternate');}
  }
  state.registry.finalizedBlocks=[...finalized];state.registry.rotationConsumptions=[...consumed];
}

export function skipBlock(state,blockId,now=Date.now()){
  ensureRegistry(state);const block=blocksFor(state).find(value=>value.id===blockId);if(!block||state.active&&state.active.blockId!==blockId)return false;
  if(state.active?.blockId===blockId){const a=state.active;if(a.pausedAt!==null)resume(state,now);if(a.intermediate?.kind==='program')markStatus(state,a.intermediate.item.officialId,'pending');const main=a.plan[a.cursor];if(main)markStatus(state,main.officialId,'pending');if(a.results.length||(a.supplementary||[]).length){a.finishedAt=now;a.status='interrupted';state.history.push(a);}state.active=null;}
  if(state.registry.units.some(unit=>unit.blockId===blockId&&unit.status==='in_progress'))return false;
  let changed=false;for(const unit of state.registry.units)if(unit.blockId===blockId&&unit.status==='pending'){unit.status='skipped';unit.skippedAt=now;changed=true;}if(!changed)return false;finalizeCompletedBlocks(state);if(cycleComplete(state))advanceCycle(state,now);else state.next=nextPendingBlockIndex(state,Math.max(0,blocksFor(state).findIndex(value=>value.id===blockId)+1));return true;
}

export function reopenBlock(state,blockId){
  ensureRegistry(state);const blocks=blocksFor(state),index=blocks.findIndex(value=>value.id===blockId);if(index<0||state.active?.blockId===blockId)return false;const skipped=state.registry.units.filter(unit=>unit.blockId===blockId&&unit.status==='skipped');if(!skipped.length)return false;for(const unit of skipped){unit.status='pending';delete unit.skippedAt;}state.registry.finalizedBlocks=(state.registry.finalizedBlocks||[]).filter(id=>id!==blockId);if(!state.active)state.next=index;return true;
}

function applyPendingPhase(state,now){if(!state.pendingPhase)return;state.phase={id:state.pendingPhase.id,activatedAt:now};state.phaseCycle=1;state.pendingPhase=null;}
function applyPendingObjectives(state,now){const pending=state.objectives?.pendingChanges;if(!pending)return;Object.assign(state.objectives.zones,pending.zones||{});if(pending.personalization)state.objectives.personalization=pending.personalization;if(state.objectives.zones.glutes==='hypertrophy')initializeHypertrophyLevels(state,undefined,now);state.objectives.pendingChanges=null;}
function advanceCycle(state,now){state.cycle++;state.phaseCycle++;applyPendingPhase(state,now);applyPendingObjectives(state,now);state.next=0;state.registry=buildCycleRegistry(state,now);}
function finishSession(state,a,now){
  a.finishedAt=now;a.status='complete';a.stage='complete';a.mainRest=null;a.suggestion=null;state.history.push(a);state.active=null;finalizeCompletedBlocks(state);
  if(cycleComplete(state))advanceCycle(state,now);else state.next=nextPendingBlockIndex(state,a.block+1);
}

function advanceCursorPastCompleted(state){const a=state.active;if(!a)return;while(a.cursor<a.plan.length&&registryUnit(state,a.plan[a.cursor].officialId)?.status==='completed')a.cursor++;}
function resultFrom(a,item,actual,now,extra={}){return{...item,kind:item.kind||'program',actual,rating:a.draft.rating,note:a.draft.note.trim(),at:now,timedSeconds:a.timer?Math.round(elapsedTimer(a.timer,now)/100)/10:null,...extra};}

export function validateSet(state,now=Date.now()){
  const a=state.active,item=currentSet(state);if(!a||!item||a.stage!=='set'||a.pausedAt!==null)return false;
  const d=a.draft,measured=item.supplementaryType==='mobility'&&a.timer?Math.round(elapsedTimer(a.timer,now)/100)/10:item.target,actual=d.actual===null?measured:d.actual,ratings=item.supplementaryType==='mobility'?FLEXIBILITY_RATINGS:RATINGS;if(!ratings.includes(d.rating)||!Number.isFinite(actual)||actual<0||actual>9999)throw Error('Résultat invalide.');
  if(a.intermediate?.kind==='supplementary'){
    const result=resultFrom(a,item,actual,now,{kind:'supplementary',fillerId:item.fillerId||null,mobilityId:item.mobilityId||null,supplementaryType:item.supplementaryType||'strength',context:a.mainRest?{ownerId:a.mainRest.ownerId,ownerName:a.mainRest.ownerName,restIndex:a.mainRest.index}:null});a.supplementary.push(result);state.registry.fillers.push({id:item.fillerId||item.mobilityId,fillerId:item.fillerId||null,mobilityId:item.mobilityId||null,supplementaryType:item.supplementaryType||'strength',side:item.side||null,family:item.family,zone:item.zone||null,at:now,result});a.intermediate=null;a.stage='rest';a.suggestion=null;resetDraft(a);return false;
  }
  if(a.intermediate?.kind==='program'){
    const result=resultFrom(a,item,actual,now,{kind:'program',movedBy:'express'});a.results.push(result);markStatus(state,item.officialId,'completed');state.registry.availability[item.id]=now+item.rest*1000;a.intermediate=null;a.stage='rest';a.suggestion=null;resetDraft(a);finalizeCompletedBlocks(state);advanceCursorPastCompleted(state);if(a.cursor>=a.plan.length){finishSession(state,a,now);return true;}return false;
  }
  const result=resultFrom(a,item,actual,now,{kind:'program'});a.results.push(result);markStatus(state,item.officialId,'completed');state.registry.availability[item.id]=now+item.rest*1000;a.cursor++;resetDraft(a);finalizeCompletedBlocks(state);advanceCursorPastCompleted(state);
  if(a.cursor>=a.plan.length){finishSession(state,a,now);return true;}
  state.registry.restCount++;a.stage='rest';a.restUntil=now+item.rest*1000;a.mainRest={ownerId:item.officialId,ownerName:item.variantName,until:a.restUntil,index:state.registry.restCount};a.suggestion=null;a.excludedSuggestions=[];a.suppressSuggestions=false;return false;
}

export function restSuggestion(state,now=Date.now()){
  const a=state.active;if(!a||a.stage!=='rest'||a.pausedAt!==null||a.suppressSuggestions)return null;
  const owner=registryUnit(state,a.mainRest?.ownerId);if(!owner)return null;
  if(a.suggestion){const fresh=a.suggestion.kind==='program'?registryUnit(state,a.suggestion.item.officialId)?.status==='pending':true;if(fresh)return a.suggestion;a.suggestion=null;}
  a.suggestion=selectRestActivity(state,owner,a.restUntil,now,a.excludedSuggestions);if(a.suggestion?.kind==='supplementary'){const item=a.suggestion.item;state.registry.activityOffers=state.registry.activityOffers||[];state.registry.activityOffers.push({id:item.mobilityId||item.fillerId,type:item.supplementaryType||'strength',zone:item.zone||item.family||null,sessionId:a.id,restIndex:a.mainRest?.index||0,at:now});}return a.suggestion;
}
export function beginSuggestedActivity(state,now=Date.now()){
  const a=state.active,s=a?.suggestion;if(!a||a.stage!=='rest'||!s)return false;
  if(s.kind==='program'){const unit=registryUnit(state,s.item.officialId);if(!unit||unit.status!=='pending')return false;unit.status='in_progress';a.intermediate={kind:'program',item:{...unit}};}
  else a.intermediate={kind:'supplementary',item:{...s.item}};
  a.stage='set';a.suggestion=null;resetDraft(a);return true;
}
export function skipSuggestedActivity(state,recover=false){const a=state.active;if(!a||a.stage!=='rest'||!a.suggestion)return false;a.excludedSuggestions.push(a.suggestion.kind==='program'?a.suggestion.item.officialId:(a.suggestion.item.fillerId||a.suggestion.item.mobilityId));a.suggestion=null;if(recover)a.suppressSuggestions=true;return true;}

export function skipRest(state){const a=state.active;if(a?.stage!=='rest'||a.pausedAt!==null)return false;a.stage='set';a.restUntil=null;a.mainRest=null;a.suggestion=null;a.suppressSuggestions=false;advanceCursorPastCompleted(state);if(a.cursor>=a.plan.length){finishSession(state,a,Date.now());return true;}markStatus(state,a.plan[a.cursor].officialId,'in_progress');resetDraft(a);return true;}
export function currentSet(state){const a=state.active;if(!a)return null;if(a.intermediate)return a.intermediate.item;return a.plan[a.cursor]||null;}
export function currentSetDetails(state){const item=currentSet(state);if(!item)return null;if(item.kind==='supplementary'){if(item.supplementaryType==='mobility')return{...item,technique:null,cues:[item.shortInstruction,'Tension légère, respiration normale, aucune recherche d’amplitude maximale.'],mistake:item.stopCriterion};return{...item,technique:null,cues:['Reste très facile et garde au moins cinq répétitions potentielles en réserve.'],mistake:'Ne va jamais à l’échec.'};}const technique=techniqueFor(item.id,item.variantId,item.mode);if(!technique)throw Error(`Consigne introuvable pour ${item.id}/${item.variantId}/${item.mode}.`);return{...item,technique,cues:technique.sessionCues,mistake:technique.mistakes[0]||''};}

export function abandon(state,now=Date.now()){const a=state.active;if(!a)return false;if(a.pausedAt!==null)resume(state,now);if(a.intermediate?.kind==='program')markStatus(state,a.intermediate.item.officialId,'pending');const main=a.plan[a.cursor];if(main)markStatus(state,main.officialId,'pending');a.finishedAt=now;a.status='interrupted';state.history.push(a);state.active=null;return true;}

function recomposeRegistryExercise(state,id,modeId){
  const registry=ensureRegistry(state),blocks=blocksFor(state);for(const [blockIndex,block]of blocks.entries())if(block.ids.includes(id)){
    const old=registry.units.filter(x=>x.blockId===block.id&&x.id===id),fixed=old.filter(x=>x.status!=='pending'),resolved=fixed.length,startOrder=Math.min(...old.map(x=>x.order));
    const replacement=[...fixed,...planItems(state,id,modeId,resolved,{...block,index:blockIndex},startOrder+resolved)];
    const first=registry.units.findIndex(x=>x.blockId===block.id&&x.id===id);registry.units.splice(first,old.length,...replacement);
  }
  registry.units.sort((a,b)=>a.order-b.order);registry.units.forEach((x,i)=>x.order=i);
}
function recomposeActive(state,id){
  const a=state.active;if(!a)return;const first=a.plan.findIndex((x,i)=>i>=a.cursor&&x.id===id);if(first<0)return;let end=first;while(end<a.plan.length&&a.plan[end].id===id)end++;
  const fixed=a.plan.slice(first,end).filter(x=>registryUnit(state,x.officialId)?.status==='in_progress'),completed=ensureRegistry(state).units.filter(x=>x.blockId===a.blockId&&x.id===id&&x.status==='completed').length,modeId=a.lineModes[exercises[id].lineId]||'force',block=blocksFor(state)[a.block];
  const pending=ensureRegistry(state).units.filter(x=>x.blockId===a.blockId&&x.id===id&&x.status==='pending').map(x=>({...x}));a.plan=[...a.plan.slice(0,first),...fixed,...pending,...a.plan.slice(end)];if(a.cursor>=a.plan.length)finishSession(state,a,Date.now());
}
export function changeLevel(state,id,delta,now=Date.now(),modeId=null){
  const e=exercises[id];if(!e||!Number.isInteger(delta)||!delta)return false;const mode=modeId||(state.active?.lineModes?.[e.lineId]||'force'),steps=e.modes[mode]?.steps;if(!steps)return false;
  const before=mode==='hypertrophy'?state.hypertrophyLevels[id]:e.major?state.progress[e.lineId][mode]:state.levels[id],after=before+delta;if(after<0||after>=steps.length)return false;
  if(mode==='hypertrophy'){state.hypertrophyLevels[id]=after;state.hypertrophyLevelChanges.push({id,lineId:e.lineId,mode,from:before,to:after,at:now});recomposeObjectivesNow(state,now);return true;}
  if(e.major)state.progress[e.lineId][mode]=after;else state.levels[id]=after;state.levelChanges.push({id,lineId:e.lineId,mode,from:before,to:after,at:now});recomposeRegistryExercise(state,id,mode);recomposeActive(state,id);return true;
}

export function passages(state,id,limit=3,modeId='force'){const e=exercises[id],index=modeId==='hypertrophy'?state.hypertrophyLevels[id]:e.major?state.progress[e.lineId][modeId]:state.levels[id],changes=modeId==='hypertrophy'?state.hypertrophyLevelChanges:state.levelChanges,changedAt=changes.findLast(c=>c.id===id&&c.mode===modeId)?.at??0;return state.history.filter(h=>h.status==='complete'&&h.startedAt>=changedAt&&h.results.some(r=>r.id===id&&r.mode===modeId&&r.level===index)).slice(-limit).map(h=>h.results.filter(r=>r.id===id&&r.mode===modeId));}
export function recentPain(state,line,limit=3){return state.history.filter(h=>(h.results||[]).some(r=>r.lineId===line)).slice(-limit).some(h=>h.results.some(r=>r.lineId===line&&r.rating==='Douleur / gêne'));}
export function recommendation(state,id,modeId='force'){const e=exercises[id],needed=modeId==='hypertrophy'?2:3,recent=passages(state,id,needed,modeId),index=modeId==='hypertrophy'?state.hypertrophyLevels[id]:e.major?state.progress[e.lineId][modeId]:state.levels[id],max=e.modes[modeId].steps.length-1;if(recentPain(state,e.lineId))return{kind:'pain',text:'Douleur signalée récemment. Aucune hausse suggérée.'};if(recent.length>=2&&recent.filter(rs=>rs.some(r=>r.rating==='Trop dur'||r.actual<(r.targetMin??r.target))).length>=2&&index>0)return{kind:'down',text:'Niveau inférieur conseillé : deux expositions difficiles.'};if(recent.length===needed&&recent.every(rs=>rs.every(r=>['Correct','Facile'].includes(r.rating)&&r.actual>=(modeId==='hypertrophy'?(r.targetMax??r.target):r.target)))&&index<max)return{kind:'up',text:modeId==='hypertrophy'?'Niveau supérieur suggéré : 2 expositions réussies.':'Palier supérieur suggéré : 3 passages réussis.'};return null;}

function phaseSessions(state,id=state.phase.id){return state.history.filter(h=>h.phaseId===id);}
function completedPhaseCycles(state){return Math.max(0,state.phaseCycle-1);}
function cleanRecentCycles(state,count){const min=Math.max(1,state.phaseCycle-count);return phaseSessions(state).filter(h=>h.phaseCycle>=min).every(h=>(h.results||[]).every(r=>r.rating!=='Douleur / gêne'));}
function qualityRecentCycles(state,count){const min=Math.max(1,state.phaseCycle-count),results=phaseSessions(state).filter(h=>h.phaseCycle>=min).flatMap(h=>h.results||[]);return results.length>0&&results.filter(r=>['Correct','Facile'].includes(r.rating)&&r.actual>=r.target).length/results.length>=.8;}
function noRepeatedFailure(state){return Object.keys(exercises).every(id=>{const ps=state.history.filter(h=>(h.results||[]).some(r=>r.id===id)).slice(-3);return ps.length<3||ps.filter(h=>h.results.some(r=>r.id===id&&(r.rating==='Trop dur'||r.actual<r.target))).length<2;});}
function noRepeatedAbandon(state){const byBlock=new Map();for(const h of state.history){const list=byBlock.get(h.blockId)||[];list.push(h);byBlock.set(h.blockId,list);}return[...byBlock.values()].every(list=>list.slice(-3).filter(h=>h.status==='interrupted').length<2);}
export function phaseUnlockProgress(state,now=Date.now()){const current=state.phase.id,index=phaseOrder.indexOf(current),next=phaseOrder[index+1];if(!next)return null;const cycles=completedPhaseCycles(state),days=Math.floor((now-state.phase.activatedAt)/day);let checks;if(current==='phase1')checks=[['cycles',cycles>=4,`${cycles}/4 cycles complets`],['days',days>=8,`${days}/8 jours`],['pain',cleanRecentCycles(state,2),'Aucune douleur sur les 2 derniers cycles'],['tolerance',qualityRecentCycles(state,2),'≥ 80 % Correct ou Facile']];else if(current==='phase2a')checks=[['cycles',cycles>=3,`${cycles}/3 cycles complets`],['days',days>=7,`${days}/7 jours`],['pain',cleanRecentCycles(state,3),'Nouveaux exercices sans douleur'],['tolerance',noRepeatedFailure(state),'Aucun échec répété sur 2 des 3 passages']];else if(current==='phase2b')checks=[['cycles',cycles>=3,`${cycles}/3 cycles complets`],['days',days>=7,`${days}/7 jours`],['pain',cleanRecentCycles(state,2),'Walkout et compléments tolérés'],['tolerance',qualityRecentCycles(state,2),'≥ 80 % Correct ou Facile']];else checks=[['cycles',cycles>=4,`${cycles}/4 cycles complets`],['days',days>=10,`${days}/10 jours`],['pain',cleanRecentCycles(state,2),'Aucune douleur récurrente'],['tolerance',noRepeatedAbandon(state),'Aucun bloc abandonné 2 fois sur 3']];return{current,next,label:phases[next].label,checks:checks.map(([id,ok,text])=>({id,ok,text})),ready:checks.every(([,ok])=>ok)};}
export function unlockPhase(state,now=Date.now(),options={}){const p=phaseUnlockProgress(state,now);if(!p||(!p.ready&&!options.force))return false;const apply=options.apply||'current';state.phaseChanges.push({from:state.phase.id,to:p.next,at:now,anticipated:!p.ready,apply});if(apply==='next'){state.pendingPhase={id:p.next,requestedAt:now};return true;}const oldUnits=ensureRegistry(state).units;state.phase={id:p.next,activatedAt:now};state.phaseCycle=1;const expanded=buildCycleRegistry(state),keys=new Set(oldUnits.map(x=>`${x.blockId}:${x.id}:${x.series}`));for(const unit of expanded.units)if(!keys.has(`${unit.blockId}:${unit.id}:${unit.series}`)){unit.order=oldUnits.length;oldUnits.push(unit);}state.registry.phaseId=p.next;state.registry.id=`${p.next}:cycle${state.cycle}`;state.registry.units=oldUnits;state.next=Math.max(0,nextPendingBlockIndex(state,state.next));return true;}

function successfulSessions(state,predicate){return state.history.filter(h=>predicate((h.results||[]).filter(r=>r.mode==='force'))).length;}
const cleanSets=(results,id,variants,sets,target)=>{const rs=results.filter(r=>r.id===id&&(!variants||variants.includes(r.variantId)));return rs.length>=sets&&rs.every(r=>['Correct','Facile'].includes(r.rating)&&r.actual>=target);};
function prerequisiteStatus(state,line,modeId){let count=0,needed=1;if(modeId==='endurance'){if(line==='horizontalPush'){needed=2;count=successfulSessions(state,rs=>cleanSets(rs,'pushup',['classique'],2,10));}else if(line==='verticalPush')count=successfulSessions(state,rs=>cleanSets(rs,'pike',['pike'],2,8));else if(line==='verticalPull')count=successfulSessions(state,rs=>cleanSets(rs,'pullup',['stricte'],3,5));else if(line==='horizontalPull')count=successfulSessions(state,rs=>cleanSets(rs,'row',['actuel'],2,12)||cleanSets(rs,'row',['plus-horizontal','presque-horizontal','pause-poitrine','pieds-sureleves'],2,8));else if(line==='knee')count=successfulSessions(state,rs=>cleanSets(rs,'split',['split-squat'],2,10)||cleanSets(rs,'split',['bulgarian'],2,8));else if(line==='posterior'){const bridge=successfulSessions(state,rs=>cleanSets(rs,'bridge',['une-jambe'],2,10)),walkout=successfulSessions(state,rs=>cleanSets(rs,'hamstring',['court','complet'],2,6));count=Math.min(bridge,walkout);}else return null;}else if(modeId==='power'){if(line==='horizontalPush')count=successfulSessions(state,rs=>cleanSets(rs,'pushup',['classique'],2,10));else if(line==='verticalPush')count=successfulSessions(state,rs=>cleanSets(rs,'pike',['pike'],2,8));else if(line==='verticalPull')count=successfulSessions(state,rs=>cleanSets(rs,'pullup',['stricte'],3,4));else if(line==='horizontalPull')count=successfulSessions(state,rs=>cleanSets(rs,'row',['plus-horizontal','presque-horizontal','pause-poitrine','pieds-sureleves'],2,8));else if(line==='knee')count=successfulSessions(state,rs=>cleanSets(rs,'split',['bulgarian'],2,8));else return null;}else return null;return{count,needed,ok:count>=needed};}
export function modeUnlockProgress(state,line,modeId,now=Date.now()){if(state.modeUnlocks[line]?.[modeId])return{ready:false,already:true,checks:[]};const prerequisite=prerequisiteStatus(state,line,modeId);if(!prerequisite)return null;const base=[{id:'prerequisite',ok:prerequisite.ok,text:`Pré-requis de la ligne (${Math.min(prerequisite.count,prerequisite.needed)}/${prerequisite.needed})`}];if(modeId==='endurance')return{line,mode:modeId,checks:base,ready:base.every(c=>c.ok)};const days=Math.floor((now-state.phase.activatedAt)/day),checks=[{id:'base',ok:state.phase.id==='complete',text:'Base A→G active'},{id:'days',ok:state.phase.id==='complete'&&days>=14,text:`Base active depuis ${days}/14 jours`},{id:'pain',ok:!recentPain(state,line),text:'Aucune douleur récente'},...base];return{line,mode:modeId,checks,ready:checks.every(c=>c.ok)};}
export function unlockMode(state,line,modeId,now=Date.now(),force=false){const p=modeUnlockProgress(state,line,modeId,now);if(!p||(!p.ready&&!force))return false;state.modeUnlocks[line][modeId]=true;return true;}
export function powerExplosiveAvailable(state,line){const e=Object.values(exercises).find(x=>x.lineId===line&&x.major),passages=state.history.filter(h=>{const rs=(h.results||[]).filter(r=>r.id===e?.id&&r.mode==='power'&&r.level===0);return rs.length&&rs.every(r=>['Correct','Facile'].includes(r.rating)&&r.actual>=r.target);});return passages.slice(-3).length>=3&&!recentPain(state,line,3);}

export function assertState(s){
  if(!s||s.schemaVersion!==7||!Number.isInteger(s.revision)||s.revision<0||!phases[s.phase?.id]||!Number.isFinite(s.phase.activatedAt)||!Number.isInteger(s.next)||s.next<0||s.next>=blocksFor(s).length||!Number.isInteger(s.cycle)||s.cycle<1||!Number.isInteger(s.phaseCycle)||s.phaseCycle<1||!Array.isArray(s.history)||!Array.isArray(s.levelChanges)||!EXECUTION_MODES[s.settings?.executionMode])throw Error('Sauvegarde incompatible ou endommagée.');
  if(!s.objectives||!PERSONALIZATION_VALUES.includes(s.objectives.personalization)||ZONE_ORDER.some(zone=>!OBJECTIVE_VALUES.includes(s.objectives.zones?.[zone]))||!Array.isArray(s.hypertrophyLevelChanges))throw Error('Objectifs musculaires invalides.');
  for(const id of HYPERTROPHY_IDS)if(!Number.isInteger(s.hypertrophyLevels?.[id])||!exercises[id].modes.hypertrophy.steps[s.hypertrophyLevels[id]]||typeof s.hypertrophyInitialized?.[id]!=='boolean'||!Number.isInteger(s.hypertrophyRotation?.[id]?.slot)||!Number.isInteger(s.hypertrophyRotation?.[id]?.maintenance))throw Error('Progression hypertrophie invalide.');
  assertFlexibilityState(s.flexibility);
  for(const [id,e]of Object.entries(exercises)){if(e.major){const pg=s.progress?.[e.lineId],u=s.modeUnlocks?.[e.lineId];if(!pg||!u)throw Error('Progression de ligne invalide.');for(const modeId of Object.keys(e.modes).filter(mode=>mode!=='hypertrophy'))if(!Number.isInteger(pg[modeId])||!e.modes[modeId].steps[pg[modeId]])throw Error('Palier de mode invalide.');}else if(!Number.isInteger(s.levels?.[id])||!e.steps[s.levels[id]])throw Error('Palier invalide.');}
  const ids=new Set();for(const unit of ensureRegistry(s).units){if(ids.has(unit.officialId)||!exercises[unit.id]||!['pending','in_progress','completed','skipped'].includes(unit.status)||!unit.workMeta||!['canonical','objective-line','objective-extra'].includes(unit.source)||!['force','hypertrophy','endurance','power'].includes(unit.stimulus)||!unit.muscleContributions)throw Error('Registre officiel invalide.');ids.add(unit.officialId);}
  const checkResult=r=>{if(r.kind==='supplementary')return;if(!exercises[r.id]||!exercises[r.id].modes[r.mode]?.steps[r.level]||!RATINGS.includes(r.rating)||typeof r.note!=='string'||!Number.isFinite(r.actual)||!Number.isFinite(r.at)||typeof r.variantId!=='string')throw Error('Historique invalide.');};
  for(const h of[...s.history,...(s.active?[s.active]:[])]){if(!Array.isArray(h.results)||!Number.isFinite(h.startedAt)||!Number.isFinite(h.pausedMs))throw Error('Séance invalide.');h.results.forEach(checkResult);(h.supplementary||[]).forEach(checkResult);}
  if(s.active){const a=s.active;if(!['rest','set'].includes(a.stage)||!Number.isInteger(a.cursor)||a.cursor<0||a.cursor>=a.plan.length||!RATINGS.includes(a.draft?.rating))throw Error('Séance en cours invalide.');for(const item of a.plan)if(!exercises[item.id]||!Number.isFinite(item.target)||!item.variantId||!item.officialId)throw Error('Programme de séance invalide.');}
  return s;
}
