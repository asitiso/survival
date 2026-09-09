import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const actionModule = await import('../dist/game/enemy-sprite-action-readability.js').catch(() => null);

function api() {
  assert.ok(actionModule, 'enemy sprite action readability module must exist');
  return actionModule;
}

const moving = {
  motionBlend: 0.9,
  stride: Math.PI * 0.28,
  facingX: 1,
  facingY: 0,
  turn: 0.72,
  pullback: 0,
  lunge: 0,
  hitStagger: 0,
  hitOffsetX: 0,
  hitOffsetY: 0,
};

const idle = {
  motionBlend: 0,
  stride: 0,
  facingX: 1,
  facingY: 0,
  turn: 0,
  pullback: 0,
  lunge: 0,
  hitStagger: 0,
  hitOffsetX: 0,
  hitOffsetY: 0,
};

test('phase 4839 agile sprites carry a clearer locomotion pose than heavy sprites', () => {
  const { enemySpriteActionPresentation } = api();
  const hound = enemySpriteActionPresentation('hound', moving, false);
  const golem = enemySpriteActionPresentation('siegeGolem', moving, false);
  assert.ok(Math.abs(hound.rotation) > Math.abs(golem.rotation));
  assert.ok(Math.abs(hound.scaleY - 1) > Math.abs(golem.scaleY - 1));
  assert.ok(Math.hypot(hound.offsetX, hound.offsetY) > Math.hypot(golem.offsetX, golem.offsetY));
});

test('phase 4840 attack windup and strike create opposite readable sprite poses', () => {
  const { enemySpriteActionPresentation } = api();
  const windup = enemySpriteActionPresentation('brute', { ...idle, pullback: 1 }, false);
  const strike = enemySpriteActionPresentation('brute', { ...idle, lunge: 1 }, false);
  assert.ok(windup.offsetX < 0, `windup should pull sprite backward, got ${windup.offsetX}`);
  assert.ok(strike.offsetX > 0, `strike should push sprite forward, got ${strike.offsetX}`);
  assert.ok(windup.scaleY > 1);
  assert.ok(strike.scaleX > 1);
  assert.ok(strike.scaleY < 1);
});

test('phase 4841 hit stagger adds a short sprite-only squash and directional tilt', () => {
  const { enemySpriteActionPresentation } = api();
  const hit = enemySpriteActionPresentation('grunt', {
    ...idle,
    hitStagger: 1,
    hitOffsetX: -5,
    hitOffsetY: 2,
  }, false);
  assert.ok(hit.offsetX < 0);
  assert.ok(Math.abs(hit.rotation) > 0.01);
  assert.ok(hit.scaleY < 1);
  assert.ok(hit.scaleX > 1);
});

test('phase 4842 boss sprite pose remains heavier and more restrained than elite pose', () => {
  const { enemySpriteActionPresentation } = api();
  const input = { ...moving, pullback: 0.6, lunge: 0.8, hitStagger: 0.7, hitOffsetX: -4, hitOffsetY: 1 };
  const elite = enemySpriteActionPresentation('elite', input, false);
  const boss = enemySpriteActionPresentation('boss', input, false);
  assert.ok(Math.abs(boss.rotation) < Math.abs(elite.rotation));
  assert.ok(Math.hypot(boss.offsetX, boss.offsetY) < Math.hypot(elite.offsetX, elite.offsetY));
  assert.ok(Math.abs(boss.scaleY - 1) < Math.abs(elite.scaleY - 1));
});

test('phase 4843 reduced motion damps sprite-only action pose to roughly forty percent', () => {
  const { enemySpriteActionPresentation } = api();
  const input = { ...moving, lunge: 0.9, hitStagger: 0.8, hitOffsetX: -5, hitOffsetY: 2 };
  const full = enemySpriteActionPresentation('assassin', input, false);
  const reduced = enemySpriteActionPresentation('assassin', input, true);
  assert.ok(Math.abs(reduced.rotation) <= Math.abs(full.rotation) * 0.45 + 1e-6);
  assert.ok(Math.hypot(reduced.offsetX, reduced.offsetY) <= Math.hypot(full.offsetX, full.offsetY) * 0.45 + 1e-6);
  assert.ok(Math.abs(reduced.scaleX - 1) <= Math.abs(full.scaleX - 1) * 0.45 + 1e-6);
  assert.ok(Math.abs(reduced.scaleY - 1) <= Math.abs(full.scaleY - 1) * 0.45 + 1e-6);
});

test('phase 4844 live renderer applies action readability only inside sprite draw branches', () => {
  const source = readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /enemySpriteActionPresentation/);
  assert.match(source, /spriteActionPresentation/);
  const regularBranch = source.indexOf('if (spritePresentation.visible && spriteAtlasImage && isEnemySpriteType(enemy.type))');
  const bossBranch = source.indexOf('if (bossPresentation?.visible && bossSpriteAtlasImage && bossArchetype)');
  assert.ok(regularBranch >= 0 && bossBranch > regularBranch);
  const regularSlice = source.slice(regularBranch, bossBranch);
  const bossSlice = source.slice(bossBranch, bossBranch + 1500);
  assert.match(regularSlice, /spriteActionPresentation/);
  assert.match(bossSlice, /spriteActionPresentation/);
  assert.doesNotMatch(source.slice(0, regularBranch), /spriteActionPresentation\.(offsetX|offsetY|rotation|scaleX|scaleY)/);
});
