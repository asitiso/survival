import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (path) => readFileSync(resolve(here, '..', path), 'utf8');

test('phone landscape presentation profile enlarges actors without changing battlefield geometry', () => {
  const source = read('src/game/mobile-landscape-presentation.ts');
  assert.match(source, /PHONE_LANDSCAPE_MAX_HEIGHT\s*=\s*520/);
  assert.match(source, /actorScale:\s*active\s*\?\s*1\.1\s*:\s*1/);
  assert.match(source, /hudScale:\s*active\s*\?\s*1\.18\s*:\s*1/);
  assert.match(source, /controlScale:\s*active\s*\?\s*1\.25\s*:\s*1/);
});

test('hero and enemy sprite presentation use actor-only mobile scale', () => {
  const hero = read('src/game/hero-battle-sprite-assets.ts');
  const enemy = read('src/game/enemy-sprite-assets.ts');
  assert.match(hero, /mobileLandscapeActorScale/);
  assert.match(hero, /SIZE_SCALE\[heroId\]\s*\*\s*mobileLandscapeActorScale\(\)/);
  assert.match(enemy, /mobileLandscapeActorScale/);
  assert.match(enemy, /SIZE_SCALE\[spriteType\]\s*\*\s*mobileLandscapeActorScale\(\)/);
});

test('phone landscape action buttons grow visually while preserving the established hit envelope', () => {
  const helper = read('src/game/mobile-landscape-presentation.ts');
  const config = read('src/game/config.ts');
  const input = read('src/core/input.ts');
  assert.match(helper, /mobileLandscapeControlScale/);
  assert.match(helper, /mobileLandscapeTouchScale/);
  assert.match(config, /get radius\(\)[\s\S]*mobileLandscapeControlScale\(\)/);
  assert.match(input, /const actionTouchScale\s*=\s*mobileLandscapeTouchScale\(ACTION_TOUCH_SCALE\)/);
  assert.match(input, /hitTestActionButton\(p, ACTION_BUTTONS, actionTouchScale/);
  assert.match(input, /touchProfile\[button\.id\]\s*\?\?\s*actionTouchScale/);
});
