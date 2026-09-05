import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBossActionAssist } from '../dist/game/boss-action-assist-audit.js';

test('phase 511 boss action assist audit covers every boss archetype and readiness pattern',()=>{
  const a=auditBossActionAssist(); assert.equal(a.archetypeCount,6); assert.ok(a.samples.length>=48);
});
test('phase 512 imminent specials have a usable one-action response whenever a mapped action is ready',()=>{
  const a=auditBossActionAssist(); assert.ok(a.responseCoverage>=.98); assert.equal(a.multiActionViolations,0);
});
test('phase 513 low-health potion rescue remains available without creating early false prompts',()=>{
  const a=auditBossActionAssist(); assert.ok(a.potionRescueCoverage>=.99); assert.equal(a.earlyFalsePromptCount,0);
});
test('phase 514 boss action assist audit passes release thresholds',()=>{
  const a=auditBossActionAssist(); assert.equal(a.passed,true); assert.deepEqual(a.issues,[]);
});
