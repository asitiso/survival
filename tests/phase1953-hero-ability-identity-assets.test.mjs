import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  HERO_ABILITY_IDENTITY_ATLAS,
  HERO_ABILITY_ACTIONS,
  HERO_ABILITY_HERO_IDS,
  heroAbilityIdentityIcon,
  heroAbilitySpellIdentityIcon,
  auditHeroAbilityIdentityAtlas,
} from '../dist/game/hero-ability-identity-assets.js';

const SPELLS = ['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('phase 1953 hero ability atlas covers 4 heroes x 6 actions with unique cells', () => {
  assert.deepEqual(HERO_ABILITY_HERO_IDS, ['arkan','seria','kain','edric']);
  assert.deepEqual(HERO_ABILITY_ACTIONS, ['spell1','spell2','spell3','spell4','ultimate1','ultimate2']);
  assert.deepEqual(HERO_ABILITY_IDENTITY_ATLAS, {
    src: './assets/ui/hero-ability-icons.png', columns: 6, rows: 4, cellSize: 96, width: 576, height: 384,
  });
  const audit = auditHeroAbilityIdentityAtlas();
  assert.equal(audit.itemCount, 24);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 24);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 1953 spell mapping is stable and every icon is static with non-blocking legacy/text fallback', () => {
  for (const heroId of HERO_ABILITY_HERO_IDS) {
    for (let index = 0; index < SPELLS.length; index += 1) {
      const spellId = SPELLS[index];
      const actionId = HERO_ABILITY_ACTIONS[index];
      const bySpell = heroAbilitySpellIdentityIcon(heroId, spellId);
      const byAction = heroAbilityIdentityIcon(heroId, actionId);
      assert.deepEqual(bySpell, byAction);
      assert.equal(byAction.heroId, heroId);
      assert.equal(byAction.actionId, actionId);
      assert.equal(byAction.legacyFallbackActionId, actionId);
      assert.equal(byAction.animated, false);
      assert.equal(byAction.motionAmplitude, 0);
      assert.equal(byAction.textFallbackPreserved, true);
      assert.equal(byAction.legacyFallbackPreserved, true);
      assert.equal(byAction.loadFailureBlocksGameplay, false);
      assert.ok(byAction.sx >= 0 && byAction.sy >= 0);
      assert.ok(byAction.sx + byAction.sw <= HERO_ABILITY_IDENTITY_ATLAS.width);
      assert.ok(byAction.sy + byAction.sh <= HERO_ABILITY_IDENTITY_ATLAS.height);
    }
  }
});

test('phase 1953 declared hero ability PNG exists at the promised dimensions', () => {
  const file = path.resolve(HERO_ABILITY_IDENTITY_ATLAS.src.replace(/^\.\//, ''));
  const buffer = fs.readFileSync(file);
  assert.deepEqual(pngDimensions(buffer), { width: 576, height: 384 });
  assert.ok(buffer.length > 10_000);
});
