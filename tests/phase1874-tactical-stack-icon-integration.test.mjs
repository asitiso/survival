import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1874 tactical stack binds field events objectives missions and directives to icons',()=>{
  assert.match(gameSource,/iconId:\s*event\.id/);
  assert.match(gameSource,/iconId:\s*objective\.id/);
  assert.match(gameSource,/iconId:\s*mission\.id/);
  assert.match(gameSource,/iconId:\s*this\.threatDirective\.id/);
  assert.match(gameSource,/drawStatusRow\(ctx, y, row\.accent, row\.title, row\.detail, row\.iconId\)/);
});

test('tactical stack keeps text fallback and does not require image readiness',()=>{
  assert.match(gameSource,/tacticalStatusIconAtlasReady/);
  assert.match(gameSource,/drawStatusRow\([\s\S]*ctx\.fillText\(title/);
  assert.match(gameSource,/if \(iconPresentation\.visible && this\.tacticalStatusIconAtlasImage && this\.tacticalStatusIconAtlasReady\)/);
});
