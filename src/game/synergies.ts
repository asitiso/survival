import type { EquipmentState } from '../domain/types.js';
import type { HeroId } from './hero-profiles.js';
import type { RelicId } from './relics.js';
import type { RunTraitId } from './run-traits.js';

export type SynergyId =
  | 'forbidden-arcana'
  | 'broken-time'
  | 'last-bastion'
  | 'starbreaker'
  | 'golden-fever'
  | 'overclock'
  | 'ember-dominion'
  | 'winter-dominion'
  | 'storm-dominion'
  | 'oath-dominion';

export interface SynergyBuild {
  heroId: HeroId;
  traitId: RunTraitId | null;
  relicId: RelicId | null;
  equipment: EquipmentState;
}

export interface SynergyDefinition {
  id: SynergyId;
  name: string;
  description: string;
  accent: string;
}

export interface SynergyModifiers {
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  moveSpeedMultiplier: number;
  heroDamageTakenMultiplier: number;
  areaMultiplier: number;
  goldMultiplier: number;
  coreDamageTakenMultiplier: number;
  arkanExplosionChanceBonus: number;
  arkanExplosionRadiusMultiplier: number;
  kainOverloadGainMultiplier: number;
  kainOverloadMaxCooldownReductionBonus: number;
  edricAuraRadiusBonus: number;
  edricAuraMitigationMultiplier: number;
}

const NAMES: Record<SynergyId, Omit<SynergyDefinition, 'id'>> = {
  'forbidden-arcana': { name: '금단의 비전', description: '대마도사의 심장과 심연의 눈이 공명합니다.', accent: '#d98cff' },
  'broken-time': { name: '부서진 시간', description: '시간 계열 장비와 유물이 영창을 더 압축합니다.', accent: '#70d8ff' },
  'last-bastion': { name: '최후의 성채', description: '수호 장비와 유물이 수호핵을 극단적으로 강화합니다.', accent: '#f0ca72' },
  starbreaker: { name: '별파괴자', description: '파괴 본능이 전설 광역 무기를 폭주시킵니다.', accent: '#ff845d' },
  'golden-fever': { name: '황금 열병', description: '황금 감각과 미다스의 손이 금화 폭주를 일으킵니다.', accent: '#ffd85d' },
  overclock: { name: '오버클럭', description: '신속 영창과 크로노스 셉터가 위험한 고속 영창을 만듭니다.', accent: '#70e5ff' },
  'ember-dominion': { name: '잿불 지배', description: '아르칸의 연쇄폭발이 지배 단계로 상승합니다.', accent: '#ff674a' },
  'winter-dominion': { name: '겨울 지배', description: '세리아의 광역 제어가 더 넓고 빠르게 퍼집니다.', accent: '#86e7ff' },
  'storm-dominion': { name: '폭풍 지배', description: '카인의 과부하가 더 빨리 차고 더 깊게 가속됩니다.', accent: '#ae94ff' },
  'oath-dominion': { name: '맹세 지배', description: '에드릭의 수호 오라가 더 넓고 단단해집니다.', accent: '#f2c96f' },
};

const NEUTRAL: SynergyModifiers = {
  spellPowerMultiplier: 1,
  cooldownMultiplier: 1,
  moveSpeedMultiplier: 1,
  heroDamageTakenMultiplier: 1,
  areaMultiplier: 1,
  goldMultiplier: 1,
  coreDamageTakenMultiplier: 1,
  arkanExplosionChanceBonus: 0,
  arkanExplosionRadiusMultiplier: 1,
  kainOverloadGainMultiplier: 1,
  kainOverloadMaxCooldownReductionBonus: 0,
  edricAuraRadiusBonus: 0,
  edricAuraMitigationMultiplier: 1,
};

function legendaryWeapon(build: SynergyBuild, id: string): boolean {
  return build.equipment.weapon?.legendary === true && build.equipment.weapon.id === id;
}

function legendaryArmor(build: SynergyBuild, id: string): boolean {
  return build.equipment.armor?.legendary === true && build.equipment.armor.id === id;
}

function def(id: SynergyId): SynergyDefinition { return { id, ...NAMES[id] }; }

export function activeSynergies(build: SynergyBuild): SynergyDefinition[] {
  const out: SynergyDefinition[] = [];
  if (build.relicId === 'abyss-eye' && legendaryWeapon(build, 'arcane-staff')) out.push(def('forbidden-arcana'));
  if (build.relicId === 'chrono-shard' && legendaryWeapon(build, 'rapid-wand')) out.push(def('broken-time'));
  if (build.relicId === 'guardian-heart' && legendaryArmor(build, 'guardian-plate')) out.push(def('last-bastion'));
  if (build.traitId === 'destruction' && legendaryWeapon(build, 'blast-rod')) out.push(def('starbreaker'));
  if (build.traitId === 'goldSense' && legendaryWeapon(build, 'golden-wand')) out.push(def('golden-fever'));
  if (build.traitId === 'rapidCasting' && legendaryWeapon(build, 'rapid-wand')) out.push(def('overclock'));
  if (build.heroId === 'arkan' && build.relicId === 'ember-crown' && legendaryWeapon(build, 'arcane-staff')) out.push(def('ember-dominion'));
  if (build.heroId === 'seria' && build.relicId === 'winter-heart' && legendaryWeapon(build, 'blast-rod')) out.push(def('winter-dominion'));
  if (build.heroId === 'kain' && build.relicId === 'storm-core' && legendaryWeapon(build, 'rapid-wand')) out.push(def('storm-dominion'));
  if (build.heroId === 'edric' && build.relicId === 'oath-seal' && legendaryArmor(build, 'guardian-plate')) out.push(def('oath-dominion'));
  return out;
}

export function synergyHudNames(build: SynergyBuild, limit = 2): string[] {
  return activeSynergies(build).slice(0, Math.max(0, Math.floor(limit))).map((entry) => entry.name);
}

export function synergyModifiers(build: SynergyBuild): SynergyModifiers {
  const out: SynergyModifiers = { ...NEUTRAL };
  for (const synergy of activeSynergies(build)) {
    switch (synergy.id) {
      case 'forbidden-arcana':
        out.spellPowerMultiplier *= 1.16;
        out.heroDamageTakenMultiplier *= 1.05;
        break;
      case 'broken-time':
        out.cooldownMultiplier *= 0.92;
        out.moveSpeedMultiplier *= 0.97;
        break;
      case 'last-bastion':
        out.coreDamageTakenMultiplier *= 0.82;
        break;
      case 'starbreaker':
        out.areaMultiplier *= 1.18;
        out.spellPowerMultiplier *= 1.08;
        break;
      case 'golden-fever':
        out.goldMultiplier *= 1.30;
        break;
      case 'overclock':
        out.cooldownMultiplier *= 0.93;
        out.heroDamageTakenMultiplier *= 1.04;
        break;
      case 'ember-dominion':
        out.arkanExplosionChanceBonus += 0.08;
        out.arkanExplosionRadiusMultiplier *= 1.15;
        break;
      case 'winter-dominion':
        out.areaMultiplier *= 1.15;
        out.cooldownMultiplier *= 0.95;
        break;
      case 'storm-dominion':
        out.kainOverloadGainMultiplier *= 1.25;
        out.kainOverloadMaxCooldownReductionBonus += 0.04;
        break;
      case 'oath-dominion':
        out.edricAuraRadiusBonus += 45;
        out.edricAuraMitigationMultiplier *= 0.90;
        break;
    }
  }
  return out;
}
