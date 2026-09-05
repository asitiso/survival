import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/generic-upgrade-effective-projection-identity-audit.js',import.meta.url);

test('phase 2292 deterministic generic upgrade effective-gain audit contains exactly sixty samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'generic upgrade effective gain audit module must exist');const {auditGenericUpgradeEffectiveProjectionIdentityAssets}=await import(auditUrl.href);const a=auditGenericUpgradeEffectiveProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.runtimeProjectionSamples,50);assert.equal(a.genericUpgradeCount,5);assert.equal(a.statusIdentityCount,3);assert.deepEqual([...a.statusesCovered].sort(),['capped','diminished','full']);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2293 audit proves cooldown floor truthfulness without mutating upgrade gameplay',async()=>{
  const {auditGenericUpgradeEffectiveProjectionIdentityAssets}=await import(auditUrl.href);const a=auditGenericUpgradeEffectiveProjectionIdentityAssets();
  assert.equal(a.cooldownDiminishedSeen,true);assert.equal(a.cooldownCappedSeen,true);assert.equal(a.liveHeroMutation,false);
});
