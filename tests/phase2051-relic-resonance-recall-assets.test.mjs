import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RELIC_RESONANCE_RECALL_IDS,
  auditRelicResonanceRecallAtlas,
  relicResonanceRecallIcon,
  relicResonanceRecallPresentation,
  relicResonanceTierBadge,
} from '../dist/game/relic-resonance-recall-assets.js';

test('phase 2051 reuses all relic build identity cells as static resonance recall identities',()=>{
  assert.equal(RELIC_RESONANCE_RECALL_IDS.length,14);
  const atlas=auditRelicResonanceRecallAtlas();
  assert.equal(atlas.relicCount,14); assert.equal(atlas.coverage,1); assert.equal(atlas.uniqueCellCount,14); assert.deepEqual(atlas.outOfBounds,[]); assert.equal(atlas.passed,true);
  for(const id of RELIC_RESONANCE_RECALL_IDS){
    const icon=relicResonanceRecallIcon(id);
    assert.equal(icon.atlasSrc,'./assets/ui/build-identity-icons.png');
    assert.equal(icon.toastIdentitySupported,true); assert.equal(icon.stripBadgeSupported,true);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0); assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
  }
  assert.equal(relicResonanceTierBadge(0),null);
  assert.equal(relicResonanceTierBadge(1)?.label,'I'); assert.equal(relicResonanceTierBadge(2)?.label,'II'); assert.equal(relicResonanceTierBadge(3)?.label,'III');
  assert.equal(relicResonanceRecallPresentation(null,3),null); assert.equal(relicResonanceRecallPresentation('winter-heart',0),null);
  assert.equal(relicResonanceRecallPresentation('winter-heart',2)?.badge.label,'II');
});
