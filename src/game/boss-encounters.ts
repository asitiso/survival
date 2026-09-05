import { distance, type Vec2 } from '../core/math.js';
import type { BossArchetype, BossVariantTier } from './boss-patterns.js';

export interface MagicTargetSink { hitMagic(pos: Vec2, strength: number): void; }

export interface BossEncounterNode {
  id: number;
  kind: 'flamePylon' | 'summonCore' | 'armorPlate' | 'curseAnchor' | 'mawSigil' | 'clockShard';
  pos: Vec2;
  hp: number;
  maxHp: number;
  radius: number;
  alive: boolean;
}

export interface BossEncounterModifiers {
  bossDamageTakenMultiplier: number;
  specialCadenceMultiplier: number;
  summonCountMultiplier: number;
  dashDistanceMultiplier: number;
}

const NEUTRAL: BossEncounterModifiers = {
  bossDamageTakenMultiplier: 1,
  specialCadenceMultiplier: 1,
  summonCountMultiplier: 1,
  dashDistanceMultiplier: 1,
};

export class BossEncounterSystem implements MagicTargetSink {
  activeBossId: number | null = null;
  archetype: BossArchetype | null = null;
  variantTier: BossVariantTier = 0;
  nodes: BossEncounterNode[] = [];
  destroyedNodes = 0;
  private vulnerabilityTimer = 0;
  private nextNodeId = 1;

  reset(): void {
    this.activeBossId = null;
    this.archetype = null;
    this.variantTier = 0;
    this.nodes = [];
    this.destroyedNodes = 0;
    this.vulnerabilityTimer = 0;
    this.nextNodeId = 1;
  }

  begin(bossId: number, archetype: BossArchetype, bossPos: Vec2, variantTier: BossVariantTier): void {
    this.activeBossId = bossId;
    this.archetype = archetype;
    this.variantTier = variantTier;
    this.destroyedNodes = 0;
    this.vulnerabilityTimer = 0;
    const tierHp = 210 + variantTier * 55;
    const offsets = archetype === 'juggernaut'
      ? [{ x: -105, y: -52 }, { x: 105, y: -52 }, { x: 0, y: 118 }]
      : archetype === 'twinMaw'
        ? [{ x: -132, y: -18 }, { x: 132, y: -18 }, { x: 0, y: 128 }]
        : [{ x: -118, y: 18 }, { x: 118, y: 18 }];
    const kind = archetype === 'inferno' ? 'flamePylon'
      : archetype === 'summoner' ? 'summonCore'
        : archetype === 'juggernaut' ? 'armorPlate'
          : archetype === 'abyssWitch' ? 'curseAnchor'
            : archetype === 'twinMaw' ? 'mawSigil' : 'clockShard';
    this.nodes = offsets.map((offset) => ({
      id: this.nextNodeId++, kind,
      pos: { x: bossPos.x + offset.x, y: bossPos.y + offset.y },
      hp: tierHp, maxHp: tierHp, radius: kind === 'armorPlate' ? 27 : 31, alive: true,
    }));
  }

  update(dt: number): void { this.vulnerabilityTimer = Math.max(0, this.vulnerabilityTimer - Math.max(0, dt)); }

  hitMagic(pos: Vec2, strength: number): void {
    let target: BossEncounterNode | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const node of this.nodes) {
      if (!node.alive) continue;
      const d = distance(pos, node.pos);
      if (d <= node.radius + 82 && d < best) { target = node; best = d; }
    }
    if (!target) return;
    target.hp = Math.max(0, target.hp - Math.max(1, strength));
    if (target.hp > 0) return;
    target.alive = false;
    this.destroyedNodes += 1;
    if (this.archetype === 'inferno' && this.nodes.every((node) => !node.alive)) this.vulnerabilityTimer = 6;
  }

  get modifiers(): BossEncounterModifiers {
    if (!this.activeBossId || !this.archetype) return NEUTRAL;
    const alive = this.nodes.filter((node) => node.alive).length;
    if (this.archetype === 'inferno') {
      if (this.vulnerabilityTimer > 0) return { ...NEUTRAL, bossDamageTakenMultiplier: 1.28 };
      return alive > 0 ? { ...NEUTRAL, bossDamageTakenMultiplier: 0.78 } : NEUTRAL;
    }
    if (this.archetype === 'summoner') {
      return alive > 0 ? { ...NEUTRAL, specialCadenceMultiplier: 0.82, summonCountMultiplier: 1.28 } : { ...NEUTRAL, specialCadenceMultiplier: 1.22, summonCountMultiplier: 0.78 };
    }
    if (this.archetype === 'juggernaut') return alive > 0 ? { ...NEUTRAL, bossDamageTakenMultiplier: 0.84, dashDistanceMultiplier: 1.18 } : { ...NEUTRAL, bossDamageTakenMultiplier: 1.18, dashDistanceMultiplier: 0.72 };
    if (this.archetype === 'abyssWitch') return alive > 0 ? { ...NEUTRAL, bossDamageTakenMultiplier: 0.86, specialCadenceMultiplier: 0.88 } : { ...NEUTRAL, bossDamageTakenMultiplier: 1.16, specialCadenceMultiplier: 1.12 };
    if (this.archetype === 'twinMaw') return alive > 0 ? { ...NEUTRAL, bossDamageTakenMultiplier: 0.88, specialCadenceMultiplier: 0.92 } : { ...NEUTRAL, bossDamageTakenMultiplier: 1.15 };
    return alive > 0 ? { ...NEUTRAL, specialCadenceMultiplier: 0.84 } : { ...NEUTRAL, bossDamageTakenMultiplier: 1.12, specialCadenceMultiplier: 1.18 };
  }
}
