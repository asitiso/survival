import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIELD_NODE_IDENTITY_ATLAS,
  FIELD_NODE_IDENTITY_KINDS,
  auditFieldNodeIdentityAtlas,
  fieldNodeIdentityIcon,
  fieldNodeIdentityPresentation,
} from '../dist/game/field-node-identity-assets.js';

test('phase 1993 field node identity atlas covers five endless node kinds in unique static cells',()=>{
  assert.deepEqual([...FIELD_NODE_IDENTITY_KINDS],['mana_well','sanctuary_zone','barricade','safe_corridor','volatile_zone']);
  assert.deepEqual(FIELD_NODE_IDENTITY_ATLAS,{src:'./assets/ui/field-node-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const expected={
    mana_well:{label:'MANA',color:'#9b7cff'}, sanctuary_zone:{label:'SAFE',color:'#7ce8b7'},
    barricade:{label:'WALL',color:'#d0b277'}, safe_corridor:{label:'PATH',color:'#75d8ff'}, volatile_zone:{label:'RISK',color:'#ff6c83'},
  };
  const cells=new Set();
  for(const kind of FIELD_NODE_IDENTITY_KINDS){
    const icon=fieldNodeIdentityIcon(kind); const presentation=fieldNodeIdentityPresentation(kind);
    cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.sw,96); assert.equal(icon.sh,96); assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.deepEqual(presentation,expected[kind]);
    assert.ok(icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192);
  }
  assert.equal(cells.size,5);
  const audit=auditFieldNodeIdentityAtlas();
  assert.equal(audit.itemCount,5); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
