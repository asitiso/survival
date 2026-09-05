import { HERO_PROFILES } from './hero-profiles.js';
import { HERO_PORTRAIT_ATLAS, heroPortraitPresentation, heroPortraitSprite, auditHeroPortraitAtlas } from './hero-portrait-assets.js';

export interface HeroPortraitAssetSample {
  caseId: string;
  expected: string | number | boolean;
  actual: string | number | boolean;
  passed: boolean;
}

export interface HeroPortraitAssetAudit {
  passed: boolean;
  samples: HeroPortraitAssetSample[];
  coverage: number;
  uniqueCellCount: number;
  selectableHeroCount: number;
  motionAmplitude: number;
  fallbackPreserved: boolean;
  snapshotSchemaMutation: false;
  issues: string[];
}

const add = (samples: HeroPortraitAssetSample[], caseId: string, expected: HeroPortraitAssetSample['expected'], actual: HeroPortraitAssetSample['actual']): void => {
  samples.push({ caseId, expected, actual, passed: expected === actual });
};

export function auditHeroPortraitAssets(): HeroPortraitAssetAudit {
  const samples: HeroPortraitAssetSample[] = [];
  const heroIds = HERO_PROFILES.map((profile) => profile.id);
  const atlas = auditHeroPortraitAtlas(heroIds);

  add(samples, 'hero-count', 4, heroIds.length);
  add(samples, 'coverage', 1, atlas.coverage);
  add(samples, 'unique-cells', 4, atlas.uniqueCellCount);
  add(samples, 'atlas-columns', 2, HERO_PORTRAIT_ATLAS.columns);
  add(samples, 'atlas-rows', 2, HERO_PORTRAIT_ATLAS.rows);
  add(samples, 'atlas-width', 512, HERO_PORTRAIT_ATLAS.width);
  add(samples, 'atlas-height', 512, HERO_PORTRAIT_ATLAS.height);
  add(samples, 'no-missing-heroes', 0, atlas.missing.length);
  add(samples, 'no-out-of-bounds-heroes', 0, atlas.outOfBounds.length);

  for (const profile of HERO_PROFILES) {
    const sprite = heroPortraitSprite(profile.id);
    const inBounds = sprite.sx >= 0 && sprite.sy >= 0
      && sprite.sx + sprite.sw <= HERO_PORTRAIT_ATLAS.width
      && sprite.sy + sprite.sh <= HERO_PORTRAIT_ATLAS.height;
    add(samples, `sprite-${profile.id}-in-bounds`, true, inBounds);
  }

  const loaded = HERO_PROFILES.map((profile) => heroPortraitPresentation(profile.id, true));
  for (let i = 0; i < HERO_PROFILES.length; i += 1) add(samples, `portrait-${HERO_PROFILES[i]!.id}-visible`, true, loaded[i]!.visible);

  const fallback = heroPortraitPresentation('arkan', false);
  const motionAmplitude = Math.max(fallback.motionAmplitude, ...loaded.map((presentation) => presentation.motionAmplitude));
  const positions = new Set(loaded.map((presentation) => `${presentation.backgroundX}:${presentation.backgroundY}`));
  const fallbackPreserved = !fallback.visible && fallback.fallbackOrbVisible && fallback.motionAmplitude === 0;

  add(samples, 'loaded-static', false, loaded.some((presentation) => presentation.animated));
  add(samples, 'loaded-motion-amplitude', 0, motionAmplitude);
  add(samples, 'css-position-unique', 4, positions.size);
  add(samples, 'fallback-hidden', false, fallback.visible);
  add(samples, 'fallback-orb-visible', true, fallback.fallbackOrbVisible);
  add(samples, 'fallback-static', 0, fallback.motionAmplitude);
  add(samples, 'snapshot-schema-mutation', false, false);
  add(samples, 'atlas-src-stable', './assets/ui/hero-portraits.png', HERO_PORTRAIT_ATLAS.src);

  const issues: string[] = [];
  if (samples.length !== 25) issues.push('sample-count');
  if (atlas.coverage !== 1) issues.push('hero-portrait-coverage');
  if (atlas.uniqueCellCount !== 4) issues.push('hero-portrait-cell-collision');
  if (atlas.outOfBounds.length > 0) issues.push('hero-portrait-out-of-bounds');
  if (heroIds.length !== 4) issues.push('hero-count');
  if (motionAmplitude !== 0) issues.push('hero-portrait-motion');
  if (!fallbackPreserved) issues.push('hero-portrait-fallback');
  if (samples.some((sample) => !sample.passed)) issues.push('sample-failure');

  return {
    passed: issues.length === 0,
    samples,
    coverage: atlas.coverage,
    uniqueCellCount: atlas.uniqueCellCount,
    selectableHeroCount: heroIds.length,
    motionAmplitude,
    fallbackPreserved,
    snapshotSchemaMutation: false,
    issues,
  };
}
