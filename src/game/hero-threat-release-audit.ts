import { directorSnapshot } from '../domain/director.js';
import { threatLevelModifiers, type ThreatLevel } from '../domain/threat-level.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';
import { openingThirtyMinuteSample } from './opening-thirty-timetable.js';
import { allHeroReleaseModels, heroReleaseModel } from './hero-release-model.js';

export interface HeroThreatReleaseCheckpoint {
  heroId: HeroId;
  threat: ThreatLevel;
  minute: number;
  offenseIndex: number;
  survivalIndex: number;
  coreGuardIndex: number;
  compositeIndex: number;
  pressureIndex: number;
  releaseMargin: number;
}

export interface HeroThreatReleaseAudit {
  checkpoints: HeroThreatReleaseCheckpoint[];
  maxOffenseSpread: number;
  maxSurvivalSpread: number;
  maxCoreGuardSpread: number;
  maxCompositeSpread: number;
  threatMonotonic: boolean;
  heroMarginsMonotonic: boolean;
  finitePositive: boolean;
  passed: boolean;
}

const MINUTES = [5, 10, 15, 20, 25, 30] as const;
const THREATS = [0, 3, 5] as const satisfies readonly ThreatLevel[];
function round(value: number): number { return Math.round(value * 10000) / 10000; }
function spread(values: readonly number[]): number { return round(Math.max(...values) / Math.max(.0001, Math.min(...values))); }

export function heroThreatPressureIndex(minute: number, threat: ThreatLevel): number {
  const seconds = Math.min(1799.999, minute * 60);
  const director = directorSnapshot(seconds);
  const opening = openingThirtyMinuteSample(seconds);
  const threatMods = threatLevelModifiers(threat);
  const elitePressure = 1 + Math.max(0, 1 / Math.max(.35, opening.eliteIntervalMultiplier * threatMods.eliteIntervalMultiplier) - 1) * .10;
  return round(director.damageMultiplier * opening.spawnPressureMultiplier * threatMods.spawnPressureMultiplier * threatMods.enemySpeedMultiplier * elitePressure);
}

export function heroThreatReleaseCheckpoints(): HeroThreatReleaseCheckpoint[] {
  const points: HeroThreatReleaseCheckpoint[] = [];
  for (const hero of HERO_PROFILES) {
    const model = heroReleaseModel(hero.id);
    for (const threat of THREATS) {
      for (const minute of MINUTES) {
        const pressure = heroThreatPressureIndex(minute, threat);
        const progression = 1 + minute / 30 * .08;
        points.push({
          heroId: hero.id,
          threat,
          minute,
          offenseIndex: model.offenseIndex,
          survivalIndex: model.survivalIndex,
          coreGuardIndex: model.coreGuardIndex,
          compositeIndex: model.compositeIndex,
          pressureIndex: pressure,
          releaseMargin: round(model.compositeIndex * progression / Math.pow(pressure, .45)),
        });
      }
    }
  }
  return points;
}

export function auditHeroThreatReleaseBalance(): HeroThreatReleaseAudit {
  const checkpoints = heroThreatReleaseCheckpoints();
  const models = allHeroReleaseModels();
  const maxOffenseSpread = spread(models.map((model) => model.offenseIndex));
  const maxSurvivalSpread = spread(models.map((model) => model.survivalIndex));
  const maxCoreGuardSpread = spread(models.map((model) => model.coreGuardIndex));
  const maxCompositeSpread = spread(models.map((model) => model.compositeIndex));
  let threatMonotonic = true;
  let heroMarginsMonotonic = true;
  for (const hero of HERO_PROFILES) {
    for (const minute of MINUTES) {
      const samples = checkpoints.filter((point) => point.heroId === hero.id && point.minute === minute).sort((a, b) => a.threat - b.threat);
      if (!(samples[0]!.pressureIndex < samples[1]!.pressureIndex && samples[1]!.pressureIndex < samples[2]!.pressureIndex)) threatMonotonic = false;
      if (!(samples[0]!.releaseMargin > samples[1]!.releaseMargin && samples[1]!.releaseMargin > samples[2]!.releaseMargin)) heroMarginsMonotonic = false;
    }
  }
  const finitePositive = checkpoints.every((point) => Number.isFinite(point.threat) && point.threat >= 0 && point.minute > 0 && [point.offenseIndex, point.survivalIndex, point.coreGuardIndex, point.compositeIndex, point.pressureIndex, point.releaseMargin].every((value) => Number.isFinite(value) && value > 0));
  const passed = finitePositive && threatMonotonic && heroMarginsMonotonic && maxOffenseSpread <= 1.35 && maxSurvivalSpread <= 1.35 && maxCoreGuardSpread <= 1.70 && maxCompositeSpread <= 1.10;
  return { checkpoints, maxOffenseSpread, maxSurvivalSpread, maxCoreGuardSpread, maxCompositeSpread, threatMonotonic, heroMarginsMonotonic, finitePositive, passed };
}
