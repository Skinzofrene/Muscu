import {exercises} from './program.js';

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
  const sessions=sessionsInPeriod(state,period,now),results=resultsInPeriod(state,period,now);
  const timed=results.filter(r=>['seconds','side-seconds'].includes(r.unit)).reduce((sum,r)=>sum+resultAmount(r).total,0);
  const cycles=new Set(sessions.filter(h=>h.status==='complete').map(h=>`${h.phaseId||'phase1'}:${h.phaseCycle??h.cycle??1}`));
  return{sessions:sessions.length,completed:sessions.filter(h=>h.status==='complete').length,sets:results.length,cycles:cycles.size,timedSeconds:timed};
}

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
  return{id,kind,total,sets:results.length,passages:sessions.length,activeDays,periodDays:days,averagePerPassage:sessions.length?total/sessions.length:0,averagePerPeriodDay:total/days,averagePerActiveDay:activeDays?total/activeDays:0,perSide,results};
}

export function currentExerciseLevel(state,id,mode='force'){
  const e=exercises[id];
  const index=e.major?state.progress[e.lineId][mode]:state.levels[id];
  return{index,display:index+1,total:e.modes[mode].steps.length,step:e.modes[mode].steps[index]};
}

export const levelHistory=(state,id)=>state.levelChanges.filter(c=>c.id===id).toReversed();
