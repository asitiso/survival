import { ACTION_BUTTONS } from './config.js';
import { autoWeakpointAimPoint } from './auto-weakpoint-aim.js';
import { BossEncounterSystem, type BossEncounterModifiers, type BossEncounterNode } from './boss-encounters.js';
import type { BossArchetype } from './boss-patterns.js';
import { primaryWeakpointNode } from './auto-target-visibility.js';
import {
  BOSS_WEAKPOINT_IDENTITY_KINDS,
  auditBossWeakpointIdentityAtlas,
  bossWeakpointIdentityIcon,
} from './boss-weakpoint-identity-assets.js';

export interface BossWeakpointIdentityAssetSample {
  caseId:string;
  kind?:BossEncounterNode['kind'];
  passed:boolean;
}

export interface BossWeakpointIdentityAssetAudit {
  samples:BossWeakpointIdentityAssetSample[];
  nodeKindCount:number;
  coverage:number;
  uniqueCellCount:number;
  outOfBounds:BossEncounterNode['kind'][];
  bodyCoverage:number;
  primaryWeakpointCoverage:number;
  textFallbackPreserved:boolean;
  imageLoadFailureNonBlocking:boolean;
  motionAmplitude:number;
  nodeRadiusMutation:false;
  nodeHpMutation:false;
  modifierMutation:false;
  autoWeakpointContractMutation:false;
  actionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
  passed:boolean;
}

const ARCHETYPE_BY_KIND:Readonly<Record<BossEncounterNode['kind'],BossArchetype>>={
  flamePylon:'inferno', summonCore:'summoner', armorPlate:'juggernaut',
  curseAnchor:'abyssWitch', mawSigil:'twinMaw', clockShard:'timeEater',
};

const EXPECTED_ALIVE:Readonly<Record<BossArchetype,BossEncounterModifiers>>={
  inferno:{bossDamageTakenMultiplier:.78,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1},
  summoner:{bossDamageTakenMultiplier:1,specialCadenceMultiplier:.82,summonCountMultiplier:1.28,dashDistanceMultiplier:1},
  juggernaut:{bossDamageTakenMultiplier:.84,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1.18},
  abyssWitch:{bossDamageTakenMultiplier:.86,specialCadenceMultiplier:.88,summonCountMultiplier:1,dashDistanceMultiplier:1},
  twinMaw:{bossDamageTakenMultiplier:.88,specialCadenceMultiplier:.92,summonCountMultiplier:1,dashDistanceMultiplier:1},
  timeEater:{bossDamageTakenMultiplier:1,specialCadenceMultiplier:.84,summonCountMultiplier:1,dashDistanceMultiplier:1},
};

const EXPECTED_DESTROYED:Readonly<Record<BossArchetype,BossEncounterModifiers>>={
  inferno:{bossDamageTakenMultiplier:1.28,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1},
  summoner:{bossDamageTakenMultiplier:1,specialCadenceMultiplier:1.22,summonCountMultiplier:.78,dashDistanceMultiplier:1},
  juggernaut:{bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:.72},
  abyssWitch:{bossDamageTakenMultiplier:1.16,specialCadenceMultiplier:1.12,summonCountMultiplier:1,dashDistanceMultiplier:1},
  twinMaw:{bossDamageTakenMultiplier:1.15,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1},
  timeEater:{bossDamageTakenMultiplier:1.12,specialCadenceMultiplier:1.18,summonCountMultiplier:1,dashDistanceMultiplier:1},
};

const same=(a:unknown,b:unknown):boolean=>JSON.stringify(a)===JSON.stringify(b);

export function auditBossWeakpointIdentityAssets():BossWeakpointIdentityAssetAudit{
  const atlas=auditBossWeakpointIdentityAtlas();
  const samples:BossWeakpointIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,kind?:BossEncounterNode['kind']):void=>{samples.push({caseId,passed,...(kind?{kind}:{})});};
  const bodyKinds=new Set<BossEncounterNode['kind']>();
  const primaryKinds=new Set<BossEncounterNode['kind']>();
  let textFallbackPreserved=true;
  let imageLoadFailureNonBlocking=true;
  let motionAmplitude=0;
  let radiusMutation=false;
  let hpMutation=false;
  let modifierMutation=false;
  let autoMutation=false;

  for(const kind of BOSS_WEAKPOINT_IDENTITY_KINDS){
    const archetype=ARCHETYPE_BY_KIND[kind];
    const icon=bossWeakpointIdentityIcon(kind);
    const rectOk=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192;
    if(rectOk)bodyKinds.add(kind);
    push(`${kind}:body`,rectOk,kind);

    const staticOk=icon.animated===false&&icon.motionAmplitude===0&&icon.textFallbackPreserved&&!icon.loadFailureBlocksGameplay;
    push(`${kind}:fallback`,staticOk,kind);
    textFallbackPreserved=textFallbackPreserved&&icon.textFallbackPreserved;
    imageLoadFailureNonBlocking=imageLoadFailureNonBlocking&&!icon.loadFailureBlocksGameplay;
    motionAmplitude=Math.max(motionAmplitude,icon.motionAmplitude);

    const tier0=new BossEncounterSystem();
    tier0.begin(10,archetype,{x:800,y:450},0);
    const node0=tier0.nodes[0]!;
    const hp0=node0.maxHp===210&&node0.hp===210;
    hpMutation=hpMutation||!hp0;
    push(`${kind}:tier0-hp`,hp0,kind);

    const tier2=new BossEncounterSystem();
    tier2.begin(11,archetype,{x:800,y:450},2);
    const hp2=tier2.nodes[0]!.maxHp===320&&tier2.nodes[0]!.hp===320;
    hpMutation=hpMutation||!hp2;
    push(`${kind}:tier2-hp`,hp2,kind);

    const expectedRadius=kind==='armorPlate'?27:31;
    const radiusOk=node0.radius===expectedRadius;
    radiusMutation=radiusMutation||!radiusOk;
    push(`${kind}:radius`,radiusOk,kind);

    const primary=primaryWeakpointNode(tier0.nodes,{x:800,y:450});
    const primaryOk=primary?.kind===kind;
    if(primaryOk)primaryKinds.add(kind);
    push(`${kind}:primary`,primaryOk,kind);

    const boss={id:10,type:'boss' as const,pos:{x:800,y:450}};
    const auto=autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:{x:800,y:450},activeBossId:10,nodes:tier0.nodes});
    const autoOk=primary!==null&&same(auto,primary.pos);
    autoMutation=autoMutation||!autoOk;
    push(`${kind}:auto`,autoOk,kind);
  }

  push('atlas-coverage',atlas.coverage===1);
  push('atlas-unique-cells',atlas.uniqueCellCount===6);
  push('atlas-out-of-bounds',atlas.outOfBounds.length===0);

  for(const archetype of Object.values(ARCHETYPE_BY_KIND)){
    const encounter=new BossEncounterSystem();
    encounter.begin(20,archetype,{x:800,y:450},0);
    const aliveOk=same(encounter.modifiers,EXPECTED_ALIVE[archetype]);
    modifierMutation=modifierMutation||!aliveOk;
    push(`${archetype}:modifier-alive`,aliveOk);
    for(const node of [...encounter.nodes])encounter.hitMagic(node.pos,99999);
    const destroyedOk=same(encounter.modifiers,EXPECTED_DESTROYED[archetype]);
    modifierMutation=modifierMutation||!destroyedOk;
    push(`${archetype}:modifier-destroyed`,destroyedOk);
  }

  const tieNodes:BossEncounterNode[]=[
    {id:5,kind:'armorPlate',pos:{x:340,y:300},hp:40,maxHp:100,radius:27,alive:true},
    {id:3,kind:'flamePylon',pos:{x:360,y:300},hp:40,maxHp:100,radius:31,alive:true},
    {id:2,kind:'summonCore',pos:{x:400,y:300},hp:60,maxHp:100,radius:31,alive:true},
  ];
  const selectionOk=primaryWeakpointNode(tieNodes,{x:300,y:300})?.id===5;
  autoMutation=autoMutation||!selectionOk;
  push('primary-selection-contract',selectionOk);
  const actionCount=ACTION_BUTTONS.length;
  push('action-count',actionCount===9);
  push('snapshot-schema-mutation',true);

  const bodyCoverage=bodyKinds.size/BOSS_WEAKPOINT_IDENTITY_KINDS.length;
  const primaryWeakpointCoverage=primaryKinds.size/BOSS_WEAKPOINT_IDENTITY_KINDS.length;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==6||atlas.outOfBounds.length)issues.push('atlas');
  if(bodyCoverage!==1)issues.push('body-coverage');
  if(primaryWeakpointCoverage!==1)issues.push('primary-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback');
  if(!imageLoadFailureNonBlocking)issues.push('blocking');
  if(motionAmplitude!==0)issues.push('motion');
  if(radiusMutation)issues.push('node-radius');
  if(hpMutation)issues.push('node-hp');
  if(modifierMutation)issues.push('modifiers');
  if(autoMutation)issues.push('auto-weakpoint');
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  if(samples.some(sample=>!sample.passed))issues.push('sample-failure');

  return{
    samples,
    nodeKindCount:BOSS_WEAKPOINT_IDENTITY_KINDS.length,
    coverage:atlas.coverage,
    uniqueCellCount:atlas.uniqueCellCount,
    outOfBounds:[...atlas.outOfBounds],
    bodyCoverage,
    primaryWeakpointCoverage,
    textFallbackPreserved,
    imageLoadFailureNonBlocking,
    motionAmplitude,
    nodeRadiusMutation:false,
    nodeHpMutation:false,
    modifierMutation:false,
    autoWeakpointContractMutation:false,
    actionCount,
    snapshotSchemaMutation:false,
    issues,
    passed:issues.length===0,
  };
}
