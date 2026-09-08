import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/game/enemies.ts', import.meta.url);
let source = await readFile(path, 'utf8');

function replaceOnce(before, after, label) {
  const first = source.indexOf(before);
  const last = source.lastIndexOf(before);
  if (first < 0) throw new Error(`phase4551 patch missing: ${label}`);
  if (first !== last) throw new Error(`phase4551 patch ambiguous: ${label}`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
}

replaceOnce(
  "import { advanceEliteAffixCueOwnership, eliteAffixCueLayerPresentation, type EliteAffixCueEventKind, type EliteAffixCueOwnershipState } from './elite-affix-cue-arbitration.js';",
  "import { advanceEliteAffixCueOwnership, eliteAffixCueLayerPresentation, type EliteAffixCueEventKind, type EliteAffixCueOwnershipState } from './elite-affix-cue-arbitration.js';\nimport { advanceEliteAffixCueLane, eliteAffixCueDesiredLane, eliteAffixCueLanePresentation, type EliteAffixCueLaneState } from './elite-affix-cue-lanes.js';",
  'lane import',
);

replaceOnce(
  "  eliteAffixCueOwnership?: EliteAffixCueOwnershipState | undefined;\n  manaShield: number;",
  "  eliteAffixCueOwnership?: EliteAffixCueOwnershipState | undefined;\n  eliteAffixCueLane?: EliteAffixCueLaneState | undefined;\n  manaShield: number;",
  'enemy lane state',
);

replaceOnce(
  "    this.enemies = this.enemies.filter((enemy) => enemy.alive);",
  "    const laneElites=this.enemies.filter((enemy)=>enemy.alive&&enemy.type==='elite'&&Boolean(enemy.eliteAffixes?.length));\n    const lanePriority=[...laneElites].sort((a,b)=>{const score=(enemy:Enemy)=>{const target=enemy.target==='core'?ctx.core.pos:ctx.hero.pos;const d=distance(enemy.pos,target);const activeAttack=enemy.swiftCadencePresentation?.phase==='strike'||(enemy.attackResolveMotion?.resolve??0)>.12||(enemy.attackTimer>0&&enemy.attackTimer<=Math.min(.18,enemy.attackInterval*.3));const important=(enemy.eliteAffixCueOwnership?.eventPriority??0)===3&&((enemy.eliteAffixCueOwnership?.holdTtl??0)>0||(enemy.eliteAffixCueOwnership?.releaseTtl??0)>0);return (important?8:0)+(enemy.target==='core'?5:0)+(d<=120?4:0)+(enemy.hitFlash>0?3:0)+(activeAttack?2:0);};return score(b)-score(a)||a.id-b.id;});\n    const lanePriorityRank=new Map(lanePriority.map((enemy,index)=>[enemy,index]));\n    const laneStress=Math.min(1,Math.max(0,laneElites.length-3)/5);\n    for(const enemy of laneElites){const target=enemy.target==='core'?ctx.core.pos:ctx.hero.pos;const d=distance(enemy.pos,target);const activeAttack=enemy.swiftCadencePresentation?.phase==='strike'||(enemy.attackResolveMotion?.resolve??0)>.12||(enemy.attackTimer>0&&enemy.attackTimer<=Math.min(.18,enemy.attackInterval*.3));const importantEvent=(enemy.eliteAffixCueOwnership?.eventPriority??0)===3&&((enemy.eliteAffixCueOwnership?.holdTtl??0)>0||(enemy.eliteAffixCueOwnership?.releaseTtl??0)>0);const desiredLane=eliteAffixCueDesiredLane({enemyId:enemy.id,priorityIndex:lanePriorityRank.get(enemy)??laneElites.length,activeEliteCount:laneElites.length,priorityTarget:enemy.target==='core'||d<=120||enemy.hitFlash>0,activeAttack,importantEvent,battlefieldStress:laneStress});enemy.eliteAffixCueLane=advanceEliteAffixCueLane(enemy.eliteAffixCueLane,{desiredLane,dt,importantEvent});}\n    this.enemies = this.enemies.filter((enemy) => enemy.alive);",
  'lane lifecycle update',
);

const renderAnchor = "    const eliteAffixLayerFor=(enemy:Enemy,affixId:EliteAffixId)=>{const target=enemy.target==='core'?corePos:heroPos;const d=target?distance(enemy.pos,target):9999;const activeAttack=enemy.swiftCadencePresentation?.phase==='strike'||(enemy.attackResolveMotion?.resolve??0)>.12||(enemy.attackTimer>0&&enemy.attackTimer<=Math.min(.18,enemy.attackInterval*.3));return eliteAffixCueLayerPresentation(enemy.eliteAffixCueOwnership,affixId,{activeEliteCount:activeAffixElites.length,indexFromPriority:eliteAffixCuePriorityRank.get(enemy)??activeAffixElites.length,priorityTarget:enemy.target==='core'||d<=120||enemy.hitFlash>0,activeAttack,higherPriorityCue:hazardPressure>=.72,battlefieldStress:eliteAffixBattlefieldStress,reducedMotion,reducedFlash});};";
replaceOnce(
  renderAnchor,
  `${renderAnchor}\n    const eliteAffixCueLaneFor=(enemy:Enemy)=>eliteAffixCueLanePresentation(enemy.eliteAffixCueLane,{enemyRadius:enemy.radius,battlefieldStress:eliteAffixBattlefieldStress,higherPriorityCue:hazardPressure>=.72,reducedMotion,reducedFlash});`,
  'render lane helper',
);

replaceOnce(
  "            ctx.save(); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)*affixLayer.motionScale); ctx.globalAlpha = (reducedFlash ? 0.26 : 0.42)*affixLayer.alphaScale;",
  "            const eliteCueLane=eliteAffixCueLaneFor(enemy); ctx.save(); ctx.translate(eliteCueLane.offsetX, eliteCueLane.offsetY); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)*affixLayer.motionScale*eliteCueLane.motionScale); ctx.globalAlpha = (reducedFlash ? 0.26 : 0.42)*affixLayer.alphaScale*eliteCueLane.alphaScale;",
  'active affix cue lane',
);

replaceOnce(
  "if(swift.alpha>0&&swiftDensity.visible&&swiftLayer.visible){const mag=Math.max(1,targetDistance),nx=targetDx/mag,ny=targetDy/mag,start=enemy.radius+8,end=start+swift.chevronLength*(.8+.2*swiftDensity.motionScale*swiftLayer.motionScale),perpX=-ny,perpY=nx,wing=4;ctx.save();ctx.globalAlpha=swift.alpha*swiftDensity.alphaScale*swiftLayer.alphaScale;",
  "if(swift.alpha>0&&swiftDensity.visible&&swiftLayer.visible){const mag=Math.max(1,targetDistance),nx=targetDx/mag,ny=targetDy/mag,start=enemy.radius+8,end=start+swift.chevronLength*(.8+.2*swiftDensity.motionScale*swiftLayer.motionScale),perpX=-ny,perpY=nx,wing=4,eliteCueLane=eliteAffixCueLaneFor(enemy);ctx.save();ctx.translate(eliteCueLane.offsetX, eliteCueLane.offsetY);ctx.globalAlpha=swift.alpha*swiftDensity.alphaScale*swiftLayer.alphaScale*eliteCueLane.alphaScale;",
  'swift cue lane',
);

replaceOnce(
  "if(frenzy.alpha>0&&frenzyDensity.visible&&frenzyLayer.visible){const hpRatio=enemy.hp/Math.max(1,enemy.maxHp),pulse=Math.sin((1-hpRatio)*Math.PI*4)*frenzy.pulse*frenzyDensity.pulseScale*frenzyLayer.motionScale;ctx.save();ctx.globalAlpha=frenzy.alpha*frenzyDensity.alphaScale*frenzyLayer.alphaScale;",
  "if(frenzy.alpha>0&&frenzyDensity.visible&&frenzyLayer.visible){const hpRatio=enemy.hp/Math.max(1,enemy.maxHp),pulse=Math.sin((1-hpRatio)*Math.PI*4)*frenzy.pulse*frenzyDensity.pulseScale*frenzyLayer.motionScale,eliteCueLane=eliteAffixCueLaneFor(enemy);ctx.save();ctx.translate(eliteCueLane.offsetX, eliteCueLane.offsetY);ctx.globalAlpha=frenzy.alpha*frenzyDensity.alphaScale*frenzyLayer.alphaScale*eliteCueLane.alphaScale;",
  'frenzied cue lane',
);

replaceOnce(
  "          if(manaShieldLayer.visible){ctx.save();ctx.globalAlpha=manaShieldLayer.alphaScale;ctx.strokeStyle = 'rgba(139,186,255,.82)';",
  "          if(manaShieldLayer.visible){const eliteCueLane=eliteAffixCueLaneFor(enemy);ctx.save();ctx.translate(eliteCueLane.offsetX, eliteCueLane.offsetY);ctx.globalAlpha=manaShieldLayer.alphaScale*eliteCueLane.alphaScale;ctx.strokeStyle = 'rgba(139,186,255,.82)';",
  'mana shield cue lane',
);

replaceOnce(
  "        const responseLayer=sourceEnemy?eliteAffixLayerFor(sourceEnemy,cue.affixId):eliteAffixCueLayerPresentation(undefined,cue.affixId,{activeEliteCount:activeAffixElites.length,indexFromPriority:activeAffixElites.length,priorityTarget:false,activeAttack:false,higherPriorityCue:hazardPressure>=.72,battlefieldStress:eliteAffixBattlefieldStress,reducedMotion,reducedFlash});\n        if(!responseLayer.visible) continue;",
  "        const responseLayer=sourceEnemy?eliteAffixLayerFor(sourceEnemy,cue.affixId):eliteAffixCueLayerPresentation(undefined,cue.affixId,{activeEliteCount:activeAffixElites.length,indexFromPriority:activeAffixElites.length,priorityTarget:false,activeAttack:false,higherPriorityCue:hazardPressure>=.72,battlefieldStress:eliteAffixBattlefieldStress,reducedMotion,reducedFlash});\n        const responseLane=sourceEnemy?eliteAffixCueLaneFor(sourceEnemy):{lane:0,offsetX:0,offsetY:0,motionScale:0,alphaScale:1};\n        const responseCuePos={x:cue.pos.x+responseLane.offsetX,y:cue.pos.y+responseLane.offsetY};\n        if(!responseLayer.visible) continue;",
  'response lane origin',
);

replaceOnce(
  "ctx.drawImage(eliteAffixLifecycleVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, cue.pos.x - size / 2, cue.pos.y - size / 2, size, size);",
  "ctx.drawImage(eliteAffixLifecycleVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, responseCuePos.x - size / 2, responseCuePos.y - size / 2, size, size);",
  'response sprite position',
);

replaceOnce(
  "distance(cue.pos,cue.targetPos)",
  "distance(responseCuePos,cue.targetPos)",
  'swift response distance',
);
replaceOnce(
  "const dx=cue.targetPos.x-cue.pos.x,dy=cue.targetPos.y-cue.pos.y",
  "const dx=cue.targetPos.x-responseCuePos.x,dy=cue.targetPos.y-responseCuePos.y",
  'swift response vector',
);
replaceOnce(
  "endX=cue.pos.x+nx*travel,endY=cue.pos.y+ny*travel",
  "endX=responseCuePos.x+nx*travel,endY=responseCuePos.y+ny*travel",
  'swift response end',
);
replaceOnce(
  "ctx.moveTo(cue.pos.x+nx*10,cue.pos.y+ny*10)",
  "ctx.moveTo(responseCuePos.x+nx*10,responseCuePos.y+ny*10)",
  'swift response start',
);

await writeFile(path, source);
console.log('phase4551 cue lane patch applied');
