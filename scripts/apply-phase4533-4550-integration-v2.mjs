import { readFile, writeFile } from 'node:fs/promises';

const path = 'src/game/enemies.ts';
let source = await readFile(path, 'utf8');

function replaceOnce(label, needle, replacement) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  source = source.replace(needle, replacement);
}

function insertAfterOnce(label, needle, insertion) {
  replaceOnce(label, needle, `${needle}${insertion}`);
}

if (source.includes("from './elite-affix-cue-arbitration.js';")) {
  console.log('Phase 4533-4550 EnemyManager integration already applied.');
  process.exit(0);
}

insertAfterOnce(
  'arbitration import',
  "from './elite-affix-identity-assets.js';\n",
  "import { advanceEliteAffixCueOwnership, eliteAffixCueLayerPresentation, type EliteAffixCueEventKind, type EliteAffixCueOwnershipState } from './elite-affix-cue-arbitration.js';\n",
);
replaceOnce(
  'Enemy ownership state',
  '  swiftCadencePresentation?: SwiftCadenceLifecycleState | undefined;\n  manaShield: number;',
  '  swiftCadencePresentation?: SwiftCadenceLifecycleState | undefined;\n  eliteAffixCueOwnership?: EliteAffixCueOwnershipState | undefined;\n  manaShield: number;',
);
insertAfterOnce(
  'per-frame ownership progression',
  "      if(enemy.eliteAffixes?.includes('swift')) enemy.swiftCadencePresentation=advanceSwiftCadenceLifecycle(enemy.swiftCadencePresentation,{inAttackRange:dist<=contact,attackTimer:enemy.attackTimer,attackInterval:enemy.attackInterval,struck:false,dt});\n",
  "      if(enemy.type==='elite'&&enemy.eliteAffixes?.length) enemy.eliteAffixCueOwnership=advanceEliteAffixCueOwnership(enemy.eliteAffixCueOwnership,{affixes:enemy.eliteAffixes,dt,swiftPhase:enemy.swiftCadencePresentation?.phase,frenziedPhase:enemy.frenziedPresentation?.phase,manaShieldActive:(enemy.manaShield??0)>0,regeneratingActive:(enemy.regenPerSecondRatio??0)>0&&enemy.hp<enemy.maxHp,commanderActive:(enemy.commandAuraMultiplier??1)>1,armoredActive:enemy.eliteAffixes.includes('armored')});\n",
);
replaceOnce(
  'Swift strike event',
  "this.queueEliteAffixResponseVfx(enemy,'swift',targetObj.pos);",
  "this.queueEliteAffixResponseVfx(enemy,'swift','strike',targetObj.pos);",
);
replaceOnce(
  'Mana Shield break event',
  "if (absorbed > 0 && enemy.eliteAffixes?.includes('manaShield')) this.queueEliteAffixResponseVfx(enemy,'manaShield');",
  "if (absorbed > 0 && enemy.eliteAffixes?.includes('manaShield')) { if (shieldBeforeDamage > 0 && (enemy.manaShield ?? 0) <= 0) this.queueEliteAffixResponseVfx(enemy,'manaShield','shieldBreak'); else this.queueEliteAffixResponseVfx(enemy,'manaShield'); }",
);
replaceOnce(
  'Frenzied threshold event',
  "if (hpRatioBeforeDamage > 0.42 && enemy.hp / Math.max(1, enemy.maxHp) <= 0.42 && enemy.eliteAffixes?.includes('frenzied')) this.queueEliteAffixResponseVfx(enemy,'frenzied');",
  "if (hpRatioBeforeDamage > 0.42 && enemy.hp / Math.max(1, enemy.maxHp) <= 0.42 && enemy.eliteAffixes?.includes('frenzied')) this.queueEliteAffixResponseVfx(enemy,'frenzied','thresholdEntry');",
);
insertAfterOnce(
  'affix priority ranking',
  "    const swiftPriorityRank=new Map(swiftPriority.map((enemy,index)=>[enemy,index]));\n",
  "    const activeAffixElites=this.enemies.filter((enemy)=>enemy.type==='elite'&&Boolean(enemy.eliteAffixes?.length));\n    const eliteAffixCuePriority=[...activeAffixElites].sort((a,b)=>{const score=(enemy:Enemy)=>{const target=enemy.target==='core'?corePos:heroPos;const d=target?distance(enemy.pos,target):9999;const activeAttack=enemy.swiftCadencePresentation?.phase==='strike'||(enemy.attackResolveMotion?.resolve??0)>.12||(enemy.attackTimer>0&&enemy.attackTimer<=Math.min(.18,enemy.attackInterval*.3));return (enemy.target==='core'?5:0)+(d<=120?4:0)+(enemy.hitFlash>0?3:0)+(activeAttack?2:0);};return score(b)-score(a);});\n    const eliteAffixCuePriorityRank=new Map(eliteAffixCuePriority.map((enemy,index)=>[enemy,index]));\n    const eliteAffixBattlefieldStress=Math.max(Math.max(0,Math.min(1,hazardPressure)),Math.min(1,Math.max(0,activeAffixElites.length-3)/5));\n    const eliteAffixLayerFor=(enemy:Enemy,affixId:EliteAffixId)=>{const target=enemy.target==='core'?corePos:heroPos;const d=target?distance(enemy.pos,target):9999;const activeAttack=enemy.swiftCadencePresentation?.phase==='strike'||(enemy.attackResolveMotion?.resolve??0)>.12||(enemy.attackTimer>0&&enemy.attackTimer<=Math.min(.18,enemy.attackInterval*.3));return eliteAffixCueLayerPresentation(enemy.eliteAffixCueOwnership,affixId,{activeEliteCount:activeAffixElites.length,indexFromPriority:eliteAffixCuePriorityRank.get(enemy)??activeAffixElites.length,priorityTarget:enemy.target==='core'||d<=120||enemy.hitFlash>0,activeAttack,higherPriorityCue:hazardPressure>=.72,battlefieldStress:eliteAffixBattlefieldStress,reducedMotion,reducedFlash});};\n",
);

replaceOnce(
  'active affix lifecycle layer',
  "const affixId = enemy.eliteAffixes[index]!;\n            const activeSprite = eliteAffixLifecycleVfxSprite(affixId,'active');\n            const size = enemy.radius * (index === 0 ? 2.9 : 2.45);\n            ctx.save(); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)); ctx.globalAlpha = reducedFlash ? 0.26 : 0.42;\n            ctx.drawImage(eliteAffixLifecycleVfxAtlasImage, activeSprite.sx, activeSprite.sy, activeSprite.sw, activeSprite.sh, -size / 2, -size / 2, size, size);\n            ctx.restore();",
  "const affixId = enemy.eliteAffixes[index]!;\n            const affixLayer=eliteAffixLayerFor(enemy,affixId);\n            if(!affixLayer.visible) continue;\n            const activeSprite = eliteAffixLifecycleVfxSprite(affixId,'active');\n            const size = enemy.radius * (index === 0 ? 2.9 : 2.45);\n            ctx.save(); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)*affixLayer.motionScale); ctx.globalAlpha = (reducedFlash ? 0.26 : 0.42)*affixLayer.alphaScale;\n            ctx.drawImage(eliteAffixLifecycleVfxAtlasImage, activeSprite.sx, activeSprite.sy, activeSprite.sw, activeSprite.sh, -size / 2, -size / 2, size, size);\n            ctx.restore();",
);
replaceOnce(
  'Swift layer declaration',
  "const swift=swiftCadencePresentation(enemy.swiftCadencePresentation,reducedMotion,reducedFlash),swiftPriorityTarget=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0||enemy.swiftCadencePresentation?.phase==='strike',swiftDensity=swiftCadenceDensityPresentation(enemy.swiftCadencePresentation,{activeCount:activeSwift.length,indexFromPriority:swiftPriorityRank.get(enemy)??activeSwift.length,priorityTarget:swiftPriorityTarget,higherPriorityCue:hazardPressure>=.72,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash});",
  "const swift=swiftCadencePresentation(enemy.swiftCadencePresentation,reducedMotion,reducedFlash),swiftPriorityTarget=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0||enemy.swiftCadencePresentation?.phase==='strike',swiftDensity=swiftCadenceDensityPresentation(enemy.swiftCadencePresentation,{activeCount:activeSwift.length,indexFromPriority:swiftPriorityRank.get(enemy)??activeSwift.length,priorityTarget:swiftPriorityTarget,higherPriorityCue:hazardPressure>=.72,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash}),swiftLayer=eliteAffixLayerFor(enemy,'swift');",
);
replaceOnce('Swift layer visibility', 'if(swift.alpha>0&&swiftDensity.visible){', 'if(swift.alpha>0&&swiftDensity.visible&&swiftLayer.visible){');
replaceOnce('Swift layer motion', 'swift.chevronLength*(.8+.2*swiftDensity.motionScale)', 'swift.chevronLength*(.8+.2*swiftDensity.motionScale*swiftLayer.motionScale)');
replaceOnce('Swift layer alpha', 'ctx.globalAlpha=swift.alpha*swiftDensity.alphaScale;', 'ctx.globalAlpha=swift.alpha*swiftDensity.alphaScale*swiftLayer.alphaScale;');
replaceOnce(
  'Frenzied layer declaration',
  "const frenzy=frenziedThresholdPresentation(enemy.frenziedPresentation,reducedMotion,reducedFlash),frenzyPriority=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0,frenzyDensity=frenziedThresholdDensityPresentation(enemy.frenziedPresentation,{activeCount:activeFrenzied.length,indexFromPriority:frenziedPriorityRank.get(enemy)??activeFrenzied.length,priorityTarget:frenzyPriority,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash});",
  "const frenzy=frenziedThresholdPresentation(enemy.frenziedPresentation,reducedMotion,reducedFlash),frenzyPriority=enemy.target==='core'||targetDistance<=120||enemy.hitFlash>0,frenzyDensity=frenziedThresholdDensityPresentation(enemy.frenziedPresentation,{activeCount:activeFrenzied.length,indexFromPriority:frenziedPriorityRank.get(enemy)??activeFrenzied.length,priorityTarget:frenzyPriority,battlefieldStress:Math.max(0,Math.min(1,hazardPressure)),reducedMotion,reducedFlash}),frenzyLayer=eliteAffixLayerFor(enemy,'frenzied');",
);
replaceOnce('Frenzied layer visibility', 'if(frenzy.alpha>0&&frenzyDensity.visible){', 'if(frenzy.alpha>0&&frenzyDensity.visible&&frenzyLayer.visible){');
replaceOnce('Frenzied layer motion', 'frenzy.pulse*frenzyDensity.pulseScale;', 'frenzy.pulse*frenzyDensity.pulseScale*frenzyLayer.motionScale;');
replaceOnce('Frenzied layer alpha', 'ctx.globalAlpha=frenzy.alpha*frenzyDensity.alphaScale;', 'ctx.globalAlpha=frenzy.alpha*frenzyDensity.alphaScale*frenzyLayer.alphaScale;');
replaceOnce(
  'Mana Shield layer',
  "if (enemy.maxManaShield > 0 && enemy.manaShield > 0) {\n          ctx.strokeStyle = 'rgba(139,186,255,.82)'; ctx.lineWidth = 3;\n          ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * enemy.manaShield / enemy.maxManaShield); ctx.stroke();\n        }",
  "if (enemy.maxManaShield > 0 && enemy.manaShield > 0) {\n          const manaShieldLayer=eliteAffixLayerFor(enemy,'manaShield');\n          if(manaShieldLayer.visible){ctx.save();ctx.globalAlpha=manaShieldLayer.alphaScale;ctx.strokeStyle = 'rgba(139,186,255,.82)'; ctx.lineWidth = 3;\n          ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * enemy.manaShield / enemy.maxManaShield); ctx.stroke();ctx.restore();}\n        }",
);
replaceOnce(
  'response layer setup',
  "for (const cue of this.eliteAffixResponseVfx) {\n        const sprite = eliteAffixLifecycleVfxSprite(cue.affixId,'response');",
  "for (const cue of this.eliteAffixResponseVfx) {\n        const sourceEnemy=this.enemies.find((candidate)=>candidate.id===cue.enemyId);\n        const responseLayer=sourceEnemy?eliteAffixLayerFor(sourceEnemy,cue.affixId):eliteAffixCueLayerPresentation(undefined,cue.affixId,{activeEliteCount:activeAffixElites.length,indexFromPriority:activeAffixElites.length,priorityTarget:false,activeAttack:false,higherPriorityCue:hazardPressure>=.72,battlefieldStress:eliteAffixBattlefieldStress,reducedMotion,reducedFlash});\n        if(!responseLayer.visible) continue;\n        const sprite = eliteAffixLifecycleVfxSprite(cue.affixId,'response');",
);
replaceOnce('response layer alpha', 'ctx.save(); ctx.globalAlpha = Math.min(reducedFlash ? 0.48 : 0.88, t);', 'ctx.save(); ctx.globalAlpha = Math.min(reducedFlash ? 0.48 : 0.88, t)*responseLayer.responseAlphaScale;');
replaceOnce(
  'Swift connector source reuse',
  "if(cue.affixId==='swift'&&cue.targetPos&&cue.targetKind){const sourceEnemy=this.enemies.find((candidate)=>candidate.id===cue.enemyId);const ownership=swiftStrikeOwnershipPresentation",
  "if(cue.affixId==='swift'&&cue.targetPos&&cue.targetKind){const ownership=swiftStrikeOwnershipPresentation",
);
replaceOnce('Swift connector alpha', 'ctx.globalAlpha=ownership.connectorAlpha*t;', 'ctx.globalAlpha=ownership.connectorAlpha*t*responseLayer.responseAlphaScale;');

replaceOnce(
  'queue method',
  "  private queueEliteAffixResponseVfx(enemy:Enemy,affixId:EliteAffixId,targetPos?:Vec2):void {\n    const existing=this.eliteAffixResponseVfx.find((cue)=>cue.enemyId===enemy.id&&cue.affixId===affixId&&cue.ttl>0.12);\n    if(existing)return;\n    const maxTtl=0.42;\n    this.eliteAffixResponseVfx.push({pos:{...enemy.pos},enemyId:enemy.id,affixId,...(targetPos?{targetPos:{...targetPos},targetKind:enemy.target}:{}),ttl:maxTtl,maxTtl});\n    if (this.eliteAffixResponseVfx.length > 32) this.eliteAffixResponseVfx.splice(0,this.eliteAffixResponseVfx.length-32);\n  }",
  "  private signalEliteAffixCueEvent(enemy:Enemy,affixId:EliteAffixId,kind:EliteAffixCueEventKind):void {\n    if(!enemy.eliteAffixes?.includes(affixId))return;\n    enemy.eliteAffixCueOwnership=advanceEliteAffixCueOwnership(enemy.eliteAffixCueOwnership,{affixes:enemy.eliteAffixes,dt:0,event:{affixId,kind},swiftPhase:enemy.swiftCadencePresentation?.phase,frenziedPhase:enemy.frenziedPresentation?.phase,manaShieldActive:(enemy.manaShield??0)>0,regeneratingActive:(enemy.regenPerSecondRatio??0)>0&&enemy.hp<enemy.maxHp,commanderActive:(enemy.commandAuraMultiplier??1)>1,armoredActive:enemy.eliteAffixes.includes('armored')});\n  }\n\n  private queueEliteAffixResponseVfx(enemy:Enemy,affixId:EliteAffixId,eventKind:EliteAffixCueEventKind='response',targetPos?:Vec2):void {\n    const important=eventKind!=='response';\n    if(important)this.signalEliteAffixCueEvent(enemy,affixId,eventKind);\n    const existing=this.eliteAffixResponseVfx.find((cue)=>cue.enemyId===enemy.id&&cue.affixId===affixId&&cue.ttl>0.12);\n    if(existing)return;\n    if(!important)this.signalEliteAffixCueEvent(enemy,affixId,eventKind);\n    const maxTtl=0.42;\n    this.eliteAffixResponseVfx.push({pos:{...enemy.pos},enemyId:enemy.id,affixId,...(targetPos?{targetPos:{...targetPos},targetKind:enemy.target}:{}),ttl:maxTtl,maxTtl});\n    if (this.eliteAffixResponseVfx.length > 32) this.eliteAffixResponseVfx.splice(0,this.eliteAffixResponseVfx.length-32);\n  }",
);

await writeFile(path, source);
console.log('Applied Phase 4533-4550 EnemyManager integration v2.');
