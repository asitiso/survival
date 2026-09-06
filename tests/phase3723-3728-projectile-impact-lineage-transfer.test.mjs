import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactLineageTransferPresentation;
test('impact lineage transfer helper exists',()=>assert.equal(typeof fn,'function'));
test('multihit impacts inherit one source lineage',()=>{const a=fn?.({sourceLineageKey:'projectile-7',impactIndex:0,continues:true},false),b=fn?.({sourceLineageKey:'projectile-7',impactIndex:2,continues:true},false);assert.ok(a&&b);assert.equal(a.lineageKey,b.lineageKey);});
test('chain impacts preserve cast lineage across jumps',()=>{const a=fn?.({sourceLineageKey:'chain-3',impactIndex:1,secondaryKind:'chain',continues:true},false),b=fn?.({sourceLineageKey:'chain-3',impactIndex:4,secondaryKind:'chain',continues:false},false);assert.ok(a&&b);assert.equal(a.lineageKey,'chain-3');assert.equal(b.lineageKey,'chain-3');});
test('splash impacts branch under their parent lineage',()=>{const p=fn?.({sourceLineageKey:'projectile-9',impactIndex:1,secondaryKind:'splash',continues:true},false);assert.ok(p);assert.match(p.lineageKey,/projectile-9:splash/);});
test('terminal primary impact retires source owner after transfer',()=>{const p=fn?.({sourceLineageKey:'projectile-4',impactIndex:0,continues:false},false);assert.ok(p);assert.equal(p.retireSource,true);assert.equal(p.presentationOnly,true);});
test('live spell visuals carry explicit impact lineage metadata',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/visualImpactLineageId/);assert.match(s,/impactLineageKey/);assert.match(s,/projectileImpactLineageTransferPresentation/);});
