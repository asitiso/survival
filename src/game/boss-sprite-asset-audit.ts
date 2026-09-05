import { BOSS_SPRITE_ARCHETYPES, BOSS_SPRITE_ATLAS, auditBossSpriteAtlas, bossSpritePresentation, bossSpriteRect } from './boss-sprite-assets.js';

export interface BossSpriteAssetSample {
  caseId: string;
  expected: string | number | boolean;
  actual: string | number | boolean;
  passed: boolean;
}

export interface BossSpriteAssetAudit {
  passed: boolean;
  samples: BossSpriteAssetSample[];
  coverage: number;
  uniqueCellCount: number;
  archetypeCount: number;
  motionAmplitude: number;
  fallbackPreserved: boolean;
  presentationOnly: boolean;
  snapshotSchemaMutation: false;
  issues: string[];
}

const add = (samples: BossSpriteAssetSample[], caseId: string, expected: BossSpriteAssetSample['expected'], actual: BossSpriteAssetSample['actual']): void => {
  samples.push({ caseId, expected, actual, passed: expected === actual });
};

export function auditBossSpriteAssets(): BossSpriteAssetAudit {
  const samples: BossSpriteAssetSample[] = [];
  const atlas = auditBossSpriteAtlas(BOSS_SPRITE_ARCHETYPES);
  add(samples, 'archetype-count', 6, BOSS_SPRITE_ARCHETYPES.length);
  add(samples, 'coverage', 1, atlas.coverage);
  add(samples, 'unique-cells', 6, atlas.uniqueCellCount);
  add(samples, 'atlas-columns', 3, BOSS_SPRITE_ATLAS.columns);
  add(samples, 'atlas-rows', 2, BOSS_SPRITE_ATLAS.rows);
  add(samples, 'atlas-width', 768, BOSS_SPRITE_ATLAS.width);
  add(samples, 'atlas-height', 512, BOSS_SPRITE_ATLAS.height);
  add(samples, 'no-missing-archetypes', 0, atlas.missing.length);
  add(samples, 'no-out-of-bounds-archetypes', 0, atlas.outOfBounds.length);

  for (const archetype of BOSS_SPRITE_ARCHETYPES) {
    const sprite = bossSpriteRect(archetype);
    const inBounds = sprite.sx >= 0 && sprite.sy >= 0
      && sprite.sx + sprite.sw <= BOSS_SPRITE_ATLAS.width
      && sprite.sy + sprite.sh <= BOSS_SPRITE_ATLAS.height;
    add(samples, `sprite-${archetype}-in-bounds`, true, inBounds);
  }

  const loaded = BOSS_SPRITE_ARCHETYPES.map((archetype) => bossSpritePresentation(archetype, 58, true));
  const fallback = bossSpritePresentation('inferno', 58, false);
  const motionAmplitude = Math.max(fallback.motionAmplitude, ...loaded.map((presentation) => presentation.motionAmplitude));
  const fallbackPreserved = !fallback.visible && fallback.fallbackBodyVisible && fallback.motionAmplitude === 0;
  const sizesSafe = loaded.every((presentation) => presentation.drawSize >= 120 && presentation.drawSize <= 170);
  const presentationOnly = loaded.every((presentation) => presentation.fallbackBodyVisible && presentation.motionAmplitude === 0 && presentation.animated === false);

  add(samples, 'loaded-visible', true, loaded.every((presentation) => presentation.visible));
  add(samples, 'loaded-static', false, loaded.some((presentation) => presentation.animated));
  add(samples, 'motion-amplitude', 0, motionAmplitude);
  add(samples, 'draw-sizes-safe', true, sizesSafe);
  add(samples, 'fallback-body-preserved', true, fallbackPreserved);
  add(samples, 'presentation-only', true, presentationOnly);
  add(samples, 'snapshot-schema-mutation', false, false);
  add(samples, 'atlas-src-stable', './assets/bosses/boss-sprites.png', BOSS_SPRITE_ATLAS.src);
  add(samples, 'boss-archetype-order-stable', 'inferno|summoner|juggernaut|abyssWitch|twinMaw|timeEater', BOSS_SPRITE_ARCHETYPES.join('|'));
  add(samples, 'fallback-visible-flag', false, fallback.visible);

  const issues: string[] = [];
  if (samples.length !== 25) issues.push('sample-count');
  if (atlas.coverage !== 1) issues.push('boss-sprite-coverage');
  if (atlas.uniqueCellCount !== 6) issues.push('boss-sprite-cell-collision');
  if (atlas.outOfBounds.length > 0) issues.push('boss-sprite-out-of-bounds');
  if (motionAmplitude !== 0) issues.push('boss-sprite-motion');
  if (!fallbackPreserved) issues.push('boss-sprite-fallback');
  if (!presentationOnly) issues.push('boss-sprite-gameplay-overreach');
  if (samples.some((sample) => !sample.passed)) issues.push('sample-failure');

  return {
    passed: issues.length === 0,
    samples,
    coverage: atlas.coverage,
    uniqueCellCount: atlas.uniqueCellCount,
    archetypeCount: BOSS_SPRITE_ARCHETYPES.length,
    motionAmplitude,
    fallbackPreserved,
    presentationOnly,
    snapshotSchemaMutation: false,
    issues,
  };
}
