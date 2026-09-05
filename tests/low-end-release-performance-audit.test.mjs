import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLowEndReleasePerformance, simulateLowEndStress } from '../dist/game/low-end-release-performance-audit.js';

test('phase 731 sustained low-end pressure reaches minimal presentation within 180 frames without touching combat logic',()=>{const s=simulateLowEndStress(30,.95,180);assert.equal(s.finalTier,'minimal');assert.ok(s.framesToMinimal<=180);assert.equal(s.enemyLogicMultiplier,1);});
test('phase 732 minimal low-end policy preserves the full telegraph cap while bounding decorative budgets',()=>{const a=auditLowEndReleasePerformance();assert.equal(a.telegraphCap,24);assert.ok(a.maxParticleCap<=64);assert.ok(a.maxTrailCap<=28);assert.equal(a.telegraphsPreserved,true);});
test('phase 733 brief frame spikes do not downgrade and recovery remains intentionally slower than degradation',()=>{const a=auditLowEndReleasePerformance();assert.equal(a.shortSpikeDowngrades,0);assert.ok(a.recoveryFramesRequired>a.maxFramesToMinimal/2);assert.equal(a.hysteresisPreserved,true);});
test('phase 734 low-end release audit covers sustained stress profiles and stays inside low-device entity ceilings',()=>{const a=auditLowEndReleasePerformance();assert.ok(a.samples>=6);assert.equal(a.enemyLogicCap,220);assert.ok(a.projectileCap<=90);assert.ok(a.effectCap<=60);assert.equal(a.passed,true);});
