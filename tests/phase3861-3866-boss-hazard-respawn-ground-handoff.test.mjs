import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardRespawnGroundHandoffPresentation;
test('boss respawn ground handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('memory owner preserves unrelated ground memory',()=>{const p=fn?.({coherenceOwner:'memory',memoryLife:.7,nextHazardTelegraph:.8},false);assert.ok(p);assert.equal(p.owner,'memory');assert.equal(p.memoryAlphaScale,1);assert.equal(p.telegraphAlphaScale,1);});
test('handoff owner crossfades old memory and new telegraph',()=>{const p=fn?.({coherenceOwner:'handoff',memoryLife:.7,nextHazardTelegraph:.7},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.memoryAlphaScale>0&&p.memoryAlphaScale<1);assert.ok(p.telegraphAlphaScale>0&&p.telegraphAlphaScale<=1);});
test('urgent handoff shifts ownership toward new spawn',()=>{const slow=fn?.({coherenceOwner:'handoff',memoryLife:.7,nextHazardTelegraph:.8},false),urgent=fn?.({coherenceOwner:'handoff',memoryLife:.7,nextHazardTelegraph:.2},false);assert.ok(slow&&urgent);assert.ok(urgent.memoryAlphaScale<slow.memoryAlphaScale);assert.ok(urgent.telegraphAlphaScale>=slow.telegraphAlphaScale);});
test('spawn owner fully retires old ground memory',()=>{const p=fn?.({coherenceOwner:'spawn',memoryLife:.4,nextHazardTelegraph:.1},false);assert.ok(p);assert.equal(p.owner,'spawn');assert.equal(p.memoryAlphaScale,0);assert.equal(p.telegraphAlphaScale,1);});
test('live hazard and memory draws compose respawn handoff',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardRespawnGroundHandoffPresentation/);assert.match(s,/respawnGroundHandoff/);});
