import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const spellsSource = fs.readFileSync(new URL('../src/game/spells.ts', import.meta.url), 'utf8');
const helperSourceUrl = new URL('../src/game/persistent-spell-ground-ordering.ts', import.meta.url);

async function loadGroundOrdering() {
  if (!fs.existsSync(helperSourceUrl)) return null;
  return import('../dist/game/persistent-spell-ground-ordering.js');
}

test('phase 4883 merges active and retiring persistent spell ground cues into one stable world-y order', async () => {
  const mod = await loadGroundOrdering();
  assert.ok(mod, 'persistent spell ground ordering helper must exist');
  const fieldA = { id: 'field-a', pos: { y: 180 } };
  const fieldB = { id: 'field-b', pos: { y: 260 } };
  const hole = { id: 'hole', pos: { y: 120 } };
  const expire = { id: 'expire', pos: { y: 220 } };
  const residue = { id: 'residue', pos: { y: 200 } };
  const ordered = mod.persistentSpellGroundLayerCues({
    fields: [fieldA, fieldB],
    holes: [hole],
    expiries: [expire],
    residues: [residue],
  });
  assert.deepEqual(ordered.map((cue) => `${cue.kind}:${cue.value.id}`), [
    'hole:hole',
    'field:field-a',
    'residue:residue',
    'expire:expire',
    'field:field-b',
  ]);
});

test('phase 4883 ordering is stable, finite-first, and never mutates lifecycle arrays', async () => {
  const mod = await loadGroundOrdering();
  assert.ok(mod, 'persistent spell ground ordering helper must exist');
  const fields = [{ id: 'field-1', pos: { y: 100 } }, { id: 'field-2', pos: { y: 100 } }];
  const holes = [{ id: 'hole-nan', pos: { y: Number.NaN } }];
  const expiries = [{ id: 'expire-inf', pos: { y: Number.POSITIVE_INFINITY } }];
  const residues = [{ id: 'residue', pos: { y: 90 } }];
  const before = {
    fields: [...fields], holes: [...holes], expiries: [...expiries], residues: [...residues],
  };
  const ordered = mod.persistentSpellGroundLayerCues({ fields, holes, expiries, residues });
  assert.deepEqual(ordered.map((cue) => cue.value.id), ['residue', 'field-1', 'field-2', 'hole-nan', 'expire-inf']);
  assert.deepEqual(fields, before.fields);
  assert.deepEqual(holes, before.holes);
  assert.deepEqual(expiries, before.expiries);
  assert.deepEqual(residues, before.residues);
});

test('phase 4883 persistent readability cues share stable finite-first world-y ordering without mutating active zones', async () => {
  const mod = await loadGroundOrdering();
  assert.ok(mod, 'persistent spell ground ordering helper must exist');
  assert.equal(typeof mod.persistentSpellReadabilityLayerCues, 'function');
  const fields = [
    { id: 'field-front', pos: { y: 260 } },
    { id: 'field-back', pos: { y: 120 } },
  ];
  const holes = [
    { id: 'hole-mid', pos: { y: 180 } },
    { id: 'hole-nan', pos: { y: Number.NaN } },
  ];
  const before = { fields: [...fields], holes: [...holes] };
  const ordered = mod.persistentSpellReadabilityLayerCues({ fields, holes });
  assert.deepEqual(ordered.map((cue) => `${cue.kind}:${cue.value.id}`), [
    'field:field-back',
    'hole:hole-mid',
    'field:field-front',
    'hole:hole-nan',
  ]);
  assert.deepEqual(fields, before.fields);
  assert.deepEqual(holes, before.holes);
});

test('phase 4883 game keeps physical persistent ground below terrain foreground while readability and combat layers stay above it', () => {
  assert.match(
    gameSource,
    /this\.spells\.renderGroundLayer\([\s\S]*this\.drawTerrainForegroundOcclusion\(ctx\);[\s\S]*this\.spells\.renderPersistentReadabilityLayer\([\s\S]*this\.spells\.render\(/,
  );
  assert.match(spellsSource, /renderGroundLayer\s*\(/);
  assert.match(spellsSource, /renderPersistentReadabilityLayer\s*\(/);
  assert.match(spellsSource, /includeGroundLayer\s*=\s*true/);
  assert.match(
    spellsSource,
    /if\s*\(includeGroundLayer\)\s*\{[\s\S]*this\.renderGroundLayer\([\s\S]*this\.renderPersistentReadabilityLayer\(/,
  );
});

test('phase 4883 ground layer owns physical zone bodies and retirement cues without duplicate combat-layer loops', () => {
  assert.match(spellsSource, /persistentSpellGroundLayerCues\s*\(\{/);
  assert.match(spellsSource, /fields:\s*this\.fields/);
  assert.match(spellsSource, /holes:\s*this\.holes/);
  assert.match(spellsSource, /expiries:\s*this\.persistentZoneExpireVfx/);
  assert.match(spellsSource, /residues:\s*this\.ultimatePostImpactResidues/);

  const groundStart = spellsSource.indexOf('  renderGroundLayer(');
  const readabilityStart = spellsSource.indexOf('  renderPersistentReadabilityLayer(', groundStart);
  const renderStart = spellsSource.indexOf('  render(ctx: CanvasRenderingContext2D', readabilityStart);
  const castStart = spellsSource.indexOf('  private castFireBolt', renderStart);
  assert.ok(groundStart >= 0 && readabilityStart > groundStart && renderStart > readabilityStart && castStart > renderStart);

  const groundSource = spellsSource.slice(groundStart, readabilityStart);
  const readabilitySource = spellsSource.slice(readabilityStart, renderStart);
  const combatRenderSource = spellsSource.slice(renderStart, castStart);

  assert.doesNotMatch(groundSource, /heroSpellSignatureVfxSprite/);
  assert.doesNotMatch(groundSource, /heroUltimateSignatureVfxSprite/);
  assert.doesNotMatch(groundSource, /crowdControlPropagationVfxSprite/);

  assert.match(readabilitySource, /persistentSpellReadabilityLayerCues\s*\(\{/);
  assert.match(readabilitySource, /heroSpellSignatureVfxSprite/);
  assert.match(readabilitySource, /heroUltimateSignatureVfxSprite/);
  assert.match(readabilitySource, /crowdControlPropagationVfxSprite/);
  assert.doesNotMatch(readabilitySource, /persistentZoneExpireVfx|ultimatePostImpactResidues/);

  assert.doesNotMatch(combatRenderSource, /for \(const field of this\.fields\)/);
  assert.doesNotMatch(combatRenderSource, /for \(const hole of this\.holes\)/);
  assert.doesNotMatch(combatRenderSource, /for \(const cue of this\.persistentZoneExpireVfx\)/);
  assert.doesNotMatch(combatRenderSource, /for \(const cue of this\.ultimatePostImpactResidues\)/);
});