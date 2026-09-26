// Catalogue canonique V6.1 des objectifs musculaires.
export const OBJECTIVE_VALUES=['strength','hypertrophy'];
export const PERSONALIZATION_VALUES=['compact','balanced','maximize'];

export const ZONES={
  chest:{label:'Pectoraux',required:['pecs'],capability:'full'},
  back:{label:'Dos',required:['lats','upperBack'],capability:'full'},
  shoulders:{label:'Épaules',required:['frontDelt','sideDelt','rearDelt'],capability:'partial',limitation:'Avant/arrière bien couverts ; deltoïde latéral limité avec le matériel actuel.'},
  biceps:{label:'Biceps',required:['elbowFlexors'],capability:'full'},
  triceps:{label:'Triceps',required:['triceps'],capability:'full'},
  forearms:{label:'Avant-bras / prise',required:['forearmGrip'],capability:'partial',limitation:'La suspension développe surtout la force de prise ; le catalogue actuel ne couvre pas une optimisation complète.'},
  core:{label:'Abdos / tronc',required:['absCompression','coreStability'],capability:'full'},
  glutes:{label:'Fessiers',required:['gluteMax','gluteMed'],capability:'full'},
  quads:{label:'Quadriceps',required:['quads'],capability:'full'},
  hamstrings:{label:'Ischios',required:['hamstrings'],capability:'full'},
  lowerLeg:{label:'Mollets / bas de jambe',required:['calves','tibialis'],capability:'full'}
};

export const ZONE_ORDER=Object.keys(ZONES);
export const SUBZONES=new Set([
  'pecs','lats','upperBack','frontDelt','sideDelt','rearDelt','elbowFlexors','triceps','forearmGrip',
  'absCompression','coreStability','gluteMax','gluteMed','quads','hamstrings','calves','tibialis',
  'adductors','hipFlexors','scapular','neck','obliques'
]);

export const defaultObjectives=()=>({
  zones:Object.fromEntries(ZONE_ORDER.map(id=>[id,'strength'])),
  personalization:'balanced',
  pendingChanges:null
});

export const PERSONALIZATION_LIMITS={compact:1,balanced:2,maximize:4};
export const HYPERTROPHY_VOLUME={floor:8,target:10,automaticCeiling:12,windowMs:7*24*60*60*1000};
export const HYPERTROPHY_INSTRUCTION='Arrête-toi en gardant environ 1–2 répétitions propres possibles.';

export const GLUTE_HYPERTROPHY_TEMPLATE={
  zone:'glutes',blockId:'E',unilateralBlockId:'B',minimumPerPattern:2,
  patterns:{
    hipExtension:{label:'Extension',detail:'Grand fessier — Extension de hanche',exerciseIds:['bridge']},
    unilateralHipKneeExtension:{label:'Unilatéral',detail:'Grand fessier — Unilatéral',exerciseIds:['gluteSplit','split']},
    hipAbduction:{label:'Abduction',detail:'Moyen fessier — Abduction',exerciseIds:['abductor']}
  },
  // Budget d'extras après le socle 2 Extension / 2 Unilatéral / 2 Abduction.
  additionBudget:{compact:1,balanced:2,maximize:4},
  fixedOrder:['hipExtension','unilateralHipKneeExtension','hipAbduction']
};

export const GLUTE_PATTERN_BY_EXERCISE={bridge:'hipExtension',gluteSplit:'unilateralHipKneeExtension',split:'unilateralHipKneeExtension',abductor:'hipAbduction'};

// Tables explicites : variante Force réellement active → index du niveau H sûr.
export const HYPERTROPHY_INITIAL_LEVEL_MAP={
  bridge:{sourceId:'bridge',variants:{'deux-jambes':0,'une-jambe':1,'pause-haute':2,'levier-long':3,'levier-long-pause':4,entretien:4}},
  gluteSplit:{sourceId:'split',variants:{'split-squat':0,'split-pause':1,bulgarian:2,'bulgarian-pause':3,'pistol-assiste':3,'pistol-support':3,pistol:3,'pistol-pause':3}},
  abductor:{sourceId:'abductor',variants:{laterale:0,pause:1,'side-genou':2,'side-complet':3,avancee:4}}
};

export const MUSCLE_MAP={
  pullup:{ownerZone:'back',direct:['lats','upperBack'],importantSecondary:['elbowFlexors','forearmGrip'],lightSecondary:[]},
  hang:{ownerZone:'forearms',direct:['forearmGrip'],importantSecondary:['scapular'],lightSecondary:[],hypertrophyMain:false},
  split:{ownerZone:'quads',direct:['quads'],importantSecondary:['gluteMax','adductors'],lightSecondary:[]},
  gluteSplit:{ownerZone:'glutes',direct:['gluteMax'],importantSecondary:['quads','adductors'],lightSecondary:[]},
  calf:{ownerZone:'lowerLeg',direct:['calves'],importantSecondary:[],lightSecondary:[]},
  pushup:{ownerZone:'chest',direct:['pecs'],importantSecondary:['triceps','frontDelt'],lightSecondary:[]},
  dip:{ownerZone:'triceps',direct:['triceps'],importantSecondary:['pecs','frontDelt'],lightSecondary:[]},
  row:{ownerZone:'back',direct:['upperBack','lats'],importantSecondary:['elbowFlexors','rearDelt','forearmGrip'],lightSecondary:[]},
  leg:{ownerZone:'core',direct:['absCompression'],importantSecondary:['hipFlexors'],lightSecondary:[]},
  bridge:{ownerZone:'glutes',direct:['gluteMax'],importantSecondary:['hamstrings'],lightSecondary:[]},
  tibialis:{ownerZone:'lowerLeg',direct:['tibialis'],importantSecondary:[],lightSecondary:[]},
  pike:{ownerZone:'shoulders',direct:['frontDelt'],importantSecondary:['triceps'],lightSecondary:[]},
  scapPull:{ownerZone:'back',direct:['scapular'],importantSecondary:[],lightSecondary:[],hypertrophyMain:false},
  scapPush:{ownerZone:'shoulders',direct:['scapular'],importantSecondary:[],lightSecondary:[],hypertrophyMain:false},
  hollow:{ownerZone:'core',direct:['coreStability'],importantSecondary:[],lightSecondary:[],hypertrophyMain:false},
  hamstring:{ownerZone:'hamstrings',direct:['hamstrings'],importantSecondary:['gluteMax'],lightSecondary:[]},
  rearShoulder:{ownerZone:'shoulders',direct:['rearDelt','upperBack'],importantSecondary:[],lightSecondary:[]},
  sidePlank:{ownerZone:'core',direct:['coreStability'],importantSecondary:['gluteMed'],lightSecondary:[],hypertrophyMain:false},
  adductor:{ownerZone:'core',direct:['adductors'],importantSecondary:['coreStability'],lightSecondary:[],hypertrophyMain:false},
  antiRotation:{ownerZone:'core',direct:['coreStability'],importantSecondary:[],lightSecondary:[],hypertrophyMain:false},
  abductor:{ownerZone:'glutes',direct:['gluteMed'],importantSecondary:[],lightSecondary:[]},
  neck:{ownerZone:null,direct:['neck'],importantSecondary:[],lightSecondary:[],hypertrophyMain:false},
  chinup:{ownerZone:'biceps',direct:['elbowFlexors'],importantSecondary:['lats','upperBack','forearmGrip'],lightSecondary:[]},
  reverseCrunch:{ownerZone:'core',direct:['absCompression'],importantSecondary:['obliques','hipFlexors'],lightSecondary:[]}
};

const h=(variantId,variantName,sets,targetMin,targetMax,rest,unit='reps',extra={})=>({variantId,variantName,sets,targetMin,targetMax,rest,unit,...extra});
export const HYPERTROPHY_DEFINITIONS={
  pullup:[h('stricte','Traction stricte',3,3,5,120),h('stricte','Traction stricte',3,4,6,120),h('stricte','Traction stricte',3,5,8,120),h('pause-haute','Traction pause haute',3,4,8,120),h('poitrine-haute','Traction poitrine plus haute',3,6,10,120)],
  split:[h('split-squat','Split squat',2,8,12,90,'side'),h('split-squat','Split squat',2,10,15,90,'side'),h('split-pause','Split squat pause basse',2,8,15,105,'side'),h('bulgarian','Bulgarian split squat',2,8,15,120,'side'),h('bulgarian-pause','Bulgarian pause basse',2,8,15,120,'side')],
  gluteSplit:[h('split-squat','Split squat fessiers',2,8,15,90,'side'),h('split-pause','Split squat pause basse',2,8,15,105,'side'),h('bulgarian','Bulgarian split squat',2,8,15,120,'side'),h('bulgarian-pause','Bulgarian pause basse',2,8,15,120,'side')],
  calf:[h('base','Élévation mollet une jambe',2,10,15,60,'side'),h('base','Élévation mollet une jambe',2,15,20,60,'side'),h('pause-etirement','Pause haute + étirement bas',2,10,20,75,'side'),h('descente-lente','Descente très lente',2,10,15,90,'side'),h('descente-lente','Descente très lente',2,15,20,90,'side')],
  pushup:[h('classique','Pompes classiques',2,8,15,90),h('classique','Pompes classiques',2,12,20,90),h('pause-basse','Pompes pause basse',2,8,15,90),h('pieds-sureleves','Pompes pieds surélevés',2,6,15,90),h('pieds-sureleves-pause','Pieds surélevés + pause',2,6,12,90)],
  dip:[h('stricts','Dips stricts',2,4,8,120),h('stricts','Dips stricts',2,6,10,120),h('pause-basse','Dips pause basse',2,4,10,120),h('lent-pause','Descente lente + pause',2,4,10,120),h('amplitude-propre','Amplitude complète très propre',2,6,12,120)],
  row:[h('actuel','Rowing inversé actuel',2,8,15,90),h('plus-horizontal','Corps plus horizontal',2,8,15,105),h('presque-horizontal','Corps presque horizontal',2,8,15,120),h('pause-poitrine','Pause poitrine/barre',2,8,15,120),h('pieds-sureleves','Pieds surélevés — support sûr',2,8,15,120)],
  leg:[h('genoux','Relevés de genoux',2,8,15,75),h('jambes-chaise','Relevés de jambes chaise romaine',2,8,15,75),h('pause-haute','Pause haute',2,8,15,90),h('descente-controlee','Descente très contrôlée',2,8,15,90),h('genoux-suspendus','Genoux suspendus',2,8,15,90)],
  bridge:[h('deux-jambes','Pont deux jambes',2,12,25,90),h('une-jambe','Pont une jambe',2,8,20,90,'side'),h('pause-haute','Une jambe + pause haute',2,8,20,90,'side'),h('levier-long','Levier plus long',2,8,15,90,'side'),h('levier-long-pause','Levier long + pause',2,8,15,90,'side')],
  tibialis:[h('mur-proche','Mur proche',2,12,25,60),h('pieds-eloignes','Pieds plus éloignés',2,10,25,60),h('angle-important','Angle important',2,8,20,60),h('une-jambe-assistee','Dominance une jambe assistée',2,8,20,60,'side'),h('une-jambe','Une jambe',2,8,15,60,'side')],
  pike:[h('pike','Pike push-up',2,6,12,120),h('pike','Pike push-up',2,10,15,120),h('plus-verticale','Pike plus verticale',2,6,15,120),h('pieds-sureleves','Pike pieds surélevés',2,6,12,120),h('pieds-sureleves','Pike pieds surélevés',2,10,15,120)],
  hamstring:[h('court','Hamstring walkout court',2,8,15,90),h('complet','Amplitude complète',2,6,15,105),h('pause','Pause jambes presque tendues',2,6,15,120),h('lent','Très lent',2,6,12,120),h('unilateral-assiste','Dominance unilatérale assistée',2,6,12,120,'side')],
  rearShoulder:[h('prone-w','Prone W',2,10,20,60),h('snow-angel','Reverse snow angel',2,10,20,60),h('ytw','Y-T-W',2,10,20,75),h('pauses','Y-T-W avec pauses',2,10,15,75),h('pauses','Y-T-W avec pauses',2,15,20,75)],
  abductor:[h('laterale','Élévation latérale jambe',2,12,25,60,'side'),h('pause','Élévation lente + pause',2,10,20,75,'side'),h('side-genou','Side plank genou + abduction',2,8,15,75,'side'),h('side-complet','Side plank complet + abduction',2,8,15,75,'side'),h('avancee','Abduction avancée contrôlée',2,8,20,75,'side')],
  chinup:[h('negatif','Chin-up négatif',3,3,6,120,'reps',{tempo:'4–6 s par descente'}),h('strict','Chin-up strict',3,3,6,120),h('strict','Chin-up strict',3,6,10,120),h('pause-haute','Chin-up pause haute',3,6,10,120,'reps',{tempo:'pause 1 s'}),h('controle','Chin-up strict contrôlé',3,8,12,120)],
  reverseCrunch:[h('genoux-flechis','Reverse crunch · genoux très fléchis',2,8,15,90),h('90-90','Reverse crunch · 90/90',3,8,15,90),h('pause-haute','Reverse crunch · pause bassin haut',3,10,20,90),h('levier-allonge','Reverse crunch · levier allongé',3,8,15,90),h('levier-allonge-pause','Reverse crunch · levier allongé + pause',3,10,15,90)]
};

export const HYPERTROPHY_IDS=Object.keys(HYPERTROPHY_DEFINITIONS);
export const freshHypertrophyLevels=()=>Object.fromEntries(HYPERTROPHY_IDS.map(id=>[id,0]));
export const freshHypertrophyRotation=()=>Object.fromEntries(HYPERTROPHY_IDS.map(id=>[id,{slot:0,maintenance:0}]));
export const freshHypertrophyInitialized=()=>Object.fromEntries(HYPERTROPHY_IDS.map(id=>[id,false]));

export const zoneForSubzone=subzone=>ZONE_ORDER.find(zone=>ZONES[zone].required.includes(subzone))||({pecs:'chest',lats:'back',upperBack:'back',frontDelt:'shoulders',sideDelt:'shoulders',rearDelt:'shoulders',elbowFlexors:'biceps',triceps:'triceps',forearmGrip:'forearms',absCompression:'core',coreStability:'core',obliques:'core',hipFlexors:'core',gluteMax:'glutes',gluteMed:'glutes',quads:'quads',hamstrings:'hamstrings',calves:'lowerLeg',tibialis:'lowerLeg'})[subzone]||null;

export function objectiveSnapshot(exerciseId,stimulus,priority='strength',source='canonical'){
  const map=MUSCLE_MAP[exerciseId]||{ownerZone:null,direct:[],importantSecondary:[],lightSecondary:[]};
  return{source,ownerZone:map.ownerZone,ownerSubzone:map.direct[0]||null,priorityAtCreation:priority,stimulus,muscleContributions:{direct:[...map.direct],importantSecondary:[...map.importantSecondary],lightSecondary:[...map.lightSecondary]},objectivePattern:stimulus==='hypertrophy'?(GLUTE_PATTERN_BY_EXERCISE[exerciseId]||null):null,countsTowardHypertrophyVolume:stimulus==='hypertrophy'};
}

export function validateObjectiveCatalog(exercises){
  for(const zone of ZONE_ORDER)if(!ZONES[zone]?.label)throw Error(`Zone inconnue : ${zone}.`);
  for(const [id,map]of Object.entries(MUSCLE_MAP)){
    if(map.ownerZone!==null&&!ZONES[map.ownerZone])throw Error(`ownerZone inconnu : ${id}.`);
    for(const subzone of [...map.direct,...map.importantSecondary,...map.lightSecondary])if(!SUBZONES.has(subzone))throw Error(`Sous-zone inconnue : ${id}/${subzone}.`);
  }
  for(const [id,levels]of Object.entries(HYPERTROPHY_DEFINITIONS)){
    const exercise=exercises[id];if(!exercise)throw Error(`Ligne hypertrophie inconnue : ${id}.`);
    const variants=new Set(exercise.modes.hypertrophy?.variants.map(v=>v.id)||[]);
    if(levels.length!==new Set(levels.map((_,i)=>i)).size)throw Error(`Doublon de niveau H : ${id}.`);
    for(const level of levels){if(level.targetMin>level.targetMax||level.targetMin<1||level.sets<1)throw Error(`Prescription H invalide : ${id}.`);if(!variants.has(level.variantId))throw Error(`Variante H inexistante : ${id}/${level.variantId}.`);}
    if(!exercise.modes.hypertrophy?.variants.every(v=>v.technique))throw Error(`Technique H absente : ${id}.`);
  }
  return true;
}
