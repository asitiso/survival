import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evolveWorld, createDefaultWorldState } from '../dist/game/endless/world-evolution.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1994-1998 Game loads field node atlas asynchronously and preserves text fallback',()=>{
  assert.match(source,/FIELD_NODE_IDENTITY_ATLAS/);
  assert.match(source,/fieldNodeIdentityIcon/);
  assert.match(source,/fieldNodeIdentityPresentation/);
  assert.match(source,/fieldNodeIdentityAtlasImage/);
  assert.match(source,/fieldNodeIdentityAtlasReady/);
  assert.match(source,/initializeFieldNodeIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*FIELD_NODE_IDENTITY_ATLAS\.src/);
  assert.match(source,/this\.fieldNodeIdentityAtlasReady\s*&&\s*this\.fieldNodeIdentityAtlasImage/);
  assert.match(source,/ctx\.drawImage\(this\.fieldNodeIdentityAtlasImage/);
  assert.match(source,/ctx\.fillText\(presentation\.label/);
});

test('phase 1994-1998 existing world node generation contracts remain unchanged',()=>{
  const legacy={elapsedMs:480000,threat:3,fate:null,spellFusionCount:0};
  const a=evolveWorld(legacy,createDefaultWorldState(),{seed:42,cursor:0});
  const b=evolveWorld(legacy,createDefaultWorldState(),{seed:42,cursor:0});
  assert.deepEqual(a,b);
  assert.ok(a.state.nodes.length>=1&&a.state.nodes.length<=2);
  for(const node of a.state.nodes){
    assert.ok(['safe_corridor','barricade','mana_well','volatile_zone','sanctuary_zone'].includes(node.kind));
    assert.ok(node.radius>=0.1&&node.radius<=0.25);
    assert.ok(node.expiresAtMs>legacy.elapsedMs);
  }
});
