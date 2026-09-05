import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MYTHIC_LAST_LAW_IDENTITY_ATLAS,
  MYTHIC_LAST_LAW_IDENTITY_IDS,
  auditMythicLastLawIdentityAtlas,
  mythicLastLawIdentityIcon,
} from '../dist/game/endless/mythic-last-law-identity-assets.js';

test('phase 2009 mythic last law atlas covers six laws in six unique static cells',()=>{
  assert.deepEqual([...MYTHIC_LAST_LAW_IDENTITY_IDS],['solar-rupture','brood-crown','iron-verdict','null-eclipse','twin-cataclysm','broken-hour']);
  assert.deepEqual(MYTHIC_LAST_LAW_IDENTITY_ATLAS,{src:'./assets/ui/mythic-last-law-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  assert.equal(fs.existsSync(new URL('../assets/ui/mythic-last-law-icons.png',import.meta.url)),true);
  const cells=new Set();
  for(const id of MYTHIC_LAST_LAW_IDENTITY_IDS){
    const icon=mythicLastLawIdentityIcon(id); cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.id,id); assert.equal(icon.sw,96); assert.equal(icon.sh,96);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.toastIdentitySupported,true); assert.equal(icon.safeLaneIdentitySupported,true);
    assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.ok(icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192);
  }
  assert.equal(cells.size,6);
  const audit=auditMythicLastLawIdentityAtlas();
  assert.equal(audit.itemCount,6); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6);
  assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
