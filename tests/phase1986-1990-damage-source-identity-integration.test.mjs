import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { damageReasonCue, recordDamageReason } from '../dist/game/damage-reason-feedback.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1986-1990 Game loads damage source atlas asynchronously and keeps text fallback',()=>{
  assert.match(source,/DAMAGE_SOURCE_IDENTITY_ATLAS/);
  assert.match(source,/damageSourceIdentityIcon/);
  assert.match(source,/damageSourceIdentityAtlasImage/);
  assert.match(source,/damageSourceIdentityAtlasReady/);
  assert.match(source,/initializeDamageSourceIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*DAMAGE_SOURCE_IDENTITY_ATLAS\.src/);
  assert.match(source,/this\.damageSourceIdentityAtlasReady\s*&&\s*this\.damageSourceIdentityAtlasImage/);
  assert.match(source,/ctx\.drawImage\(this\.damageSourceIdentityAtlasImage/);
  assert.match(source,/const text=`\$\{state\.label\} · -\$\{Math\.max\(1,Math\.round\(state\.amount\)\)\}`/);
});

test('phase 1986-1990 damage thresholds and same-source merge behavior remain unchanged',()=>{
  assert.equal(damageReasonCue('contact',11.99,100).severity,'normal');
  assert.equal(damageReasonCue('projectile',12,100).severity,'heavy');
  assert.equal(damageReasonCue('explosion',31.99,100).severity,'heavy');
  assert.equal(damageReasonCue('arena',32,100).severity,'critical');
  const first=recordDamageReason(null,'projectile',5,100,10);
  const merged=recordDamageReason(first,'projectile',6,100,10.08);
  assert.equal(merged.source,'projectile'); assert.equal(merged.amount,11);
  const blocked=recordDamageReason(first,'contact',3,100,10.08);
  assert.deepEqual(blocked,first);
});
