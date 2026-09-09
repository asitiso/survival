import { stableWorldYDepthOrdered } from './enemy-actor-depth-ordering.js';

export interface PersistentSpellGroundPositioned {
  pos: { y: number };
}

export type PersistentSpellGroundCue<F, H, E, R> =
  | { kind: 'field'; value: F; y: number }
  | { kind: 'hole'; value: H; y: number }
  | { kind: 'expire'; value: E; y: number }
  | { kind: 'residue'; value: R; y: number };

export function persistentSpellGroundLayerCues<
  F extends PersistentSpellGroundPositioned,
  H extends PersistentSpellGroundPositioned,
  E extends PersistentSpellGroundPositioned,
  R extends PersistentSpellGroundPositioned,
>(sources: {
  fields: readonly F[];
  holes: readonly H[];
  expiries: readonly E[];
  residues: readonly R[];
}): Array<PersistentSpellGroundCue<F, H, E, R>> {
  const combined: Array<PersistentSpellGroundCue<F, H, E, R>> = [
    ...sources.fields.map((value): PersistentSpellGroundCue<F, H, E, R> => ({ kind: 'field', value, y: value.pos.y })),
    ...sources.holes.map((value): PersistentSpellGroundCue<F, H, E, R> => ({ kind: 'hole', value, y: value.pos.y })),
    ...sources.expiries.map((value): PersistentSpellGroundCue<F, H, E, R> => ({ kind: 'expire', value, y: value.pos.y })),
    ...sources.residues.map((value): PersistentSpellGroundCue<F, H, E, R> => ({ kind: 'residue', value, y: value.pos.y })),
  ];
  return stableWorldYDepthOrdered(combined, (cue) => cue.y);
}
