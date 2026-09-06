from pathlib import Path


def read(path):
    return Path(path).read_text()


def write(path, text):
    Path(path).write_text(text)


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing replacement target: {label}')
    return text.replace(old, new, 1)


def insert_after_line(text, marker, addition, label):
    lines=text.splitlines()
    for i,line in enumerate(lines):
        if marker in line:
            lines.insert(i+1, addition)
            return '\n'.join(lines)+'\n'
    raise SystemExit(f'missing line marker: {label}')

# enemies.ts
enemies=read('src/game/enemies.ts')
enemies=replace_once(enemies,
"import { projectileFocusHoldPresentation, silhouetteContrastRecoveryPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';",
"import { projectileFocusHoldPresentation, silhouetteContrastRecoveryPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';\nimport { battlefieldDepthBudgetPresentation, projectileBodyOcclusionPresentation, safeLaneProjectileCrossingPresentation, specialistHazardDepthPresentation } from './threat-impact-depth-priority-rendering.js';",
'enemies depth import')
enemies=replace_once(enemies,
"function isSpecialistEnemyType(type:EnemyType):type is SpecialistEnemyType { return type === 'shieldbearer' || type === 'assassin' || type === 'siegeGolem' || type === 'nullifier'; }",
"function isSpecialistEnemyType(type:EnemyType):type is SpecialistEnemyType { return type === 'shieldbearer' || type === 'assassin' || type === 'siegeGolem' || type === 'nullifier'; }\nfunction pointSegmentProximity(point:Vec2,a:Vec2|null,b:Vec2|null,band:number):number { if(!a||!b)return 0;const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy,safeBand=Math.max(1,band);if(len2<=.001)return Math.max(0,1-distance(point,a)/safeBand);const t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/len2)),nearest={x:a.x+dx*t,y:a.y+dy*t};return Math.max(0,1-distance(point,nearest)/safeBand); }",
'enemies segment proximity')
enemies=replace_once(enemies,
"presentationQuality: PresentationQuality = 'high', reducedFlash = false, reducedMotion = false): void {",
"presentationQuality: PresentationQuality = 'high', reducedFlash = false, reducedMotion = false, safeLaneOrigin:Vec2|null=null, safeLaneTarget:Vec2|null=null): void {",
'enemies projectile signature')
enemies=insert_after_line(enemies,'const projectileTemporal=projectileFocusHoldPresentation',
"      const projectileBodyOverlap=this.enemies.some((enemy)=>enemy.alive&&(enemy.type==='boss'||isSpecialistEnemyType(enemy.type))&&distance(enemy.pos,visualPos)<=enemy.radius+projectile.radius+10)?1:0,projectileLaneProximity=pointSegmentProximity(visualPos,safeLaneOrigin,safeLaneTarget,Math.max(54,projectile.radius*7)),projectileDepth=projectileBodyOcclusionPresentation({bodyOcclusion:projectileBodyOverlap,density:Math.min(1,this.projectiles.length/10),bossCritical:Boolean(projectile.bossArchetype)},reducedMotion),projectileLaneDepth=safeLaneProjectileCrossingPresentation({laneProximity:projectileLaneProximity,threatLevel:projectile.bossArchetype?1:.72,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,bossTelegraph:Boolean(projectile.bossArchetype),safeLaneVisible:projectileLaneProximity>0,projectilePressure:Math.min(1,this.projectiles.length/10),impactPressure:0,hazardPressure:0},reducedMotion,reducedFlash);",
'enemies projectile depth vars')
old='*projectileTemporalBudget.secondaryAlphaScale'
count=enemies.count(old)
if count < 3:
    raise SystemExit(f'expected >=3 projectile temporal alpha sites, found {count}')
enemies=enemies.replace(old,old+'*projectileDepth.trailAlphaScale*projectileLaneDepth.trailAlphaScale*projectileDepthBudget.secondaryAlphaScale')
enemies=replace_once(enemies,
"ctx.globalAlpha = (hasBossVisual ? 0.28 : 1)*projectileResolution.bodyAlphaScale;",
"ctx.globalAlpha = (hasBossVisual ? 0.28 : 1)*projectileResolution.bodyAlphaScale*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale;",
'enemies projectile body')
for alpha in ('0.92','0.78','0.94'):
    enemies=replace_once(enemies,
        f"ctx.globalAlpha = {alpha}*projectileResolution.bodyAlphaScale;",
        f"ctx.globalAlpha = {alpha}*projectileResolution.bodyAlphaScale*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale;",
        f'enemies projectile sprite {alpha}')
enemies=replace_once(enemies,
"specialistReactionLifecycleVfxAtlasReady = false, reducedFlash = false, reducedMotion = false): void {",
"specialistReactionLifecycleVfxAtlasReady = false, reducedFlash = false, reducedMotion = false, hazardPressure = 0): void {",
'enemies renderEnemies signature')
enemies=insert_after_line(enemies,'const silhouettePriority=','            const specialistDepth=specialistHazardDepthPresentation({owner:silhouetteDirection.owner,hazardPressure,attackStrength:silhouetteDirection.owner===\'attack\'||silhouetteDirection.owner===\'special\'?1:.25},reducedMotion),specialistDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:silhouetteDirection.owner===\'special\'?1:0,bossTelegraph:false,safeLaneVisible:false,projectilePressure:Math.min(1,this.projectiles.length/10),impactPressure:0,hazardPressure},reducedMotion,reducedFlash);','enemies specialist depth vars')
lines=enemies.splitlines()
for i,line in enumerate(lines):
    if 'const specialistSilhouetteAlphaScale =' in line:
        if '* silhouetteTemporal.overlayAlphaScale;' not in line: raise SystemExit('missing silhouette alpha tail')
        lines[i]=line.replace('* silhouetteTemporal.overlayAlphaScale;','* silhouetteTemporal.overlayAlphaScale * specialistDepth.directionAlphaScale * specialistDepthBudget.secondaryAlphaScale;')
    if 'const specialistSilhouetteTrailScale =' in line:
        if '* silhouetteTemporal.trailAlphaScale;' not in line: raise SystemExit('missing silhouette trail tail')
        lines[i]=line.replace('* silhouetteTemporal.trailAlphaScale;','* silhouetteTemporal.trailAlphaScale * specialistDepth.trailAlphaScale * specialistDepthBudget.secondaryAlphaScale;')
enemies='\n'.join(lines)+'\n'
write('src/game/enemies.ts',enemies)

# spells.ts
spells=read('src/game/spells.ts')
spells=replace_once(spells,
"import { impactBurstSettlePresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';",
"import { impactBurstSettlePresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';\nimport { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, heroImpactInteriorRetirementPresentation } from './threat-impact-depth-priority-rendering.js';",
'spells depth import')
spells=replace_once(spells,
"presentationQuality: PresentationQuality = 'high', primaryProjectileLabelBlockers:readonly Vec2[]=[]): void {",
"presentationQuality: PresentationQuality = 'high', primaryProjectileLabelBlockers:readonly Vec2[]=[], heroPos:Vec2|null=null, bossTelegraphZones:readonly {pos:Vec2;radius:number}[]=[]): void {",
'spells render signature')
spells=insert_after_line(spells,'const impactCritical=impact.impactResponseOwner',
"        const heroImpactProximity=heroPos?1-Math.min(1,distance(heroPos,impact.pos)/Math.max(72,impact.size*3)):0,bossTelegraphOverlap=bossTelegraphZones.some((zone)=>distance(zone.pos,impact.pos)<=zone.radius+impact.size*.6),impactDepth=heroImpactInteriorRetirementPresentation({heroProximity:heroImpactProximity,life:impactLife,neighborCount:impactNeighborCount,critical:impactCritical},reducedFlash),telegraphDepth=bossTelegraphImpactDepthPresentation({telegraphActive:bossTelegraphOverlap,overlap:bossTelegraphOverlap?1:0,impactLife},reducedFlash),impactDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:impactCritical?1:0,bossTelegraph:bossTelegraphOverlap,safeLaneVisible:false,projectilePressure:Math.min(1,this.projectiles.length/10),impactPressure:Math.min(1,impactNeighborCount/8),hazardPressure:persistentHazardOverlap?1:0},reducedMotion,reducedFlash);",
'spells impact depth vars')
lines=spells.splitlines()
for i,line in enumerate(lines):
    if 'if(impactDirection?.visible' in line and 'impactTemporalBudget.secondaryAlphaScale' in line:
        lines[i]=line.replace('*impactTemporalBudget.secondaryAlphaScale','*impactTemporalBudget.secondaryAlphaScale*impactDepthBudget.secondaryAlphaScale',1)
    if 'ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress) * 0.9' in line:
        lines[i]=line.replace(' * (budget?.alphaScale??1);',' * (budget?.alphaScale??1) * impactDepth.fillAlphaScale * telegraphDepth.impactFillAlphaScale * impactDepthBudget.secondaryAlphaScale;',1)
    if 'ctx.save();ctx.globalAlpha=.38*arrivalContinuity.edgeAlphaScale' in line:
        lines[i]=line.replace('*(budget?.alphaScale??1);','*(budget?.alphaScale??1)*impactDepth.edgeAlphaScale*telegraphDepth.impactEdgeAlphaScale;',1)
spells='\n'.join(lines)+'\n'
write('src/game/spells.ts',spells)

# game.ts
game=read('src/game/game.ts')
game=replace_once(game,
"import { hazardCorridorStabilityPresentation, safeLaneAttentionHoldPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';",
"import { hazardCorridorStabilityPresentation, safeLaneAttentionHoldPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';\nimport { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, safeLaneProjectileCrossingPresentation } from './threat-impact-depth-priority-rendering.js';",
'game depth import')
lines=game.splitlines()
for i,line in enumerate(lines):
    if 'this.enemies.renderProjectiles(ctx,' in line:
        if not line.rstrip().endswith(');'): raise SystemExit('renderProjectiles call tail')
        lines[i]=line.rstrip()[:-2]+", this.hero.pos, this.currentMythicSafeLanePresentation?.target??null);"
    if 'this.enemies.renderEnemies(ctx,' in line:
        if not line.rstrip().endswith(');'): raise SystemExit('renderEnemies call tail')
        lines[i]=line.rstrip()[:-2]+", Math.min(1,this.bossArena.hazards.length/6));"
    if 'this.spells.render(ctx,' in line and 'Preserve the residual-motion' not in line:
        if not line.rstrip().endswith(');'): raise SystemExit('spells render call tail')
        lines[i]=line.rstrip()[:-2]+", this.hero.pos, this.bossArena.hazards.filter((hazard)=>hazard.telegraph>0).map((hazard)=>({pos:hazard.pos,radius:hazard.radius})));"
game='\n'.join(lines)+'\n'
game=insert_after_line(game,'const hazardLaneProximity=',
"      const hazardTelegraphDepth=bossTelegraphImpactDepthPresentation({telegraphActive:hazard.telegraph>0,overlap:Math.min(1,this.enemies.activeProjectileCount/8),impactLife:Math.max(0,Math.min(1,hazard.ttl/5.4))},this.presentationSettings.reducedFlash),hazardDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,bossTelegraph:hazard.telegraph>0,safeLaneVisible:Boolean(safeLane),projectilePressure:Math.min(1,this.enemies.activeProjectileCount/12),impactPressure:0,hazardPressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);",
'game hazard depth vars')
game=replace_once(game,
"const hazardFillAlpha=hazardBaseAlpha*hazardExpiry.fillAlphaScale*denseBattleSafeLane.hazardFillScale*battlefieldHazardReclaim.hazardAlphaScale*hazardSpatial.fillAlphaScale*hazardTemporal.fillAlphaScale,hazardEdgeAlpha=hazardBaseAlpha*hazardExpiry.edgeAlphaScale*denseBattleSafeLane.hazardEdgeScale*hazardResidueRelease.hazardEdgeScale*hazardGroundResolution.hazardEdgeAlphaScale*hazardSpatial.hazardEdgeAlphaScale*hazardTemporal.edgeAlphaScale;",
"const hazardFillAlpha=hazardBaseAlpha*hazardExpiry.fillAlphaScale*denseBattleSafeLane.hazardFillScale*battlefieldHazardReclaim.hazardAlphaScale*hazardSpatial.fillAlphaScale*hazardTemporal.fillAlphaScale*hazardDepthBudget.secondaryAlphaScale,hazardEdgeAlpha=hazardBaseAlpha*hazardExpiry.edgeAlphaScale*denseBattleSafeLane.hazardEdgeScale*hazardResidueRelease.hazardEdgeScale*hazardGroundResolution.hazardEdgeAlphaScale*hazardSpatial.hazardEdgeAlphaScale*hazardTemporal.edgeAlphaScale*hazardTelegraphDepth.telegraphEdgeAlphaScale;",
'game hazard alpha')
game=game.replace('hazard.telegraph>0?hazardBaseAlpha:hazardFillAlpha','hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale:hazardFillAlpha')
game=game.replace('hazard.telegraph>0?hazardBaseAlpha:hazardEdgeAlpha','hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale:hazardEdgeAlpha')
game=insert_after_line(game,'const safeLaneTemporal=',
"      const safeLaneProjectileDepth=safeLaneProjectileCrossingPresentation({laneProximity:Math.min(1,this.enemies.activeProjectileCount/8),threatLevel:denseBattleSafeLane.pressure,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),bossTelegraph:Boolean(boss&&Number.isFinite(boss.specialTimer)&&(boss.specialTimer??99)<=1.2),safeLaneVisible:true,projectilePressure:Math.min(1,this.enemies.activeProjectileCount/12),impactPressure:0,hazardPressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);",
'game safe lane depth vars')
lines=game.splitlines()
for i,line in enumerate(lines):
    if 'const safeLaneBaseAlpha=' in line:
        if '*safeLaneTemporalBudget.safeLaneAlphaScale;' not in line: raise SystemExit('safe lane alpha tail')
        lines[i]=line.replace('*safeLaneTemporalBudget.safeLaneAlphaScale;','*safeLaneTemporalBudget.safeLaneAlphaScale*safeLaneProjectileDepth.safeLaneAlphaScale*safeLaneDepthBudget.safeLaneAlphaScale;')
game='\n'.join(lines)+'\n'
write('src/game/game.ts',game)

print('phase4083-4088 integration applied')
