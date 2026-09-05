import type { EquipmentState } from '../domain/types.js';
import type { RunMissionReward } from './run-missions.js';
import type { RegularEnemyWeights } from './threat-directives.js';

export interface MissionRewardRunState {
  shopTokens: number;
  equipmentState: EquipmentState;
  goldEarned: number;
}

export interface EnemyPressureState {
  enemySpeedMultiplier: number;
  spawnPressureMultiplier: number;
  eliteIntervalMultiplier: number;
  regularWeights: RegularEnemyWeights;
}

export function applyMissionRewardToState(state: MissionRewardRunState, reward: RunMissionReward): MissionRewardRunState {
  const equipmentState: EquipmentState = {
    coins: state.equipmentState.coins,
    weapon: state.equipmentState.weapon ? { ...state.equipmentState.weapon } : null,
    armor: state.equipmentState.armor ? { ...state.equipmentState.armor } : null,
    healingPotions: state.equipmentState.healingPotions,
  };
  let shopTokens = state.shopTokens;
  let goldEarned = state.goldEarned;
  if (reward.kind === 'shopToken') shopTokens += reward.amount;
  else if (reward.kind === 'gold') {
    equipmentState.coins += reward.amount;
    goldEarned += reward.amount;
  } else if (reward.kind === 'potion') equipmentState.healingPotions += reward.amount;
  return { shopTokens, equipmentState, goldEarned };
}

export function composeEnemyPressure(
  event: { spawnPressureMultiplier: number; eliteIntervalMultiplier: number },
  catastrophe: { enemySpeedMultiplier: number; spawnPressureMultiplier: number; eliteIntervalMultiplier: number },
  threat: { enemySpeedMultiplier: number; spawnPressureMultiplier: number; eliteIntervalMultiplier: number; regularWeights: RegularEnemyWeights },
): EnemyPressureState {
  return {
    enemySpeedMultiplier: catastrophe.enemySpeedMultiplier * threat.enemySpeedMultiplier,
    spawnPressureMultiplier: event.spawnPressureMultiplier * catastrophe.spawnPressureMultiplier * threat.spawnPressureMultiplier,
    eliteIntervalMultiplier: event.eliteIntervalMultiplier * catastrophe.eliteIntervalMultiplier * threat.eliteIntervalMultiplier,
    regularWeights: threat.regularWeights,
  };
}
