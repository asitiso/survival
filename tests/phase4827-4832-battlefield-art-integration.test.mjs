import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const art = await import('../dist/game/battlefield-gameplay-art.js').catch(() => null);

function api() {
  assert.ok(art, 'battlefield-gameplay-art module must exist');
  return art;
}

test('phase 4827 gameplay art declares dedicated backdrop and prop atlas assets', () => {
  const { BATTLEFIELD_GAMEPLAY_ART } = api();
  assert.equal(BATTLEFIELD_GAMEPLAY_ART.backdrop.src, './assets/arena/battlefield-gameplay-backdrop.svg');
  assert.equal(BATTLEFIELD_GAMEPLAY_ART.props.src, './assets/arena/battlefield-gameplay-props.svg');
  assert.equal(BATTLEFIELD_GAMEPLAY_ART.props.columns, 3);
  assert.equal(BATTLEFIELD_GAMEPLAY_ART.props.rows, 2);
});

test('phase 4828 generated battlefield assets are checked into the served asset tree', () => {
  assert.equal(existsSync(new URL('../assets/arena/battlefield-gameplay-backdrop.svg', import.meta.url)), true);
  assert.equal(existsSync(new URL('../assets/arena/battlefield-gameplay-props.svg', import.meta.url)), true);
});

test('phase 4829 decoration anchors stay outside the central combat readability zone', () => {
  const { BATTLEFIELD_DECORATION_ANCHORS } = api();
  assert.ok(BATTLEFIELD_DECORATION_ANCHORS.length >= 6);
  for (const anchor of BATTLEFIELD_DECORATION_ANCHORS) {
    assert.ok(anchor.x <= 0.19 || anchor.x >= 0.81 || anchor.y <= 0.18 || anchor.y >= 0.82,
      `decorative ${anchor.kind} must remain on an arena edge`);
  }
});

test('phase 4830 prop sprites use unique bounded atlas cells', () => {
  const { BATTLEFIELD_DECORATION_ANCHORS, battlefieldGameplayPropSprite } = api();
  const cells = new Set();
  for (const anchor of BATTLEFIELD_DECORATION_ANCHORS) {
    const sprite = battlefieldGameplayPropSprite(anchor.kind);
    assert.ok(sprite.sx >= 0 && sprite.sy >= 0 && sprite.sw === 192 && sprite.sh === 192);
    assert.ok(sprite.sx + sprite.sw <= 576 && sprite.sy + sprite.sh <= 384);
    cells.add(`${sprite.sx}:${sprite.sy}`);
  }
  assert.ok(cells.size >= 6);
});

test('phase 4831 combat pressure lowers decorative art instead of obscuring warnings', () => {
  const { battlefieldGameplayArtProfile } = api();
  const normal = battlefieldGameplayArtProfile(false, false);
  const critical = battlefieldGameplayArtProfile(false, true);
  const reducedFlashCritical = battlefieldGameplayArtProfile(true, true);
  assert.ok(normal.backdropAlpha <= 0.36 && normal.propAlpha <= 0.76);
  assert.ok(critical.backdropAlpha < normal.backdropAlpha);
  assert.ok(critical.propAlpha < normal.propAlpha);
  assert.ok(reducedFlashCritical.backdropAlpha <= critical.backdropAlpha);
  assert.ok(reducedFlashCritical.propAlpha <= critical.propAlpha);
});

test('phase 4832 arena rendering keeps generated art underneath gameplay telegraphs with image failure fallback', () => {
  const source = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /BATTLEFIELD_GAMEPLAY_ART/);
  assert.match(source, /battlefieldGameplayArtProfile/);
  assert.match(source, /battlefieldGameplayPropSprite/);
  const drawArena = source.indexOf('private drawArena');
  const drawBackdrop = source.indexOf('battlefieldGameplayBackdropImage', drawArena);
  const drawPropsCall = source.indexOf('this.drawBattlefieldGameplayProps(ctx)');
  const drawTelegraphs = source.indexOf('this.drawDangerTelegraphs(ctx)');
  assert.ok(drawArena >= 0 && drawBackdrop > drawArena);
  assert.ok(drawPropsCall > drawArena && drawPropsCall < drawTelegraphs, 'props must stay below gameplay warnings');
  assert.match(source, /if \(this\.battlefieldGameplayBackdropReady && this\.battlefieldGameplayBackdropImage\)/);
  assert.match(source, /if \(!this\.battlefieldGameplayPropsReady \|\| !this\.battlefieldGameplayPropsImage\) return;/);
});
