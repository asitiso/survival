import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ASCENSION_MUTATOR_IDENTITY_ATLAS, ASCENSION_MUTATOR_IDENTITY_IDS, auditAscensionMutatorIdentityAtlas, ascensionMutatorIdentityIcon } from '../dist/game/endless/ascension-mutator-identity-assets.js';

const expected=['accelerated_projectiles','reinforced_elites','volatile_death','scarce_shop'];

test('phase 2025 ascension mutator atlas covers four threats in four unique static cells',()=>{
  assert.deepEqual([...ASCENSION_MUTATOR_IDENTITY_IDS],expected);
  assert.deepEqual(ASCENSION_MUTATOR_IDENTITY_ATLAS,{src:'./assets/ui/ascension-mutator-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192});
  assert.equal(fs.existsSync(new URL('../assets/ui/ascension-mutator-icons.png',import.meta.url)),true);
  const cells=new Set();
  for(const id of ASCENSION_MUTATOR_IDENTITY_IDS){
    const icon=ascensionMutatorIdentityIcon(id); cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.id,id); assert.equal(icon.sw,96); assert.equal(icon.sh,96);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.toastIdentitySupported,true); assert.equal(icon.activeRecallIdentitySupported,true); assert.equal(icon.maxVisibleRecallIcons,3);
    assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.ok(icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=192&&icon.sy+icon.sh<=192);
  }
  assert.equal(cells.size,4);
  const audit=auditAscensionMutatorIdentityAtlas();
  assert.equal(audit.itemCount,4); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,4); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
