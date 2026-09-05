import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeArcaneCombo } from '../dist/game/arcane-combos.js';

const base = { evolvedSpells:[], legendaryIds:[], relicId:null, traitId:null, synergyIds:[], meterActive:false, coreHpRatio:1, objectiveStreak:0 };

test('arcane combo recognizes four hero build families and caps at tier three', () => {
  const cases = [
    ['arkan','fireBolt','arcane-staff','ember-crown','ember-dominion','inferno-chain'],
    ['seria','frostNova','blast-rod','winter-heart','winter-dominion','frozen-control'],
    ['kain','chainLightning','rapid-wand','storm-core','storm-dominion','storm-velocity'],
    ['edric','frostNova','guardian-plate','oath-seal','oath-dominion','guardian-fortress'],
  ];
  for (const [heroId,spell,legendary,relic,synergy,family] of cases) {
    const combo = analyzeArcaneCombo({...base,heroId,evolvedSpells:[spell],legendaryIds:[legendary],relicId:relic,synergyIds:[synergy],meterActive:true,objectiveStreak:3});
    assert.equal(combo.family,family);
    assert.equal(combo.tier,3);
    assert.ok(combo.powerMultiplier <= 1.12);
  }
});

test('partial build creates a lower readable combo rather than false ascendency', () => {
  const combo = analyzeArcaneCombo({...base,heroId:'arkan',evolvedSpells:['fireBolt'],legendaryIds:['blast-rod']});
  assert.equal(combo.family,'inferno-chain');
  assert.ok(combo.tier >= 1 && combo.tier < 3);
  assert.match(combo.label,/LINK|SURGE/);
});

test('unrelated weak build stays at no combo', () => {
  const combo = analyzeArcaneCombo({...base,heroId:'seria'});
  assert.equal(combo.tier,0);
  assert.equal(combo.family,'none');
  assert.equal(combo.powerMultiplier,1);
});
