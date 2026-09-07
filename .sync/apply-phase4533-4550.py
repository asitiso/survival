from pathlib import Path

identity = Path('src/game/elite-affix-identity-assets.ts')
s = identity.read_text()
marker = "export type SwiftCadencePhase = 'approach' | 'ready' | 'strike' | 'recovery';"
assert 'export function eliteAffixDensePresentation' not in s
block = """export interface EliteAffixDensePresentationInput {
  role: EliteAffixOwnershipRole;
  indexFromPriority: number;
  battlefieldStress: number;
  coreNear: boolean;
  recentlyHit: boolean;
  currentlyAttacking: boolean;
  higherPriorityCue: boolean;
  reducedMotion: boolean;
  reducedFlash: boolean;
}
export interface EliteAffixDensePresentation { visible: boolean; alphaScale: number; motionScale: number; }
export function eliteAffixDensePresentation(input: EliteAffixDensePresentationInput): EliteAffixDensePresentation {
  const stress = clamp(Number.isFinite(input.battlefieldStress) ? input.battlefieldStress : 0, 0, 1);
  const priority = input.role === 'primary';
  const protectedSecondary = input.coreNear || input.recentlyHit || input.currentlyAttacking;
  const capacity = Math.max(1, Math.round(4 - stress * 3));
  let visible = priority || protectedSecondary || Math.max(0, input.indexFromPriority) < capacity;
  if (input.higherPriorityCue && !priority && !protectedSecondary) visible = false;
  let alphaScale = 0;
  if (visible) {
    alphaScale = priority ? Math.max(0.56, 0.92 * (1 - stress * 0.28)) : Math.max(0.24, 0.46 * (1 - stress * 0.48));
    if (protectedSecondary) alphaScale = Math.max(alphaScale, priority ? 0.62 : 0.34);
    if (input.higherPriorityCue) alphaScale *= priority ? 0.38 : 0.28;
    if (input.reducedFlash) alphaScale *= 0.62;
  }
  return { visible, alphaScale, motionScale: input.reducedMotion ? 0 : visible ? (priority ? 1 : 0.42) : 0 };
}

"""
identity.write_text(s.replace(marker, block + marker))

enemies = Path('src/game/enemies.ts')
e = enemies.read_text()
old_import = "import { advanceFrenziedThresholdLifecycle, advanceSwiftCadenceLifecycle, eliteAffixIdentityEmphasis, eliteAffixIdentityIcon, eliteAffixIdentityRowLayout, frenziedThresholdDensityPresentation, frenziedThresholdPresentation, swiftCadenceDensityPresentation, swiftCadencePresentation, swiftStrikeOwnershipPresentation, type FrenziedThresholdLifecycleState, type SwiftCadenceLifecycleState } from './elite-affix-identity-assets.js';"
new_import = "import { advanceEliteAffixPresentationOwner, advanceFrenziedThresholdLifecycle, advanceSwiftCadenceLifecycle, eliteAffixDensePresentation, eliteAffixIdentityEmphasis, eliteAffixIdentityIcon, eliteAffixIdentityRowLayout, frenziedThresholdDensityPresentation, frenziedThresholdPresentation, swiftCadenceDensityPresentation, swiftCadencePresentation, swiftStrikeOwnershipPresentation, type EliteAffixCueCandidate, type EliteAffixPresentationOwnerState, type FrenziedThresholdLifecycleState, type SwiftCadenceLifecycleState } from './elite-affix-identity-assets.js';"
assert old_import in e
e = e.replace(old_import, new_import, 1)

field = "  swiftCadencePresentation?: SwiftCadenceLifecycleState | undefined;"
assert field in e and 'eliteAffixPresentationOwner?:' not in e
e = e.replace(field, field + "\n  eliteAffixPresentationOwner?: EliteAffixPresentationOwnerState | undefined;", 1)

swift_tick = "      if(enemy.eliteAffixes?.includes('swift')) enemy.swiftCadencePresentation=advanceSwiftCadenceLifecycle(enemy.swiftCadencePresentation,{inAttackRange:dist<=contact,attackTimer:enemy.attackTimer,attackInterval:enemy.attackInterval,struck:false,dt});"
assert swift_tick in e
owner_tick = """
      if ((enemy.eliteAffixes?.length ?? 0) > 1) {
        const ownershipCandidates: EliteAffixCueCandidate[] = enemy.eliteAffixes!.map((id) => ({ id, reason: 'passive' }));
        for (const cue of this.eliteAffixResponseVfx) if (cue.enemyId === enemy.id && cue.ttl > 0) ownershipCandidates.push({ id: cue.affixId, reason: 'response' });
        if (enemy.frenziedPresentation?.phase === 'entered') ownershipCandidates.push({ id: 'frenzied', reason: 'threshold-enter' });
        if (enemy.swiftCadencePresentation?.phase === 'strike') ownershipCandidates.push({ id: 'swift', reason: 'actual-strike' });
        enemy.eliteAffixPresentationOwner = advanceEliteAffixPresentationOwner(enemy.eliteAffixPresentationOwner, ownershipCandidates, dt);
      }
"""
e = e.replace(swift_tick, swift_tick + owner_tick, 1)

swift_strike = "        if (enemy.eliteAffixes?.includes('swift')) { enemy.swiftCadencePresentation=advanceSwiftCadenceLifecycle(enemy.swiftCadencePresentation,{inAttackRange:true,attackTimer:enemy.attackTimer,attackInterval:enemy.attackInterval,struck:true,dt:0}); this.queueEliteAffixResponseVfx(enemy,'swift',targetObj.pos); }"
assert swift_strike in e
swift_strike_new = "        if (enemy.eliteAffixes?.includes('swift')) { enemy.swiftCadencePresentation=advanceSwiftCadenceLifecycle(enemy.swiftCadencePresentation,{inAttackRange:true,attackTimer:enemy.attackTimer,attackInterval:enemy.attackInterval,struck:true,dt:0}); if((enemy.eliteAffixes?.length??0)>1)enemy.eliteAffixPresentationOwner=advanceEliteAffixPresentationOwner(enemy.eliteAffixPresentationOwner,[{id:'swift',reason:'actual-strike'}],0); this.queueEliteAffixResponseVfx(enemy,'swift',targetObj.pos); }"
e = e.replace(swift_strike, swift_strike_new, 1)

defense_line = "    this.feedback?.addDefenseResponse?.(enemy.pos,defenseResponse,source);"
assert defense_line in e
e = e.replace(defense_line, "    if(defenseResponse.shieldBroken&&enemy.eliteAffixes?.includes('manaShield')&&(enemy.eliteAffixes?.length??0)>1)enemy.eliteAffixPresentationOwner=advanceEliteAffixPresentationOwner(enemy.eliteAffixPresentationOwner,[{id:'manaShield',reason:'shield-break'}],0);\n" + defense_line, 1)

elite_block = "      if (enemy.type === 'elite' && enemy.eliteAffixes?.length) {\n        if (eliteAffixLifecycleVfxAtlasReady && eliteAffixLifecycleVfxAtlasImage) {"
assert elite_block in e
dense_prelude = """      if (enemy.type === 'elite' && enemy.eliteAffixes?.length) {
        const multiAffixDense=(affixId:EliteAffixId,indexFromPriority:number,currentlyAttacking=false)=>{
          const ownerId=enemy.eliteAffixPresentationOwner?.ownerId;
          const role=enemy.eliteAffixes!.length<2||!ownerId||ownerId===affixId?'primary' as const:'secondary' as const;
          return eliteAffixDensePresentation({role,indexFromPriority,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),coreNear:enemy.target==='core'||targetDistance<=120,recentlyHit:enemy.hitFlash>0,currentlyAttacking,higherPriorityCue:hazardPressure>=.72,reducedMotion,reducedFlash});
        };
        if (eliteAffixLifecycleVfxAtlasReady && eliteAffixLifecycleVfxAtlasImage) {"""
e = e.replace(elite_block, dense_prelude, 1)

lifecycle = "            const activeSprite = eliteAffixLifecycleVfxSprite(affixId,'active');\n            const size = enemy.radius * (index === 0 ? 2.9 : 2.45);\n            ctx.save(); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)); ctx.globalAlpha = reducedFlash ? 0.26 : 0.42;"
assert lifecycle in e
lifecycle_new = "            const activeSprite = eliteAffixLifecycleVfxSprite(affixId,'active');\n            const size = enemy.radius * (index === 0 ? 2.9 : 2.45);\n            const dense=multiAffixDense(affixId,index,affixId==='swift'&&enemy.swiftCadencePresentation?.phase==='strike');\n            if(!dense.visible)continue;\n            ctx.save(); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)); ctx.globalAlpha = (reducedFlash ? 0.26 : 0.42)*dense.alphaScale;"
e = e.replace(lifecycle, lifecycle_new, 1)

swift_render = "          const swift=swiftCadencePresentation(enemy.swiftCadencePresentation,reducedMotion,reducedFlash),swiftPriorityTarget=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0||enemy.swiftCadencePresentation?.phase==='strike',swiftDensity=swiftCadenceDensityPresentation(enemy.swiftCadencePresentation,{activeCount:activeSwift.length,indexFromPriority:swiftPriorityRank.get(enemy)??activeSwift.length,priorityTarget:swiftPriorityTarget,higherPriorityCue:hazardPressure>=.72,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash});\n          if(swift.alpha>0&&swiftDensity.visible){const mag=Math.max(1,targetDistance),nx=targetDx/mag,ny=targetDy/mag,start=enemy.radius+8,end=start+swift.chevronLength*(.8+.2*swiftDensity.motionScale),perpX=-ny,perpY=nx,wing=4;ctx.save();ctx.globalAlpha=swift.alpha*swiftDensity.alphaScale;"
assert swift_render in e
swift_render_new = "          const swift=swiftCadencePresentation(enemy.swiftCadencePresentation,reducedMotion,reducedFlash),swiftPriorityTarget=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0||enemy.swiftCadencePresentation?.phase==='strike',swiftDensity=swiftCadenceDensityPresentation(enemy.swiftCadencePresentation,{activeCount:activeSwift.length,indexFromPriority:swiftPriorityRank.get(enemy)??activeSwift.length,priorityTarget:swiftPriorityTarget,higherPriorityCue:hazardPressure>=.72,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash}),swiftMultiDense=multiAffixDense('swift',swiftPriorityRank.get(enemy)??activeSwift.length,enemy.swiftCadencePresentation?.phase==='strike');\n          if(swift.alpha>0&&swiftDensity.visible&&swiftMultiDense.visible){const mag=Math.max(1,targetDistance),nx=targetDx/mag,ny=targetDy/mag,start=enemy.radius+8,end=start+swift.chevronLength*(.8+.2*swiftDensity.motionScale),perpX=-ny,perpY=nx,wing=4;ctx.save();ctx.globalAlpha=swift.alpha*swiftDensity.alphaScale*swiftMultiDense.alphaScale;"
e = e.replace(swift_render, swift_render_new, 1)

frenzy_render = "          const frenzy=frenziedThresholdPresentation(enemy.frenziedPresentation,reducedMotion,reducedFlash),frenzyPriority=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0,frenzyDensity=frenziedThresholdDensityPresentation(enemy.frenziedPresentation,{activeCount:activeFrenzied.length,indexFromPriority:frenziedPriorityRank.get(enemy)??activeFrenzied.length,priorityTarget:frenzyPriority,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash});\n          if(frenzy.alpha>0&&frenzyDensity.visible){const hpRatio=enemy.hp/Math.max(1,enemy.maxHp),pulse=Math.sin((1-hpRatio)*Math.PI*4)*frenzy.pulse*frenzyDensity.pulseScale;ctx.save();ctx.globalAlpha=frenzy.alpha*frenzyDensity.alphaScale;"
assert frenzy_render in e
frenzy_render_new = "          const frenzy=frenziedThresholdPresentation(enemy.frenziedPresentation,reducedMotion,reducedFlash),frenzyPriority=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0,frenzyDensity=frenziedThresholdDensityPresentation(enemy.frenziedPresentation,{activeCount:activeFrenzied.length,indexFromPriority:frenziedPriorityRank.get(enemy)??activeFrenzied.length,priorityTarget:frenzyPriority,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash}),frenzyMultiDense=multiAffixDense('frenzied',frenziedPriorityRank.get(enemy)??activeFrenzied.length,false);\n          if(frenzy.alpha>0&&frenzyDensity.visible&&frenzyMultiDense.visible){const hpRatio=enemy.hp/Math.max(1,enemy.maxHp),pulse=Math.sin((1-hpRatio)*Math.PI*4)*frenzy.pulse*frenzyDensity.pulseScale;ctx.save();ctx.globalAlpha=frenzy.alpha*frenzyDensity.alphaScale*frenzyMultiDense.alphaScale;"
e = e.replace(frenzy_render, frenzy_render_new, 1)

enemies.write_text(e)
