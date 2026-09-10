import {
  EquipmentStack,
  EquipmentState,
  EquipmentTransactionResult,
  EquippedItem,
} from './types.js';

export const EQUIPMENT_INVENTORY_CAPACITY = 6;

export function inventoryStackKey(id: string, rank: number): string {
  return `${id}@${Math.max(1, Math.floor(rank))}`;
}

const normalizedInventory = (state: EquipmentState): EquipmentStack[] =>
  (state.inventory ?? []).map((stack) => ({ ...stack }));

const normalizedRecipes = (state: EquipmentState): string[] => [...(state.discoveredRecipes ?? [])];

const result = (state: EquipmentState, ok: boolean, message: string): EquipmentTransactionResult => ({
  ok,
  state: {
    ...state,
    inventory: normalizedInventory(state),
    discoveredRecipes: normalizedRecipes(state),
  },
  message,
});

function addToInventory(inventory: EquipmentStack[], item: EquippedItem, count: number): boolean {
  const rank = Math.max(1, Math.floor(item.rank));
  const existing = inventory.find((stack) => inventoryStackKey(stack.id, stack.rank) === inventoryStackKey(item.id, rank));
  if (existing) {
    existing.count += count;
    return true;
  }
  if (inventory.length >= EQUIPMENT_INVENTORY_CAPACITY) return false;
  inventory.push({ ...item, rank, count });
  return true;
}

export function canStoreInventoryItem(
  state: EquipmentState,
  item: Pick<EquippedItem, 'id' | 'rank'>,
): boolean {
  const inventory = state.inventory ?? [];
  return inventory.length < EQUIPMENT_INVENTORY_CAPACITY
    || inventory.some((stack) => inventoryStackKey(stack.id, stack.rank) === inventoryStackKey(item.id, item.rank));
}

export function addInventoryItem(
  state: EquipmentState,
  item: EquippedItem,
  count = 1,
): EquipmentTransactionResult {
  const amount = Math.floor(count);
  const next: EquipmentState = { ...state, inventory: normalizedInventory(state), discoveredRecipes: normalizedRecipes(state) };
  if (amount <= 0) return result(next, false, 'Inventory count must be positive.');
  if (!addToInventory(next.inventory!, { ...item }, amount)) return result(next, false, 'Inventory is full.');
  return result(next, true, 'Item added to inventory.');
}

export function equipInventoryStack(state: EquipmentState, stackKey: string): EquipmentTransactionResult {
  const inventory = normalizedInventory(state);
  const index = inventory.findIndex((stack) => inventoryStackKey(stack.id, stack.rank) === stackKey);
  if (index < 0) return result(state, false, 'Inventory item not found.');
  const selected = { ...inventory[index]! };
  const slot: 'weapon' | 'armor' | 'accessory' = selected.kind;
  const displaced = state[slot] as EquippedItem | null | undefined;
  inventory[index]!.count -= 1;
  if (inventory[index]!.count <= 0) inventory.splice(index, 1);
  if (displaced && !addToInventory(inventory, { ...displaced }, 1)) {
    return result(state, false, 'Inventory is full for the equipped item.');
  }
  const next: EquipmentState = {
    ...state,
    [slot]: { ...selected },
    inventory,
    discoveredRecipes: normalizedRecipes(state),
  };
  return result(next, true, 'Item equipped.');
}

export function sellInventoryStack(
  state: EquipmentState,
  stackKey: string,
  basePrice: number,
): EquipmentTransactionResult {
  const inventory = normalizedInventory(state);
  const index = inventory.findIndex((stack) => inventoryStackKey(stack.id, stack.rank) === stackKey);
  if (index < 0) return result(state, false, 'Inventory item not found.');
  inventory[index]!.count -= 1;
  if (inventory[index]!.count <= 0) inventory.splice(index, 1);
  const next: EquipmentState = {
    ...state,
    coins: state.coins + Math.floor(basePrice * 0.35),
    inventory,
    discoveredRecipes: normalizedRecipes(state),
  };
  return result(next, true, 'Item sold.');
}
