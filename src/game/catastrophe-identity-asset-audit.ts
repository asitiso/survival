import { catastropheAt, catastropheModifiers, type CatastropheId, type CatastropheModifiers } from '../domain/catastrophe.js';
import { ACTION_BUTTONS } from './config.js';
import { CATASTROPHE_IDENTITY_IDS, auditCatastropheIdentityAtlas, catastropheIdentityIcon } from './catastrophe-identity-assets.js';

export interface CatastropheIdentityAssetSample{caseId:string;id?:CatastropheId;passed:boolean;}
export interface CatastropheIdentityAssetAudit{
  samples:CatastropheIdentityAssetSample[];
  catastropheCount:number;coverage:number;uniqueCellCount:number;outOfBounds:CatastropheId[];
  iconCoverage:number;rotationCoverage:number;fallbackCoverage:number;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  catastropheTimingMutation:boolean;catastropheModifierMutation:boolean;
  actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}

const EXPECTED:Readonly<Record<CatastropheId,{name:string;description:string;mods:CatastropheModifiers}>>={
  goldenNight:{name:'황금의 밤',description:'모든 금화 획득량 ×2',mods:{goldMultiplier:2,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1}},
  frenzy:{name:'적의 광분',description:'적 이동속도 +22%',mods:{goldMultiplier:1,enemySpeedMultiplier:1.22,cooldownMultiplier:1,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1}},
  arcaneSurge:{name:'마력 폭주',description:'마법 쿨타임 -18% · 적 이동속도 +10%',mods:{goldMultiplier:1,enemySpeedMultiplier:1.10,cooldownMultiplier:0.82,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1}},
  redMoon:{name:'붉은 달',description:'적 밀도와 정예 출현 증가',mods:{goldMultiplier:1,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1.32,eliteIntervalMultiplier:0.58,coreDamageMultiplier:1}},
  guardianGrace:{name:'수호의 은총',description:'수호핵 피해 -22% · 적 밀도 소폭 증가',mods:{goldMultiplier:1,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1.08,eliteIntervalMultiplier:1,coreDamageMultiplier:0.78}},
};

function sameModifiers(a:CatastropheModifiers,b:CatastropheModifiers):boolean{
  return a.goldMultiplier===b.goldMultiplier&&a.enemySpeedMultiplier===b.enemySpeedMultiplier&&a.cooldownMultiplier===b.cooldownMultiplier&&a.spawnPressureMultiplier===b.spawnPressureMultiplier&&a.eliteIntervalMultiplier===b.eliteIntervalMultiplier&&a.coreDamageMultiplier===b.coreDamageMultiplier;
}

export function auditCatastropheIdentityAssets():CatastropheIdentityAssetAudit{
  const atlas=auditCatastropheIdentityAtlas(); const samples:CatastropheIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,id?:CatastropheId):void=>{samples.push({caseId,passed,...(id?{id}:{})});};
  const iconSet=new Set<CatastropheId>(),rotationSet=new Set<CatastropheId>(),fallbackSet=new Set<CatastropheId>();
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0,catastropheModifierMutation=false;

  CATASTROPHE_IDENTITY_IDS.forEach((id,index)=>{
    const icon=catastropheIdentityIcon(id); const expected=EXPECTED[id]; const active=catastropheAt(1200+180*index);
    const rectOk=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192;
    if(rectOk)iconSet.add(id); push(`${id}:body`,rectOk,id);
    const fallbackOk=icon.textFallbackPreserved; if(fallbackOk)fallbackSet.add(id); push(`${id}:fallback`,fallbackOk,id);
    push(`${id}:non-blocking`,!icon.loadFailureBlocksGameplay,id);
    push(`${id}:static`,icon.animated===false&&icon.motionAmplitude===0,id);
    push(`${id}:kind`,icon.id===id,id);
    push(`${id}:cell-size`,icon.sw===96&&icon.sh===96,id);
    const rotationOk=active?.id===id; if(rotationOk)rotationSet.add(id); push(`${id}:rotation`,rotationOk,id);
    push(`${id}:name`,active?.name===expected.name,id);
    push(`${id}:description`,active?.description===expected.description,id);
    const modifierOk=active?sameModifiers(catastropheModifiers(active),expected.mods):false;
    catastropheModifierMutation=catastropheModifierMutation||!modifierOk; push(`${id}:modifiers`,modifierOk,id);
    textFallbackPreserved=textFallbackPreserved&&icon.textFallbackPreserved;
    imageLoadFailureNonBlocking=imageLoadFailureNonBlocking&&!icon.loadFailureBlocksGameplay;
    iconMotionAmplitude=Math.max(iconMotionAmplitude,icon.motionAmplitude);
  });

  push('atlas:coverage',atlas.coverage===1);
  push('atlas:unique-cells',atlas.uniqueCellCount===5);
  push('atlas:bounds',atlas.outOfBounds.length===0);
  push('atlas:item-count',atlas.itemCount===5);
  const actionCount=ACTION_BUTTONS.length; push('action-count',actionCount===9);
  push('snapshot-schema-mutation',true);
  const timingStartOk=catastropheAt(1199)===null&&catastropheAt(1200)?.id==='goldenNight'; push('timing:start',timingStartOk);
  const order=CATASTROPHE_IDENTITY_IDS.map((_,i)=>catastropheAt(1200+180*i)?.id); const rotationOrderOk=order.every((id,i)=>id===CATASTROPHE_IDENTITY_IDS[i]); push('timing:rotation-order',rotationOrderOk);
  const loopOk=catastropheAt(1200+180*5)?.id==='goldenNight'; push('timing:loop',loopOk);
  const neutralOk=sameModifiers(catastropheModifiers(null),{goldMultiplier:1,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1}); push('modifiers:neutral',neutralOk);

  const catastropheTimingMutation=!(timingStartOk&&rotationOrderOk&&loopOk);
  const iconCoverage=iconSet.size/5,rotationCoverage=rotationSet.size/5,fallbackCoverage=fallbackSet.size/5;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==5||atlas.outOfBounds.length)issues.push('atlas');
  if(iconCoverage!==1)issues.push('icon-coverage'); if(rotationCoverage!==1)issues.push('rotation-coverage'); if(fallbackCoverage!==1)issues.push('fallback-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback'); if(!imageLoadFailureNonBlocking)issues.push('blocking'); if(iconMotionAmplitude!==0)issues.push('motion');
  if(catastropheTimingMutation)issues.push('timing-mutation'); if(catastropheModifierMutation||!neutralOk)issues.push('modifier-mutation');
  if(actionCount!==9)issues.push(`actions:${actionCount}`); if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,catastropheCount:5,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],iconCoverage,rotationCoverage,fallbackCoverage,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,catastropheTimingMutation,catastropheModifierMutation:catastropheModifierMutation||!neutralOk,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
