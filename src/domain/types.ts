export type EquipmentKind = 'weapon' | 'armor' | 'accessory';
export type OfferKind = EquipmentKind | 'potion';

export interface EquippedItem {
  id: string;
  kind: EquipmentKind;
  name: string;
  rank: number;
  power: number;
  legendary: boolean;
}

export interface EquipmentStack extends EquippedItem {
  count: number;
}

export interface EquipmentState {
  coins: number;
  weapon: EquippedItem | null;
  armor: EquippedItem | null;
  /** Missing on older saves; treated as an empty third slot. */
  accessory?: EquippedItem | null;
  healingPotions: number;
  inventory: EquipmentStack[];
  discoveredRecipes: string[];
}

export interface EquipmentTransactionResult {
  ok: boolean;
  state: EquipmentState;
  message: string;
  newlyDiscoveredRecipeId?: string;
}

export interface ShopOffer {
  basePrice?: number;
  id: string;
  kind: OfferKind;
  name: string;
  price: number;
  power: number;
}

export interface PurchaseResult {
  ok: boolean;
  state: EquipmentState;
  message: string;
}
