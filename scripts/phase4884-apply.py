from pathlib import Path

helper_path = Path('src/game/pickup-layer-ordering.ts')
helper_path.write_text("""import { stableWorldYDepthOrdered } from './enemy-actor-depth-ordering.js';

export interface PickupLayerPositioned {
  pos: { y: number };
}

export function pickupGroundBodyOrdered<T extends PickupLayerPositioned>(
  pickups: readonly T[],
): T[] {
  return stableWorldYDepthOrdered(pickups, (pickup) => pickup.pos.y);
}

export type PickupInteractionLayerCue<P, C> =
  | { kind: 'pickup'; value: P; y: number }
  | { kind: 'collection'; value: C; y: number };

export function pickupInteractionLayerCues<
  P extends PickupLayerPositioned,
  C extends PickupLayerPositioned,
>(sources: {
  pickups: readonly P[];
  collections: readonly C[];
}): Array<PickupInteractionLayerCue<P, C>> {
  const combined: Array<PickupInteractionLayerCue<P, C>> = [
    ...sources.pickups.map((value): PickupInteractionLayerCue<P, C> => ({ kind: 'pickup', value, y: value.pos.y })),
    ...sources.collections.map((value): PickupInteractionLayerCue<P, C> => ({ kind: 'collection', value, y: value.pos.y })),
  ];
  return stableWorldYDepthOrdered(combined, (cue) => cue.y);
}
""")

pickups_path = Path('src/game/pickups.ts')
pickups = pickups_path.read_text()
import_anchor = "import { pickupFlowVfxSprite, type PickupFlowVfxState } from './pickup-flow-vfx-assets.js';"
import_line = "import { pickupGroundBodyOrdered, pickupInteractionLayerCues } from './pickup-layer-ordering.js';"
if import_line not in pickups:
    if pickups.count(import_anchor) != 1:
        raise SystemExit(f'pickup import anchor count={pickups.count(import_anchor)}')
    pickups = pickups.replace(import_anchor, import_anchor + '\n' + import_line, 1)

render_start_marker = "  render(\n    ctx: CanvasRenderingContext2D,"
render_start = pickups.find(render_start_marker)
queue_start = pickups.find("  private queueCollectionVfx(", render_start)
if render_start < 0 or queue_start < 0:
    raise SystemExit(f'pickup render markers missing render={render_start} queue={queue_start}')

new_render_block = """  renderGroundLayer(
    ctx: CanvasRenderingContext2D,
    interactionAtlasImage: CanvasImageSource | null = null,
    interactionAtlasReady = false,
  ): void {
    for (const pickup of pickupGroundBodyOrdered(this.pickups)) {
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
    for (const cue of pickupInteractionLayerCues({ pickups: this.pickups, collections: this.collectionVfx })) {
      if (cue.kind === 'pickup') {
        const pickup = cue.value;
        if (!pickup.flowState) continue;
        ctx.save();
        ctx.translate(pickup.pos.x, pickup.pos.y);
        const flow = pickupFlowVfxSprite(pickup.kind, pickup.flowState);
        const size = Math.max(46, pickup.radius * 4.8);
        ctx.globalAlpha = reducedFlash ? 0.34 : (pickup.flowState === 'globalMagnet' ? 0.68 : 0.56);
        ctx.drawImage(flowAtlasImage, flow.sx, flow.sy, flow.sw, flow.sh, -size / 2, -size / 2, size, size);
        ctx.restore();
        continue;
      }
      const collection = cue.value;
      const sprite = pickupFlowVfxSprite(collection.kind, collection.state);
      const t = Math.max(0, Math.min(1, collection.ttl / collection.maxTtl));
      const progress = 1 - t;
      const base = collection.state === 'collectLarge' ? 78 : 58;
      const size = base * (1 + progress * .38);
      ctx.save();
      ctx.globalAlpha = (reducedFlash ? .34 : .72) * t;
      ctx.drawImage(flowAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, collection.pos.x - size / 2, collection.pos.y - size / 2, size, size);
      ctx.restore();
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

"""
pickups = pickups[:render_start] + new_render_block + pickups[queue_start:]
pickups_path.write_text(pickups)

game_path = Path('src/game/game.ts')
game = game_path.read_text()
ground_anchor = "    this.spells.renderGroundLayer(ctx, residualMotion, this.battlefieldPropVfxAtlasImage, this.battlefieldPropVfxAtlasReady, this.heroSpellSignatureVfxAtlasImage, this.heroSpellSignatureVfxAtlasReady, this.heroUltimateSignatureVfxAtlasImage, this.heroUltimateSignatureVfxAtlasReady, this.persistentSpellZoneVfxAtlasImage, this.persistentSpellZoneVfxAtlasReady, this.crowdControlPropagationVfxAtlasImage, this.crowdControlPropagationVfxAtlasReady, this.presentationSettings.reducedFlash, this.ultimatePostImpactResidueVfxAtlasImage, this.ultimatePostImpactResidueVfxAtlasReady);"
pickup_ground_line = "    this.pickups.renderGroundLayer(ctx, this.battlefieldInteractionVfxAtlasImage, this.battlefieldInteractionVfxAtlasReady);"
if pickup_ground_line not in game:
    if game.count(ground_anchor) != 1:
        raise SystemExit(f'game ground anchor count={game.count(ground_anchor)}')
    game = game.replace(ground_anchor, ground_anchor + '\n' + pickup_ground_line, 1)

old_pickup_render = "    this.pickups.render(ctx, this.battlefieldInteractionVfxAtlasImage, this.battlefieldInteractionVfxAtlasReady, this.pickupFlowVfxAtlasImage, this.pickupFlowVfxAtlasReady, this.presentationSettings.reducedFlash);"
interaction_line = "    this.pickups.renderInteractionLayer(ctx, this.pickupFlowVfxAtlasImage, this.pickupFlowVfxAtlasReady, this.presentationSettings.reducedFlash);"
if interaction_line not in game:
    if game.count(old_pickup_render) != 1:
        raise SystemExit(f'old pickup render count={game.count(old_pickup_render)}')
    game = game.replace(old_pickup_render, interaction_line, 1)

game_path.write_text(game)
