import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
import { RUN_FOUNDATION_TRAIT_IDS, RUN_FOUNDATION_RELIC_IDS, RUN_FOUNDATION_ASCENSION_IDS, runTraitIdentity, relicAcquisitionIdentity, ascensionSelectionIdentity } from '../dist/game/run-foundation-identity-assets.js';

test('phase 2120 foundation identities reuse existing 46 cells without new atlas',()=>{
  assert.equal(RUN_FOUNDATION_TRAIT_IDS.length,8); assert.equal(RUN_FOUNDATION_RELIC_IDS.length,14); assert.equal(RUN_FOUNDATION_ASCENSION_IDS.length,24);
  for(const id of RUN_FOUNDATION_TRAIT_IDS){const x=runTraitIdentity(id);assert.equal(x.atlasSrc,'./assets/ui/decision-path-icons.png');assert.equal(x.persistentRecallSupported,true);assert.equal(x.motionAmplitude,0);}
  for(const id of RUN_FOUNDATION_RELIC_IDS){const x=relicAcquisitionIdentity(id);assert.equal(x.atlasSrc,'./assets/ui/build-identity-icons.png');assert.equal(x.acquisitionToastSupported,true);}
  for(const id of RUN_FOUNDATION_ASCENSION_IDS){const x=ascensionSelectionIdentity(id);assert.equal(x.atlasSrc,'./assets/ui/deep-run-decision-icons.png');assert.equal(x.selectionToastSupported,true);}
});

test('phase 2121-2124 game wires trait persistent recall and relic/ascension selection toasts',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/drawRunTraitRecall\(/); assert.match(game,/showRunTraitEventToast\(/);
  assert.match(game,/showBuildIdentityEventToast\(`유물 장착/); assert.match(game,/showDeepRunAscensionEventToast\(`승천 선택/);
  assert.match(game,/syncRunFoundationIdentityTracker\(false\)/);
});
