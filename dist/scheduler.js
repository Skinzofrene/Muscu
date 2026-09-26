import {FLEXIBILITY_CATALOG} from './flexibility.js';

export const EXECUTION_MODES={
  quality:{label:'Qualité',description:'Repos complets · priorité à la performance'},
  express:{label:'Express',description:'Même programme · moins de temps'},
  density:{label:'Densité',description:'Activité légère pendant les repos'},
  hybrid:{label:'Hybride',description:'Série officielle compatible puis complément choisi'}
};

export const FATIGUE_FAMILIES={TV:'Tirage vertical',TH:'Tirage horizontal',PH:'Poussée horizontale / dips',PV:'Poussée verticale',JG:'Jambes dominante genou',CP:'Chaîne postérieure',MO:'Mollets',TI:'Tibial',AF:'Abdos / compression',ST:'Stabilité tronc',GR:'Grip / suspension',SC:'Scapulaire / arrière d’épaule',HA:'Hanche / adducteurs / abducteurs'};

export const EXERCISE_META={
  pullup:['TV','high','high'],hang:['GR','low','low'],split:['JG','high','medium'],gluteSplit:['JG','high','medium'],calf:['MO','low','low'],pushup:['PH','medium','medium'],dip:['PH','high','high'],row:['TH','medium','medium'],leg:['AF','medium','medium'],bridge:['CP','medium','low'],tibialis:['TI','low','low'],pike:['PV','high','high'],scapPull:['SC','low','low'],scapPush:['SC','low','low'],hollow:['ST','low','medium'],hamstring:['CP','medium','medium'],rearShoulder:['SC','low','low'],sidePlank:['ST','low','medium'],adductor:['HA','low','medium'],antiRotation:['ST','low','low'],abductor:['HA','low','low'],neck:['SC','low','low'],chinup:['TV','high','medium'],reverseCrunch:['AF','medium','medium']
};

// Familles réellement co-sollicitées : elles n'écrasent pas la famille propriétaire,
// mais empêchent le scheduler de traiter deux efforts très proches comme indépendants.
export const SECONDARY_FAMILIES={
  pullup:['GR','SC'],hang:['TV','SC'],split:['HA'],gluteSplit:['HA','CP'],pushup:['SC','ST'],dip:['PV','SC'],row:['GR','SC'],leg:[],bridge:['ST'],pike:['PH','SC'],scapPull:['TV','GR'],scapPush:['PH'],hollow:[],hamstring:['HA'],rearShoulder:['TH'],sidePlank:['HA','SC'],adductor:['ST'],antiRotation:['SC'],abductor:['ST'],chinup:['GR','SC'],reverseCrunch:['ST']
};

export const COMPATIBILITY={
  TV:{green:['JG','CP','MO','TI','HA'],orange:['PH','ST'],red:['TH','GR','SC','TV']},
  TH:{green:['JG','CP','MO','TI','HA'],orange:['PH','ST'],red:['TV','GR','SC','TH']},
  PH:{green:['JG','CP','MO','TI','HA'],orange:['TH','ST'],red:['PV','PH','SC']},
  PV:{green:['JG','CP','MO','TI','HA'],orange:['TH'],red:['PH','PV','SC']},
  JG:{green:['TV','TH','PH','PV','GR','SC'],orange:['CP','MO','TI','ST'],red:['JG']},
  CP:{green:['TV','TH','PH','PV','GR','SC','TI'],orange:['JG','MO','ST'],red:['CP']},
  MO:{green:['TV','TH','PH','PV','AF','GR','SC'],orange:['JG','CP','TI'],red:['MO']},
  TI:{green:['TV','TH','PH','PV','AF','GR','SC','CP'],orange:['JG','MO'],red:['TI']},
  AF:{green:['MO','TI','HA'],orange:['TV','TH','PH','PV','JG','CP'],red:['AF','ST']},
  ST:{green:['MO','TI'],orange:['TV','TH','PH','PV','JG','CP','HA'],red:['AF','ST']},
  GR:{green:['JG','CP','MO','TI','HA','PH'],orange:['PV'],red:['TV','TH','GR']},
  SC:{green:['JG','CP','MO','TI','HA'],orange:['PH','PV','TV','TH'],red:['SC']},
  HA:{green:['TV','TH','PH','PV','GR','AF'],orange:['JG','CP','ST'],red:['HA']}
};

export const FILLERS={
  squat:{name:'Squats légers',family:'JG',doses:{light:5,normal:8,sustained:10},unit:'reps'},
  calf:{name:'Mollets deux jambes',family:'MO',doses:{light:8,normal:10,sustained:12},unit:'reps'},
  tibialis:{name:'Tibialis facile',family:'TI',doses:{light:8,normal:10,sustained:12},unit:'reps'},
  bridge:{name:'Pont fessier deux jambes',family:'CP',doses:{light:6,normal:8,sustained:10},unit:'reps'},
  birdDog:{name:'Bird dog',family:'ST',doses:{light:3,normal:4,sustained:5},unit:'side'},
  deadBug:{name:'Dead bug',family:'ST',doses:{light:3,normal:4,sustained:5},unit:'side'},
  lateralLeg:{name:'Élévation latérale jambe',family:'HA',doses:{light:5,normal:7,sustained:8},unit:'side'},
  adduction:{name:'Adduction allongée',family:'HA',doses:{light:5,normal:7,sustained:8},unit:'side'},
  wallSlide:{name:'Wall slide scapulaire',family:'SC',doses:{light:5,normal:6,sustained:8},unit:'reps'}
};

export const defaultSchedulerSettings=()=>({
  executionMode:'quality',expressLevel:'normal',densityLevel:'normal',densityActivityType:'reinforcement',allowFillers:true,
  expressAllowed:Object.fromEntries(Object.keys(EXERCISE_META).map(id=>[id,true])),
  fillerAllowed:Object.fromEntries(Object.keys(FILLERS).map(id=>[id,true])),
  mobilityAllowed:Object.fromEntries(Object.values(FLEXIBILITY_CATALOG).filter(x=>x.usableAsRestMobility).map(x=>[x.id,true])),
  sounds:{enabled:true,rest:true,exercise:true,volume:'low'},fillerIntroSeen:false
});

const advanced=/archer|pistol|un-bras|une-main|hspu|explos|jump|max|bulgarian|asymetrique|unilateral/;
export function workMetadata(item){
  const [family,baseCost,baseTechnique]=EXERCISE_META[item.id]||['ST','low','low'];
  const target=Number(item.target)||0;
  const systemic=item.mode==='power'||(item.mode==='force'&&target<=5&&baseCost!=='low')?'high':baseCost;
  const technical=item.mode==='power'||advanced.test(item.variantId||'')?'high':baseTechnique;
  const secondary=[...(SECONDARY_FAMILIES[item.id]||[])];
  if(item.id==='leg'&&/suspend|montee-haute/.test(item.variantId||''))secondary.push('GR','TV');
  return{family,secondary:[...new Set(secondary)],systemic,technical,estimatedSeconds:estimateSetDuration(item)};
}

export function estimateSetDuration(item){
  const target=Number(item.target)||0,slow=item.mode==='force'&&target<=5,secondsPerRep=slow?4:3;
  if(item.unit==='seconds')return Math.ceil(target+8);
  if(item.unit==='side-seconds')return Math.ceil(target*2+13);
  if(item.unit==='side')return Math.ceil(target*2*secondsPerRep+13);
  return Math.ceil(target*secondsPerRep+8);
}

export function compatibility(sourceFamily,targetFamily){
  const row=COMPATIBILITY[sourceFamily];
  if(!row||row.red.includes(targetFamily))return'RED';
  if(row.green.includes(targetFamily))return'GREEN';
  if(row.orange.includes(targetFamily))return'ORANGE';
  return'RED';
}

export function workCompatibility(sourceMeta,targetMeta){
  const primary=compatibility(sourceMeta.family,targetMeta.family);
  if(primary==='RED')return'RED';
  const sources=[sourceMeta.family,...(sourceMeta.secondary||[])],targets=[targetMeta.family,...(targetMeta.secondary||[])];
  const secondaryConflict=sources.some(source=>targets.some(target=>COMPATIBILITY[source]?.red.includes(target)));
  return secondaryConflict?'ORANGE':primary;
}

export function protectedRestSeconds(item){
  const rest=Math.max(0,Number(item.rest)||0),meta=item.workMeta||workMetadata(item),target=Number(item.target)||0;
  if(item.mode==='power')return rest;
  if(['MO','TI','SC','HA','ST'].includes(meta.family))return Math.min(rest,Math.max(15,rest*.2));
  if(item.mode==='endurance')return Math.min(rest,Math.max(20,rest*.25));
  if(target<=5)return Math.min(rest,Math.max(60,rest*.5));
  if(target<=8)return Math.min(rest,Math.max(45,rest*.4));
  return Math.min(rest,Math.max(20,rest*.25));
}

export function activityWindowSeconds(mainItem,restUntil,now=Date.now()){
  return Math.max(0,(restUntil-now)/1000-protectedRestSeconds(mainItem)-10);
}

const pending=state=>(state.registry?.units||[]).filter(x=>x.status==='pending').sort((a,b)=>a.order-b.order);
const recentResults=(state,id)=>state.history.flatMap(h=>h.results||[]).filter(r=>r.id===id).slice(-3);
const hasRecentPain=(state,item)=>state.history.slice(-3).some(h=>(h.results||[]).some(r=>r.lineId===item.lineId&&r.rating==='Douleur / gêne'));
const threshold={prudent:80,normal:65,maximal:55};

export function prospectiveCompatibility(state,candidateFamily,candidateOfficialId=null,aggressiveness=state.settings?.expressLevel||'normal'){
  const candidateMeta=typeof candidateFamily==='string'?{family:candidateFamily,secondary:[]}:candidateFamily;
  const future=pending(state).filter(x=>x.officialId!==candidateOfficialId).slice(0,2),levels=future.map(x=>workCompatibility(candidateMeta,x.workMeta||workMetadata(x)));
  if(levels[0]==='RED')return{eligible:false,penalty:-Infinity,levels,future,reason:'travail officiel proche incompatible'};
  if(levels[0]==='ORANGE'&&aggressiveness!=='maximal')return{eligible:false,penalty:-Infinity,levels,future,reason:'prochaine unité protégée hors réglage Maximal'};
  let penalty=levels[0]==='ORANGE'?-25:0;
  if(levels[1]==='ORANGE')penalty-=10;else if(levels[1]==='RED')penalty-=20;
  return{eligible:true,penalty,levels,future,reason:penalty?'compatibilité prospective pénalisée':'prochaines unités préservées'};
}

export function scoreOfficialCandidate(state,mainItem,candidate,restUntil,now=Date.now()){
  if(mainItem.mode==='power'||candidate.status!=='pending'||candidate.officialId===mainItem.officialId)return{eligible:false,score:-Infinity,reason:'indisponible'};
  if(state.settings?.expressAllowed?.[candidate.id]===false)return{eligible:false,score:-Infinity,reason:'désactivé'};
  const mainMeta=mainItem.workMeta||workMetadata(mainItem),meta=candidate.workMeta||workMetadata(candidate),level=workCompatibility(mainMeta,meta),aggressiveness=state.settings?.expressLevel||'normal',future=prospectiveCompatibility(state,meta,candidate.officialId,aggressiveness);
  if(!future.eligible)return{eligible:false,score:-Infinity,reason:future.reason,level,futureLevels:future.levels};
  if(level==='RED'||(level==='ORANGE'&&aggressiveness!=='maximal'))return{eligible:false,score:-Infinity,reason:'fatigue incompatible',level,futureLevels:future.levels};
  if(hasRecentPain(state,candidate))return{eligible:false,score:-Infinity,reason:'douleur récente',level};
  const availableAt=state.registry?.availability?.[candidate.id]||0;
  if(availableAt>now)return{eligible:false,score:-Infinity,reason:'récupération en cours',level};
  const window=activityWindowSeconds(mainItem,restUntil,now);
  if(meta.estimatedSeconds>window)return{eligible:false,score:-Infinity,reason:'fenêtre trop courte',level,window};
  const list=pending(state),position=list.findIndex(x=>x.officialId===candidate.officialId);
  let score=(level==='GREEN'?70:45)+future.penalty;
  score+=position===0?15:position<=2?10:5;
  score+=meta.systemic==='low'?10:meta.systemic==='high'?-15:0;
  score+=meta.technical==='low'?5:meta.technical==='high'?-15:0;
  score+=meta.estimatedSeconds<=window*.7?10:0;
  const counts=new Map();for(const unit of state.registry?.units||[])if(unit.status==='completed')counts.set(unit.workMeta.family,(counts.get(unit.workMeta.family)||0)+1);
  const minimum=Math.min(...list.map(x=>counts.get(x.workMeta.family)||0));if((counts.get(meta.family)||0)===minimum)score+=10;
  const difficult=recentResults(state,candidate.id).filter(r=>r.rating==='Trop dur'||r.actual<r.target).length;
  if(difficult>=2)score-=30;else if(difficult===1)score-=15;
  return{eligible:score>=threshold[aggressiveness],score,level,futureLevels:future.levels,window,reason:`${level==='GREEN'?'Association favorable':'Association prudente'} · ${future.reason} · ${Math.round(window)} s disponibles`};
}

export function selectOfficialCandidate(state,mainItem,restUntil,now=Date.now(),excluded=[]){
  const choices=pending(state).filter(x=>!excluded.includes(x.officialId)).map(item=>({item,assessment:scoreOfficialCandidate(state,mainItem,item,restUntil,now)})).filter(x=>x.assessment.eligible);
  choices.sort((a,b)=>b.assessment.score-a.assessment.score||a.item.order-b.item.order||({low:0,medium:1,high:2}[a.item.workMeta.systemic]-{low:0,medium:1,high:2}[b.item.workMeta.systemic])||a.item.workMeta.estimatedSeconds-b.item.workMeta.estimatedSeconds);
  return choices[0]||null;
}

function fillerLimit(level){return level==='light'?1:level==='sustained'?3:2;}
export function fillerDose(id,level='normal'){const filler=FILLERS[id];return filler?.doses[level]??filler?.doses.normal;}
export function scoreFiller(state,mainItem,id,restUntil,now=Date.now()){
  const filler=FILLERS[id];if(!filler||mainItem.mode==='power'||state.settings?.allowFillers===false||state.settings?.fillerAllowed?.[id]===false)return{eligible:false,score:-Infinity,reason:'désactivé'};
  const density=state.settings?.densityLevel||'normal',log=state.registry?.fillers||[],familyCount=log.filter(x=>x.family===filler.family).length;
  if(familyCount>=fillerLimit(density))return{eligible:false,score:-Infinity,reason:'limite du cycle atteinte'};
  const restIndex=state.active?.mainRest?.index||1;if(density==='light'&&restIndex%2===0)return{eligible:false,score:-Infinity,reason:'repos léger protégé'};
  const future=prospectiveCompatibility(state,filler.family,null,state.settings?.expressLevel||'normal');if(!future.eligible)return{eligible:false,score:-Infinity,reason:future.reason,futureLevels:future.levels};
  const target=fillerDose(id,density),estimatedSeconds=estimateSetDuration({target,unit:filler.unit,mode:'force'}),window=activityWindowSeconds(mainItem,restUntil,now);
  if(estimatedSeconds>window)return{eligible:false,score:-Infinity,reason:'fenêtre trop courte'};
  const level=workCompatibility(mainItem.workMeta||workMetadata(mainItem),{family:filler.family,secondary:[]});if(level!=='GREEN')return{eligible:false,score:-Infinity,reason:'fatigue incompatible'};
  let score=70+15+(familyCount===0?10:0)+(estimatedSeconds<=window*.7?10:0)+future.penalty;if(log.at(-1)?.family===filler.family)score-=15;
  return{eligible:score>=70,score,level,futureLevels:future.levels,window,estimatedSeconds,target,reason:`${FATIGUE_FAMILIES[filler.family]} peu sollicitée · ${future.reason} · ${Math.round(window)} s disponibles`};
}

export function selectFiller(state,mainItem,restUntil,now=Date.now(),excluded=[]){
  const choices=Object.keys(FILLERS).filter(id=>!excluded.includes(id)).map(id=>({id,assessment:scoreFiller(state,mainItem,id,restUntil,now)})).filter(x=>x.assessment.eligible);
  choices.sort((a,b)=>b.assessment.score-a.assessment.score||a.assessment.estimatedSeconds-b.assessment.estimatedSeconds||a.id.localeCompare(b.id));
  if(!choices.length)return null;
  const {id,assessment}=choices[0],f=FILLERS[id];return{kind:'supplementary',item:{id:`filler:${id}`,fillerId:id,name:f.name,variantName:f.name,family:f.family,target:assessment.target,unit:f.unit,rest:0,kind:'supplementary',supplementaryType:'strength',workMeta:{family:f.family,secondary:[],systemic:'low',technical:'low',estimatedSeconds:assessment.estimatedSeconds}},assessment};
}

const mobilityLog=state=>(state.registry?.fillers||[]).filter(x=>x.supplementaryType==='mobility'||x.mobilityId);
const offerLog=state=>state.registry?.activityOffers||[];
function mobilitySide(state,exercise){if(!exercise.unilateral)return null;const last=mobilityLog(state).findLast(x=>x.mobilityId===exercise.id);return last?.side==='left'?'right':'left';}
const lastUseIndex=(state,id)=>offerLog(state).findLastIndex(x=>x.id===id);

export function scoreMobility(state,mainItem,id,restUntil,now=Date.now()){
  const exercise=FLEXIBILITY_CATALOG[id],prescription=exercise?.restPrescription;
  if(!exercise||!['standard','conditional'].includes(exercise.restPool)||!exercise.usableAsRestMobility||!prescription||mainItem.mode==='power'||state.settings?.allowFillers===false||state.settings?.mobilityAllowed?.[id]===false)return{eligible:false,score:-Infinity,reason:'mobilité indisponible'};
  const window=activityWindowSeconds(mainItem,restUntil,now),estimatedSeconds=prescription.targetDuration+8;if(estimatedSeconds>window||prescription.maxUseful>20)return{eligible:false,score:-Infinity,reason:'fenêtre trop courte'};
  const mainFamily=(mainItem.workMeta||workMetadata(mainItem)).family,future=pending(state).slice(0,2),nextFamily=future[0]?.workMeta?.family,secondFamily=future[1]?.workMeta?.family;
  if(exercise.avoidBeforeFamilies.includes(mainFamily))return{eligible:false,score:-Infinity,reason:'zone sollicitée par l’exercice en récupération'};
  if(nextFamily&&exercise.avoidBeforeFamilies.includes(nextFamily))return{eligible:false,score:-Infinity,reason:'zone requise par la prochaine unité officielle'};
  const log=mobilityLog(state),offers=offerLog(state),recentFour=offers.slice(-4),recentTwo=offers.slice(-2);
  if(recentFour.some(x=>x.type==='mobility'&&x.id===id))return{eligible:false,score:-Infinity,reason:'numéro déjà proposé parmi les quatre derniers compléments'};
  let score=65+(exercise.fatigueCost==='very_low'?15:0);
  if(exercise.setupCost==='low'&&exercise.tags.includes('standing'))score+=10;else if(exercise.setupCost==='high'||exercise.tags.some(x=>['wall','support'].includes(x)))score-=10;
  score+=10;
  if(exercise.avoidAfterFamilies.includes(mainFamily))score-=25;
  if(secondFamily&&exercise.avoidBeforeFamilies.includes(secondFamily))score-=20;
  if(recentTwo.some(x=>x.type==='mobility'&&x.zone===exercise.primaryZone))score-=25;
  const usedThisSession=(state.active?.supplementary||[]).some(x=>x.mobilityId===id)||offers.some(x=>x.sessionId===state.active?.id&&x.id===id);if(!usedThisSession)score+=15;
  const side=mobilitySide(state,exercise),minimum=exercise.restPool==='conditional'?75:70;
  return{eligible:score>=minimum,score,window,estimatedSeconds,target:prescription.targetDuration,side,lastUsed:lastUseIndex(state,id),zone:exercise.primaryZone,reason:`${exercise.name} · mobilité très légère · zone ${exercise.avoidBeforeFamilies.includes(mainFamily)?'légèrement impliquée':'distincte'} · ${Math.round(window)} s disponibles`};
}

export function selectMobility(state,mainItem,restUntil,now=Date.now(),excluded=[]){
  const choices=Object.values(FLEXIBILITY_CATALOG).filter(x=>x.usableAsRestMobility&&!excluded.includes(x.id)).map(exercise=>({exercise,assessment:scoreMobility(state,mainItem,exercise.id,restUntil,now)})).filter(x=>x.assessment.eligible);
  choices.sort((a,b)=>b.assessment.score-a.assessment.score||a.assessment.lastUsed-b.assessment.lastUsed||a.assessment.estimatedSeconds-b.assessment.estimatedSeconds||a.exercise.number-b.exercise.number);if(!choices.length)return null;
  const {exercise,assessment}=choices[0];return{kind:'supplementary',item:{id:`mobility:${exercise.id}`,mobilityId:exercise.id,name:exercise.name,variantName:exercise.name,family:null,zone:exercise.primaryZone,page:exercise.page,pageAsset:exercise.pageAsset,target:assessment.target,unit:'seconds',side:assessment.side,rest:0,kind:'supplementary',supplementaryType:'mobility',shortInstruction:exercise.shortInstruction,detailedInstruction:exercise.detailedInstruction,stopCriterion:exercise.stopCriterion,workMeta:{family:null,secondary:[],systemic:'low',technical:'low',estimatedSeconds:assessment.estimatedSeconds}},assessment};
}

export function selectComplementary(state,mainItem,restUntil,now=Date.now(),excluded=[]){
  const type=state.settings?.densityActivityType||'reinforcement';
  if(type==='reinforcement')return selectFiller(state,mainItem,restUntil,now,excluded);
  if(type==='mobility')return selectMobility(state,mainItem,restUntil,now,excluded);
  const strength=selectFiller(state,mainItem,restUntil,now,excluded),mobility=selectMobility(state,mainItem,restUntil,now,excluded);
  if(!strength)return mobility;if(!mobility)return strength;
  if(Math.abs(mobility.assessment.score-strength.assessment.score)<=5){const recent=offerLog(state).slice(-4),mobilityCount=recent.filter(x=>x.type==='mobility').length,strengthCount=recent.filter(x=>x.type==='strength').length;if(mobilityCount!==strengthCount)return mobilityCount<strengthCount?mobility:strength;const lastType=recent.at(-1)?.type;if(lastType==='mobility')return strength;if(lastType==='strength')return mobility;}
  return mobility.assessment.score>strength.assessment.score?mobility:strength;
}

export function selectRestActivity(state,mainItem,restUntil,now=Date.now(),excluded=[]){
  const mode=state.settings?.executionMode||'quality';
  if(mode==='quality'||mainItem.mode==='power')return null;
  if(mode==='express'||mode==='hybrid'){
    const official=selectOfficialCandidate(state,mainItem,restUntil,now,excluded);
    if(official)return{kind:'program',item:official.item,assessment:official.assessment};
  }
  if(mode==='density'||mode==='hybrid')return selectComplementary(state,mainItem,restUntil,now,excluded);
  return null;
}
