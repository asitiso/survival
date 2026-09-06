import fs from 'node:fs';

function replaceOnce(path,needle,replacement){
  let text=fs.readFileSync(path,'utf8');
  const first=text.indexOf(needle),last=text.lastIndexOf(needle);
  if(first<0)throw new Error(`missing needle in ${path}: ${needle.slice(0,160)}`);
  if(first!==last)throw new Error(`needle not unique in ${path}: ${needle.slice(0,160)}`);
  text=text.slice(0,first)+replacement+text.slice(first+needle.length);
  fs.writeFileSync(path,text);
}
function replaceAllRequired(path,needle,replacement,min=1){
  let text=fs.readFileSync(path,'utf8');const count=text.split(needle).length-1;
  if(count<min)throw new Error(`expected >=${min} in ${path}, got ${count}: ${needle}`);
  text=text.split(needle).join(replacement);fs.writeFileSync(path,text);
}

replaceOnce('src/game/enemies.ts',
"import { bossCriticalFocusReservationPresentation, projectileSpatialSeparationPresentation, silhouetteLocalContrastPresentation } from './threat-impact-spatial-priority-rendering.js';",
"import { bossCriticalFocusReservationPresentation, projectileSpatialSeparationPresentation, silhouetteLocalContrastPresentation } from './threat-impact-spatial-priority-rendering.js';\nimport { projectileFocusHoldPresentation, silhouetteContrastRecoveryPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';");
replaceOnce('src/game/enemies.ts',
",bossSpatialFocus=bossCriticalFocusReservationPresentation({bossSpecial:Boolean(projectile.bossArchetype),criticalCount:projectile.bossArchetype?1:0,pressure:projectileLayerBudget.pressure},reducedFlash);",
",bossSpatialFocus=bossCriticalFocusReservationPresentation({bossSpecial:Boolean(projectile.bossArchetype),criticalCount:projectile.bossArchetype?1:0,pressure:projectileLayerBudget.pressure},reducedFlash);\n      const projectileTemporal=projectileFocusHoldPresentation({critical:Boolean(projectile.bossArchetype),life:Math.max(launchLife,travelLife),release:projectileResolution.transitionAlphaScale,pressure:projectileLayerBudget.pressure},reducedFlash),projectileTemporalBudget=temporalThreatBudgetPresentation({churn:Math.min(1,this.projectiles.length/10),pressure:projectileLayerBudget.pressure,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);");
replaceAllRequired('src/game/enemies.ts',
"*bossSpatialFocus.secondaryAlphaScale;ctx.translate",
"*bossSpatialFocus.secondaryAlphaScale*projectileTemporal.directionAlphaScale*projectileTemporalBudget.secondaryAlphaScale;ctx.translate",3);
replaceOnce('src/game/enemies.ts',
",silhouetteSpatial=silhouetteLocalContrastPresentation({threatProximity:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),owner:silhouetteDirection.owner,specialist:isSpecialistEnemyType(enemy.type)},reducedMotion);",
",silhouetteSpatial=silhouetteLocalContrastPresentation({threatProximity:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),owner:silhouetteDirection.owner,specialist:isSpecialistEnemyType(enemy.type)},reducedMotion),silhouetteTemporal=silhouetteContrastRecoveryPresentation({owner:silhouetteDirection.owner,recovery:silhouetteRecoveryReentry.locomotionWeight,pressure:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10)},reducedMotion);");
replaceOnce('src/game/enemies.ts','*silhouetteSpatial.overlayAlphaScale;','*silhouetteSpatial.overlayAlphaScale*silhouetteTemporal.overlayAlphaScale;');
replaceOnce('src/game/enemies.ts','*silhouetteSpatial.trailAlphaScale;','*silhouetteSpatial.trailAlphaScale*silhouetteTemporal.trailAlphaScale;');

replaceOnce('src/game/spells.ts',
"import { impactClusterCompressionPresentation } from './threat-impact-spatial-priority-rendering.js';",
"import { impactClusterCompressionPresentation } from './threat-impact-spatial-priority-rendering.js';\nimport { impactBurstSettlePresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';");
replaceOnce('src/game/spells.ts',
",impactSpatial=impactClusterCompressionPresentation({neighborCount:impactNeighborCount,secondary:impact.secondaryKind!==undefined,life:impactLife},reducedFlash);",
",impactSpatial=impactClusterCompressionPresentation({neighborCount:impactNeighborCount,secondary:impact.secondaryKind!==undefined,life:impactLife},reducedFlash);\n        const impactCritical=impact.impactResponseOwner==='weakpoint'||impact.enemyReactionOwner==='death',impactTemporal=impactBurstSettlePresentation({life:impactLife,neighborCount:impactNeighborCount,critical:impactCritical},reducedFlash),impactTemporalBudget=temporalThreatBudgetPresentation({churn:Math.min(1,this.projectileImpactVisuals.length/10),pressure:impactThreatBudget.pressure,criticalCount:impactCritical?1:0},reducedMotion,reducedFlash);");
replaceAllRequired('src/game/spells.ts',
"*impactSpatial.fillAlphaScale*(impact.alphaScale??1)",
"*impactSpatial.fillAlphaScale*impactTemporal.decorationAlphaScale*impactTemporalBudget.secondaryAlphaScale*(impact.alphaScale??1)",2);
replaceOnce('src/game/spells.ts','*impactSpatial.edgeAlphaScale','*impactSpatial.edgeAlphaScale*impactTemporal.edgeAlphaScale');

replaceOnce('src/game/game.ts',
"import { bossCriticalFocusReservationPresentation, hazardSafeLaneCarvePresentation, safeLaneCorridorReservationPresentation } from './threat-impact-spatial-priority-rendering.js';",
"import { bossCriticalFocusReservationPresentation, hazardSafeLaneCarvePresentation, safeLaneCorridorReservationPresentation } from './threat-impact-spatial-priority-rendering.js';\nimport { hazardCorridorStabilityPresentation, safeLaneAttentionHoldPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';");
replaceOnce('src/game/game.ts',
",bossSpatialFocus=bossCriticalFocusReservationPresentation({bossSpecial:Boolean(boss&&Number.isFinite(boss.specialTimer)&&(boss.specialTimer??99)<=1.2),criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash);",
",bossSpatialFocus=bossCriticalFocusReservationPresentation({bossSpecial:Boolean(boss&&Number.isFinite(boss.specialTimer)&&(boss.specialTimer??99)<=1.2),criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash);const safeLaneTemporal=safeLaneAttentionHoldPresentation({confidence:safeLane.confidence,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,pressure:denseBattleSafeLane.pressure,release:safeLaneAttentionRecovery.recoveryAlphaScale},this.presentationSettings.reducedFlash),safeLaneTemporalBudget=temporalThreatBudgetPresentation({churn:Math.min(1,(this.bossArena.hazards.length+this.enemies.activeProjectileCount)/14),pressure:denseBattleSafeLane.pressure,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);");
replaceOnce('src/game/game.ts','*bossSpatialFocus.safeLaneAlphaScale;','*bossSpatialFocus.safeLaneAlphaScale*safeLaneTemporal.safeLaneAlphaScale*safeLaneTemporalBudget.safeLaneAlphaScale;');
replaceOnce('src/game/game.ts',
",hazardSpatial=hazardSafeLaneCarvePresentation({hazardActive:hazard.telegraph<=0&&hazard.ttl>0,laneProximity:hazardLaneProximity,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash);",
",hazardSpatial=hazardSafeLaneCarvePresentation({hazardActive:hazard.telegraph<=0&&hazard.ttl>0,laneProximity:hazardLaneProximity,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash),hazardTemporal=hazardCorridorStabilityPresentation({active:hazard.telegraph<=0&&hazard.ttl>0,life:hazard.ttl/5.4,laneProximity:hazardLaneProximity,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash);");
replaceOnce('src/game/game.ts','*hazardSpatial.fillAlphaScale,hazardEdgeAlpha=','*hazardSpatial.fillAlphaScale*hazardTemporal.fillAlphaScale,hazardEdgeAlpha=');
replaceOnce('src/game/game.ts','*hazardSpatial.hazardEdgeAlphaScale;','*hazardSpatial.hazardEdgeAlphaScale*hazardTemporal.edgeAlphaScale;');

for(const path of ['src/game/enemies.ts','src/game/spells.ts','src/game/game.ts']){
  const text=fs.readFileSync(path,'utf8');
  if(!text.includes('threat-impact-temporal-focus-rendering.js'))throw new Error(`temporal import missing in ${path}`);
}
