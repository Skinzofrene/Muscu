import {blocksFor,exercises,stepFor} from './program.js';
import {workMetadata} from './scheduler.js';
import {GLUTE_HYPERTROPHY_TEMPLATE,GLUTE_PATTERN_BY_EXERCISE,HYPERTROPHY_VOLUME,MUSCLE_MAP,PERSONALIZATION_LIMITS,ZONE_ORDER,ZONES,objectiveSnapshot,zoneForSubzone} from './objectives.js';

const weightByKind={direct:1,importantSecondary:.5,lightSecondary:0};
const resultTime=item=>Number(item.at??item.finishedAt??item.startedAt??0);
const resolvedResultItems=(state,now)=>{const cutoff=now-HYPERTROPHY_VOLUME.windowMs,history=(state.history||[]).flatMap(session=>(session.results||[]).filter(result=>resultTime(result)>cutoff&&resultTime(result)<=now)),active=(state.active?.results||[]).filter(result=>resultTime(result)>cutoff&&resultTime(result)<=now);return[...history,...active];};
const pendingItems=state=>{const activeResultIds=new Set((state.active?.results||[]).map(x=>x.officialId));return(state.registry?.units||[]).filter(unit=>unit.status==='pending'&&!activeResultIds.has(unit.officialId));};

export function contributionByZone(item){
  if(!item?.countsTowardHypertrophyVolume||item.stimulus!=='hypertrophy')return{};
  const contributions=item.muscleContributions||MUSCLE_MAP[item.id]||{direct:[],importantSecondary:[],lightSecondary:[]},byZone={};
  for(const kind of ['direct','importantSecondary','lightSecondary'])for(const subzone of contributions[kind]||[]){const zone=zoneForSubzone(subzone);if(zone)byZone[zone]=Math.max(byZone[zone]||0,weightByKind[kind]);}
  return byZone;
}

function recentItems(state,now,includePending){return[...resolvedResultItems(state,now),...(includePending?pendingItems(state):[])];}

export function hypertrophyVolume(state,now=Date.now(),includePending=true){
  const volume=Object.fromEntries(ZONE_ORDER.map(zone=>[zone,0])),direct=Object.fromEntries(ZONE_ORDER.map(zone=>[zone,new Set()]));
  for(const item of recentItems(state,now,includePending)){
    for(const [zone,value]of Object.entries(contributionByZone(item)))volume[zone]+=value;
    for(const subzone of item.muscleContributions?.direct||[])if(zoneForSubzone(subzone))direct[zoneForSubzone(subzone)].add(subzone);
  }
  return Object.fromEntries(ZONE_ORDER.map(zone=>[zone,{volume:Math.round(volume[zone]*2)/2,direct:[...direct[zone]],missing:ZONES[zone].required.filter(subzone=>!direct[zone].has(subzone)),satisfied:volume[zone]>=HYPERTROPHY_VOLUME.floor&&volume[zone]<=HYPERTROPHY_VOLUME.automaticCeiling}]));
}

function glutePatternFor(item){if(item?.stimulus!=='hypertrophy'||!item.countsTowardHypertrophyVolume)return null;return item.objectivePattern||GLUTE_PATTERN_BY_EXERCISE[item.id]||null;}
export function glutePatternSummary(state,now=Date.now(),includePending=false){
  const template=GLUTE_HYPERTROPHY_TEMPLATE,patterns=Object.fromEntries(template.fixedOrder.map(id=>[id,{id,label:template.patterns[id].label,detail:template.patterns[id].detail,count:0,lastAt:0,minimum:template.minimumPerPattern,covered:false}]));
  for(const item of recentItems(state,now,includePending)){const pattern=glutePatternFor(item);if(!patterns[pattern])continue;patterns[pattern].count++;patterns[pattern].lastAt=Math.max(patterns[pattern].lastAt,resultTime(item));}
  for(const value of Object.values(patterns))value.covered=value.count>=value.minimum;
  return{patterns,covered:Object.values(patterns).every(value=>value.covered),missing:template.fixedOrder.filter(id=>!patterns[id].covered)};
}

export function objectiveZoneSummary(state,zone,now=Date.now()){
  const data=hypertrophyVolume(state,now,false)[zone],definition=ZONES[zone];if(!data||!definition)return null;
  const patterns=zone==='glutes'?glutePatternSummary(state,now,false):null;
  let status=data.volume<HYPERTROPHY_VOLUME.floor?'building':data.volume>HYPERTROPHY_VOLUME.automaticCeiling?'high':'target';if(zone==='glutes'&&data.volume>=HYPERTROPHY_VOLUME.floor&&!patterns.covered)status='coverage';
  return{zone,label:definition.label,capability:definition.capability,limitation:definition.limitation||null,volume:data.volume,missing:data.missing,coverage:Object.fromEntries(definition.required.map(subzone=>[subzone,!data.missing.includes(subzone)])),patterns,status};
}

function officialId(state,blockId,item,source){return`${state.phase.id}_cycle${state.cycle}_${blockId}_${item.id}_${item.mode}_${item.variantId}_${source}_set${item.series}`;}
function makeObjectiveUnits(state,id,block,source,count,orderStart,seriesStart=1,total=count){
  const step=stepFor(state,id,'hypertrophy'),map=MUSCLE_MAP[id],priority=state.objectives.zones[map.ownerZone];
  return Array.from({length:count},(_,index)=>{const series=seriesStart+index,target=step.targets[series-1]??step.targetMax,item={id,lineId:exercises[id].lineId,mode:'hypertrophy',level:state.hypertrophyLevels[id]||0,stepKey:step.key,variantId:step.variantId,variantName:step.variantName,series,total,target,targetMin:step.targetMin,targetMax:step.targetMax,unit:step.unit,rest:step.rest,instruction:step.instruction,stop:step.stop,technique:step.technique,alternate:null,blockId:block.id,blockIndex:block.index,order:orderStart+index/100,status:'pending',kind:'program',...objectiveSnapshot(id,'hypertrophy',priority,source)};item.officialId=officialId(state,block.id,item,source);item.workMeta=workMetadata(item);return item;});
}

function latestDirectAt(state,zone,now){let latest=0;for(const item of resolvedResultItems(state,now))if(item.muscleContributions?.direct?.some(subzone=>zoneForSubzone(subzone)===zone))latest=Math.max(latest,resultTime(item));return latest;}
function candidateScore(state,candidate,summary,now){const map=MUSCLE_MAP[candidate.id],missing=summary[candidate.zone].missing,satisfiesMissing=map.direct.some(x=>missing.includes(x))?1:0,deficit=Math.max(0,HYPERTROPHY_VOLUME.floor-summary[candidate.zone].volume),helpsSecond=Object.entries(contributionByZone({...objectiveSnapshot(candidate.id,'hypertrophy','hypertrophy',candidate.source),id:candidate.id})).some(([zone,value])=>zone!==candidate.zone&&value>0&&state.objectives.zones[zone]==='hypertrophy'&&summary[zone].volume<HYPERTROPHY_VOLUME.floor)?1:0;return[-satisfiesMissing,-deficit,-helpsSecond,latestDirectAt(state,candidate.zone,now),ZONE_ORDER.indexOf(candidate.zone),candidate.block.index,candidate.id];}
const compareTuple=(a,b)=>{for(let i=0;i<a.length;i++){if(a[i]<b[i])return-1;if(a[i]>b[i])return 1;}return 0;};
const nextOrder=(registry,blockId)=>Math.max(-1,...registry.units.filter(x=>x.blockId===blockId).map(x=>x.order))+0.01;

function appendUnits(registry,units){registry.units.push(...units);registry.units.sort((a,b)=>a.blockIndex-b.blockIndex||a.order-b.order);registry.units.forEach((unit,index)=>unit.order=index);}

function applyGluteTemplate(state,registry,blocks,now,addedByBlock,previousRegistry){
  if(state.objectives.zones.glutes!=='hypertrophy')return;
  const template=GLUTE_HYPERTROPHY_TEMPLATE,extensionBlock=blocks.find(value=>value.id===template.blockId),unilateralBlock=blocks.find(value=>value.id===template.unilateralBlockId);if(!extensionBlock||!unilateralBlock)return;
  const sameCycle=previousRegistry?.cycle===registry.cycle,blockWasSkipped=blockId=>sameCycle&&previousRegistry.units?.some(unit=>unit.blockId===blockId&&unit.status==='skipped'),available={hipExtension:!blockWasSkipped(extensionBlock.id),unilateralHipKneeExtension:!blockWasSkipped(unilateralBlock.id),hipAbduction:!blockWasSkipped(extensionBlock.id)};
  // Le plafond s'applique aussi aux séries canoniques H nouvellement planifiées, sans toucher au réalisé.
  while(hypertrophyVolume(state,now,true).glutes.volume>HYPERTROPHY_VOLUME.automaticCeiling){const index=registry.units.findLastIndex(unit=>unit.status==='pending'&&unit.stimulus==='hypertrophy'&&unit.ownerZone==='glutes'&&unit.source==='canonical');if(index<0)break;registry.units.splice(index,1);}
  // B porte le slot Unilatéral H canonique. E ne reçoit que Bridge et Abduction.
  const abductorExisting=registry.units.filter(unit=>unit.blockId===extensionBlock.id&&unit.id==='abductor'&&unit.stimulus==='hypertrophy');
  if(available.hipAbduction&&abductorExisting.length<template.minimumPerPattern){const missing=template.minimumPerPattern-abductorExisting.length,volume=hypertrophyVolume(state,now,true).glutes.volume,allowed=Math.min(missing,Math.max(0,Math.ceil(HYPERTROPHY_VOLUME.automaticCeiling-volume)));if(allowed>0){const units=makeObjectiveUnits(state,'abductor',extensionBlock,'objective-line',allowed,nextOrder(registry,extensionBlock.id),abductorExisting.length+1,template.minimumPerPattern);appendUnits(registry,units);addedByBlock[extensionBlock.id]+=units.length;}}
  const budget=template.additionBudget[state.objectives.personalization],desiredVolume=state.objectives.personalization==='maximize'?HYPERTROPHY_VOLUME.target:HYPERTROPHY_VOLUME.floor;let additions=0,nextPattern='hipExtension';
  const addExtra=patternId=>{if(!available[patternId])return 0;const id=patternId==='hipExtension'?'bridge':'gluteSplit',block=patternId==='hipExtension'?extensionBlock:unilateralBlock,existing=registry.units.filter(unit=>unit.blockId===block.id&&unit.id===id&&unit.stimulus==='hypertrophy');if(!existing.length||existing.length>=5)return 0;const volume=hypertrophyVolume(state,now,true).glutes.volume;if(volume>=HYPERTROPHY_VOLUME.automaticCeiling)return 0;const units=makeObjectiveUnits(state,id,block,'objective-extra',1,nextOrder(registry,block.id),existing.length+1,existing.length+1);appendUnits(registry,units);additions++;addedByBlock[block.id]+=1;return 1;};
  while(additions<budget&&hypertrophyVolume(state,now,true).glutes.volume<desiredVolume){const first=nextPattern,second=first==='hipExtension'?'unilateralHipKneeExtension':'hipExtension';if(addExtra(first))nextPattern=second;else if(addExtra(second))nextPattern=first;else if(available.hipAbduction){const existing=registry.units.filter(unit=>unit.blockId===extensionBlock.id&&unit.id==='abductor'&&unit.stimulus==='hypertrophy');if(!existing.length||existing.length>=5)break;const volume=hypertrophyVolume(state,now,true).glutes.volume;if(volume>=HYPERTROPHY_VOLUME.automaticCeiling)break;const units=makeObjectiveUnits(state,'abductor',extensionBlock,'objective-extra',1,nextOrder(registry,extensionBlock.id),existing.length+1,existing.length+1);appendUnits(registry,units);additions++;addedByBlock[extensionBlock.id]+=1;}else break;}
}

export function applyObjectivePlanner(state,registry,now=Date.now()){
  if(!state?.objectives||!registry?.units)return registry;const previousRegistry=state.registry;state.registry=registry;
  const blocks=blocksFor(state).map((block,index)=>({...block,index})),limit=PERSONALIZATION_LIMITS[state.objectives.personalization]??2,addedByBlock=Object.fromEntries(blocks.map(b=>[b.id,0])),addedByZoneBlock={};
  applyGluteTemplate(state,registry,blocks,now,addedByBlock,previousRegistry);
  let summary=hypertrophyVolume(state,now,true);const candidates=[];
  if(state.objectives.zones.biceps==='hypertrophy'&&summary.biceps.volume<HYPERTROPHY_VOLUME.floor)candidates.push({id:'chinup',zone:'biceps',block:blocks.find(b=>b.id==='A'),source:'objective-line',count:2});
  if(state.objectives.zones.core==='hypertrophy'&&summary.core.volume<HYPERTROPHY_VOLUME.floor)candidates.push({id:'reverseCrunch',zone:'core',block:blocks.find(b=>b.id==='D'),source:'objective-line',count:2});
  for(const block of blocks)for(const id of block.ids){const map=MUSCLE_MAP[id],units=registry.units.filter(x=>x.blockId===block.id&&x.id===id),hUnits=units.filter(x=>x.stimulus==='hypertrophy');if(map?.ownerZone&&map.ownerZone!=='glutes'&&state.objectives.zones[map.ownerZone]==='hypertrophy'&&hUnits.length===2&&summary[map.ownerZone].volume<HYPERTROPHY_VOLUME.floor)candidates.push({id,zone:map.ownerZone,block,source:'objective-extra',count:1});}
  candidates.sort((a,b)=>compareTuple(candidateScore(state,a,summary,now),candidateScore(state,b,summary,now)));
  for(const candidate of candidates){const block=candidate.block;if(!block||addedByBlock[block.id]>=limit)continue;const key=`${block.id}:${candidate.zone}`,zoneAdded=addedByZoneBlock[key]||0,remaining=Math.min(candidate.count,limit-addedByBlock[block.id],2-zoneAdded);if(remaining<=0)continue;summary=hypertrophyVolume(state,now,true);if(summary[candidate.zone].volume>=HYPERTROPHY_VOLUME.automaticCeiling)continue;if(candidate.source==='objective-extra'&&registry.units.some(x=>x.blockId===block.id&&x.id===candidate.id&&x.stimulus!=='hypertrophy'))continue;const existing=registry.units.filter(x=>x.blockId===block.id&&x.id===candidate.id),seriesStart=candidate.source==='objective-extra'?3:1,total=candidate.source==='objective-extra'?3:remaining,additions=makeObjectiveUnits(state,candidate.id,block,candidate.source,Math.min(remaining,Math.ceil(HYPERTROPHY_VOLUME.automaticCeiling-summary[candidate.zone].volume)),nextOrder(registry,block.id),seriesStart,total);appendUnits(registry,additions);addedByBlock[block.id]+=additions.length;addedByZoneBlock[key]=zoneAdded+additions.length;}
  return registry;
}

// Recompose uniquement les unités encore pending. completed, in_progress et skipped gardent leur snapshot.
export function reconcileObjectiveUnits(state,now=Date.now(),freshRegistry){
  if(!freshRegistry)return applyObjectivePlanner(state,state.registry,now);
  const fixed=(state.registry?.units||[]).filter(unit=>unit.status!=='pending'),fixedIds=new Set(fixed.map(unit=>unit.officialId)),pending=freshRegistry.units.filter(unit=>!fixedIds.has(unit.officialId));state.registry={...freshRegistry,units:[...fixed,...pending].sort((a,b)=>a.blockIndex-b.blockIndex||a.order-b.order)};state.registry.units.forEach((unit,index)=>unit.order=index);return state.registry;
}
