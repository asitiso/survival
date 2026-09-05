import test from 'node:test';
import assert from 'node:assert/strict';
import { finalFormFinisherFeedback } from '../dist/game/endless/final-form-finisher-feedback.js';
import { finalFormEvadeFinisher } from '../dist/game/endless/final-form-evade-finisher.js';
import { arenaDodgeFinisherProfile } from '../dist/game/endless/arena-dodge-finisher.js';
import { soundDescriptor } from '../dist/game/audio.js';
import fs from 'node:fs';

const forms=['solar-sovereign','phoenix-lord','volcanic-archon','oath-guardian'];

test('four evade finisher families expose distinct bounded presentation identities',()=>{
  const profiles=forms.map((id)=>finalFormFinisherFeedback(id,finalFormEvadeFinisher(id,arenaDodgeFinisherProfile())));
  assert.deepEqual(profiles.map((p)=>p.family),['execution','chain','control','bulwark']);
  assert.equal(new Set(profiles.map((p)=>p.soundKind)).size,4);
  assert.equal(new Set(profiles.map((p)=>p.accent)).size,4);
  for(const p of profiles){
    assert.ok(p.particleCount>=4&&p.particleCount<=18);
    assert.ok(p.ringCount>=1&&p.ringCount<=3);
    assert.ok(p.trailCount>=0&&p.trailCount<=8);
    assert.ok(p.ttl>0&&p.ttl<=.5);
    assert.ok(p.shake>=1&&p.shake<=5);
  }
});

test('new finisher audio cues remain short high-priority combat cues',()=>{
  for(const kind of ['finisherExecution','finisherChain','finisherControl','finisherBulwark']){
    const d=soundDescriptor(kind);
    assert.ok(d.duration>=.12&&d.duration<=.32,kind);
    assert.ok(d.priority>=3,kind);
    assert.ok(d.cooldown>=.12,kind);
  }
});

test('game consumes the feedback profile at the existing x5 finisher seam',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.ok(source.includes('finalFormFinisherFeedback'));
  assert.ok(source.includes('finisherFeedback.soundKind'));
  assert.ok(source.includes('finisherFeedback.particleCount'));
  assert.ok(source.includes('finisherFeedback.ringCount'));
});
