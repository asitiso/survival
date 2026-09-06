import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { specialistStrikeOriginCoherencePresentation } from '../dist/game/specialist-strike-origin-coherence-rendering.js';

const base={type:'assassin',radius:24,facingX:1,facingY:0,pullback:.1,lunge:.9,resolve:.15,silhouetteForward:11,silhouetteLateral:2};
test('strike origin follows silhouette facing',()=>{const p=specialistStrikeOriginCoherencePresentation(base,false);assert.ok(p.originOffsetX>0);assert.ok(Math.abs(p.originOffsetY)<8);});
test('assassin strike has stronger forward follow than shieldbearer',()=>{const a=specialistStrikeOriginCoherencePresentation(base,false),s=specialistStrikeOriginCoherencePresentation({...base,type:'shieldbearer'},false);assert.ok(a.forwardFollow>s.forwardFollow);});
test('resolve owner reduces forward exaggeration',()=>{const s=specialistStrikeOriginCoherencePresentation(base,false),r=specialistStrikeOriginCoherencePresentation({...base,lunge:.1,resolve:.9},false);assert.ok(r.forwardFollow<s.forwardFollow);});
test('lateral silhouette offset is bounded',()=>{const p=specialistStrikeOriginCoherencePresentation({...base,silhouetteLateral:99},false);assert.ok(Math.abs(p.lateralFollow)<=8.001);});
test('reduced motion compresses origin distance',()=>{const f=specialistStrikeOriginCoherencePresentation(base,false),r=specialistStrikeOriginCoherencePresentation(base,true);assert.ok(Math.hypot(r.originOffsetX,r.originOffsetY)<Math.hypot(f.originOffsetX,f.originOffsetY));});
test('coherence result is presentation-only and live strike origin is queued',()=>{const p=specialistStrikeOriginCoherencePresentation({...base,facingX:0,facingY:0},false);assert.equal(p.presentationOnly,true);assert.ok(Number.isFinite(p.originOffsetX));const src=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(src,/specialistStrikeOriginVfx/);assert.match(src,/specialistStrikeOriginCoherencePresentation/);});
