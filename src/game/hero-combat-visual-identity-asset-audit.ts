import { ACTION_BUTTONS } from './config.js';
import { HERO_METER_IDENTITY_IDS,auditHeroMeterIdentityAtlas,heroMeterIdentityIcon } from './hero-meter-identity-assets.js';
import { ARCANE_COMBO_IDENTITY_IDS,auditArcaneComboIdentityAtlas,arcaneComboIdentityIcon,arcaneComboTierBadge } from './arcane-combo-identity-assets.js';
import { TACTICAL_STATUS_ICON_IDS,tacticalStatusIconPresentation } from './tactical-status-icon-assets.js';
import { FUSION_IDS,fusionDefinition } from './spell-fusions.js';
import { buildIdentityIcon } from './build-identity-assets.js';
import { createHeroMeterState,heroMeterModifiers,updateHeroMeter } from './hero-meters.js';
import { analyzeArcaneCombo } from './arcane-combos.js';
import { fieldEventModifiers } from './field-events.js';
import { objectiveDefinition } from './battlefield-objectives.js';
import { missionTargetForDanger } from './run-missions.js';
import { threatDirectiveAt,threatDirectiveModifiers } from './threat-directives.js';

export interface HeroCombatVisualIdentityAssetSample { caseId:string; passed:boolean; }
export interface HeroCombatVisualIdentityAssetAudit {
  samples:HeroCombatVisualIdentityAssetSample[];
  heroMeterCount:number;heroMeterCoverage:number;heroMeterUniqueCellCount:number;
  arcaneComboCount:number;arcaneComboCoverage:number;arcaneComboUniqueCellCount:number;
  tacticalToastCoverage:number;fusionToastCoverage:number;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  heroMeterContractMutation:boolean;comboContractMutation:boolean;tacticalContractMutation:boolean;fusionContractMutation:boolean;
  actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}
const close=(a:number,b:number)=>Math.abs(a-b)<1e-9;
function heroMeterContractOk():boolean{
  const durations={arkan:7,seria:6.5,kain:5.5,edric:6} as const;
  for(const heroId of HERO_METER_IDENTITY_IDS){const tr=updateHeroMeter({...createHeroMeterState(heroId),charge:.999},0,{casts:1,chilledHits:1,moving:true,preventedDamageRatio:1});if(!tr.activated||!close(tr.state.activeTimer,durations[heroId])||tr.state.charge!==0)return false;}
  const a=heroMeterModifiers({heroId:'arkan',charge:0,activeTimer:1});
  const s=heroMeterModifiers({heroId:'seria',charge:0,activeTimer:1});
  const k=heroMeterModifiers({heroId:'kain',charge:0,activeTimer:1});
  const e=heroMeterModifiers({heroId:'edric',charge:0,activeTimer:1});
  return close(a.spellPowerMultiplier,1.22)&&close(a.areaMultiplier,1.15)&&close(a.arkanExplosionChanceBonus,.14)&&close(a.arkanExplosionRadiusMultiplier,1.3)
    &&close(s.cooldownMultiplier,.88)&&close(s.areaMultiplier,1.22)&&s.shatterRadius===155&&close(s.shatterDamageMultiplier,1.35)
    &&close(k.cooldownMultiplier,.78)&&close(k.spellPowerMultiplier,1.08)&&k.kainChainBonus===2
    &&close(e.coreDamageTakenMultiplier,.72)&&close(e.areaMultiplier,1.16);
}
function comboContractOk():boolean{
  const samples=[
    ['arkan','fireBolt','arcane-staff','ember-crown','ember-dominion','inferno-chain'],
    ['seria','frostNova','blast-rod','winter-heart','winter-dominion','frozen-control'],
    ['kain','chainLightning','rapid-wand','storm-core','storm-dominion','storm-velocity'],
    ['edric','frostNova','guardian-plate','oath-seal','oath-dominion','guardian-fortress'],
  ] as const;
  for(const [heroId,spell,legendary,relic,synergy,family] of samples){const c=analyzeArcaneCombo({heroId,evolvedSpells:[spell],legendaryIds:[legendary],relicId:relic,traitId:null,synergyIds:[synergy],meterActive:true,coreHpRatio:heroId==='edric'?.5:1,objectiveStreak:2});if(c.family!==family||c.tier!==3||c.label!=='ASCENDANCY'||!close(c.powerMultiplier,1.12)||!close(c.cooldownMultiplier,.94)||!close(c.areaMultiplier,1.12))return false;}
  return arcaneComboTierBadge(1)==='I'&&arcaneComboTierBadge(2)==='II'&&arcaneComboTierBadge(3)==='III';
}
function tacticalContractOk():boolean{
  const mana=fieldEventModifiers({id:'manaStorm',name:'',description:'',duration:25,remaining:10,startedAt:0,accent:''});
  const gold=fieldEventModifiers({id:'goldenNight',name:'',description:'',duration:30,remaining:10,startedAt:0,accent:''});
  const elite=fieldEventModifiers({id:'eliteRush',name:'',description:'',duration:14,remaining:10,startedAt:0,accent:''});
  const directive=threatDirectiveAt(480);const dm=threatDirectiveModifiers(directive);
  return close(mana.cooldownMultiplier,.68)&&close(mana.spawnPressureMultiplier,1.5)&&close(gold.goldMultiplier,2)&&close(gold.eliteIntervalMultiplier,.72)&&close(elite.spawnPressureMultiplier,1.35)&&close(elite.eliteIntervalMultiplier,.42)
    &&objectiveDefinition('riftSeal').duration===34&&objectiveDefinition('beaconDefense').duration===28&&objectiveDefinition('cursedAltar').duration===22
    &&missionTargetForDanger('massacre',1)===45&&missionTargetForDanger('eliteHunt',11)===5&&missionTargetForDanger('goldRush',11)===900
    &&directive?.id==='swarmFront'&&threatDirectiveAt(600)?.id==='ironMarch'&&threatDirectiveAt(720)?.id==='artilleryLine'&&threatDirectiveAt(840)?.id==='hexConvoy'&&close(dm.spawnPressureMultiplier,1.18);
}
function fusionContractOk():boolean{return FUSION_IDS.length===6&&FUSION_IDS.every(id=>fusionDefinition(id).id===id&&buildIdentityIcon(id).id===id);}

export function auditHeroCombatVisualIdentityAssets():HeroCombatVisualIdentityAssetAudit{
  const meterAtlas=auditHeroMeterIdentityAtlas(),comboAtlas=auditArcaneComboIdentityAtlas();const samples:HeroCombatVisualIdentityAssetSample[]=[];const push=(caseId:string,passed:boolean)=>samples.push({caseId,passed});
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0;
  for(const id of HERO_METER_IDENTITY_IDS){const i=heroMeterIdentityIcon(id);push(`${id}:body`,i.sx>=0&&i.sy>=0&&i.sx+i.sw<=192&&i.sy+i.sh<=192);push(`${id}:hud`,i.hudIdentitySupported&&i.activeGlowSupported);push(`${id}:toast`,i.activationToastIdentitySupported);push(`${id}:safety`,!i.animated&&i.motionAmplitude===0&&i.textFallbackPreserved&&!i.loadFailureBlocksGameplay);textFallbackPreserved&&=i.textFallbackPreserved;imageLoadFailureNonBlocking&&=!i.loadFailureBlocksGameplay;iconMotionAmplitude=Math.max(iconMotionAmplitude,i.motionAmplitude);}
  for(const id of ARCANE_COMBO_IDENTITY_IDS){const i=arcaneComboIdentityIcon(id);push(`${id}:body`,i.sx>=0&&i.sy>=0&&i.sx+i.sw<=192&&i.sy+i.sh<=192);push(`${id}:hud`,i.hudIdentitySupported&&i.tierBadgeSupported);push(`${id}:toast`,i.tierToastIdentitySupported);push(`${id}:safety`,!i.animated&&i.motionAmplitude===0&&i.textFallbackPreserved&&!i.loadFailureBlocksGameplay);textFallbackPreserved&&=i.textFallbackPreserved;imageLoadFailureNonBlocking&&=!i.loadFailureBlocksGameplay;iconMotionAmplitude=Math.max(iconMotionAmplitude,i.motionAmplitude);}
  let tacticalToastCount=0;for(const id of TACTICAL_STATUS_ICON_IDS){const p=tacticalStatusIconPresentation(id),ok=p.visible&&!p.animated&&p.motionAmplitude===0;push(`tactical:${id}:toast`,ok);if(ok)tacticalToastCount++;}
  let fusionToastCount=0;for(const id of FUSION_IDS){const icon=buildIdentityIcon(id),ok=icon.id===id&&icon.textFallbackPreserved&&!icon.animated&&icon.motionAmplitude===0;push(`fusion:${id}:toast`,ok);if(ok)fusionToastCount++;}
  const meterOk=heroMeterContractOk(),comboOk=comboContractOk(),tacticalOk=tacticalContractOk(),fusionOk=fusionContractOk();
  push('contract:hero-meter',meterOk);push('contract:arcane-combo',comboOk);push('contract:tactical',tacticalOk);push('contract:fusion',fusionOk);push('contract:text-fallback',textFallbackPreserved);push('contract:image-nonblocking',imageLoadFailureNonBlocking);push('contract:actions-snapshot',ACTION_BUTTONS.length===9);
  const heroMeterCoverage=meterAtlas.coverage,arcaneComboCoverage=comboAtlas.coverage,tacticalToastCoverage=tacticalToastCount/TACTICAL_STATUS_ICON_IDS.length,fusionToastCoverage=fusionToastCount/FUSION_IDS.length;
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!meterAtlas.passed)issues.push('hero-meter-atlas');if(!comboAtlas.passed)issues.push('arcane-combo-atlas');if(tacticalToastCoverage!==1)issues.push('tactical-toast-coverage');if(fusionToastCoverage!==1)issues.push('fusion-toast-coverage');if(samples.some(s=>!s.passed))issues.push('sample-failure');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  return {samples,heroMeterCount:HERO_METER_IDENTITY_IDS.length,heroMeterCoverage,heroMeterUniqueCellCount:meterAtlas.uniqueCellCount,arcaneComboCount:ARCANE_COMBO_IDENTITY_IDS.length,arcaneComboCoverage,arcaneComboUniqueCellCount:comboAtlas.uniqueCellCount,tacticalToastCoverage,fusionToastCoverage,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,heroMeterContractMutation:!meterOk,comboContractMutation:!comboOk,tacticalContractMutation:!tacticalOk,fusionContractMutation:!fusionOk,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
