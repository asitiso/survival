export type EquipmentKind = 'weapon' | 'armor';
export type OfferKind = EquipmentKind | 'potion';

export interface EquippedItem {
  id: string;
  kind: EquipmentKind;
  name: string;
  rank: number;
  power: number;
  legendary: boolean;
}

export interface EquipmentState {
  coins: number;
  weapon: EquippedItem | null;
  armor: EquippedItem | null;
  healingPotions: number;
}

export interface ShopOffer {
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
