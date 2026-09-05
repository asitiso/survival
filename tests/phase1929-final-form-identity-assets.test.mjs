import test from 'node:test';
import assert from 'node:assert/strict';
import { FINAL_FORM_IDENTITY_IDS, FINAL_FORM_IDENTITY_ATLAS, finalFormIdentityIcon, auditFinalFormIdentityAtlas } from '../dist/game/final-form-identity-assets.js';

test('Phase 1929 final forms map to twelve unique atlas cells',()=>{
  assert.equal(FINAL_FORM_IDENTITY_IDS.length,12);
  const cells=new Set(FINAL_FORM_IDENTITY_IDS.map(id=>{const i=finalFormIdentityIcon(id); return `${i.sx}:${i.sy}`}));
  assert.equal(cells.size,12);
  assert.deepEqual(FINAL_FORM_IDENTITY_ATLAS,{src:'./assets/ui/final-form-icons.png',columns:4,rows:3,cellSize:96,width:384,height:288});
  const a=auditFinalFormIdentityAtlas(); assert.equal(a.coverage,1); assert.equal(a.uniqueCellCount,12); assert.deepEqual(a.outOfBounds,[]);
});
