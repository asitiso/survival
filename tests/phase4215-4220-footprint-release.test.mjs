import test from 'node:test';
import assert from 'node:assert/strict';
import * as recovery from '../dist/game/threat-impact-spatial-recovery-rendering.js';
import * as release from '../dist/game/threat-impact-footprint-release-rendering.js';

test('Phase 4215 projectile footprint release does not snap back while pressure remains',()=>{const p=recovery.projectileCorridorReleasePresentation({pressure:1,release:1,critical:false});assert.equal(p.bodyAlphaScale,1);assert.ok(p.trailAlphaScale<=.78);});
test('Phase 4216 telegraph safe-lane footprint retains reserve through release',()=>{const p=recovery.telegraphSafeLaneReleasePresentation({overlap:1,release:1,telegraphActive:true});assert.equal(p.telegraphEdgeAlphaScale,.98);assert.ok(p.secondaryAlphaScale<=.82);});
test('Phase 4217 impact footprint release keeps fill below canonical material',()=>{const p=recovery.impactCorridorReleasePresentation({life:1,heroProximity:1,neighborCount:8,release:1,critical:false});assert.equal(p.canonicalAlphaScale,1);assert.ok(p.fillAlphaScale<=.78);});
test('Phase 4218 specialist recovery trail stays bounded under hazard ownership',()=>{const p=recovery.specialistDirectionalReleasePresentation({owner:'recovery',hazardPressure:1,recovery:1});assert.equal(p.bodyAlphaScale,1);assert.ok(p.trailAlphaScale<=.68);});
test('Phase 4219 footprint release is monotonic without restoring protected material above one',()=>{const low=release.projectileFootprintReleasePresentation({pressure:.8,release:.25,critical:false}),high=release.projectileFootprintReleasePresentation({pressure:.8,release:.75,critical:false});assert.ok(low.trailCeiling<=high.trailCeiling);assert.ok(high.trailCeiling<=1);assert.equal(high.canonicalBodyScale,1);});
test('Phase 4220 release budget preserves critical body and safe-lane ownership',()=>{const p=release.footprintReleaseBudgetPresentation({release:1,pressure:1,safeLaneVisible:true,criticalCount:3},true,true);assert.equal(p.criticalScale,1);assert.equal(p.canonicalBodyScale,1);assert.equal(p.safeLaneScale,1);assert.ok(p.secondaryCeiling<1);});
