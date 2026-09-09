import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value); }
function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`missing ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`duplicate ${label}`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const orderingPath = 'src/game/persistent-spell-ground-ordering.ts';
let ordering = read(orderingPath);
if (!ordering.includes('persistentSpellReadabilityLayerCues')) {
  ordering += `\n\nexport type PersistentSpellReadabilityCue<F, H> =\n  | { kind: 'field'; value: F; y: number }\n  | { kind: 'hole'; value: H; y: number };\n\nexport function persistentSpellReadabilityLayerCues<\n  F extends PersistentSpellGroundPositioned,\n  H extends PersistentSpellGroundPositioned,\n>(sources: {\n  fields: readonly F[];\n  holes: readonly H[];\n}): Array<PersistentSpellReadabilityCue<F, H>> {\n  const combined: Array<PersistentSpellReadabilityCue<F, H>> = [\n    ...sources.fields.map((value): PersistentSpellReadabilityCue<F, H> => ({ kind: 'field', value, y: value.pos.y })),\n    ...sources.holes.map((value): PersistentSpellReadabilityCue<F, H> => ({ kind: 'hole', value, y: value.pos.y })),\n  ];\n  return stableWorldYDepthOrdered(combined, (cue) => cue.y);\n}\n`;
}
write(orderingPath, ordering);

const spellsPath = 'src/game/spells.ts';
let spells = read(spellsPath);
spells = replaceOnce(
  spells,
  "import { persistentSpellGroundLayerCues } from './persistent-spell-ground-ordering.js';",
  "import { persistentSpellGroundLayerCues, persistentSpellReadabilityLayerCues } from './persistent-spell-ground-ordering.js';",
  'persistent spell ordering import',
);

const fieldSignature = `        if (heroSpellSignatureAtlasReady && heroSpellSignatureAtlasImage) {\n          const sprite = heroSpellSignatureVfxSprite(field.heroId, 'flameField');\n          const size = field.radius * 2.1;\n          ctx.save(); ctx.globalAlpha = Math.min(0.62, fieldAlpha * 0.82);\n          ctx.drawImage(heroSpellSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, field.pos.x - size / 2, field.pos.y - size / 2, size, size);\n          ctx.restore();\n        }\n`;
spells = replaceOnce(spells, fieldSignature, '', 'ground field signature block');

const holeSignature = `        if (ultimateSignatureAtlasReady && ultimateSignatureAtlasImage) {\n          const sprite = heroUltimateSignatureVfxSprite(hole.heroId, 'blackHole');\n          const size = hole.radius * 2.24;\n          ctx.save(); ctx.globalAlpha = 0.58;\n          ctx.drawImage(ultimateSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, hole.pos.x - size / 2, hole.pos.y - size / 2, size, size);\n          ctx.restore();\n        }\n`;
spells = replaceOnce(spells, holeSignature, '', 'ground black-hole signature block');

const holeCc = `        if (crowdControlPropagationVfxAtlasReady && crowdControlPropagationVfxAtlasImage) {\n          const sprite=crowdControlPropagationVfxSprite(hole.heroId,'blackHole');\n          const size=hole.radius * 2.34;\n          ctx.save();ctx.globalAlpha=reducedFlash ? 0.32 : 0.58;\n          ctx.drawImage(crowdControlPropagationVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,hole.pos.x-size/2,hole.pos.y-size/2,size,size);ctx.restore();\n        }\n`;
spells = replaceOnce(spells, holeCc, '', 'ground black-hole crowd-control block');

const renderNeedle = '  render(ctx: CanvasRenderingContext2D, motion?: ResidualCombatMotionPolicy';
const renderIndex = spells.indexOf(renderNeedle);
if (renderIndex < 0) throw new Error('missing SpellSystem.render');
if (!spells.includes('  renderPersistentReadabilityLayer(')) {
  const readabilityMethod = `  renderPersistentReadabilityLayer(\n    ctx: CanvasRenderingContext2D,\n    heroSpellSignatureAtlasImage?: HTMLImageElement | null,\n    heroSpellSignatureAtlasReady = false,\n    ultimateSignatureAtlasImage?: HTMLImageElement | null,\n    ultimateSignatureAtlasReady = false,\n    crowdControlPropagationVfxAtlasImage?: HTMLImageElement | null,\n    crowdControlPropagationVfxAtlasReady = false,\n    reducedFlash = false,\n  ): void {\n    for (const cue of persistentSpellReadabilityLayerCues({ fields: this.fields, holes: this.holes })) {\n      if (cue.kind === 'field') {\n        const field = cue.value;\n        if (!heroSpellSignatureAtlasReady || !heroSpellSignatureAtlasImage) continue;\n        const fieldAlpha = Math.min(0.72, 0.28 + Math.max(0, Math.min(1, field.ttl / 1.4)) * 0.44);\n        const sprite = heroSpellSignatureVfxSprite(field.heroId, 'flameField');\n        const size = field.radius * 2.1;\n        ctx.save();\n        ctx.globalAlpha = Math.min(0.62, fieldAlpha * 0.82);\n        ctx.drawImage(heroSpellSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, field.pos.x - size / 2, field.pos.y - size / 2, size, size);\n        ctx.restore();\n        continue;\n      }\n      const hole = cue.value;\n      if (ultimateSignatureAtlasReady && ultimateSignatureAtlasImage) {\n        const sprite = heroUltimateSignatureVfxSprite(hole.heroId, 'blackHole');\n        const size = hole.radius * 2.24;\n        ctx.save();\n        ctx.globalAlpha = 0.58;\n        ctx.drawImage(ultimateSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, hole.pos.x - size / 2, hole.pos.y - size / 2, size, size);\n        ctx.restore();\n      }\n      if (crowdControlPropagationVfxAtlasReady && crowdControlPropagationVfxAtlasImage) {\n        const sprite = crowdControlPropagationVfxSprite(hole.heroId, 'blackHole');\n        const size = hole.radius * 2.34;\n        ctx.save();\n        ctx.globalAlpha = reducedFlash ? 0.32 : 0.58;\n        ctx.drawImage(crowdControlPropagationVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, hole.pos.x - size / 2, hole.pos.y - size / 2, size, size);\n        ctx.restore();\n      }\n    }\n  }\n\n`;
  spells = spells.slice(0, renderIndex) + readabilityMethod + spells.slice(renderIndex);
}

const oldCompatibility = '    if (includeGroundLayer) this.renderGroundLayer(ctx, motion, propVfxAtlasImage, propVfxAtlasReady, heroSpellSignatureAtlasImage, heroSpellSignatureAtlasReady, ultimateSignatureAtlasImage, ultimateSignatureAtlasReady, persistentSpellZoneVfxAtlasImage, persistentSpellZoneVfxAtlasReady, crowdControlPropagationVfxAtlasImage, crowdControlPropagationVfxAtlasReady, reducedFlash, ultimatePostImpactResidueVfxAtlasImage, ultimatePostImpactResidueVfxAtlasReady);';
const newCompatibility = `    if (includeGroundLayer) {\n      this.renderGroundLayer(ctx, motion, propVfxAtlasImage, propVfxAtlasReady, heroSpellSignatureAtlasImage, heroSpellSignatureAtlasReady, ultimateSignatureAtlasImage, ultimateSignatureAtlasReady, persistentSpellZoneVfxAtlasImage, persistentSpellZoneVfxAtlasReady, crowdControlPropagationVfxAtlasImage, crowdControlPropagationVfxAtlasReady, reducedFlash, ultimatePostImpactResidueVfxAtlasImage, ultimatePostImpactResidueVfxAtlasReady);\n      this.renderPersistentReadabilityLayer(ctx, heroSpellSignatureAtlasImage, heroSpellSignatureAtlasReady, ultimateSignatureAtlasImage, ultimateSignatureAtlasReady, crowdControlPropagationVfxAtlasImage, crowdControlPropagationVfxAtlasReady, reducedFlash);\n    }`;
spells = replaceOnce(spells, oldCompatibility, newCompatibility, 'render compatibility ground call');
write(spellsPath, spells);

const gamePath = 'src/game/game.ts';
let game = read(gamePath);
const terrainForeground = '    this.drawTerrainForegroundOcclusion(ctx);\n';
const readabilityCall = `    this.drawTerrainForegroundOcclusion(ctx);\n    this.spells.renderPersistentReadabilityLayer(ctx, this.heroSpellSignatureVfxAtlasImage, this.heroSpellSignatureVfxAtlasReady, this.heroUltimateSignatureVfxAtlasImage, this.heroUltimateSignatureVfxAtlasReady, this.crowdControlPropagationVfxAtlasImage, this.crowdControlPropagationVfxAtlasReady, this.presentationSettings.reducedFlash);\n`;
game = replaceOnce(game, terrainForeground, readabilityCall, 'terrain foreground render call');
write(gamePath, game);

console.log('Phase 4883 persistent readability layer applied.');
