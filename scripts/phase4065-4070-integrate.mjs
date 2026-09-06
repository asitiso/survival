import fs from 'node:fs';

function replaceOnce(path, needle, replacement) {
  let text = fs.readFileSync(path, 'utf8');
  const first = text.indexOf(needle);
  const last = text.lastIndexOf(needle);
  if (first < 0) throw new Error(`missing needle in ${path}: ${needle.slice(0, 120)}`);
  if (first !== last) throw new Error(`needle not unique in ${path}: ${needle.slice(0, 120)}`);
  text = text.slice(0, first) + replacement + text.slice(first + needle.length);
  fs.writeFileSync(path, text);
}

function replaceAllRequired(path, needle, replacement, minCount = 1) {
  let text = fs.readFileSync(path, 'utf8');
  const count = text.split(needle).length - 1;
  if (count < minCount) throw new Error(`expected >=${minCount} matches in ${path}, got ${count}: ${needle}`);
  text = text.split(needle).join(replacement);
  fs.writeFileSync(path, text);
}

replaceOnce(
  'src/game/enemies.ts',
  "import { continuityResolutionBudgetPresentation, projectileCanonicalReclaimPresentation, silhouetteLocomotionSettlePresentation } from './threat-impact-resolution-rendering.js';",
  "import { continuityResolutionBudgetPresentation, projectileCanonicalReclaimPresentation, silhouetteLocomotionSettlePresentation } from './threat-impact-resolution-rendering.js';\nimport { battlefieldThreatLayerBudgetPresentation, silhouetteThreatDeconflictionPresentation, threatCuePriorityArbitrationPresentation, threatOverlapSuppressionBudgetPresentation } from './threat-impact-priority-rendering.js';"
);
replaceOnce(
  'src/game/enemies.ts',
  "      const bossTravel=projectile.bossArchetype&&projectile.visualLaunchWorldOrigin&&projectile.visualLaunchTravelTtl!==undefined&&projectile.visualLaunchTravelMaxTtl?bossSharedAnchorTravelContinuityPresentation",
  "      const projectilePriority=threatCuePriorityArbitrationPresentation({threatLevel:projectile.bossArchetype?1:.72,bossSpecial:Boolean(projectile.bossArchetype),heroCritical:false,coreCritical:false,safeLaneVisible:true},reducedFlash),projectileOverlap=threatOverlapSuppressionBudgetPresentation({activeCount:this.projectiles.length,indexFromNewest:projectileResolutionRank.get(projectile)??this.projectiles.length,kind:'projectile',critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileLayerBudget=battlefieldThreatLayerBudgetPresentation({projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);\n      const bossTravel=projectile.bossArchetype&&projectile.visualLaunchWorldOrigin&&projectile.visualLaunchTravelTtl!==undefined&&projectile.visualLaunchTravelMaxTtl?bossSharedAnchorTravelContinuityPresentation"
);
replaceAllRequired(
  'src/game/enemies.ts',
  '*projectileResolutionBudget.effectStrength;ctx.strokeStyle=',
  '*projectileResolutionBudget.effectStrength*projectilePriority.secondaryAlphaScale*projectileOverlap.alphaScale*projectileLayerBudget.projectileDecorationScale;ctx.strokeStyle=',
  2
);
replaceOnce(
  'src/game/enemies.ts',
  "*bossBridgeBudget.alphaScale*threatOwnership.travelAlphaScale;ctx.strokeStyle='#ffb26f'",
  "*bossBridgeBudget.alphaScale*threatOwnership.travelAlphaScale*projectilePriority.secondaryAlphaScale*projectileLayerBudget.projectileDecorationScale;ctx.strokeStyle='#ffb26f'"
);
replaceOnce(
  'src/game/enemies.ts',
  "      const silhouetteResolutionEffect=silhouetteResolutionBudget.effectStrength,silhouetteResolutionAlphaScale=1-(1-silhouetteResolution.overlayAlphaScale)*silhouetteResolutionEffect,silhouetteResolutionTrailScale=1-(1-silhouetteResolution.trailScale)*silhouetteResolutionEffect;",
  "      const silhouetteResolutionEffect=silhouetteResolutionBudget.effectStrength,silhouetteResolutionAlphaScale=1-(1-silhouetteResolution.overlayAlphaScale)*silhouetteResolutionEffect,silhouetteResolutionTrailScale=1-(1-silhouetteResolution.trailScale)*silhouetteResolutionEffect;\n      const silhouettePriority=silhouetteThreatDeconflictionPresentation({owner:silhouetteDirection.owner,threatPressure:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),attackStrength:silhouetteDirection.owner==='attack'||silhouetteDirection.owner==='special'?1:.25},reducedMotion);"
);
replaceOnce(
  'src/game/enemies.ts',
  '*specialistRecoveryCadenceTrailScale*silhouetteRecoveryAlphaScale;',
  '*specialistRecoveryCadenceTrailScale*silhouetteRecoveryAlphaScale*silhouettePriority.overlayAlphaScale;'
);
replaceOnce(
  'src/game/enemies.ts',
  '*silhouetteRecoveryTrailScale;\n      const dynamicSilhouette',
  '*silhouetteRecoveryTrailScale*silhouettePriority.trailScale;\n      const dynamicSilhouette'
);

replaceOnce(
  'src/game/spells.ts',
  "import { continuityResolutionBudgetPresentation, impactFootprintRetirementPresentation } from './threat-impact-resolution-rendering.js';",
  "import { continuityResolutionBudgetPresentation, impactFootprintRetirementPresentation } from './threat-impact-resolution-rendering.js';\nimport { battlefieldThreatLayerBudgetPresentation, hazardImpactEdgeArbitrationPresentation } from './threat-impact-priority-rendering.js';"
);
replaceOnce(
  'src/game/spells.ts',
  "        const arrivalContinuity=impactArrivalFootprintContinuityPresentation",
  "        const persistentHazardOverlap=this.fields.some((field)=>distance(field.pos,impact.pos)<=field.radius+impact.size*.5)||this.holes.some((hole)=>distance(hole.pos,impact.pos)<=hole.radius+impact.size*.5);\n        const impactPriority=hazardImpactEdgeArbitrationPresentation({hazardActive:persistentHazardOverlap,hazardLife:persistentHazardOverlap?1:0,impactLife,overlap:persistentHazardOverlap?1:0},reducedFlash),impactThreatBudget=battlefieldThreatLayerBudgetPresentation({projectileCount:this.projectiles.length,impactCount:this.projectileImpactVisuals.length,hazardCount:this.fields.length+this.holes.length,silhouetteCount:0,criticalCount:(impact.impactResponseOwner==='weakpoint'||impact.enemyReactionOwner==='death')?1:0},reducedMotion,reducedFlash);\n        const arrivalContinuity=impactArrivalFootprintContinuityPresentation"
);
replaceAllRequired(
  'src/game/spells.ts',
  '*impactResolutionBudget.effectStrength*(impact.alphaScale??1)',
  '*impactResolutionBudget.effectStrength*impactPriority.impactAlphaScale*impactThreatBudget.impactDecorationScale*(impact.alphaScale??1)',
  2
);

replaceOnce(
  'src/game/game.ts',
  "import { hazardGroundResolutionPresentation, safeLaneCanonicalResolutionPresentation } from './threat-impact-resolution-rendering.js';",
  "import { hazardGroundResolutionPresentation, safeLaneCanonicalResolutionPresentation } from './threat-impact-resolution-rendering.js';\nimport { battlefieldThreatLayerBudgetPresentation, safeLaneOcclusionGuardPresentation } from './threat-impact-priority-rendering.js';"
);
replaceOnce(
  'src/game/game.ts',
  "safeLaneResolution=safeLaneCanonicalResolutionPresentation({release:safeLaneReclaim.release,hazardPressure:denseBattleSafeLane.pressure,memoryCount:this.bossHazardClearedGroundMemory.length},this.presentationSettings.reducedFlash);",
  "safeLaneResolution=safeLaneCanonicalResolutionPresentation({release:safeLaneReclaim.release,hazardPressure:denseBattleSafeLane.pressure,memoryCount:this.bossHazardClearedGroundMemory.length},this.presentationSettings.reducedFlash);const safeLanePriority=safeLaneOcclusionGuardPresentation({confidence:safeLane.confidence,hazardPressure:denseBattleSafeLane.pressure,projectilePressure:Math.min(1,this.enemies.activeProjectileCount/12),criticalPressure:this.dangerState.coreCritical?1:(this.dangerState.heroCritical ? .9 : 0)},this.presentationSettings.reducedFlash),battlefieldThreatBudget=battlefieldThreatLayerBudgetPresentation({projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);"
);
replaceOnce(
  'src/game/game.ts',
  '*safeLaneReclaim.safeLaneAlphaScale*safeLaneResolution.safeLaneAlphaScale;',
  '*safeLaneReclaim.safeLaneAlphaScale*safeLaneResolution.safeLaneAlphaScale*safeLanePriority.safeLaneAlphaScale*battlefieldThreatBudget.safeLaneAlphaScale;'
);

for (const path of ['src/game/enemies.ts','src/game/spells.ts','src/game/game.ts']) {
  const text = fs.readFileSync(path,'utf8');
  if (!text.includes('threat-impact-priority-rendering.js')) throw new Error(`priority import missing in ${path}`);
}
