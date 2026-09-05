import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CATASTROPHE_IDENTITY_ATLAS,
  CATASTROPHE_IDENTITY_IDS,
  auditCatastropheIdentityAtlas,
  catastropheIdentityIcon,
} from '../dist/game/catastrophe-identity-assets.js';

test('phase 2001 catastrophe identity atlas covers five rotating catastrophes in unique static cells',()=>{
  assert.deepEqual([...CATASTROPHE_IDENTITY_IDS],['goldenNight','frenzy','arcaneSurge','redMoon','guardianGrace']);
  assert.deepEqual(CATASTROPHE_IDENTITY_ATLAS,{src:'./assets/ui/catastrophe-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  assert.equal(fs.existsSync(new URL('../assets/ui/catastrophe-icons.png',import.meta.url)),true);
  const cells=new Set();
  for(const id of CATASTROPHE_IDENTITY_IDS){
    const icon=catastropheIdentityIcon(id); cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.id,id); assert.equal(icon.sw,96); assert.equal(icon.sh,96);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.ok(icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192);
  }
  assert.equal(cells.size,5);
  const audit=auditCatastropheIdentityAtlas();
  assert.equal(audit.itemCount,5); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5);
  assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
