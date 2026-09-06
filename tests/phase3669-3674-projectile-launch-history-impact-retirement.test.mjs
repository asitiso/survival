import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { projectileMultiHitImpactHandoff } from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const first=(continues=true)=>projectileMultiHitImpactHandoff({launchOffset:{x:-14,y:4},launchTtl:.05,launchMaxTtl:.1,priorImpactCount:0,continues},false);
test('first impact retires launch travel owner',()=>{assert.equal(first(true).retireTravelOwner,true);});
test('terminal first impact also retires launch travel owner',()=>{assert.equal(first(false).retireTravelOwner,true);});
test('subsequent multihit does not request duplicate travel retirement',()=>{const p=projectileMultiHitImpactHandoff({launchOffset:{x:-14,y:4},launchTtl:.04,launchMaxTtl:.1,priorImpactCount:1,continues:true},false);assert.equal(p.retireTravelOwner,false);});
test('impact identity owns after first launch retirement',()=>{assert.equal(first(true).travelHandoffOwner,'impact');});
test('retirement stays presentation-only',()=>{assert.equal(first(true).presentationOnly,true);});
test('live spell impact retires absolute launch history metadata',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/impactHandoff\.retireTravelOwner/);assert.match(s,/delete p\.visualLaunchWorldOrigin/);assert.match(s,/delete p\.visualLaunchTravelTtl/);assert.match(s,/delete p\.visualLaunchTravelMaxTtl/);});
