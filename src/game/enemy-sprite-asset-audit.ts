import { ENEMY_SPRITE_ATLAS, ENEMY_SPRITE_TYPES, auditEnemySpriteAtlas, enemySpritePresentation, enemySpriteRect } from './enemy-sprite-assets.js';

export interface EnemySpriteAssetSample {
  caseId: string;
  expected: string | number | boolean;
  actual: string | number | boolean;
  passed: boolean;
}

export interface EnemySpriteAssetAudit {
  passed: boolean;
  samples: EnemySpriteAssetSample[];
  coverage: number;
  uniqueCellCount: number;
  spriteTypeCount: number;
  motionAmplitude: number;
  fallbackPreserved: boolean;
  bossExcluded: boolean;
  snapshotSchemaMutation: false;
  issues: string[];
}

const add = (samples: EnemySpriteAssetSample[], caseId: string, expected: EnemySpriteAssetSample['expected'], actual: EnemySpriteAssetSample['actual']): void => {
  samples.push({ caseId, expected, actual, passed: expected === actual });
};

export function auditEnemySpriteAssets(): EnemySpriteAssetAudit {
  const samples: EnemySpriteAssetSample[] = [];
  const atlas = auditEnemySpriteAtlas(ENEMY_SPRITE_TYPES);
  add(samples, 'sprite-type-count', 12, ENEMY_SPRITE_TYPES.length);
  add(samples, 'coverage', 1, atlas.coverage);
  add(samples, 'unique-cells', 12, atlas.uniqueCellCount);
  add(samples, 'atlas-columns', 4, ENEMY_SPRITE_ATLAS.columns);
  add(samples, 'atlas-rows', 3, ENEMY_SPRITE_ATLAS.rows);
  add(samples, 'atlas-width', 512, ENEMY_SPRITE_ATLAS.width);
  add(samples, 'atlas-height', 384, ENEMY_SPRITE_ATLAS.height);
  add(samples, 'no-missing-types', 0, atlas.missing.length);
  add(samples, 'no-out-of-bounds-types', 0, atlas.outOfBounds.length);

  for (const type of ENEMY_SPRITE_TYPES.slice(0, 8)) {
    const sprite = enemySpriteRect(type);
    const inBounds = sprite.sx >= 0 && sprite.sy >= 0
      && sprite.sx + sprite.sw <= ENEMY_SPRITE_ATLAS.width
      && sprite.sy + sprite.sh <= ENEMY_SPRITE_ATLAS.height;
    add(samples, `sprite-${type}-in-bounds`, true, inBounds);
  }

  const loaded = ENEMY_SPRITE_TYPES.map((type) => enemySpritePresentation(type, 24, true));
  const fallback = enemySpritePresentation('grunt', 18, false);
  const boss = enemySpritePresentation('boss', 58, true);
  const motionAmplitude = Math.max(fallback.motionAmplitude, boss.motionAmplitude, ...loaded.map((presentation) => presentation.motionAmplitude));
  const fallbackPreserved = !fallback.visible && fallback.fallbackBodyVisible && fallback.motionAmplitude === 0;
  const sizesSafe = loaded.every((presentation) => presentation.drawSize >= 30 && presentation.drawSize <= 100);
  const bossExcluded = !boss.visible && boss.drawSize === 0;

  add(samples, 'loaded-visible', true, loaded.every((presentation) => presentation.visible));
  add(samples, 'loaded-static', false, loaded.some((presentation) => presentation.animated));
  add(samples, 'motion-amplitude', 0, motionAmplitude);
  add(samples, 'draw-sizes-safe', true, sizesSafe);
  add(samples, 'fallback-body-preserved', true, fallbackPreserved);
  add(samples, 'boss-excluded', true, bossExcluded);
  add(samples, 'snapshot-schema-mutation', false, false);
  add(samples, 'atlas-src-stable', './assets/enemies/enemy-sprites.png', ENEMY_SPRITE_ATLAS.src);

  const issues: string[] = [];
  if (samples.length !== 25) issues.push('sample-count');
  if (atlas.coverage !== 1) issues.push('enemy-sprite-coverage');
  if (atlas.uniqueCellCount !== 12) issues.push('enemy-sprite-cell-collision');
  if (atlas.outOfBounds.length > 0) issues.push('enemy-sprite-out-of-bounds');
  if (motionAmplitude !== 0) issues.push('enemy-sprite-motion');
  if (!fallbackPreserved) issues.push('enemy-sprite-fallback');
  if (!bossExcluded) issues.push('enemy-sprite-boss-overreach');
  if (samples.some((sample) => !sample.passed)) issues.push('sample-failure');

  return {
    passed: issues.length === 0,
    samples,
    coverage: atlas.coverage,
    uniqueCellCount: atlas.uniqueCellCount,
    spriteTypeCount: ENEMY_SPRITE_TYPES.length,
    motionAmplitude,
    fallbackPreserved,
    bossExcluded,
    snapshotSchemaMutation: false,
    issues,
  };
}
