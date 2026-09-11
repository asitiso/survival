import {
  EquipmentStack,
  EquipmentState,
  EquipmentTransactionResult,
  EquippedItem,
} from './types.js';
import { equipmentDefinition } from '../game/shop-data.js';

export const EQUIPMENT_INVENTORY_CAPACITY = 6;
export const MAX_EQUIPMENT_STACK_COUNT = 99;
export const EQUIPMENT_MAX_STACK_COUNT = MAX_EQUIPMENT_STACK_COUNT;

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
    const count = boundedInteger(stack.count, 1, MAX_EQUIPMENT_STACK_COUNT);
    const key = inventoryStackKey(definition.id, rank);
    const existing = inventory.find((candidate) => inventoryStackKey(candidate.id, candidate.rank) === key);
    if (existing) {
      existing.count = Math.min(MAX_EQUIPMENT_STACK_COUNT, existing.count + count);
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
  if (count <= 0 || count > MAX_EQUIPMENT_STACK_COUNT) return false;
  const existing = inventory.find((stack) => inventoryStackKey(stack.id, stack.rank) === inventoryStackKey(item.id, rank));
  if (existing) {
    if (existing.count + count > MAX_EQUIPMENT_STACK_COUNT) return false;
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
  count = 1,
): boolean {
  const amount = Math.floor(count);
  if (amount <= 0) return false;
  const inventory = state.inventory ?? [];
  const existing = inventory.find((stack) => inventoryStackKey(stack.id, stack.rank) === inventoryStackKey(item.id, item.rank));
  return existing ? existing.count + amount <= MAX_EQUIPMENT_STACK_COUNT
    : amount <= MAX_EQUIPMENT_STACK_COUNT && inventory.length < EQUIPMENT_INVENTORY_CAPACITY;
}

export function addInventoryItem(
  state: EquipmentState,
  item: EquippedItem,
  count = 1,
): EquipmentTransactionResult {
  const amount = Math.floor(count);
  const next: EquipmentState = { ...state, inventory: normalizedInventory(state), discoveredRecipes: normalizedRecipes(state) };
  if (amount <= 0) return failure(state, 'Inventory count must be positive.');
  if (!addToInventory(next.inventory!, { ...item }, amount)) {
    const existing = next.inventory!.some((stack) => inventoryStackKey(stack.id, stack.rank) === inventoryStackKey(item.id, item.rank));
    return failure(state, existing ? `같은 장비는 한 스택에 ${MAX_EQUIPMENT_STACK_COUNT}개까지 보관할 수 있습니다.` : '보관함이 가득 찼습니다.');
  }
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
    const sameStack = inventory.some((stack) => inventoryStackKey(stack.id, stack.rank) === inventoryStackKey(displaced.id, displaced.rank));
    return failure(state, sameStack
      ? `같은 장비는 한 스택에 ${MAX_EQUIPMENT_STACK_COUNT}개까지 보관할 수 있습니다.`
      : 'Inventory is full for the equipped item.');
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
    coins: state.coins + Math.floor(basePrice * 35 / 100),
    inventory,
    discoveredRecipes: normalizedRecipes(state),
  };
  return success(next, 'Item sold.');
}
