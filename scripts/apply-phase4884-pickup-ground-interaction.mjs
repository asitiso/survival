import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value); }
function assertUnique(source, needle, label) {
  const first = source.indexOf(needle);
  if (first < 0) throw new Error(`missing ${label}`);
  if (source.indexOf(needle, first + needle.length) >= 0) throw new Error(`duplicate ${label}`);
  return first;
}

const pickupsPath = 'src/game/pickups.ts';
let pickups = read(pickupsPath);
const importNeedle = "import { pickupFlowVfxSprite, type PickupFlowVfxState } from './pickup-flow-vfx-assets.js';";
assertUnique(pickups, importNeedle, 'pickup flow import');
pickups = pickups.replace(
  importNeedle,
  `${importNeedle}\nimport { stableWorldYDepthOrdered } from './enemy-actor-depth-ordering.js';`,
);

const renderStartNeedle = '\n  render(\n';
const renderEndNeedle = '\n  private queueCollectionVfx';
const renderStart = assertUnique(pickups, renderStartNeedle, 'PickupManager.render start');
const renderEnd = assertUnique(pickups, renderEndNeedle, 'queueCollectionVfx boundary');
if (renderEnd <= renderStart) throw new Error('invalid PickupManager render boundary');

const replacement = `
  renderGroundLayer(
    ctx: CanvasRenderingContext2D,
    interactionAtlasImage: CanvasImageSource | null = null,
    interactionAtlasReady = false,
  ): void {
    for (const pickup of stableWorldYDepthOrdered(this.pickups, (pickup) => pickup.pos.y)) {
      ctx.save();
      ctx.translate(pickup.pos.x, pickup.pos.y);
      if (interactionAtlasReady && interactionAtlasImage) {
        const sprite = battlefieldInteractionSprite('pickup', pickup.kind);
        const size = Math.max(30, pickup.radius * 3.4);
        ctx.globalAlpha = 0.96;
        ctx.drawImage(interactionAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
      } else if (pickup.kind === 'coin') {
        ctx.shadowColor = '#ffd64f'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffd85d'; ctx.beginPath(); ctx.arc(0, 0, pickup.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff1a0'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#8b5e13'; ctx.font = '900 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('G', 0, 1);
      } else {
        ctx.rotate(Math.PI / 4);
        ctx.shadowColor = '#63d6ff'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#71dcff'; ctx.fillRect(-pickup.radius * .65, -pickup.radius * .65, pickup.radius * 1.3, pickup.radius * 1.3);
      }
      ctx.restore();
    }
  }

  renderInteractionLayer(
    ctx: CanvasRenderingContext2D,
    flowAtlasImage: CanvasImageSource | null = null,
    flowAtlasReady = false,
    reducedFlash = false,
  ): void {
    if (!flowAtlasReady || !flowAtlasImage) return;
    for (const pickup of stableWorldYDepthOrdered(this.pickups, (pickup) => pickup.pos.y)) {
      if (!pickup.flowState) continue;
      const flow = pickupFlowVfxSprite(pickup.kind,pickup.flowState);
      const size = Math.max(46,pickup.radius*4.8);
      ctx.save();
      ctx.translate(pickup.pos.x, pickup.pos.y);
      ctx.globalAlpha = reducedFlash ? 0.34 : (pickup.flowState === 'globalMagnet' ? 0.68 : 0.56);
      ctx.drawImage(flowAtlasImage,flow.sx,flow.sy,flow.sw,flow.sh,-size/2,-size/2,size,size);
      ctx.restore();
    }
    for (const cue of stableWorldYDepthOrdered(this.collectionVfx, (cue) => cue.pos.y)) {
      const sprite=pickupFlowVfxSprite(cue.kind,cue.state); const t=Math.max(0,Math.min(1,cue.ttl/cue.maxTtl)); const progress=1-t;
      const base=cue.state==='collectLarge'?78:58,size=base*(1+progress*.38);
      ctx.save();ctx.globalAlpha=(reducedFlash?.34:.72)*t;
      ctx.drawImage(flowAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.pos.x-size/2,cue.pos.y-size/2,size,size);ctx.restore();
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    interactionAtlasImage: CanvasImageSource | null = null,
    interactionAtlasReady = false,
    flowAtlasImage: CanvasImageSource | null = null,
    flowAtlasReady = false,
    reducedFlash = false,
  ): void {
    this.renderGroundLayer(ctx, interactionAtlasImage, interactionAtlasReady);
    this.renderInteractionLayer(ctx, flowAtlasImage, flowAtlasReady, reducedFlash);
  }
`;

pickups = pickups.slice(0, renderStart) + replacement + pickups.slice(renderEnd);
write(pickupsPath, pickups);

const gamePath = 'src/game/game.ts';
let game = read(gamePath);
let lines = game.split('\n');
function uniqueLineIndex(fragment, label) {
  const matches = [];
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(fragment)) matches.push(i);
  if (matches.length !== 1) throw new Error(`${label}: expected 1 line, got ${matches.length}`);
  return matches[0];
}

const oldPickupRenderIndex = uniqueLineIndex('this.pickups.render(ctx,', 'legacy Game pickup render');
lines.splice(oldPickupRenderIndex, 1);

const spellGroundIndex = uniqueLineIndex('this.spells.renderGroundLayer(ctx,', 'spell ground pass');
lines.splice(spellGroundIndex + 1, 0,
  '    this.pickups.renderGroundLayer(ctx, this.battlefieldInteractionVfxAtlasImage, this.battlefieldInteractionVfxAtlasReady);',
);

const spellReadabilityIndex = uniqueLineIndex('this.spells.renderPersistentReadabilityLayer(ctx,', 'spell readability pass');
lines.splice(spellReadabilityIndex + 1, 0,
  '    this.pickups.renderInteractionLayer(ctx, this.pickupFlowVfxAtlasImage, this.pickupFlowVfxAtlasReady, this.presentationSettings.reducedFlash);',
);

game = lines.join('\n');
write(gamePath, game);
