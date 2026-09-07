import test from 'node:test';
import assert from 'node:assert/strict';
import { auditAutoTransitionLatency } from '../dist/game/auto-transition-latency-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 527 AUTO transition audit replays sticky targeting and weakpoint changes across frame sequences',()=>{
  const a=auditAutoTransitionLatency();
  assert.ok(a.targetFrames>=120);
  assert.ok(a.weakpointFrames>=60);
  assert.ok(a.intentionalSwitches>=2);
});
test('phase 528 marginal challengers do not create target flicker before the material switch threshold',()=>{
  const a=auditAutoTransitionLatency();
  assert.equal(a.unnecessarySwitches,0);
  assert.ok(a.maxSwitchesPerSecond<=2);
});
test('phase 529 AUTO target and weakpoint changes stay inside a human reaction window instead of frame-perfect switching',()=>{
  const a=auditAutoTransitionLatency();
  assert.ok(a.materialSwitchLatencyFrames>=6&&a.materialSwitchLatencyFrames<=24);
  assert.ok(a.coreThreatSwitchLatencyFrames>=3&&a.coreThreatSwitchLatencyFrames<=18);
  assert.ok(a.weakpointSwitchLatencyFrames>=8&&a.weakpointSwitchLatencyFrames<=22);
});
test('phase 530 release candidate fails closed when AUTO transition latency regresses',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const failed={...evidence,autoTransitionLatency:{...evidence.autoTransitionLatency,passed:false,issues:['forced-auto-latency']}};
  const audit=releaseCandidateAudit(failed);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('auto-transition-latency'));
});
