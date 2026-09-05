export type FatePath = 'frenzy' | 'gold' | 'guardian' | 'none';
export type DeviceClass = 'low' | 'mid' | 'high';

export interface LegacyRunView {
  heroId: string;
  elapsedMs: number;
  level: number;
  threat: number;
  kills: number;
  bossesDefeated: number;
  elitesDefeated: number;
  gold: number;
  xp: number;
  guardianCoreHp: number;
  guardianCoreMaxHp: number;
  fate: FatePath;
  spellFusionCount: number;
  mapEvolutionRank: number;
  masteryLevel: number;
  deviceClass: DeviceClass;
}

export type GameplayEvent =
  | { type: 'enemy_killed'; elite?: boolean }
  | { type: 'spell_cast'; spellId: string; fusion?: boolean; affinity?: string }
  | { type: 'hero_damaged'; amount: number }
  | { type: 'core_damaged'; amount: number }
  | { type: 'boss_defeated'; bossId: string; durationMs: number; coreDamage: number; heroDefeated?: boolean; affinityDamage?: Record<string, number> }
  | { type: 'boss_encounter_end'; bossId: string; durationMs: number; coreDamage: number; heroDefeated: boolean; affinityDamage?: Record<string, number> }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'frame_pressure'; frameMs: number };

export type Effect =
  | { type: 'show_contract_offer'; offerId: string; options: ReadonlyArray<{ optionId: string; family: string; title: string; description: string; target: number; durationMs: number }> }
  | { type: 'contract_reward'; xpMultiplier?: number; masteryMultiplier?: number; goldMultiplier?: number; shieldPercent?: number; potionEfficiency?: number; bossDamageMultiplier?: number; fusionPowerMultiplier?: number; cooldownMultiplier?: number }
  | { type: 'contract_failed'; family: string }
  | { type: 'world_evolved'; world: string }
  | { type: 'spawn_field_node'; nodeId: string; kind: string; x: number; y: number; radius: number; expiresAtMs: number }
  | { type: 'ascension_tier'; tier: number }
  | { type: 'ascension_mutator'; mutator: string }
  | { type: 'nemesis_updated'; bossId: string; adaptations: string[] }
  | { type: 'show_hero_ascension_offer'; milestone: number }
  | { type: 'chronicle_milestone'; minute: number; title: string; rewardGold: number; coreHealPercent: number }
  | { type: 'final_form_signature'; formId: string; name: string; color: string }
  | { type: 'oath_started'; milestone: number; title: string; target: number }
  | { type: 'oath_completed'; milestone: number; title: string; rewardGold: number; coreHealPercent: number }
  | { type: 'oath_failed'; milestone: number; title: string }
  | { type: 'oath_expired'; milestone: number; title: string }
  | { type: 'run_checkpoint'; minute: number; title: string }
  | { type: 'run_milestone_recap'; minute: number; title: string; headline: string; killsDelta: number; bossesDelta: number };
