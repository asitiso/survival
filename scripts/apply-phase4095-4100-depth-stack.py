from pathlib import Path

def read(path): return Path(path).read_text()
def write(path,text): Path(path).write_text(text)
def replace_once(text,old,new,label):
    if old not in text: raise SystemExit(f'missing target: {label}')
    return text.replace(old,new,1)
def insert_after(text,marker,line,label):
    rows=text.splitlines()
    for i,row in enumerate(rows):
        if marker in row:
            rows.insert(i+1,line)
            return '\n'.join(rows)+'\n'
    raise SystemExit(f'missing marker: {label}')

# enemies.ts
e=read('src/game/enemies.ts')
e=replace_once(e,
"import { depthRecoveryBudgetPresentation, projectileDepthRecoveryPresentation, safeLaneDepthRecoveryPresentation, specialistDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';",
"import { depthRecoveryBudgetPresentation, projectileDepthRecoveryPresentation, safeLaneDepthRecoveryPresentation, specialistDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';\nimport { canonicalBodyDepthReclaimPresentation, criticalDepthLatchPresentation, unifiedDepthStackBudgetPresentation } from './threat-impact-depth-stack-rendering.js';",
'enemies stack import')
e=insert_after(e,'const projectileDepthRecovery=',
"      const projectileCriticalLatch=criticalDepthLatchPresentation({critical:Boolean(projectile.bossArchetype),release:1-projectileResolution.transitionAlphaScale,pressure:projectileDepthBudget.pressure},reducedFlash),projectileCanonicalStack=canonicalBodyDepthReclaimPresentation({release:1-projectileResolution.transitionAlphaScale,pressure:projectileDepthBudget.pressure,owner:projectile.bossArchetype?'critical':projectileResolution.owner==='canonical'?'canonical':'recovery'},reducedMotion),projectileUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,bossTelegraphCount:projectile.bossArchetype?1:0,safeLaneVisible:projectileLaneProximity>0,secondaryCount:this.projectiles.length,pressure:projectileDepthBudget.pressure},reducedMotion,reducedFlash);",
'projectile stack vars')
trail_tail='*projectileDepthRecovery.trailAlphaScale*safeLaneDepthRecovery.trailAlphaScale*projectileRecoveryBudget.secondaryRecoveryScale'
if e.count(trail_tail)<3: raise SystemExit(f'expected projectile trail sites >=3, got {e.count(trail_tail)}')
e=e.replace(trail_tail,trail_tail+'*projectileCriticalLatch.secondaryAlphaScale*projectileCanonicalStack.trailAlphaScale*projectileUnifiedStack.secondaryAlphaScale')
body_tail='*projectileDepthRecovery.bodyAlphaScale*safeLaneDepthRecovery.bodyAlphaScale*projectileRecoveryBudget.canonicalBodyAlphaScale'
if e.count(body_tail)<4: raise SystemExit(f'expected projectile body sites >=4, got {e.count(body_tail)}')
e=e.replace(body_tail,body_tail+'*projectileCriticalLatch.criticalAlphaScale*projectileCanonicalStack.bodyAlphaScale*projectileUnifiedStack.canonicalBodyAlphaScale')
write('src/game/enemies.ts',e)

# spells.ts
s=read('src/game/spells.ts')
s=replace_once(s,
"import { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, impactDepthHandoffPresentation } from './threat-impact-depth-recovery-rendering.js';",
"import { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, impactDepthHandoffPresentation } from './threat-impact-depth-recovery-rendering.js';\nimport { impactEdgeGhostRetirementPresentation, unifiedDepthStackBudgetPresentation } from './threat-impact-depth-stack-rendering.js';",
'spells stack import')
s=insert_after(s,'const impactDepthHandoff=',
"        const impactStackRetirement=impactEdgeGhostRetirementPresentation({life:impactLife,neighborCount:impactNeighborCount,critical:impactCritical},reducedFlash),impactUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:impactCritical?1:0,bossTelegraphCount:bossTelegraphOverlap?1:0,safeLaneVisible:false,secondaryCount:this.projectileImpactVisuals.length,pressure:impactDepthBudget.pressure},reducedMotion,reducedFlash);",
'impact stack vars')
s=replace_once(s,
'*impactRecoveryBudget.secondaryRecoveryScale*(impact.alphaScale??1)',
'*impactRecoveryBudget.secondaryRecoveryScale*impactUnifiedStack.secondaryAlphaScale*(impact.alphaScale??1)',
'impact direction stack')
s=replace_once(s,
'* impactRecoveryBudget.secondaryRecoveryScale;',
'* impactRecoveryBudget.secondaryRecoveryScale * impactStackRetirement.fillAlphaScale * impactUnifiedStack.secondaryAlphaScale;',
'impact fill stack')
s=replace_once(s,
'*telegraphDepthRelease.impactEdgeAlphaScale;',
'*telegraphDepthRelease.impactEdgeAlphaScale*impactStackRetirement.edgeAlphaScale;',
'impact edge stack')
write('src/game/spells.ts',s)

# game.ts
g=read('src/game/game.ts')
g=replace_once(g,
"import { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, safeLaneDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';",
"import { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, safeLaneDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';\nimport { bossTelegraphStackOrderPresentation, safeLaneEdgeClutterProtectionPresentation, unifiedDepthStackBudgetPresentation } from './threat-impact-depth-stack-rendering.js';",
'game stack import')
g=insert_after(g,'const hazardDepthRelease=',
"      const hazardStackOrder=bossTelegraphStackOrderPresentation({activeCount:this.bossArena.hazards.length,indexFromNewest:Math.max(0,this.bossArena.hazards.length-1-this.bossArena.hazards.indexOf(hazard)),life:hazard.telegraph>0?Math.min(1,hazard.telegraph/1.2):Math.min(1,hazard.ttl/5.4),critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedFlash),hazardUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,bossTelegraphCount:this.bossArena.hazards.filter((entry)=>entry.telegraph>0).length,safeLaneVisible:Boolean(safeLane),secondaryCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);",
'hazard stack vars')
g=replace_once(g,
'*hazardRecoveryBudget.secondaryRecoveryScale*hazardDepthRelease.impactFillAlphaScale,',
'*hazardRecoveryBudget.secondaryRecoveryScale*hazardDepthRelease.impactFillAlphaScale*hazardStackOrder.decorationAlphaScale*hazardUnifiedStack.secondaryAlphaScale,',
'hazard stack fill')
# Only strengthen active telegraph edge; ordinary active hazard edge remains governed by existing edge path.
g=g.replace('hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale:hazardFillAlpha','hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardFillAlpha')
g=g.replace('hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale:hazardEdgeAlpha','hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha')
g=insert_after(g,'const safeLaneDepthRecovery=',
"      const safeLaneEdgeDistance=Math.min(safeLaneVisualTarget.x,LOGICAL_WIDTH-safeLaneVisualTarget.x,safeLaneVisualTarget.y,LOGICAL_HEIGHT-safeLaneVisualTarget.y),safeLaneStackProtection=safeLaneEdgeClutterProtectionPresentation({edgeProximity:1-Math.min(1,safeLaneEdgeDistance/180),clutter:Math.min(1,(this.bossArena.hazards.length+this.enemies.activeProjectileCount)/14),confidence:safeLane.confidence,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedFlash),safeLaneUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),bossTelegraphCount:this.bossArena.hazards.filter((entry)=>entry.telegraph>0).length,safeLaneVisible:true,secondaryCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);",
'safe lane stack vars')
g=replace_once(g,
'*safeLaneDepthRecovery.safeLaneAlphaScale;',
'*safeLaneDepthRecovery.safeLaneAlphaScale*safeLaneStackProtection.safeLaneAlphaScale*safeLaneUnifiedStack.safeLaneAlphaScale;',
'safe lane stack alpha')
g=replace_once(g,
'ctx.save(); ctx.globalAlpha = safeLaneBaseAlpha*safeLaneHazardRecovery.pathAlphaScale;',
'ctx.save(); ctx.globalAlpha = safeLaneBaseAlpha*Math.max(safeLaneHazardRecovery.pathAlphaScale,safeLaneStackProtection.pathAlphaFloor);',
'safe lane path floor')
write('src/game/game.ts',g)
print('phase4095-4100 depth stack integration applied')
