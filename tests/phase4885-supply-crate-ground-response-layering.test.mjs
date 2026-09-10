import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

function methodSlice(name) {
  const start = gameSource.indexOf(`private ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const braceStart = gameSource.indexOf('{', start);
  assert.notEqual(braceStart, -1, `${name} must have a body`);
  let depth = 0;
  for (let i = braceStart; i < gameSource.length; i += 1) {
    if (gameSource[i] === '{') depth += 1;
    else if (gameSource[i] === '}') {
      depth -= 1;
      if (depth === 0) return gameSource.slice(start, i + 1);
    }
  }
  assert.fail(`${name} body must close`);
}

test('phase 4885 keeps the supply crate physical body on the grounded world pass', () => {
  const body = methodSlice('drawSupplyCrate');
  assert.match(body, /battlefieldInteractionSprite\('supply','crate'\)/);
  assert.match(body, /ctx\.fillRect\(-28, -22, 56, 44\)/);
  assert.doesNotMatch(body, /drawFieldEventResponseIdentity\(ctx,'supplyDrop'/);
});

test('phase 4885 renders the supply-drop response identity in its own readability pass', () => {
  const response = methodSlice('drawSupplyCrateResponseIdentity');
  assert.match(response, /if \(!this\.supplyCrate\) return/);
  assert.match(response, /drawFieldEventResponseIdentity\(ctx,'supplyDrop',0,-43,20\)/);
  assert.doesNotMatch(response, /battlefieldInteractionSprite\('supply'/);
  assert.doesNotMatch(response, /Math\.random\(/);
  assert.doesNotMatch(response, /equipmentState\s*=/);
});

test('phase 4885 keeps crate body below actors and response identity above terrain foreground', () => {
  const bodyCall = gameSource.indexOf('this.drawSupplyCrate(ctx, secondaryMotion);');
  const enemies = gameSource.indexOf('this.enemies.renderEnemies(ctx');
  const foreground = gameSource.indexOf('this.drawTerrainForegroundOcclusion(ctx);');
  const responseCall = gameSource.indexOf('this.drawSupplyCrateResponseIdentity(ctx, secondaryMotion);');
  const eliteWarnings = gameSource.indexOf('this.drawElitePackApproachFormationVfx(ctx);');
  assert.ok(bodyCall >= 0 && enemies >= 0 && foreground >= 0 && responseCall >= 0 && eliteWarnings >= 0);
  assert.ok(bodyCall < enemies, 'supply crate body must remain below enemy actors');
  assert.ok(enemies < foreground, 'terrain foreground must remain above grounded actors');
  assert.ok(foreground < responseCall, 'supply response identity must survive terrain foreground occlusion');
  assert.ok(responseCall < eliteWarnings, 'supply response identity must stay below protected tactical warnings');
});

test('phase 4885 is presentation-only and leaves supply collection gameplay untouched', () => {
  assert.match(gameSource, /distance\(this\.hero\.pos, this\.supplyCrate\) > this\.hero\.radius \+ 58/);
  assert.match(gameSource, /Math\.random\(\) < 0\.45/);
  assert.match(gameSource, /healingPotions: this\.equipmentState\.healingPotions \+ 1/);
  assert.match(gameSource, /purchaseOffer\(this\.equipmentState, \{ \.\.\.offer, price: 0 \}\)/);
});
