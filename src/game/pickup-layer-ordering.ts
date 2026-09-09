import { stableWorldYDepthOrdered } from './enemy-actor-depth-ordering.js';

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
