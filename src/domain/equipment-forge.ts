import { addInventoryItem, inventoryStackKey } from './equipment-inventory.js';
import type {
  EquipmentKind,
  EquipmentStack,
  EquipmentState,
  EquipmentTransactionResult,
  EquippedItem,
} from './types.js';
import { equipmentRecipe } from '../game/equipment-recipes.js';

export type EquipmentTarget =
  | { place: 'equipped'; kind: EquipmentKind }
  | { place: 'inventory'; stackKey: string };

export interface StrengthenRequirement {
  materialCount: number;
  goldCost: number;
  unlockAtSeconds: number;
}

export function strengthenRequirement(rank: number): StrengthenRequirement {
  if (rank === 1) return { materialCount: 1, goldCost: 150, unlockAtSeconds: 90 };
  if (rank === 2) return { materialCount: 1, goldCost: 350, unlockAtSeconds: 240 };
  if (rank === 3) return { materialCount: 2, goldCost: 800, unlockAtSeconds: 480 };
  if (rank === 4) return { materialCount: 2, goldCost: 1800, unlockAtSeconds: 720 };
  const goldCost = Math.min(25000, Math.round(1800 * 1.32 ** (rank - 4) / 10) * 10);
  return { materialCount: 1, goldCost, unlockAtSeconds: 720 + (rank - 4) * 120 };
}

const failure = (state: EquipmentState, message: string): EquipmentTransactionResult => ({ ok: false, state, message });

const clonedInventory = (state: EquipmentState): EquipmentStack[] => (state.inventory ?? []).map((stack) => ({ ...stack }));

function removeFromInventory(inventory: EquipmentStack[], id: string, minimumRank: number, count: number, maximumRank = Infinity): boolean {
  const candidates = inventory
    .map((stack, index) => ({ stack, index }))
    .filter(({ stack }) => stack.id === id && stack.rank >= minimumRank && stack.rank <= maximumRank && stack.count > 0)
    .sort((a, b) => a.stack.rank - b.stack.rank || a.index - b.index);
  if (candidates.reduce((total, { stack }) => total + stack.count, 0) < count) return false;

  let remaining = count;
  for (const { stack } of candidates) {
    const taken = Math.min(stack.count, remaining);
    stack.count -= taken;
    remaining -= taken;
    if (remaining === 0) break;
  }
  for (let index = inventory.length - 1; index >= 0; index -= 1) {
    if (inventory[index]!.count <= 0) inventory.splice(index, 1);
  }
  return true;
}

function upgradedItem(item: EquippedItem): EquippedItem {
  const rank = Math.max(1, Math.floor(item.rank)) + 1;
  return { ...item, rank, legendary: rank >= 5 };
}

function success(state: EquipmentState, message: string, newlyDiscoveredRecipeId?: string): EquipmentTransactionResult {
  return newlyDiscoveredRecipeId === undefined
    ? { ok: true, state, message }
    : { ok: true, state, message, newlyDiscoveredRecipeId };
}

export function strengthenEquipment(
  state: EquipmentState,
  target: EquipmentTarget,
  elapsedSeconds: number,
): EquipmentTransactionResult {
  let selected: EquippedItem | null = null;
  if (target.place === 'equipped') selected = state[target.kind] ?? null;
  else selected = (state.inventory ?? []).find((stack) => inventoryStackKey(stack.id, stack.rank) === target.stackKey) ?? null;
  if (!selected) return failure(state, '강화할 장비를 찾을 수 없습니다.');

  const rank = Math.max(1, Math.floor(selected.rank));
  const requirement = strengthenRequirement(rank);
  if (elapsedSeconds < requirement.unlockAtSeconds) return failure(state, '아직 강화할 수 없습니다.');
  if (state.coins < requirement.goldCost) return failure(state, '금화가 부족합니다.');

  const inventory = clonedInventory(state);
  if (target.place === 'inventory') {
    const reservedIndex = inventory.findIndex((stack) => inventoryStackKey(stack.id, stack.rank) === target.stackKey);
    if (reservedIndex < 0) return failure(state, '강화할 장비를 찾을 수 없습니다.');
    inventory[reservedIndex]!.count -= 1;
    if (inventory[reservedIndex]!.count === 0) inventory.splice(reservedIndex, 1);
  }
  if (!removeFromInventory(inventory, selected.id, 1, requirement.materialCount, rank)) {
    return failure(state, '같은 장비 재료가 부족합니다.');
  }

  const upgraded = upgradedItem(selected);
  if (target.place === 'equipped') {
    return success({
      ...state,
      [target.kind]: upgraded,
      inventory,
      discoveredRecipes: [...(state.discoveredRecipes ?? [])],
      coins: state.coins - requirement.goldCost,
    }, '장비를 강화했습니다.');
  }

  const stored = addInventoryItem({ ...state, inventory }, upgraded);
  if (!stored.ok) return failure(state, '보관함이 가득 찼습니다.');
  return success({ ...stored.state, coins: state.coins - requirement.goldCost }, '장비를 강화했습니다.');
}

export function combineEquipment(state: EquipmentState, recipeId: string): EquipmentTransactionResult {
  const recipe = equipmentRecipe(recipeId);
  if (!recipe) return failure(state, '조합식을 찾을 수 없습니다.');

  const inventory = clonedInventory(state);
  for (const ingredientId of recipe.ingredientIds) {
    if (!removeFromInventory(inventory, ingredientId, recipe.minimumIngredientRank, 1)) {
      return failure(state, '조합 재료가 부족합니다.');
    }
  }

  const discoveredRecipes = [...(state.discoveredRecipes ?? [])];
  const newlyDiscoveredRecipeId = recipe.hidden && !discoveredRecipes.includes(recipe.id) ? recipe.id : undefined;
  if (newlyDiscoveredRecipeId) discoveredRecipes.push(newlyDiscoveredRecipeId);
  const afterIngredients: EquipmentState = { ...state, inventory, discoveredRecipes };
  const slot = recipe.result.kind;
  const placed = afterIngredients[slot] === null || afterIngredients[slot] === undefined
    ? { ...afterIngredients, [slot]: { ...recipe.result } }
    : addInventoryItem(afterIngredients, recipe.result);
  const next = 'ok' in placed ? (placed.ok ? placed.state : null) : placed;
  if (!next) return failure(state, '보관함이 가득 찼습니다.');
  if (state.coins < recipe.goldCost) return failure(state, '금화가 부족합니다.');

  return success({ ...next, coins: state.coins - recipe.goldCost }, '장비를 조합했습니다.', newlyDiscoveredRecipeId);
}
