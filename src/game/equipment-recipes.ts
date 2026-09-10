import type { EquippedItem, EquipmentStack, EquipmentState } from '../domain/types.js';

export interface EquipmentRecipe {
  id: string;
  hidden: boolean;
  ingredientIds: readonly [string, string];
  minimumIngredientRank: number;
  goldCost: number;
  result: EquippedItem;
  description: string;
  hint: string;
}

export type EquipmentRecipeVisibility = 'visible' | 'hidden' | 'hint' | 'ready-secret' | 'revealed';

export interface EquipmentRecipePresentation {
  id: string;
  hidden: boolean;
  visibility: EquipmentRecipeVisibility;
  name: string;
  description: string;
  hint: string;
  ingredientIds?: readonly [string, string];
  minimumIngredientRank?: number;
  goldCost?: number;
  result?: EquippedItem;
}

const recipeResult = (
  id: string,
  kind: EquippedItem['kind'],
  name: string,
  rank: number,
  power: number,
): EquippedItem => ({ id, kind, name, rank, power, legendary: rank >= 5 });

const RECIPES: readonly EquipmentRecipe[] = [
  {
    id: 'arcane-accelerator', hidden: false, ingredientIds: ['arcane-staff', 'rapid-wand'],
    minimumIngredientRank: 2, goldCost: 700,
    result: recipeResult('arcane-accelerator', 'weapon', '비전 가속봉', 3, 0.24),
    description: '마법 피해와 재사용시간을 함께 강화합니다.', hint: '',
  },
  {
    id: 'alchemical-blast-staff', hidden: false, ingredientIds: ['blast-rod', 'golden-wand'],
    minimumIngredientRank: 2, goldCost: 650,
    result: recipeResult('alchemical-blast-staff', 'weapon', '연금 폭발봉', 3, 0.17),
    description: '광역 범위와 금화 획득을 함께 강화합니다.', hint: '',
  },
  {
    id: 'wind-iron-armor', hidden: false, ingredientIds: ['iron-robe', 'gale-cloak'],
    minimumIngredientRank: 2, goldCost: 750,
    result: recipeResult('wind-iron-armor', 'armor', '바람 철갑', 3, 0.13),
    description: '영웅 피해 감소와 이동속도를 함께 강화합니다.', hint: '',
  },
  {
    id: 'gravity-guardian-armor', hidden: false, ingredientIds: ['magnet-cloak', 'guardian-plate'],
    minimumIngredientRank: 2, goldCost: 800,
    result: recipeResult('gravity-guardian-armor', 'armor', '중력 수호갑', 3, 0.16),
    description: '수집 범위와 수호핵 피해 감소를 함께 강화합니다.', hint: '',
  },
  {
    id: 'thunder-wisdom-seal', hidden: false, ingredientIds: ['sage-amulet', 'storm-ring'],
    minimumIngredientRank: 2, goldCost: 600,
    result: recipeResult('thunder-wisdom-seal', 'accessory', '현뢰의 인장', 3, 0.14),
    description: '마법 피해와 재사용시간을 함께 강화합니다.', hint: '',
  },
  {
    id: 'golden-bastion-talisman', hidden: false, ingredientIds: ['bastion-talisman', 'fortune-charm'],
    minimumIngredientRank: 2, goldCost: 650,
    result: recipeResult('golden-bastion-talisman', 'accessory', '황금 성채 부적', 3, 0.14),
    description: '영웅 피해 감소와 금화 획득을 함께 강화합니다.', hint: '',
  },
  {
    id: 'celestial-fusion-staff', hidden: true, ingredientIds: ['arcane-accelerator', 'alchemical-blast-staff'],
    minimumIngredientRank: 3, goldCost: 2800,
    result: recipeResult('celestial-fusion-staff', 'weapon', '천체 융합봉', 5, 0.31),
    description: '마법 피해·광역 범위·재사용시간을 강화합니다.', hint: '두 종류의 희귀 지팡이가 공명합니다.',
  },
  {
    id: 'world-tree-armor', hidden: true, ingredientIds: ['wind-iron-armor', 'gravity-guardian-armor'],
    minimumIngredientRank: 3, goldCost: 3200,
    result: recipeResult('world-tree-armor', 'armor', '세계수 성갑', 5, 0.24),
    description: '영웅·수호핵 피해 감소와 이동속도를 강화합니다.', hint: '두 종류의 희귀 갑옷이 뿌리를 내립니다.',
  },
  {
    id: 'fate-core', hidden: true, ingredientIds: ['thunder-wisdom-seal', 'golden-bastion-talisman'],
    minimumIngredientRank: 3, goldCost: 2500,
    result: recipeResult('fate-core', 'accessory', '운명의 핵', 5, 0.22),
    description: '마법 피해·재사용시간·금화·피해 감소를 강화합니다.', hint: '두 종류의 희귀 부적이 운명을 가리킵니다.',
  },
];

export function equipmentRecipes(): readonly EquipmentRecipe[] {
  return RECIPES;
}

export function equipmentRecipe(id: string): EquipmentRecipe | null {
  return RECIPES.find((recipe) => recipe.id === id) ?? null;
}

function hasIngredient(
  inventory: readonly EquipmentStack[],
  ingredientId: string,
  minimumRank: number,
): boolean {
  return inventory.some((stack) => stack.id === ingredientId && stack.rank >= minimumRank && stack.count > 0);
}

export function hiddenRecipePresentation(
  recipe: EquipmentRecipe,
  inventory: readonly EquipmentStack[],
  _runDiscoveries: readonly string[],
  permanentDiscoveries: readonly string[],
): EquipmentRecipePresentation {
  if (!recipe.hidden) {
    return {
      id: recipe.id, hidden: false, visibility: 'visible', name: recipe.result.name,
      description: recipe.description, hint: recipe.hint, ingredientIds: recipe.ingredientIds,
      minimumIngredientRank: recipe.minimumIngredientRank, goldCost: recipe.goldCost, result: { ...recipe.result },
    };
  }
  if (permanentDiscoveries.includes(recipe.id)) {
    return {
      id: recipe.id, hidden: true, visibility: 'revealed', name: recipe.result.name,
      description: recipe.description, hint: recipe.hint, ingredientIds: recipe.ingredientIds,
      minimumIngredientRank: recipe.minimumIngredientRank, goldCost: recipe.goldCost, result: { ...recipe.result },
    };
  }

  const ownedCount = recipe.ingredientIds.filter((id) => hasIngredient(inventory, id, recipe.minimumIngredientRank)).length;
  if (ownedCount === 0) return { id: recipe.id, hidden: true, visibility: 'hidden', name: '???', description: '', hint: '' };
  if (ownedCount === 1) return { id: recipe.id, hidden: true, visibility: 'hint', name: '???', description: '', hint: recipe.hint };
  return {
    id: recipe.id, hidden: true, visibility: 'ready-secret', name: '???', description: '', hint: recipe.hint,
    minimumIngredientRank: recipe.minimumIngredientRank, goldCost: recipe.goldCost,
  };
}

export function recipesForOwnedItems(
  state: EquipmentState,
  permanentDiscoveries: readonly string[],
): EquipmentRecipePresentation[] {
  const inventory = state.inventory ?? [];
  const runDiscoveries = state.discoveredRecipes ?? [];
  return RECIPES
    .map((recipe) => hiddenRecipePresentation(recipe, inventory, runDiscoveries, permanentDiscoveries))
    .filter((recipe) => recipe.visibility !== 'hidden');
}
