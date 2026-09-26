import {exercises} from './program.js';
import {FLEXIBILITY_CATALOG} from './flexibility.js';

export const PERIODS={today:{label:'Aujourd’hui',days:1},week:{label:'7 jours',days:7},month:{label:'30 jours',days:30},all:{label:'Tout',days:null}};

const startOfDay=value=>{const d=new Date(value);d.setHours(0,0,0,0);return d.getTime();};
export function periodStart(period,now=Date.now()){
  const days=PERIODS[period]?.days;
  if(days===null)return-Infinity;
  if(!days)throw Error('Période inconnue.');
  const start=startOfDay(now);
  return start-(days-1)*86400000;
}

export const sessionsInPeriod=(state,period='all',now=Date.now())=>state.history.filter(h=>(h.finishedAt||h.startedAt)>=periodStart(period,now));
const resultTime=r=>r.at??0;
export const resultsInPeriod=(state,period='all',now=Date.now())=>state.history.flatMap(h=>h.results||[]).filter(r=>resultTime(r)>=periodStart(period,now));
export const supplementaryInPeriod=(state,period='all',now=Date.now())=>state.history.flatMap(h=>h.supplementary||[]).filter(r=>resultTime(r)>=periodStart(period,now));
export const restMobilityInPeriod=(state,period='all',now=Date.now())=>supplementaryInPeriod(state,period,now).filter(r=>r.supplementaryType==='mobility');
export const flexibilitySessionsInPeriod=(state,period='all',now=Date.now())=>(state.flexibility?.history||[]).filter(h=>(h.finishedAt||h.startedAt)>=periodStart(period,now));

export function resultAmount(result){
  const actual=Number(result.actual)||0;
  if(result.unit==='seconds')return{kind:'time',total:actual,perSide:null};
  if(result.unit==='side-seconds'){
    const left=Number.isFinite(result.leftActual)?result.leftActual:null,right=Number.isFinite(result.rightActual)?result.rightActual:null;
    return left!==null||right!==null?{kind:'time',total:(left||0)+(right||0),perSide:{left,right}}:{kind:'time',total:actual*2,perSide:{left:actual,right:actual}};
  }
  if(result.unit==='side'){
    const left=Number.isFinite(result.leftActual)?result.leftActual:null,right=Number.isFinite(result.rightActual)?result.rightActual:null;
    return left!==null||right!==null?{kind:'reps',total:(left||0)+(right||0),perSide:{left,right}}:{kind:'reps',total:actual*2,perSide:{left:actual,right:actual}};
  }
  return{kind:'reps',total:actual,perSide:null};
}

export function overviewStats(state,period='all',now=Date.now()){
  const sessions=sessionsInPeriod(state,period,now),results=resultsInPeriod(state,period,now),supplementary=supplementaryInPeriod(state,period,now);
  const timed=results.filter(r=>['seconds','side-seconds'].includes(r.unit)).reduce((sum,r)=>sum+resultAmount(r).total,0);
  const cycles=new Set(sessions.filter(h=>h.status==='complete').map(h=>`${h.phaseId||'phase1'}:${h.phaseCycle??h.cycle??1}`));
  const mobility=supplementary.filter(r=>r.supplementaryType==='mobility'),strength=supplementary.filter(r=>r.supplementaryType!=='mobility');
  return{sessions:sessions.length,completed:sessions.filter(h=>h.status==='complete').length,sets:results.length,programSets:results.length,complementarySets:supplementary.length,strengthSets:strength.length,mobilitySets:mobility.length,totalSets:results.length+supplementary.length,cycles:cycles.size,timedSeconds:timed};
}

export function flexibilityOverviewStats(state,period='all',now=Date.now()){
  const sessions=flexibilitySessionsInPeriod(state,period,now),results=sessions.flatMap(h=>h.results||[]).filter(r=>resultTime(r)>=periodStart(period,now)),mobility=restMobilityInPeriod(state,period,now);
  const routineSeconds=results.reduce((sum,r)=>sum+(Number(r.actualSeconds)||0),0),mobilitySeconds=mobility.reduce((sum,r)=>sum+(Number(r.actual)||Number(r.timedSeconds)||0),0);
  return{routines:sessions.filter(h=>h.status==='complete').length,startedRoutines:sessions.length,routineSeconds,mobilitySeconds,totalFlexibilitySeconds:routineSeconds+mobilitySeconds,positions:results.length};
}

export const performedFlexibilityIds=state=>{const seen=new Set();return(state.flexibility?.history||[]).flatMap(h=>h.results||[]).map(r=>r.exerciseId||r.id).filter(id=>FLEXIBILITY_CATALOG[id]&&!seen.has(id)&&seen.add(id));};
export function flexibilityExerciseStats(state,id,period='all',now=Date.now()){
  const sessions=flexibilitySessionsInPeriod(state,period,now),results=sessions.flatMap(h=>h.results||[]).filter(r=>(r.exerciseId||r.id)===id&&resultTime(r)>=periodStart(period,now)),totalSeconds=results.reduce((sum,r)=>sum+(Number(r.actualSeconds)||0),0),ratings=results.map(r=>r.rating),counts=ratings.reduce((map,rating)=>(map[rating]=(map[rating]||0)+1,map),{}),recentFeeling=Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||null;
  const sideCounts={left:results.filter(r=>r.side==='left').length,right:results.filter(r=>r.side==='right').length};
  return{id,passages:results.length,totalSeconds,averageSeconds:results.length?totalSeconds/results.length:0,recentFeeling,sideCounts,results};
}

export function combinedHistoryStats(state,period='all',now=Date.now()){return{muscle:overviewStats(state,period,now),flexibility:flexibilityOverviewStats(state,period,now)};}

export const performedExerciseIds=state=>{
  const seen=new Set();
  return state.history.flatMap(h=>h.results||[]).map(r=>r.id).filter(id=>exercises[id]&&!seen.has(id)&&seen.add(id));
};

export function exerciseStats(state,id,period='all',now=Date.now()){
  const sessions=sessionsInPeriod(state,period,now).filter(h=>h.results?.some(r=>r.id===id));
  const results=sessions.flatMap(h=>h.results.filter(r=>r.id===id&&resultTime(r)>=periodStart(period,now)));
  const amounts=results.map(resultAmount),kind=amounts.some(x=>x.kind==='time')?'time':'reps';
  const total=amounts.filter(x=>x.kind===kind).reduce((sum,x)=>sum+x.total,0);
  const activeDays=new Set(results.map(r=>startOfDay(resultTime(r)))).size;
  const days=PERIODS[period]?.days||Math.max(1,activeDays);
  const perSide=amounts.some(x=>x.perSide)?amounts.reduce((acc,x)=>{if(!x.perSide)return acc;if(x.perSide.left!==null)acc.left+=x.perSide.left;if(x.perSide.right!==null)acc.right+=x.perSide.right;return acc;},{left:0,right:0}):null;
  const family=results.find(r=>r.workMeta?.family)?.workMeta?.family;
  const complementary=family?supplementaryInPeriod(state,period,now).filter(r=>(r.family||r.workMeta?.family)===family):[];
  const complementaryTotal=complementary.map(resultAmount).filter(x=>x.kind===kind).reduce((sum,x)=>sum+x.total,0);
  return{id,kind,total,programTotal:total,complementaryTotal,combinedTotal:total+complementaryTotal,sets:results.length,complementarySets:complementary.length,passages:sessions.length,activeDays,periodDays:days,averagePerPassage:sessions.length?total/sessions.length:0,averagePerPeriodDay:total/days,averagePerActiveDay:activeDays?total/activeDays:0,perSide,results};
}

export function familyStats(state,family,period='all',now=Date.now()){
  const program=resultsInPeriod(state,period,now).filter(r=>r.workMeta?.family===family),complementary=supplementaryInPeriod(state,period,now).filter(r=>(r.family||r.workMeta?.family)===family);
  const amount=list=>list.reduce((sum,r)=>sum+resultAmount(r).total,0),programTotal=amount(program),complementaryTotal=amount(complementary);
  return{family,program:programTotal,complementary:complementaryTotal,total:programTotal+complementaryTotal,programSets:program.length,complementarySets:complementary.length};
}

export function currentExerciseLevel(state,id,mode='force'){
  const e=exercises[id];
  const index=e.major?state.progress[e.lineId][mode]:state.levels[id];
  return{index,display:index+1,total:e.modes[mode].steps.length,step:e.modes[mode].steps[index]};
}

export const levelHistory=(state,id)=>state.levelChanges.filter(c=>c.id===id).toReversed();
