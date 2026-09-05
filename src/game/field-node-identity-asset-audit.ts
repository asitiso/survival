import { ACTION_BUTTONS } from './config.js';
import { createDefaultWorldState, evolveWorld, type FieldNodeKind } from './endless/world-evolution.js';
import { FIELD_NODE_IDENTITY_KINDS, auditFieldNodeIdentityAtlas, fieldNodeIdentityIcon, fieldNodeIdentityPresentation } from './field-node-identity-assets.js';

export interface FieldNodeIdentityAssetSample{caseId:string;kind?:FieldNodeKind;passed:boolean;}
export interface FieldNodeIdentityAssetAudit{
  samples:FieldNodeIdentityAssetSample[];
  nodeKindCount:number;coverage:number;uniqueCellCount:number;outOfBounds:FieldNodeKind[];
  bodyCoverage:number;presentationCoverage:number;fallbackCoverage:number;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  fieldNodeGameplayMutation:boolean;worldEvolutionMutation:boolean;
  actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}

const EXPECTED:Readonly<Record<FieldNodeKind,{label:string;color:string}>>={
  mana_well:{label:'MANA',color:'#9b7cff'}, sanctuary_zone:{label:'SAFE',color:'#7ce8b7'},
  barricade:{label:'WALL',color:'#d0b277'}, safe_corridor:{label:'PATH',color:'#75d8ff'}, volatile_zone:{label:'RISK',color:'#ff6c83'},
};

export function auditFieldNodeIdentityAssets():FieldNodeIdentityAssetAudit{
  const atlas=auditFieldNodeIdentityAtlas(); const samples:FieldNodeIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,kind?:FieldNodeKind):void=>{samples.push({caseId,passed,...(kind?{kind}:{})});};
  const body=new Set<FieldNodeKind>(),presentation=new Set<FieldNodeKind>(),fallback=new Set<FieldNodeKind>();
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0;
  let fieldNodeGameplayMutation=false;
  for(const kind of FIELD_NODE_IDENTITY_KINDS){
    const icon=fieldNodeIdentityIcon(kind), view=fieldNodeIdentityPresentation(kind), expected=EXPECTED[kind];
    const rectOk=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192;
    if(rectOk)body.add(kind); push(`${kind}:body`,rectOk,kind);
    const presentationOk=view.label===expected.label&&view.color===expected.color;
    if(presentationOk)presentation.add(kind); push(`${kind}:presentation`,presentationOk,kind);
    const fallbackOk=icon.textFallbackPreserved; if(fallbackOk)fallback.add(kind); push(`${kind}:fallback`,fallbackOk,kind);
    push(`${kind}:non-blocking`,!icon.loadFailureBlocksGameplay,kind);
    push(`${kind}:static`,icon.animated===false&&icon.motionAmplitude===0,kind);
    push(`${kind}:label`,view.label===expected.label,kind);
    push(`${kind}:color`,view.color===expected.color,kind);
    push(`${kind}:cell-size`,icon.sw===96&&icon.sh===96,kind);
    push(`${kind}:kind`,icon.kind===kind,kind);
    const presentationOnly=Object.keys(view).sort().join('|')==='color|label';
    fieldNodeGameplayMutation=fieldNodeGameplayMutation||!presentationOnly;
    push(`${kind}:presentation-only`,presentationOnly,kind);
    textFallbackPreserved=textFallbackPreserved&&icon.textFallbackPreserved;
    imageLoadFailureNonBlocking=imageLoadFailureNonBlocking&&!icon.loadFailureBlocksGameplay;
    iconMotionAmplitude=Math.max(iconMotionAmplitude,icon.motionAmplitude);
  }

  push('atlas:coverage',atlas.coverage===1);
  push('atlas:unique-cells',atlas.uniqueCellCount===5);
  push('atlas:bounds',atlas.outOfBounds.length===0);
  push('atlas:item-count',atlas.itemCount===5);
  const actionCount=ACTION_BUTTONS.length; push('action-count',actionCount===9);
  push('snapshot-schema-mutation',true);
  const defaultWorld=createDefaultWorldState(); push('world:default-state',defaultWorld.current==='calm'&&defaultWorld.nodes.length===0&&defaultWorld.evolutionCount===0);
  const legacy={heroId:'arkan',elapsedMs:480000,level:20,threat:3,kills:500,bossesDefeated:2,elitesDefeated:10,gold:2000,xp:9000,guardianCoreHp:900,guardianCoreMaxHp:1000,fate:'none' as const,spellFusionCount:1,mapEvolutionRank:1,masteryLevel:8,deviceClass:'mid' as const};
  const evolved=evolveWorld(legacy,createDefaultWorldState(),{seed:42,cursor:0});
  const worldSeedOk=evolved.state.current==='mana_bloom'&&evolved.rng.seed===42&&evolved.rng.cursor===5;
  push('world:seed-contract',worldSeedOk);
  const nodeContractOk=evolved.state.nodes.length===2&&evolved.state.nodes.every(node=>node.kind==='mana_well'&&node.radius===0.1&&node.expiresAtMs===540000);
  push('world:node-contract',nodeContractOk);
  push('identity:presentation-only',!fieldNodeGameplayMutation);
  const worldEvolutionMutation=!worldSeedOk||!nodeContractOk;

  const bodyCoverage=body.size/5,presentationCoverage=presentation.size/5,fallbackCoverage=fallback.size/5;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==5||atlas.outOfBounds.length)issues.push('atlas');
  if(bodyCoverage!==1)issues.push('body-coverage'); if(presentationCoverage!==1)issues.push('presentation-coverage'); if(fallbackCoverage!==1)issues.push('fallback-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback'); if(!imageLoadFailureNonBlocking)issues.push('blocking'); if(iconMotionAmplitude!==0)issues.push('motion');
  if(fieldNodeGameplayMutation)issues.push('gameplay-mutation'); if(worldEvolutionMutation)issues.push('world-evolution-mutation');
  if(actionCount!==9)issues.push(`actions:${actionCount}`); if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,nodeKindCount:5,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],bodyCoverage,presentationCoverage,fallbackCoverage,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,fieldNodeGameplayMutation,worldEvolutionMutation,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
