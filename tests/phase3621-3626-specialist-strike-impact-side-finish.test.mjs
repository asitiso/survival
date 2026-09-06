import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { specialistStrikeImpactSideFinishPresentation } from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const base={origin:{x:80,y:100},target:{x:120,y:100},ttl:.035,maxTtl:.18,type:'assassin'};
test('late strike arrival creates impact-side finish',()=>{const p=specialistStrikeImpactSideFinishPresentation(base,false,false);assert.equal(p.visible,true);assert.ok(p.alpha>0);});
test('finish sits on target side of strike direction',()=>{const p=specialistStrikeImpactSideFinishPresentation(base,false,false);assert.ok(p.start.x>=base.target.x-1);assert.ok(p.end.x>p.start.x);});
test('early strike does not show finish yet',()=>{const p=specialistStrikeImpactSideFinishPresentation({...base,ttl:.16},false,false);assert.equal(p.visible,false);});
test('finish length is bounded',()=>{const p=specialistStrikeImpactSideFinishPresentation(base,false,false);assert.ok(p.length<=18.001);});
test('reduced flash lowers impact finish alpha',()=>{const f=specialistStrikeImpactSideFinishPresentation(base,false,false),r=specialistStrikeImpactSideFinishPresentation(base,false,true);assert.ok(r.alpha<f.alpha);});
test('live specialist strike draw consumes impact-side finish',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistStrikeImpactSideFinishPresentation/);assert.match(s,/impactFinish\.visible/);});
