import { HERO_PROFILES } from './hero-profiles.js';
import type { SpellId } from './spells.js';
import { spellVfxDescriptor, ultimateChoreographyDescriptor } from './spell-vfx.js';
import { PRESENTATION_LAYER_ORDER } from './presentation-integration.js';
import { PresentationRuntime } from './presentation-runtime.js';
import { bossPhaseCinematicProfile, bossLifecycleCinematicProfile } from './boss-presentation.js';
import { cameraPressureProfile, killChainVfxProfile } from './combat-feedback.js';
import { mapEnvironmentVfxDescriptor, environmentDestructionVfxDescriptor } from './map-evolution.js';
import { enemyImpactVfxDescriptor, enemyDeathCue } from './enemy-presentation.js';
import { screenGlowProfile } from './presentation-runtime.js';
import { edgeThreatVfxProfile, deathAfterglowProfile, ultimateAftermathProfile, bossSettleProfile, createVfxQualityTransition, advanceVfxQualityTransition } from './visual-rhythm.js';
import { directionalHitVfxProfile, spellResidueProfile, bossHealthPressureProfile, mapAmbientDepthProfile, visualPriorityPolicy, hitApproachProfile, spellEchoContinuityProfile, bossPressureTransitionProfile, mapCombatReactionProfile, visualReadabilityBudget, directionalImpactRecoilProfile, spellEchoCadenceProfile, bossPressureEnvelope, mapAmbientFlowProfile, visualFocusBudget } from './visual-presence.js';

const SPELLS: SpellId[] = ['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];
const LEVELS = [1,5,10] as const;
export interface VisualEffectsAudit { samples:number; distinctSpellShapes:number; maxFlashAlpha:number; maxWaveCount:number; maxRayCount:number; lowQualityScreenCap:number; telegraphPrioritySafe:boolean; bossCinematicSamples:number; cameraPressureSamples:number; killChainTierSamples:number; mapEnvironmentSamples:number; advancedVisualEffectsPassed:boolean; enemySignatureSamples:number; ultimateChoreographySamples:number; bossLifecycleSamples:number; destructionSamples:number; screenGlowSamples:number; cinematicVisualEffectsPassed:boolean; visualRhythmSamples:number; visualRhythmPassed:boolean; visualPresenceSamples:number; visualPresencePassed:boolean; visualTimingSamples:number; visualTimingPassed:boolean; visualCoherenceSamples:number; visualCoherencePassed:boolean; passed:boolean; }
export function auditVisualEffectsSafety(): VisualEffectsAudit {
  let samples=0,maxFlashAlpha=0,maxWaveCount=0,maxRayCount=0;
  const shapes=new Set<string>();
  for(const hero of HERO_PROFILES) for(const spell of SPELLS) for(const level of LEVELS){
    const d=spellVfxDescriptor(hero.id,spell,level); samples++; shapes.add(d.shape); maxFlashAlpha=Math.max(maxFlashAlpha,d.flashAlpha); maxWaveCount=Math.max(maxWaveCount,d.waveCount); maxRayCount=Math.max(maxRayCount,d.rayCount);
  }
  const low=new PresentationRuntime('low');
  for(let i=0;i<8;i++) low.emitScreenEffect({kind:'shockwave',x:0,y:0,radius:20,color:'#fff',ttl:.2,alpha:.2});
  const screen=PRESENTATION_LAYER_ORDER.indexOf('screen-effects'), danger=PRESENTATION_LAYER_ORDER.indexOf('danger-telegraphs');
  const telegraphPrioritySafe=screen>=0&&danger>screen;
  const bossArchetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'] as const;
  const bossProfiles=bossArchetypes.flatMap((a)=>[bossPhaseCinematicProfile(a,2),bossPhaseCinematicProfile(a,3)]);
  const cameraKinds=['meteor','vortex','bossPhase2','bossPhase3','killChain'] as const;
  const cameraProfiles=cameraKinds.map(cameraPressureProfile);
  const killProfiles=([1,2,3] as const).map(killChainVfxProfile);
  const maps=['ruinedGate','frozenFen','crystalQuarry'] as const;
  const mapProfiles=maps.flatMap((m)=>([0,1,2] as const).map((stage)=>mapEnvironmentVfxDescriptor(m,stage,'high')));
  const advancedVisualEffectsPassed=
    new Set(bossProfiles.map((p)=>p.motif)).size===6&&bossProfiles.every((p)=>p.shockwaveCount<=3&&p.edgePulseAlpha<=0.34&&p.vignetteAlpha<=0.28)&&
    cameraProfiles.every((p)=>Math.abs(p.scaleOffset)<=0.03&&p.duration<=0.34)&&
    killProfiles.every((p)=>p.rayCount<=12&&p.pulseAlpha<=0.24&&p.shake<=5.5)&&
    new Set(mapProfiles.map((p)=>p.motif)).size===3&&mapProfiles.every((p)=>p.particlesPerSecond<=10);
  const enemyTypes=['grunt','hound','brute','archer','bomber','shaman','shieldbearer','assassin','siegeGolem','nullifier','golden','elite','boss'] as const;
  const enemyProfiles=enemyTypes.map((type)=>({hit:enemyImpactVfxDescriptor(type,'heavy'),death:enemyDeathCue(type)}));
  const ultimateProfiles=(['meteorStorm','blackHole'] as const).flatMap((spell)=>[1,5,10].map((level)=>ultimateChoreographyDescriptor(spell,level)));
  const bossLifecycle=bossArchetypes.flatMap((a)=>[bossLifecycleCinematicProfile(a,'entrance'),bossLifecycleCinematicProfile(a,'death')]);
  const destruction=maps.flatMap((m)=>([0,1,2] as const).map((stage)=>environmentDestructionVfxDescriptor(m,'evolutionCollapse',stage,'high'))).concat(maps.map((m)=>environmentDestructionVfxDescriptor(m,'crystalBlast',2,'high')));
  const glowKinds=['impact','ultimate','boss','environment'] as const; const glowProfiles=glowKinds.flatMap((kind)=>(['high','medium','low'] as const).map((q)=>screenGlowProfile(kind,q,false)));
  const edgeRhythm=(['watch','danger','critical'] as const).flatMap((level)=>(['hero','core'] as const).map((target)=>edgeThreatVfxProfile(level,target)));
  const deathRhythm=enemyTypes.flatMap((type)=>(['high','medium','low'] as const).map((q)=>deathAfterglowProfile(type,q)));
  const aftermathRhythm=(['meteorStorm','blackHole'] as const).flatMap((spell)=>[1,5,10].flatMap((level)=>(['high','medium','low'] as const).map((q)=>ultimateAftermathProfile(spell,level,q))));
  const settleRhythm=bossArchetypes.flatMap((boss)=>(['high','medium','low'] as const).map((q)=>bossSettleProfile(boss,q)));
  let transition=createVfxQualityTransition('low'); transition=advanceVfxQualityTransition(transition,'high',1.21); transition=advanceVfxQualityTransition(transition,'high',1.21);
  const visualRhythmSamples=edgeRhythm.length+deathRhythm.length+aftermathRhythm.length+settleRhythm.length+2;
  const visualRhythmPassed=edgeRhythm.every((p)=>p.alpha<=.24&&p.segmentCount<=3)&&deathRhythm.every((p)=>p.alpha<=.22&&p.radius<=210)&&aftermathRhythm.every((p)=>p.alpha<=.24&&p.ringCount<=4&&p.particleCount<=12&&p.ttl<=.65)&&settleRhythm.every((p)=>p.alpha<=.18&&p.rayCount<=8&&p.ttl<=.8)&&transition.current==='high';
  const cinematicVisualEffectsPassed=new Set(enemyProfiles.map((p)=>p.hit.motif)).size>=8&&enemyProfiles.every((p)=>p.hit.rayCount<=10&&p.hit.glowAlpha<=.32&&p.death.rayCount<=12&&p.death.glowAlpha<=.34)&&ultimateProfiles.every((p)=>p.trailCount<=10&&p.ringCount<=5&&p.glowAlpha<=.36)&&new Set(bossLifecycle.map((p)=>p.motif)).size===6&&bossLifecycle.every((p)=>p.shockwaveCount<=4&&p.rayCount<=16&&p.flashAlpha<=.36)&&destruction.every((p)=>p.debrisCount<=18&&p.waveCount<=3&&p.glowAlpha<=.30)&&glowProfiles.every((p)=>p.alpha<=.36&&p.radius<=260);
  const qualities=['high','medium','low'] as const;
  const directionalPresence=(['normal','heavy','critical'] as const).flatMap((tier)=>qualities.map((q)=>directionalHitVfxProfile(tier,q)));
  const residuePresence=SPELLS.flatMap((spell)=>LEVELS.flatMap((level)=>qualities.map((q)=>spellResidueProfile(spell,level,q,false))));
  const bossPresence=bossArchetypes.flatMap((boss)=>[.8,.45,.18].flatMap((ratio)=>qualities.map((q)=>bossHealthPressureProfile(boss,ratio,q,false))));
  const ambientPresence=maps.flatMap((map)=>([0,1,2] as const).flatMap((stage)=>qualities.map((q)=>mapAmbientDepthProfile(map,stage,q,false))));
  const priorityPresence=qualities.flatMap((q)=>[false,true].map((critical)=>visualPriorityPolicy(q,critical)));
  const visualPresenceSamples=directionalPresence.length+residuePresence.length+bossPresence.length+ambientPresence.length+priorityPresence.length;
  const visualPresencePassed=directionalPresence.every((p)=>p.streakCount<=6&&p.alpha<=.26&&p.length<=52&&p.ttl<=.28)&&residuePresence.every((p)=>p.count<=8&&p.alpha<=.20&&p.ttl<=.72)&&new Set(SPELLS.map((spell)=>spellResidueProfile(spell,10,'high',false).motion)).size===6&&bossPresence.every((p)=>p.edgeAlpha<=.16&&p.glowAlpha<=.12)&&ambientPresence.every((p)=>p.layers<=3&&p.particlesPerSecond<=10)&&priorityPresence.every((p)=>p.impactScale===1&&p.telegraphScale===1&&p.environmentScale>=.15&&p.spellResidueScale>=.15);
  const hitTiming=(['normal','heavy','critical'] as const).flatMap((tier)=>qualities.flatMap((q)=>[12,80,240].map((distance)=>hitApproachProfile({x:0,y:0},{x:distance,y:0},tier,q))));
  const echoTiming=SPELLS.flatMap((spell)=>LEVELS.flatMap((level)=>qualities.map((q)=>spellEchoContinuityProfile(spell,level,q,false))));
  const bossTiming=bossArchetypes.flatMap((boss)=>qualities.flatMap((q)=>[bossPressureTransitionProfile(boss,.62,.52,q,false),bossPressureTransitionProfile(boss,.31,.23,q,false)].filter(Boolean)));
  const reactionTiming=maps.flatMap((map)=>SPELLS.flatMap((spell)=>qualities.map((q)=>mapCombatReactionProfile(map,spell,q,false))));
  const readabilityTiming=qualities.flatMap((q)=>(['normal','danger','critical'] as const).map((threat)=>visualReadabilityBudget(q,threat)));
  const visualTimingSamples=hitTiming.length+echoTiming.length+bossTiming.length+reactionTiming.length+readabilityTiming.length;
  const visualTimingPassed=hitTiming.every((p)=>p.tailScale<=1.18&&p.spread<=7&&p.alphaScale<=1)&&echoTiming.every((p)=>p.echoCount<=5&&p.alpha<=.18&&p.ttl<=.34&&p.length<=96)&&bossTiming.every((p)=>p&&p.alpha<=.18&&p.rayCount<=8&&p.ttl<=.38&&p.radius<=190)&&reactionTiming.every((p)=>p.particleCount<=6&&p.alpha<=.18&&p.ttl<=.48&&p.speed<=92)&&readabilityTiming.every((p)=>p.telegraphScale===1&&p.impactScale===1&&p.hitDirectionScale===1&&p.environmentReactionScale>=.15&&p.spellEchoScale>=.15&&p.bossPressureScale>=.22);
  const recoilCoherence=(['normal','heavy','critical'] as const).flatMap((tier)=>qualities.flatMap((q)=>[18,86,260].map((distance)=>directionalImpactRecoilProfile({x:0,y:0},{x:distance,y:0},tier,q))));
  const cadenceCoherence=SPELLS.flatMap((spell)=>LEVELS.flatMap((level)=>qualities.map((q)=>spellEchoCadenceProfile(spell,level,q,false))));
  const bossCoherence=bossArchetypes.flatMap((boss)=>[.8,.45,.18].flatMap((ratio)=>qualities.map((q)=>bossPressureEnvelope(boss,ratio,1.37,q,false))));
  const flowCoherence=maps.flatMap((map)=>([0,1,2] as const).flatMap((stage)=>[false,true].map((critical)=>mapAmbientFlowProfile(map,stage,1.71,critical))));
  const focusCoherence=qualities.flatMap((q)=>(['normal','danger','critical'] as const).flatMap((threat)=>(['none','strained','desperate'] as const).map((boss)=>visualFocusBudget(q,threat,boss))));
  const visualCoherenceSamples=recoilCoherence.length+cadenceCoherence.length+bossCoherence.length+flowCoherence.length+focusCoherence.length;
  const visualCoherencePassed=recoilCoherence.every((p)=>p.magnitude<=3&&p.duration<=.16&&Math.abs(p.offset.x)<=3&&Math.abs(p.offset.y)<=3)&&new Set(SPELLS.map((spell)=>spellEchoCadenceProfile(spell,10,'high',false).cadence)).size===6&&cadenceCoherence.every((p)=>p.delayStep<=.055&&p.alphaScales.length<=5&&p.alphaScales.every((v)=>v>=.34&&v<=1)&&p.ttlScales.every((v)=>v>=.55&&v<=1))&&bossCoherence.every((p)=>p.edgeScale>=.68&&p.edgeScale<=1&&p.glowScale>=.62&&p.glowScale<=1&&p.lineWidthScale>=.9&&p.lineWidthScale<=1.12)&&new Set(maps.map((map)=>mapAmbientFlowProfile(map,2,1.71,false).flow)).size===3&&flowCoherence.every((p)=>p.speedScale<=1.15&&p.turbulence<=.28&&p.depthScale<=1.18&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1)&&focusCoherence.every((p)=>p.telegraphScale===1&&p.impactScale===1&&p.hitDirectionScale===1&&p.environmentScale>=.15&&p.spellEchoScale>=.15&&p.bossPressureScale>=.25&&p.screenEffectCap>=1&&p.screenEffectCap<=4);
  const passed=samples===72&&shapes.size===6&&maxFlashAlpha<=0.44&&maxWaveCount<=4&&maxRayCount<=16&&low.screenEffectCount<=2&&telegraphPrioritySafe&&advancedVisualEffectsPassed&&cinematicVisualEffectsPassed&&visualRhythmPassed&&visualPresencePassed&&visualTimingPassed&&visualCoherencePassed;
  return{samples,distinctSpellShapes:shapes.size,maxFlashAlpha,maxWaveCount,maxRayCount,lowQualityScreenCap:low.screenEffectCount,telegraphPrioritySafe,bossCinematicSamples:bossProfiles.length,cameraPressureSamples:cameraProfiles.length,killChainTierSamples:killProfiles.length,mapEnvironmentSamples:mapProfiles.length,advancedVisualEffectsPassed,enemySignatureSamples:enemyProfiles.length,ultimateChoreographySamples:ultimateProfiles.length,bossLifecycleSamples:bossLifecycle.length,destructionSamples:destruction.length,screenGlowSamples:glowProfiles.length,cinematicVisualEffectsPassed,visualRhythmSamples,visualRhythmPassed,visualPresenceSamples,visualPresencePassed,visualTimingSamples,visualTimingPassed,visualCoherenceSamples,visualCoherencePassed,passed};
}
