import {
  EquipmentStack,
  EquipmentState,
  EquipmentTransactionResult,
  EquippedItem,
} from './types.js';
import { equipmentDefinition } from '../game/shop-data.js';

export const EQUIPMENT_INVENTORY_CAPACITY = 6;

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function boundedInteger(value: unknown, min: number, max: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

export function sanitizeEquipmentInventory(raw: unknown): EquipmentStack[] {
  if (!Array.isArray(raw)) return [];
  const inventory: EquipmentStack[] = [];
  for (const entry of raw) {
    const stack = record(entry);
    if (typeof stack.id !== 'string') continue;
    const definition = equipmentDefinition(stack.id);
    if (!definition || stack.kind !== definition.kind) continue;
    const rank = boundedInteger(stack.rank, 1, 10_000);
    const count = boundedInteger(stack.count, 1, 99);
    const key = inventoryStackKey(definition.id, rank);
    const existing = inventory.find((candidate) => inventoryStackKey(candidate.id, candidate.rank) === key);
    if (existing) {
      existing.count = Math.min(99, existing.count + count);
      continue;
    }
    if (inventory.length >= EQUIPMENT_INVENTORY_CAPACITY) continue;
    inventory.push({
      id: definition.id,
      kind: definition.kind,
      name: definition.name,
      rank,
      power: definition.power,
      legendary: rank >= 5,
      count,
    });
  }
  return inventory;
}

export function inventoryStackKey(id: string, rank: number): string {
  return `${id}@${Math.max(1, Math.floor(rank))}`;
}

const normalizedInventory = (state: EquipmentState): EquipmentStack[] =>
  (state.inventory ?? []).map((stack) => ({ ...stack }));

const normalizedRecipes = (state: EquipmentState): string[] => [...(state.discoveredRecipes ?? [])];

const failure = (state: EquipmentState, message: string): EquipmentTransactionResult => ({ ok: false, state, message });

const success = (state: EquipmentState, message: string): EquipmentTransactionResult => ({
  ok: true,
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
  if (amount <= 0) return failure(state, 'Inventory count must be positive.');
  if (!addToInventory(next.inventory!, { ...item }, amount)) return failure(state, 'Inventory is full.');
  return success(next, 'Item added to inventory.');
}

export function equipInventoryStack(state: EquipmentState, stackKey: string): EquipmentTransactionResult {
  const inventory = normalizedInventory(state);
  const index = inventory.findIndex((stack) => inventoryStackKey(stack.id, stack.rank) === stackKey);
  if (index < 0) return failure(state, 'Inventory item not found.');
  const selected = { ...inventory[index]! };
  const slot: 'weapon' | 'armor' | 'accessory' = selected.kind;
  const displaced = state[slot] as EquippedItem | null | undefined;
  inventory[index]!.count -= 1;
  if (inventory[index]!.count <= 0) inventory.splice(index, 1);
  if (displaced && !addToInventory(inventory, { ...displaced }, 1)) {
    return failure(state, 'Inventory is full for the equipped item.');
  }
  const next: EquipmentState = {
    ...state,
    [slot]: { ...selected },
    inventory,
    discoveredRecipes: normalizedRecipes(state),
  };
  return success(next, 'Item equipped.');
}

export function sellInventoryStack(
  state: EquipmentState,
  stackKey: string,
  basePrice: number,
): EquipmentTransactionResult {
  const inventory = normalizedInventory(state);
  const index = inventory.findIndex((stack) => inventoryStackKey(stack.id, stack.rank) === stackKey);
  if (index < 0) return failure(state, 'Inventory item not found.');
  inventory[index]!.count -= 1;
  if (inventory[index]!.count <= 0) inventory.splice(index, 1);
  const next: EquipmentState = {
    ...state,
    coins: state.coins + Math.floor(basePrice * 0.35),
    inventory,
    discoveredRecipes: normalizedRecipes(state),
  };
  return success(next, 'Item sold.');
}
