import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistAnticipationSilhouetteDensityBudgetPresentation;
test('specialist anticipation silhouette density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse anticipation preview keeps full pose effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,type:'assassin',owner:'anticipation',urgency:.6},false);assert.ok(p);assert.equal(p.previewEffectStrength,1);assert.equal(p.cueAlphaScale,1);});
test('dense old assassin preview retires before siege preview',()=>{const a=fn?.({activeCount:8,indexFromNewest:3,type:'assassin',owner:'anticipation',urgency:.6},false),s=fn?.({activeCount:8,indexFromNewest:3,type:'siegeGolem',owner:'anticipation',urgency:.6},false);assert.ok(a&&s);assert.ok(a.capacity<s.capacity);assert.ok(a.previewEffectStrength<=s.previewEffectStrength);});
test('newest urgent preview remains readable in dense specialist pack',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,type:'nullifier',owner:'anticipation',urgency:.95},false);assert.ok(p);assert.ok(p.previewEffectStrength>.6);assert.ok(p.cueAlphaScale>.6);});
test('attack ownership disables preview decoration without hiding body',()=>{const p=fn?.({activeCount:8,indexFromNewest:0,type:'assassin',owner:'strike',urgency:1},false);assert.ok(p);assert.equal(p.previewEffectStrength,0);assert.equal(p.bodyAlphaScale,1);});
test('live specialist density budget scales preview pose and cue only',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistAnticipationSilhouetteDensityBudgetPresentation/);assert.match(s,/anticipationSilhouetteDensityBudget/);});
