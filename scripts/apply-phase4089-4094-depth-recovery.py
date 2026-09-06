from pathlib import Path

def read(p): return Path(p).read_text()
def write(p,s): Path(p).write_text(s)
def replace_once(s,a,b,label):
    if a not in s: raise SystemExit(f'missing target: {label}')
    return s.replace(a,b,1)
def insert_after(s,marker,line,label):
    rows=s.splitlines()
    for i,row in enumerate(rows):
        if marker in row:
            rows.insert(i+1,line)
            return '\n'.join(rows)+'\n'
    raise SystemExit(f'missing marker: {label}')

# enemies
e=read('src/game/enemies.ts')
e=replace_once(e,
"import { battlefieldDepthBudgetPresentation, projectileBodyOcclusionPresentation, safeLaneProjectileCrossingPresentation, specialistHazardDepthPresentation } from './threat-impact-depth-priority-rendering.js';",
"import { battlefieldDepthBudgetPresentation, projectileBodyOcclusionPresentation, safeLaneProjectileCrossingPresentation, specialistHazardDepthPresentation } from './threat-impact-depth-priority-rendering.js';\nimport { depthRecoveryBudgetPresentation, projectileDepthRecoveryPresentation, safeLaneDepthRecoveryPresentation, specialistDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';",
'enemies recovery import')
e=insert_after(e,'const projectileBodyOverlap=',
"      const projectileDepthRecovery=projectileDepthRecoveryPresentation({occlusion:projectileBodyOverlap,release:1-projectileResolution.transitionAlphaScale,pressure:projectileDepthBudget.pressure,critical:Boolean(projectile.bossArchetype)},reducedMotion),safeLaneDepthRecovery=safeLaneDepthRecoveryPresentation({laneProximity:projectileLaneProximity,confidence:safeLaneTarget?1:0,release:1-projectileLaneProximity,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.projectiles.length,pressure:projectileDepthBudget.pressure,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);",
'projectile recovery vars')
needle='*projectileDepth.trailAlphaScale*projectileLaneDepth.trailAlphaScale*projectileDepthBudget.secondaryAlphaScale'
if e.count(needle)<3: raise SystemExit('projectile depth trail sites missing')
e=e.replace(needle,needle+'*projectileDepthRecovery.trailAlphaScale*safeLaneDepthRecovery.trailAlphaScale*projectileRecoveryBudget.secondaryRecoveryScale')
body='*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale'
if e.count(body)<4: raise SystemExit('projectile body sites missing')
e=e.replace(body,body+'*projectileDepthRecovery.bodyAlphaScale*safeLaneDepthRecovery.bodyAlphaScale*projectileRecoveryBudget.canonicalBodyAlphaScale')
e=insert_after(e,'const specialistDepth=',
"      const specialistDepthRecovery=specialistDepthRecoveryPresentation({owner:silhouetteDirection.owner,recovery:silhouetteRecoveryReentry.locomotionWeight,hazardPressure},reducedMotion),specialistRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:isSpecialistEnemyType(enemy.type)?activeSpecialistCount:1,pressure:Math.min(1,hazardPressure+this.projectiles.length/12),criticalCount:silhouetteDirection.owner==='special'?1:0},reducedMotion,reducedFlash);",
'specialist recovery vars')
rows=e.splitlines()
for i,row in enumerate(rows):
    if 'const specialistSilhouetteAlphaScale=' in row:
        row=row.replace('*silhouetteTemporal.overlayAlphaScale;','*silhouetteTemporal.overlayAlphaScale*specialistDepth.directionAlphaScale*specialistDepthBudget.secondaryAlphaScale*specialistDepthRecovery.directionAlphaScale*specialistRecoveryBudget.secondaryRecoveryScale;')
        rows[i]=row
    if 'const specialistSilhouetteTrailScale=' in row:
        row=row.replace('*silhouetteTemporal.trailAlphaScale;','*silhouetteTemporal.trailAlphaScale*specialistDepth.trailAlphaScale*specialistDepthBudget.secondaryAlphaScale*specialistDepthRecovery.trailAlphaScale*specialistRecoveryBudget.secondaryRecoveryScale;')
        rows[i]=row
e='\n'.join(rows)+'\n'
write('src/game/enemies.ts',e)

# spells
s=read('src/game/spells.ts')
s=replace_once(s,
"import { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, heroImpactInteriorRetirementPresentation } from './threat-impact-depth-priority-rendering.js';",
"import { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, heroImpactInteriorRetirementPresentation } from './threat-impact-depth-priority-rendering.js';\nimport { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, impactDepthHandoffPresentation } from './threat-impact-depth-recovery-rendering.js';",
'spells recovery import')
s=insert_after(s,'const heroImpactProximity=',
"        const impactDepthHandoff=impactDepthHandoffPresentation({life:impactLife,heroProximity:heroImpactProximity,neighborCount:impactNeighborCount,critical:impactCritical},reducedFlash),telegraphDepthRelease=bossTelegraphDepthReleasePresentation({telegraphLife:bossTelegraphOverlap?1:0,impactLife,overlap:bossTelegraphOverlap?1:0},reducedFlash),impactRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.projectileImpactVisuals.length,pressure:impactDepthBudget.pressure,criticalCount:impactCritical?1:0},reducedMotion,reducedFlash);",
'impact recovery vars')
s=s.replace('*impactDepthBudget.secondaryAlphaScale*(impact.alphaScale??1)', '*impactDepthBudget.secondaryAlphaScale*impactRecoveryBudget.secondaryRecoveryScale*(impact.alphaScale??1)')
s=replace_once(s,
'* impactDepth.fillAlphaScale * telegraphDepth.impactFillAlphaScale * impactDepthBudget.secondaryAlphaScale;',
'* impactDepth.fillAlphaScale * telegraphDepth.impactFillAlphaScale * impactDepthBudget.secondaryAlphaScale * impactDepthHandoff.fillAlphaScale * telegraphDepthRelease.impactFillAlphaScale * impactRecoveryBudget.secondaryRecoveryScale;',
'impact sprite recovery')
s=replace_once(s,
'*impactDepth.edgeAlphaScale*telegraphDepth.impactEdgeAlphaScale;',
'*impactDepth.edgeAlphaScale*telegraphDepth.impactEdgeAlphaScale*impactDepthHandoff.edgeAlphaScale*telegraphDepthRelease.impactEdgeAlphaScale;',
'impact edge recovery')
write('src/game/spells.ts',s)

# game
g=read('src/game/game.ts')
g=replace_once(g,
"import { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, safeLaneProjectileCrossingPresentation } from './threat-impact-depth-priority-rendering.js';",
"import { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, safeLaneProjectileCrossingPresentation } from './threat-impact-depth-priority-rendering.js';\nimport { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, safeLaneDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';",
'game recovery import')
g=insert_after(g,'const hazardTelegraphDepth=',
"      const hazardDepthRelease=bossTelegraphDepthReleasePresentation({telegraphLife:hazard.telegraph>0?Math.min(1,hazard.telegraph/1.2):0,impactLife:Math.max(0,Math.min(1,hazard.ttl/5.4)),overlap:Math.min(1,this.enemies.activeProjectileCount/8)},this.presentationSettings.reducedFlash),hazardRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.bossArena.hazards.length,pressure:denseBattleSafeLane.pressure,criticalCount:hazard.id===primaryTelegraphHazardId?1:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);",
'hazard depth release')
g=replace_once(g,
'*hazardTemporal.fillAlphaScale*hazardDepthBudget.secondaryAlphaScale,',
'*hazardTemporal.fillAlphaScale*hazardDepthBudget.secondaryAlphaScale*hazardRecoveryBudget.secondaryRecoveryScale*hazardDepthRelease.impactFillAlphaScale,',
'hazard fill recovery')
g=g.replace('*hazardTemporal.edgeAlphaScale*hazardTelegraphDepth.telegraphEdgeAlphaScale;', '*hazardTemporal.edgeAlphaScale*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale;',1)
# preserve active telegraph edge during every shape draw
g=g.replace('hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale:hazardFillAlpha','hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale:hazardFillAlpha')
g=g.replace('hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale:hazardEdgeAlpha','hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale:hazardEdgeAlpha')
g=insert_after(g,'const safeLaneProjectileDepth=',
"      const safeLaneDepthRecovery=safeLaneDepthRecoveryPresentation({laneProximity:Math.min(1,this.enemies.activeProjectileCount/8),confidence:safeLane.confidence,release:safeLaneReclaim.release,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);",
'safe lane recovery vars')
g=replace_once(g,
'*safeLaneProjectileDepth.safeLaneAlphaScale*safeLaneDepthBudget.safeLaneAlphaScale;',
'*safeLaneProjectileDepth.safeLaneAlphaScale*safeLaneDepthBudget.safeLaneAlphaScale*safeLaneDepthRecovery.safeLaneAlphaScale;',
'safe lane alpha recovery')
write('src/game/game.ts',g)
print('phase4089-4094 depth recovery integration applied')
