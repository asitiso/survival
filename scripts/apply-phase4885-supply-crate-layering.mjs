import fs from 'node:fs';

const path = 'src/game/game.ts';
let source = fs.readFileSync(path, 'utf8');

function replaceExactlyOnce(label, before, after) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: source pattern not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: source pattern is not unique`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
}

replaceExactlyOnce(
  'split supply response identity from grounded body',
  "    this.drawFieldEventResponseIdentity(ctx,'supplyDrop',0,-43,20);\n    ctx.restore();\n  }\n\n  private drawHeroMeterIdentityHud",
  "    ctx.restore();\n  }\n\n  private drawSupplyCrateResponseIdentity(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {\n    if (!this.supplyCrate) return;\n    const pulse = 1 + Math.sin(this.elapsed * 4) * motion.supplyCrateMotionAmplitude;\n    ctx.save();\n    ctx.translate(this.supplyCrate.x, this.supplyCrate.y);\n    ctx.scale(pulse, pulse);\n    this.drawFieldEventResponseIdentity(ctx,'supplyDrop',0,-43,20);\n    ctx.restore();\n  }\n\n  private drawHeroMeterIdentityHud",
);

replaceExactlyOnce(
  'place supply response identity above terrain foreground',
  "    this.spells.renderPersistentReadabilityLayer(ctx, this.heroSpellSignatureVfxAtlasImage, this.heroSpellSignatureVfxAtlasReady, this.heroUltimateSignatureVfxAtlasImage, this.heroUltimateSignatureVfxAtlasReady, this.crowdControlPropagationVfxAtlasImage, this.crowdControlPropagationVfxAtlasReady, this.presentationSettings.reducedFlash);\n    this.pickups.renderInteractionLayer(ctx, this.pickupFlowVfxAtlasImage, this.pickupFlowVfxAtlasReady, this.presentationSettings.reducedFlash);\n    this.drawElitePackApproachFormationVfx(ctx);",
  "    this.spells.renderPersistentReadabilityLayer(ctx, this.heroSpellSignatureVfxAtlasImage, this.heroSpellSignatureVfxAtlasReady, this.heroUltimateSignatureVfxAtlasImage, this.heroUltimateSignatureVfxAtlasReady, this.crowdControlPropagationVfxAtlasImage, this.crowdControlPropagationVfxAtlasReady, this.presentationSettings.reducedFlash);\n    this.pickups.renderInteractionLayer(ctx, this.pickupFlowVfxAtlasImage, this.pickupFlowVfxAtlasReady, this.presentationSettings.reducedFlash);\n    this.drawSupplyCrateResponseIdentity(ctx, secondaryMotion);\n    this.drawElitePackApproachFormationVfx(ctx);",
);

fs.writeFileSync(path, source);
