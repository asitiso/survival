import type { Vec2 } from '../core/math.js';
import type { MapEvolutionStage } from './map-evolution.js';
import type { MapId } from './map-layouts.js';

const BASE_ANCHORS: Record<MapId, readonly [Vec2, Vec2, Vec2]> = {
  ruinedGate: [
    { x: 330, y: 220 }, { x: 1240, y: 260 }, { x: 1180, y: 690 },
  ],
  frozenFen: [
    { x: 300, y: 650 }, { x: 1260, y: 230 }, { x: 1290, y: 690 },
  ],
  crystalQuarry: [
    { x: 320, y: 240 }, { x: 1280, y: 250 }, { x: 1110, y: 720 },
  ],
};

const STAGE_OFFSETS: Record<MapEvolutionStage, readonly [Vec2, Vec2, Vec2]> = {
  0: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
  1: [{ x: 35, y: 65 }, { x: -45, y: 70 }, { x: -80, y: -35 }],
  2: [{ x: 75, y: 20 }, { x: -75, y: 110 }, { x: -120, y: -90 }],
};

export function objectiveAnchors(mapId: MapId, stage: MapEvolutionStage): Vec2[] {
  return BASE_ANCHORS[mapId].map((base, index) => {
    const offset = STAGE_OFFSETS[stage][index]!;
    return {
      x: Math.max(260, Math.min(1340, base.x + offset.x)),
      y: Math.max(180, Math.min(750, base.y + offset.y)),
    };
  });
}

export function chooseObjectiveAnchor(mapId: MapId, stage: MapEvolutionStage, hero: Vec2): Vec2 {
  const anchors = objectiveAnchors(mapId, stage);
  let best = anchors[0]!;
  let bestDistance = -1;
  for (const anchor of anchors) {
    const d = Math.hypot(anchor.x - hero.x, anchor.y - hero.y);
    if (d > bestDistance) {
      bestDistance = d;
      best = anchor;
    }
  }
  return { ...best };
}

export interface RiftSealState { progress: number; }
export interface RiftSealResult extends RiftSealState { complete: boolean; }

export function advanceRiftSeal(state: RiftSealState, dt: number, heroInside: boolean, nearbyEnemies: number): RiftSealResult {
  const safeDt = Math.max(0, dt);
  const enemies = Math.max(0, Math.floor(nearbyEnemies));
  const delta = heroInside
    ? Math.max(4, 18 - enemies * 0.6) * safeDt
    : -4 * safeDt;
  const progress = Math.max(0, Math.min(100, state.progress + delta));
  return { progress, complete: progress >= 100 };
}

export interface BeaconDefenseState { hp: number; timeLeft: number; }
export interface BeaconDefenseResult extends BeaconDefenseState { complete: boolean; failed: boolean; }

export function advanceBeaconDefense(state: BeaconDefenseState, dt: number, nearbyEnemies: number): BeaconDefenseResult {
  const safeDt = Math.max(0, dt);
  const enemies = Math.max(0, Math.floor(nearbyEnemies));
  const hp = Math.max(0, Math.min(100, state.hp - enemies * 3 * safeDt));
  const timeLeft = Math.max(0, state.timeLeft - safeDt);
  return { hp, timeLeft, complete: hp > 0 && timeLeft <= 0, failed: hp <= 0 };
}

export interface CursedAltarState { activated: boolean; timeLeft: number; }
export interface CursedAltarResult extends CursedAltarState { complete: boolean; }

export function advanceCursedAltar(state: CursedAltarState, dt: number): CursedAltarResult {
  const timeLeft = state.activated ? Math.max(0, state.timeLeft - Math.max(0, dt)) : state.timeLeft;
  return { activated: state.activated, timeLeft, complete: state.activated && timeLeft <= 0 };
}
