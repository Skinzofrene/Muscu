import {CANONICAL_TECHNIQUES,VARIANT_TECHNIQUE_OVERRIDES,DECISION_VARIANTS,REDUNDANT_VARIANTS,EVIDENCE_SOURCES,TECHNICAL_STATUSES,mergeTechnique,variantAuditStatus} from './technical-catalog.js';

export {CANONICAL_TECHNIQUES,VARIANT_TECHNIQUE_OVERRIDES,DECISION_VARIANTS,REDUNDANT_VARIANTS,EVIDENCE_SOURCES,TECHNICAL_STATUSES};
export const MOVEMENT_TYPES=['dynamic_controlled','isometric','explosive','control_health'];

export const MODE_INSTRUCTIONS={
  force:['Descends sous contrôle · remonte fort.','Garde 1–3 reps propres en réserve.','Arrête si la technique se dégrade.'],
  hypertrophy:['Garde environ 1–2 répétitions propres possibles.','Utilise toute l’amplitude que tu contrôles.','Arrête si la technique se dégrade.'],
  endurance:['Garde un rythme régulier et une amplitude complète.','Respire et évite les longues pauses.','Arrête avant que la technique s’effondre.'],
  power:['Chaque répétition doit être aussi rapide ou explosive que possible.','Contrôle le retour et replace-toi.','Arrête dès que la vitesse ou la hauteur baisse nettement.']
};

const BASE={
  pullup:{position:['Bras tendus au départ, prise ferme, corps immobile.'],execution:['Tire les coudes vers le bas et amène le haut du torse vers la barre.','Redescends jusqu’aux bras tendus sous contrôle.'],mistakes:['Aucun balancement des jambes ni impulsion des hanches.'],stop:'Arrête si la technique se dégrade.'},
  hang:{position:['Prends toute la barre avec une prise ferme.','Bras tendus et corps immobile.'],execution:['Laisse les épaules dans une position confortable.','Respire normalement pendant toute la durée.','Évite le balancement.'],mistakes:['Ne confonds pas une pression habituelle dans les paumes avec une douleur articulaire.'],stop:'Arrête si la prise glisse, si la position devient incontrôlée ou en cas de douleur articulaire, fourmillement ou engourdissement.'},
  split:{position:['Pieds fixes, une jambe devant et une derrière.','Pied avant entièrement posé.'],execution:['Descends le genou arrière vers le sol.','Garde le genou avant dans la direction des orteils.','Remonte en poussant principalement dans le pied avant.'],mistakes:['Ne laisse pas le genou rentrer vers l’intérieur.'],stop:'Arrête si l’alignement du genou ou l’équilibre ne peuvent plus être conservés.'},
  gluteSplit:{position:['Prends un grand pas confortable, pied avant entièrement stable.','Laisse la hanche se fléchir naturellement avec une légère inclinaison naturelle du torse.'],execution:['Descends sous contrôle sans chercher une posture extrême.','Remonte en poussant fortement dans le pied avant.'],mistakes:['Ne cherche pas une prétendue position « 100 % fessier » et ne laisse pas le genou rentrer.'],stop:'Arrête si le pied, le genou ou le bassin ne restent plus stables.'},
  calf:{position:['Utilise le support uniquement pour l’équilibre.'],execution:['Monte aussi haut que possible sur l’avant du pied.','Redescends lentement vers un étirement confortable.'],mistakes:['Évite le rebond et ne roule pas la cheville vers l’intérieur ou l’extérieur.'],stop:'Arrête si la cheville ne reste plus stable.'},
  pushup:{position:['Mains stables, corps aligné tête–bassin–jambes.'],execution:['Descends le torse entre les mains, coudes légèrement orientés vers l’arrière.','Pousse le sol pour revenir bras tendus.'],mistakes:['Ne laisse ni le bassin tomber ni les fesses monter.'],stop:'Arrête si le gainage ou l’amplitude propre ne peuvent plus être conservés.'},
  dip:{position:['Prise ferme et épaules stables.'],execution:['Descends lentement en pliant les coudes jusqu’à une profondeur confortable.','Pousse jusqu’à revenir bras tendus, sans balancement.'],mistakes:['Ne cherche pas une profondeur maximale si elle provoque une gêne à l’avant de l’épaule.'],stop:'Arrête en cas de gêne à l’avant de l’épaule.'},
  row:{position:['Corps gainé de la tête aux pieds.'],execution:['Tire la poitrine vers les barres et rapproche naturellement les omoplates en haut.','Redescends jusqu’aux bras tendus.'],mistakes:['Ne laisse pas tomber le bassin et n’avance pas seulement la tête.'],stop:'Arrête si le corps ne reste plus rigide.'},
  leg:{position:['Stabilise le dos et les avant-bras.'],execution:['Monte sans élan.','Contrôle la descente sans laisser le bas du dos se creuser excessivement.'],mistakes:['Évite tout balancement du torse.'],stop:'Arrête avant de perdre le contrôle du bassin.'},
  bridge:{position:['Pieds au sol, genoux fléchis, côtes contrôlées.'],execution:['Contracte les fessiers pour lever le bassin jusqu’à aligner bassin et tronc.','Redescends sous contrôle.'],mistakes:['Ne cherche pas à monter plus haut en cambrant le bas du dos.'],stop:'Arrête si le travail quitte les fessiers ou les ischio-jambiers.'},
  tibialis:{position:['Talons fermement au sol, corps stable.'],execution:['Relève les pointes de pieds vers les tibias.','Redescends sous contrôle.'],mistakes:['Ne décolle pas les talons et ne balance pas le corps.'],stop:'Arrête si les talons ne restent plus au sol.'},
  pike:{position:['Hanches hautes et mains stables.'],execution:['Amène la tête vers le sol entre les mains, coudes contrôlés.','Pousse le sol pour revenir.'],mistakes:['Ne transforme pas le mouvement en pompe horizontale.'],stop:'Arrête si les hanches tombent ou si les coudes s’écartent brutalement.'},
  scapPull:{position:['Suspension bras parfaitement tendus.'],execution:['Sans plier les coudes, abaisse légèrement les épaules.','Le corps monte de quelques centimètres puis relâche sous contrôle.'],mistakes:['Le mouvement vient des omoplates, pas des coudes.'],stop:'Arrête si les coudes se plient ou si l’épaule devient douloureuse.'},
  scapPush:{position:['Bras tendus pendant tout le mouvement.'],execution:['Laisse le thorax descendre légèrement entre les épaules.','Pousse le sol pour éloigner les omoplates.'],mistakes:['Ne plie pas les coudes et ne creuse pas le bas du dos.'],stop:'Arrête si les bras ou le tronc ne restent plus stables.'},
  hollow:{position:['Rapproche les côtes du bassin et garde le bas du dos contre le sol.'],execution:['Respire normalement sans perdre la position.'],mistakes:['Ne laisse pas le bas du dos se creuser.'],stop:'Termine la série dès que le bas du dos ne reste plus contrôlé.'},
  hamstring:{position:['Pars en pont, bassin levé.'],execution:['Avance les talons par petits pas en gardant les hanches aussi hautes que possible.','Ramène les pieds de la même façon.'],mistakes:['Ne cambre pas pour conserver artificiellement la hauteur.'],stop:'Arrête en cas de crampe forte, douleur vive derrière le genou ou perte totale de position.'},
  rearShoulder:{position:['Allongé ventre au sol, cou neutre.'],execution:['Déplace les bras lentement avec une petite amplitude contrôlée.','Rapproche doucement les omoplates sans hausser les épaules.'],mistakes:['Ne prends pas d’élan et ne force pas la hauteur.'],stop:'Arrête lorsque le mouvement ne reste plus fluide.'},
  sidePlank:{position:['Coude sous l’épaule, bassin levé.'],execution:['Garde le corps aligné et respire normalement.'],mistakes:['Ne laisse pas l’épaule s’écraser vers l’oreille ni le bassin descendre.'],stop:'Termine la série lorsque l’alignement ne peut plus être conservé.'},
  adductor:{position:['Place l’avant-bras au sol et l’appui supérieur de façon stable.'],execution:['Lève le bassin et garde le corps aligné.'],mistakes:['Ne force pas une douleur à l’intérieur de la cuisse.'],stop:'Arrête en cas de douleur à l’aine ou de perte d’alignement.'},
  antiRotation:{position:['Mains sous les épaules et bassin face au sol.'],execution:['Bouge lentement sans déplacer le bassin ni cambrer.'],mistakes:['Ne compense pas en tournant le tronc.'],stop:'Réduis l’amplitude ou arrête si le bassin tourne.'},
  abductor:{position:['Bassin empilé et stable.'],execution:['Monte la jambe sans élan puis redescends lentement.'],mistakes:['Évite de rouler le bassin ou de tourner exagérément les orteils vers le plafond.'],stop:'Arrête si le bassin ne reste plus stable.'},
  neck:{position:['Main contre le front, l’arrière ou le côté de la tête.'],execution:['Appuie doucement la tête contre la main sans bouger le cou.','Respire normalement avec une résistance modérée.'],mistakes:['Aucun mouvement dynamique ni pont sur la tête.'],stop:'Arrête en cas de douleur, vertige ou fourmillement.'},
  chinup:{position:['Prise supination environ largeur d’épaules.','Départ bras tendus avec les épaules contrôlées.'],execution:['Monte sans élan des jambes en amenant la poitrine vers la barre.','Fais descendre les coudes vers le corps puis redescends complètement sous contrôle.'],mistakes:['Évite le balancement, l’amplitude fortement réduite et toute descente non contrôlée.'],stop:'Arrête si le balancement devient nécessaire, si l’amplitude diminue fortement ou si la descente n’est plus contrôlée.'},
  reverseCrunch:{position:['Allongé sur le dos, bras au sol seulement pour stabiliser.'],execution:['Commence par rétroverser légèrement le bassin.','Enroule le bassin vers les côtes jusqu’à décoller le sacrum, puis redescends lentement.'],mistakes:['Ne balance pas les jambes, ne crée pas d’élan, ne fléchis pas seulement les hanches et ne pousse pas fortement sur les bras.'],stop:'Arrête si tu ne peux plus enrouler le bassin sans élan.'}
};

const ADDITIONS={
  'pullup:pause-haute':['Marque une vraie pause en haut sans avancer artificiellement le menton vers la barre.'],
  'pullup:poitrine-haute':['Monte davantage le haut du torse vers la barre sans transformer le mouvement en balancement.'],
  'pullup:poitrine-haute-explosive':['Monte le haut du torse aussi vite et haut que possible, sans impulsion des jambes.'],
  'pullup:asymetrique-assistee':['Déplace progressivement davantage de charge vers le bras cible.','Le bras d’assistance aide juste assez pour conserver une répétition propre.'],
  'pullup:archer-assistee':['Tire principalement avec le bras qui se plie, l’autre restant beaucoup plus allongé.','Travaille les deux côtés sans tordre brutalement le torse.'],
  'pullup:archer':['Tire principalement avec le bras qui se plie, l’autre restant beaucoup plus allongé.','Garde le torse contrôlé et travaille les deux côtés.'],
  'pullup:un-bras-assistee':['Le bras principal fournit l’essentiel de l’effort.','L’assistance réduit juste assez la charge pour garder une répétition propre.'],
  'hang:active':['Sans plier les coudes, abaisse légèrement les épaules et allonge le cou.','Maintiens l’activation sans te crisper.'],
  'hang:asymetrique':['Garde les deux mains sur la barre et transfère progressivement plus de poids vers le côté travaillé.','Garde le bassin contrôlé sans rotation brutale.'],
  'hang:une-main-assistee':['Le bras principal supporte l’essentiel du poids, la seconde main apporte seulement l’aide nécessaire.','Garde l’épaule stable sans chute brutale dans l’articulation.'],
  'hang:un-bras-assistee':['Le bras principal supporte l’essentiel du poids avec une assistance minimale.','Garde l’épaule stable sans chute brutale dans l’articulation.'],
  'row:plus-horizontal':['Plus le corps est horizontal, plus les fessiers et abdominaux empêchent les hanches de s’affaisser.'],
  'row:presque-horizontal':['Plus le corps est horizontal, plus les fessiers et abdominaux empêchent les hanches de s’affaisser.'],
  'row:pause-poitrine':['Marque la pause en haut sans avancer uniquement la tête.'],
  'row:pieds-sureleves':['Garde le corps entier aligné malgré l’augmentation de difficulté.'],
  'row:asymetrique':['Déplace davantage la poitrine vers la main du côté travaillé sans laisser le bassin tourner.'],
  'row:archer':['Le bras principal tire fortement tandis que l’autre reste beaucoup plus allongé. Alterne les côtés.'],
  'pushup:pause-basse':['Marque la pause près du bas sans poser le torse au sol ni perdre le gainage.'],
  'pushup:pieds-sureleves':['Garde le même alignement corporel et veille particulièrement à ne pas laisser le bassin tomber.'],
  'pushup:pieds-sureleves-pause':['Garde le même alignement corporel et marque la pause basse sans poser le torse.'],
  'pushup:archer-assistee':['Déplace progressivement davantage de poids vers un bras, l’autre fournissant seulement l’assistance nécessaire.'],
  'pushup:archer':['Descends davantage vers le bras qui travaille, l’autre restant beaucoup plus tendu.','Évite la rotation excessive du bassin.'],
  'pushup:une-main-assistee':['Écarte les pieds pour une base stable.','Le bras cible fournit la majorité de l’effort et l’assistance conserve la technique.'],
  'pushup:une-main':['Corps gainé, pieds suffisamment écartés et bassin contrôlé.','Évite de transformer la répétition en rotation complète du torse.'],
  'dip:pause-basse':['Marque la pause uniquement dans une position confortable et contrôlée.'],
  'dip:lent-pause':['Allonge volontairement la descente sans laisser les épaules partir vers l’avant.'],
  'dip:amplitude-propre':['L’amplitude complète est l’amplitude contrôlée et confortable : ne force jamais plus bas malgré une gêne.'],
  'split:split-pause':['Reste brièvement en bas sans poser le genou arrière ni perdre la position.'],
  'split:bulgarian':['Pose le pied arrière sur un support stable et place le pied avant assez loin.','La jambe avant effectue l’essentiel du travail.'],
  'split:bulgarian-pause':['Pose le pied arrière sur un support stable puis marque une pause basse contrôlée.'],
  'gluteSplit:split-pause':['Marque une pause basse contrôlée sans poser le genou arrière.'],
  'gluteSplit:bulgarian':['Pose le pied arrière sur un support stable et garde le pied avant assez loin pour rester confortable.'],
  'gluteSplit:bulgarian-pause':['Pose le pied arrière sur un support stable puis marque une pause basse contrôlée.'],
  'split:pistol-assiste':['Utilise le support uniquement pour l’équilibre et l’aide nécessaire.','Garde le talon au sol et le genou dans l’axe.'],
  'split:pistol-support':['Descends jusqu’au support sous contrôle sans te laisser tomber dessus.','Remonte sans élan brutal du torse.'],
  'split:pistol':['Pied entier au sol, genou suivant les orteils et jambe libre devant.','Contrôle toute la descente et la remontée.'],
  'split:pistol-pause':['Contrôle le pistol et marque une pause sans perdre l’appui du pied.'],
  'split:petit-squat-jump':['Saute verticalement puis réceptionne doucement sur tout le pied.','Stabilise-toi avant la répétition suivante.'],
  'split:squat-jump':['Cherche la hauteur, réceptionne silencieusement et retrouve l’équilibre avant de recommencer.'],
  'split:squat-jump-max':['Chaque saut cherche la hauteur maximale.','Arrête lorsque la hauteur diminue nettement.'],
  'calf:pause-etirement':['Marque la contraction en haut sans rebondir.'],
  'calf:descente-lente':['Contrôle volontairement toute la descente.'],
  'leg:pause-haute':['Maintiens brièvement le haut du mouvement sans perdre la position du bassin.'],
  'leg:descente-controlee':['Ralentis volontairement la descente et limite l’amplitude avant que le bas du dos se creuse.'],
  'leg:genoux-suspendus':['Évite tout balancement et ramène légèrement le bassin vers les côtes en haut.'],
  'leg:jambes-suspendues':['Évite tout balancement et ramène légèrement le bassin vers les côtes en haut.'],
  'leg:montee-haute':['Monte progressivement plus haut sans utiliser de kipping incontrôlé.'],
  'bridge:une-jambe':['Garde le bassin horizontal sans laisser un côté tomber ou tourner.'],
  'bridge:pause-haute':['Serre les fessiers en haut sans cambrer le bas du dos.'],
  'bridge:levier-long':['Éloigne progressivement le pied en gardant le bassin contrôlé et le travail dans les fessiers ou ischios.'],
  'bridge:levier-long-pause':['Garde le levier long contrôlé puis marque une pause haute sans cambrer.'],
  'tibialis:pieds-eloignes':['La difficulté vient uniquement de l’augmentation de l’angle : conserve la même technique.'],
  'tibialis:angle-important':['La difficulté vient uniquement de l’augmentation de l’angle : conserve la même technique.'],
  'tibialis:une-jambe-assistee':['Transfère progressivement plus de travail vers une jambe en gardant les talons au sol.'],
  'tibialis:une-jambe':['Le talon reste stable et le mouvement vient de la cheville, sans balancement du corps.'],
  'pike:plus-verticale':['Rapproche davantage les épaules au-dessus des mains tout en conservant le contrôle.'],
  'pike:pieds-sureleves':['Garde les hanches hautes et n’évolue pas vers une pompe classique.'],
  'pike:handstand-mur':['Mains fermement ancrées, pousse activement le sol.','Garde les épaules stables, le corps gainé et une respiration régulière.'],
  'pike:hspu-partielle':['Descends seulement dans l’amplitude contrôlée, tête, mains et épaules stables.'],
  'pike:hspu-mur':['Descends seulement dans l’amplitude contrôlée et évite que les coudes s’échappent vers l’extérieur.'],
  'hollow:levier-long':['Éloigne les appuis sans compenser en creusant le dos.'],
  'hollow:hollow-tuck':['Épaules légèrement décollées et genoux repliés.'],
  'hollow:une-jambe':['N’étends la jambe que tant que le bas du dos reste collé au sol.'],
  'hollow:complet':['Allonge bras et jambes uniquement dans l’amplitude où le bassin reste contrôlé.'],
  'hamstring:complet':['Allonge progressivement les jambes sans laisser le bassin s’effondrer.'],
  'hamstring:pause':['Maintiens brièvement la position difficile sans bloquer douloureusement les genoux.'],
  'hamstring:lent':['Fais de petits pas contrôlés, sans mouvement brusque.'],
  'hamstring:unilateral-assiste':['Une jambe fournit davantage de travail, l’autre aide juste assez pour contrôler le mouvement.'],
  'hamstring:unilateral':['Garde le bassin stable pendant que la jambe cible fournit l’essentiel du travail.'],
  'sidePlank:complet':['Aligne le corps de la tête aux pieds et garde le bassin haut.'],
  'sidePlank:empile-pause':['Garde les pieds stables et le bassin sans rotation.'],
  'sidePlank:star-assiste':['Élève la jambe supérieure seulement sans perdre l’alignement du bassin.'],
  'sidePlank:star':['Élève la jambe supérieure seulement sans perdre l’alignement du bassin.'],
  'adductor:allonge':['Allongé sur le côté, soulève la jambe inférieure avec contrôle sans rouler le bassin.'],
  'adductor:court':['Le genou supérieur est soutenu : lève le bassin et maintiens sans douleur.'],
  'adductor:plus-long':['Rapproche progressivement le support du pied seulement si le bassin reste stable.'],
  'adductor:complet':['Le support est proche du pied : conserve le bassin stable.'],
  'adductor:dynamique':['Monte et descends le bassin lentement au lieu de maintenir uniquement la position.'],
  'antiRotation:bird-dog':['Étends bras et jambe opposée lentement puis reviens avant d’alterner.'],
  'antiRotation:shoulder-taps':['Depuis la position haute de pompe, touche l’épaule opposée en gardant le bassin immobile.'],
  'antiRotation:pieds-rapproches':['Les pieds rapprochés augmentent la difficulté : garde la même technique.'],
  'antiRotation:bras-devant':['Allonge un bras devant sans déplacer le bassin ni le thorax.'],
  'scapPull:pause':['Maintiens brièvement la position active.'],
  'scapPull:lent':['Ralentis le mouvement des omoplates sans plier les coudes.'],
  'scapPull:maintien':['Bras tendus, épaules légèrement abaissées, cou long et respiration normale.'],
  'scapPush:plank-plus':['Termine en poussant davantage le sol pour arrondir légèrement le haut du dos sans plier les coudes.'],
  'scapPush:wall-slide':['Monte progressivement les bras contre le mur sans laisser les côtes partir vers l’avant.'],
  'abductor:pause':['Maintiens brièvement en haut sans faire rouler le bassin.'],
  'abductor:side-genou':['Maintiens d’abord le gainage puis lève la jambe supérieure sans perdre le bassin.'],
  'abductor:side-complet':['Maintiens le gainage à levier complet puis lève la jambe sans perdre le bassin.'],
  'rearShoulder:prone-w':['Bras en W, décolle légèrement mains et coudes puis rapproche doucement les omoplates.'],
  'rearShoulder:snow-angel':['Bras légèrement décollés, déplace-les lentement de bas en haut sans hausser les épaules.'],
  'rearShoulder:ytw':['Effectue chaque forme lentement avec une petite amplitude contrôlée.'],
  'rearShoulder:pauses':['Effectue chaque forme lentement et marque une courte pause contrôlée.']
};

const MODE_CAPABLE={pullup:['force','hypertrophy','endurance','power'],pushup:['force','hypertrophy','endurance','power'],row:['force','hypertrophy','endurance','power'],split:['force','hypertrophy','endurance','power'],gluteSplit:['hypertrophy'],pike:['force','hypertrophy','endurance','power'],dip:['force','hypertrophy'],leg:['force','hypertrophy'],bridge:['force','hypertrophy','endurance'],calf:['hypertrophy'],tibialis:['hypertrophy'],hamstring:['hypertrophy'],rearShoulder:['hypertrophy'],abductor:['hypertrophy'],chinup:['hypertrophy'],reverseCrunch:['hypertrophy']};
const CONTROL_HEALTH=new Set(['calf','tibialis','scapPull','scapPush','rearShoulder','antiRotation','abductor']);
const ISOMETRIC_EXERCISES=new Set(['hang','hollow','sidePlank','neck']);
const ISOMETRIC_VARIANTS=new Set(['pike:handstand-mur','scapPull:maintien','adductor:court','adductor:plus-long','adductor:complet']);
const POSITION_LABELS={feet:'Pieds',knees:'Genoux',hips:'Hanches',pelvis:'Bassin',trunk:'Tronc',scapulae:'Omoplates',shoulders:'Épaules',elbows:'Coudes',wrists:'Poignets',headNeck:'Tête et nuque',supports:'Appuis'};

function typeFor(exerciseId,variantId,modeId,unit){
  const key=`${exerciseId}:${variantId}`;
  if(ISOMETRIC_EXERCISES.has(exerciseId)||ISOMETRIC_VARIANTS.has(key)||unit==='seconds'||unit==='side-seconds')return'isometric';
  if(modeId==='power'||/jump|explos|rapide|vitesse/.test(variantId))return'explosive';
  if(CONTROL_HEALTH.has(exerciseId))return'control_health';
  return'dynamic_controlled';
}

export function buildTechnique({exerciseId,lineId,modeId,variant,unit}){
  const base=BASE[exerciseId];
  if(!base)throw Error(`Technique de base absente pour ${exerciseId}.`);
  const canonicalBase=CANONICAL_TECHNIQUES[exerciseId];
  if(!canonicalBase)throw Error(`Référentiel technique structuré absent pour ${exerciseId}.`);
  const key=`${exerciseId}:${variant.id}`,override=VARIANT_TECHNIQUE_OVERRIDES[key]||null,canonical=mergeTechnique(canonicalBase,override||{});
  const type=override?.movementType||typeFor(exerciseId,variant.id,modeId,unit),allowed=MODE_CAPABLE[exerciseId]||[];
  const compatibleModes=type==='dynamic_controlled'||type==='explosive'||modeId==='hypertrophy'?allowed.filter(m=>m===modeId||((exerciseId==='pushup'||exerciseId==='pullup')&&['classique','stricte'].includes(variant.id))):[];
  const addition=override?.execution?[]:(ADDITIONS[key]||[]);
  const modeInstructions=compatibleModes.includes(modeId)?[...MODE_INSTRUCTIONS[modeId]]:[];
  const position=[`Orientation : ${canonical.globalOrientation}.`,`Appuis : ${canonical.support}.`,...Object.entries(canonical.startPosition).filter(([,value])=>value).slice(0,4).map(([part,value])=>`${POSITION_LABELS[part]||part} : ${value}.`)];
  const execution=[...canonical.execution,...addition],mistakes=[...canonical.commonErrors],stop=variant.stop||canonical.stopCriteria.join(' · ');
  const sessionCue=[execution[0],canonical.fixedBodyParts[0]?`Repère fixe : ${canonical.fixedBodyParts[0]}.`:null,canonical.stopCriteria[0]?`Arrêt : ${canonical.stopCriteria[0]}.`:null].filter(Boolean).join(' ');
  const detailedInstructions=[
    ...position,
    canonical.grip?`Prise : ${canonical.grip.type}; ${canonical.grip.width}; pouce ${canonical.grip.thumb}.`:null,
    ...execution.map((item,index)=>`${index+1}. ${item}`),
    `Fin : ${canonical.endPosition}`,
    `Amplitude : ${canonical.rangeOfMotion}`,
    `Respiration : ${canonical.breathing}`,
    `Tempo : ${canonical.tempoPrinciple}`,
    `Erreurs : ${mistakes.join(' · ')}`,
    `Arrêt : ${stop}`
  ].filter(Boolean);
  const sessionCues=[execution[0],canonical.fixedBodyParts[0],modeInstructions[0],stop].filter(Boolean).slice(0,4);
  return{id:variant.id,exerciseId,lineId,name:variant.name,canonicalName:canonical.canonicalName,aliases:[...canonical.aliases],type,movementType:type,globalOrientation:canonical.globalOrientation,support:canonical.support,startPosition:{...canonical.startPosition},grip:canonical.grip?{...canonical.grip}:null,position,execution,endPosition:canonical.endPosition,rangeOfMotion:canonical.rangeOfMotion,fixedBodyParts:[...canonical.fixedBodyParts],breathing:canonical.breathing,tempoPrinciple:canonical.tempoPrinciple,mistakes,commonErrors:[...mistakes],stop,stopCriteria:[...canonical.stopCriteria],primaryMuscles:[...canonical.primaryMuscles],secondaryMuscles:[...canonical.secondaryMuscles],stabilizers:[...canonical.stabilizers],visualSignature:{framesNeeded:canonical.visualSignature.framesNeeded,frames:[...canonical.visualSignature.frames]},sources:[...canonical.sources],status:variantAuditStatus(exerciseId,variant.id),decisionReason:DECISION_VARIANTS[key]||null,redundancyReason:REDUNDANT_VARIANTS[key]||null,compatibleModes,modeInstructions,unilateral:unit==='side'||unit==='side-seconds',timed:unit==='seconds'||unit==='side-seconds',sessionCue,detailedInstructions,sessionCues};
}

export function validateTechniqueCatalog(exercises){
  let count=0;
  for(const [exerciseId,exercise]of Object.entries(exercises))for(const [modeId,definition]of Object.entries(exercise.modes)){
    const variants=new Map(definition.variants.map(v=>[v.id,v]));
    for(const variant of definition.variants){
      const t=variant.technique;count++;
      if(!variant.id||!t||!MOVEMENT_TYPES.includes(t.type)||!t.position.length||!t.execution.length||!t.mistakes.length)throw Error(`Consigne canonique invalide : ${exerciseId}/${modeId}/${variant.id||'sans-id'}.`);
      if(!TECHNICAL_STATUSES.includes(t.status)||!t.canonicalName||!t.globalOrientation||!t.support||!t.startPosition||!t.endPosition||!t.rangeOfMotion||!t.breathing||!t.tempoPrinciple||!t.sessionCue||t.detailedInstructions.length<10)throw Error(`Référentiel technique incomplet : ${exerciseId}/${modeId}/${variant.id}.`);
      if(!Array.isArray(t.primaryMuscles)||!Array.isArray(t.secondaryMuscles)||!Array.isArray(t.stabilizers)||!t.visualSignature?.framesNeeded||!t.visualSignature.frames.length)throw Error(`Anatomie ou signature visuelle absente : ${exerciseId}/${modeId}/${variant.id}.`);
      if(t.modeInstructions.length&&!t.compatibleModes.includes(modeId))throw Error(`Mode incompatible composé : ${exerciseId}/${variant.id}/${modeId}.`);
      if(t.compatibleModes.some(m=>!MODE_INSTRUCTIONS[m]))throw Error(`Mode inconnu dans ${exerciseId}/${variant.id}.`);
    }
    for(const step of definition.steps)if(!variants.has(step.variantId))throw Error(`Palier orphelin : ${exerciseId}/${modeId}/${step.variantId}.`);
  }
  return count;
}
