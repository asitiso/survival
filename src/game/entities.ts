import type { Vec2 } from '../core/math.js';
import { heroProfile, type HeroId } from './hero-profiles.js';

export interface Hero {
  profileId: HeroId;
  pos: Vec2;
  facing: Vec2;
  radius: number;
  speed: number;
  maxHp: number;
  hp: number;
  shield: number;
  maxShield: number;
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  kills: number;
  spellPower: number;
  cooldownMultiplier: number;
  pickupRadius: number;
  healingPotions: number;
  equipmentSpellPower: number;
  equipmentCooldownMultiplier: number;
  equipmentMoveSpeed: number;
  equipmentDamageTakenMultiplier: number;
  equipmentAreaMultiplier: number;
  equipmentGoldMultiplier: number;
  equipmentPickupMultiplier: number;
  equipmentCoreDamageTakenMultiplier: number;
  temporaryCooldownMultiplier: number;
  temporaryChainJumpBonus: number;
}

export interface GuardianCore {
  pos: Vec2;
  radius: number;
  maxHp: number;
  hp: number;
}

export function createHero(profileId: HeroId = 'arkan'): Hero {
  const profile = heroProfile(profileId);
  return {
    profileId,
    pos: { x: 690, y: 470 }, facing: { x: 1, y: 0 }, radius: 23, speed: profile.baseSpeed,
    maxHp: profile.baseHp, hp: profile.baseHp, shield: 0, maxShield: 0, level: 1, xp: 0, xpNext: 36,
    coins: 0, kills: 0, spellPower: profile.spellPower, cooldownMultiplier: profile.cooldownMultiplier, pickupRadius: 110, healingPotions: 1,
    equipmentSpellPower: 1, equipmentCooldownMultiplier: 1, equipmentMoveSpeed: 1, equipmentDamageTakenMultiplier: 1,
    equipmentAreaMultiplier: 1, equipmentGoldMultiplier: 1, equipmentPickupMultiplier: 1, equipmentCoreDamageTakenMultiplier: 1, temporaryCooldownMultiplier: 1, temporaryChainJumpBonus: 0,
  };
}

export function createGuardianCore(): GuardianCore {
  return { pos: { x: 800, y: 450 }, radius: 48, maxHp: 1800, hp: 1800 };
}
