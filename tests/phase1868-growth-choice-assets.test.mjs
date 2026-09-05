import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const GENERIC=['maxHp','moveSpeed','spellPower','cooldown','pickupRadius','relic','fusion'];
const SPELLS=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

test('phase 1868 growth choice atlas covers generic growth, relic, and fusion identities', async () => {
  assert.equal(fs.existsSync(new URL('../assets/ui/growth-choice-icons.png', import.meta.url)), true);
  const assets=await import('../dist/game/growth-choice-icon-assets.js');
  const audit=assets.auditGrowthChoiceIconAtlas(GENERIC);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,7);
  assert.equal(audit.missing.length,0);
  assert.equal(audit.outOfBounds.length,0);
  assert.equal(assets.GROWTH_CHOICE_ICON_ATLAS.columns,4);
  assert.equal(assets.GROWTH_CHOICE_ICON_ATLAS.rows,2);
  assert.equal(assets.GROWTH_CHOICE_ICON_ATLAS.cellSize,96);
});

test('spell growth choices reuse the existing action icon atlas instead of duplicating art', async () => {
  const assets=await import('../dist/game/growth-choice-icon-assets.js');
  for(const id of SPELLS){
    const icon=assets.growthChoiceIcon(id);
    assert.equal(icon?.atlasSrc,'./assets/ui/action-icons.png');
    assert.equal(icon?.animated,false);
    assert.equal(icon?.motionAmplitude,0);
  }
  assert.equal(assets.growthChoiceIcon('relic:abyss-eye')?.assetId,'abyss-eye');
  assert.equal(assets.growthChoiceIcon('relic:abyss-eye')?.atlasSrc,'./assets/ui/build-identity-icons.png');
  assert.equal(assets.growthChoiceIcon('fusion:solar-detonation')?.assetId,'solar-detonation');
  assert.equal(assets.growthChoiceIcon('fusion:solar-detonation')?.atlasSrc,'./assets/ui/build-identity-icons.png');
});
