import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { directorSnapshot } from '../dist/domain/director.js';
import { presentationLimits } from '../dist/game/presentation-budget.js';
import { sanitizeRunSnapshot } from '../dist/domain/run-snapshot.js';
import { compactPhase22BuildLabels } from '../dist/game/hud-presentation.js';

test('phase22 keeps the established nine combat actions and mobile performance guardrails', () => {
  assert.equal(ACTION_BUTTONS.length, 9);
  assert.deepEqual(ACTION_BUTTONS.map((button) => button.id), ['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
  assert.ok(directorSnapshot(2700).enemyBudget <= 320);
  assert.equal(presentationLimits('high').particlesHardCap, 180);
  assert.equal(presentationLimits('high').telegraphsHardCap, 24);
});

test('resume snapshot remains compact and never serializes active enemy or projectile swarms', () => {
  const snapshot = sanitizeRunSnapshot({
    version: 1, savedAt: 1, heroId: 'arkan', traitId: 'destruction', threatLevel: 2, elapsed: 777,
    hero: { level: 24, xp: 10, xpNext: 100, hp: 120, maxHp: 200, coins: 450, kills: 300 }, coreHp: 900,
    spellLevels: { fireBolt: 10, chainLightning: 10, frostNova: 6, flameField: 5, meteorStorm: 2, blackHole: 2 },
    equipment: { coins: 450, weapon: null, armor: null, healingPotions: 2 }, relic: 'abyss-eye',
    fusions: ['solar-detonation'], fateChoices: ['frenzy'], map: { id: 'ruinedGate', evolutionStage: 1 },
    progression: { bossesKilled: 3, goldEarned: 1200, shopTokens: 1 },
    enemies: new Array(320).fill({ x: 1, y: 1 }), projectiles: new Array(150).fill({ x: 1, y: 1 }),
  });
  const payload = JSON.stringify(snapshot);
  assert.ok(payload.length < 6000);
  assert.equal(payload.includes('enemies'), false);
  assert.equal(payload.includes('projectiles'), false);
});

test('compact phase22 build summary exposes mastery fusion and fate without overflowing the left HUD', () => {
  const labels = compactPhase22BuildLabels({
    masteryLevel: 12,
    relicName: '심연의 눈',
    synergies: ['심연 공명', '초전도 폭풍', '숨겨진 셋째'],
    fusionNames: ['태양 폭발', '뇌전 특이점'],
    fateSummary: '광란 / 황금',
  });
  assert.ok(labels.length <= 4);
  assert.ok(labels.some((label) => label.includes('M12')));
  assert.ok(labels.some((label) => label.includes('융합')));
  assert.ok(labels.some((label) => label.includes('운명')));
});

test('phase22 results and documentation expose final build, resume, onboarding and balance verification', async () => {
  const { readFile } = await import('node:fs/promises');
  const resultsSource = await readFile(new URL('../src/ui/results.ts', import.meta.url), 'utf8');
  const gameSource = await readFile(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.ok(resultsSource.includes('buildSummary'));
  assert.ok(gameSource.includes('compactPhase22BuildLabels'));
  for (const token of ['Phase 18', 'Phase 19', 'Phase 20', 'Phase 21', 'Phase 22', '이어하기', '온보딩', '밸런스']) assert.ok(readme.includes(token), `README missing ${token}`);
});
