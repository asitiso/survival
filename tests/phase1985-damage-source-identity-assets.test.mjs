import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAMAGE_SOURCE_IDENTITY_ATLAS,
  DAMAGE_SOURCE_IDENTITY_SOURCES,
  auditDamageSourceIdentityAtlas,
  damageSourceIdentityIcon,
} from '../dist/game/damage-source-identity-assets.js';

test('phase 1985 damage source identity atlas covers five sources in unique static cells',()=>{
  assert.deepEqual([...DAMAGE_SOURCE_IDENTITY_SOURCES],['contact','projectile','explosion','arena','strain']);
  assert.deepEqual(DAMAGE_SOURCE_IDENTITY_ATLAS,{src:'./assets/ui/damage-source-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const cells=new Set();
  for(const source of DAMAGE_SOURCE_IDENTITY_SOURCES){
    const icon=damageSourceIdentityIcon(source);
    cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.sw,96); assert.equal(icon.sh,96);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.ok(icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192);
  }
  assert.equal(cells.size,5);
  const audit=auditDamageSourceIdentityAtlas();
  assert.equal(audit.itemCount,5); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
