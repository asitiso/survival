import test from 'node:test'; import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2150 release freeze binds response evade identity evidence',()=>{const f=auditReleaseFreeze();assert.equal(f.responseEvadeIdentityAssetsPassed,true);assert.equal(f.responseEvadeIdentityAssetsSamples,60);assert.equal(f.passed,true);});

test('phase 2150 candidate fails closed on forged response evade evidence and sample mutation changes signature',()=>{const base=releaseCandidateAudit();const forged=structuredClone(base.evidence);forged.releaseFreeze.responseEvadeIdentityAssetsPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));const changed=structuredClone(base.evidence);changed.releaseFreeze.responseEvadeIdentityAssetsSamples+=1;const mutated=releaseCandidateAudit(changed);assert.notEqual(mutated.signature,base.signature);assert.match(base.markdown,/response-evade-identity-assets safe \(60\)/);});
