import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as shop from '../dist/ui/shop.js';
import { equipmentDefinition } from '../dist/game/shop-data.js';
import { recipesForOwnedItems } from '../dist/game/equipment-recipes.js';
import { Game } from '../dist/game/game.js';

const source = fs.readFileSync(new URL('../src/ui/shop.ts', import.meta.url), 'utf8');
const game = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const item = (id, rank = 1, count = 1) => ({ ...equipmentDefinition(id), rank, count, legendary: rank >= 5 });
const empty = () => ({ coins: 10000, weapon: null, armor: null, accessory: null, inventory: [], discoveredRecipes: [], healingPotions: 1 });
const model = state => ({ state, elapsedSeconds: 480, heroMaxHp: 333, permanentRecipeDiscoveries: [] });

test('shop exposes purchase and forge tabs with three equipped and six inventory buttons', () => {
  assert.match(source, /role="tablist"/);
  assert.match(source, /대장간/);
  assert.match(source, /shop-equipped-slot/);
  assert.match(source, /Array\.from\(\{ length: 6 \}/);
  assert.doesNotMatch(source, /dragstart|draggable|addEventListener\(['"]drop/);
  assert.doesNotMatch(source, /shop-accessories|accessoryIconPosition/,'Task 7 must not depend on the separate untracked accessory atlas');
  assert.match(source, /offer\.kind !== 'accessory' && iconPresentation\.visible/,'accessories must use the existing fallback even when another dirty change advertises an atlas');
});

test('purchase labels describe storage and domain capacity, ignoring legacy time locks', () => {
  assert.equal(typeof shop.shopPurchaseView, 'function');
  const offer = { ...equipmentDefinition('arcane-staff'), locked: true };
  const state = { ...empty(), weapon: item('arcane-staff'), inventory: [item('arcane-staff', 1, 3)] };
  const view = shop.shopPurchaseView(model(state), offer);
  assert.equal(view.disabled, false);
  assert.equal(view.placement, '보관함 · 현재 3개');
  assert.doesNotMatch(JSON.stringify(view), /이후 강화|→ 고급/);
  assert.match(shop.shopPurchaseView(model(empty()), offer).placement, /빈 슬롯 · 즉시 장착/);
  const full = { ...state, inventory: ['rapid-wand', 'blast-rod', 'golden-wand', 'iron-robe', 'gale-cloak', 'magnet-cloak'].map(id => item(id)) };
  const blocked = shop.shopPurchaseView(model(full), offer);
  assert.equal(blocked.disabled, true);
  assert.match(blocked.reason, /보관함.*가득/);
  assert.equal(blocked.projection.summary, '', 'a disabled card must not repeat its visible failure reason');
  assert.equal(blocked.projection.actionLabel, '보관', 'blocked purchase must not reuse a legacy upgrade label');
});

test('forge selection explains time, material, equip capacity and sale requirements without mutating state', () => {
  assert.equal(typeof shop.shopSelectionView, 'function');
  const state = { ...empty(), weapon: item('arcane-staff'), inventory: [item('arcane-staff')] };
  const original = JSON.stringify(state);
  const early = shop.shopSelectionView({ ...model(state), elapsedSeconds: 30 }, 'equipped:weapon');
  assert.equal(early.strengthen.disabled, true);
  assert.match(early.strengthen.reason, /1:30/);
  assert.match(early.requirements, /강화 재료.*1개.*150/);
  assert.equal(early.sell.disabled, true);
  const ready = shop.shopSelectionView(model(state), 'equipped:weapon');
  assert.equal(ready.strengthen.disabled, false);
  assert.match(ready.strengthen.projection, /생존.*수호핵.*화력/);
  const selected = shop.shopSelectionView(model(state), 'arcane-staff@1');
  assert.equal(selected.equip.disabled, false);
  assert.equal(selected.sell.refund, 77);
  assert.equal(selected.strengthen.disabled, true, 'selected copy cannot consume itself');
  assert.equal(JSON.stringify(state), original);
});

test('hidden recipe cards omit secrets until permanent discovery and visible cards expose effects and projections', () => {
  assert.equal(typeof shop.shopRecipeView, 'function');
  const state = empty();
  const normal = recipesForOwnedItems(state, [])[0];
  const visible = shop.shopRecipeView(model(state), normal);
  assert.match(visible.details, /마력 지팡이.*고급.*속사 완드.*고급.*700/);
  assert.match(visible.projection, /생존.*수호핵.*화력/);
  assert.equal(visible.disabled, true);
  assert.match(visible.reason, /재료/);
  const hidden = { id: 'celestial-fusion-staff', hidden: true, visibility: 'hidden', name: 'secret' };
  assert.equal(shop.shopRecipeView(model(state), hidden), null);
  state.inventory = [item('arcane-accelerator', 3)];
  let recipe = recipesForOwnedItems(state, []).find(r => r.id === hidden.id);
  let view = shop.shopRecipeView(model(state), recipe);
  assert.equal(view.title, '???');
  assert.equal(view.disabled, true);
  assert.doesNotMatch(JSON.stringify(view), /천체 융합봉|0\.90|1\.90|생존.*→/);
  state.inventory.push(item('alchemical-blast-staff', 3));
  recipe = recipesForOwnedItems(state, []).find(r => r.id === hidden.id);
  view = shop.shopRecipeView(model(state), recipe);
  assert.equal(view.title, '???');
  assert.equal(view.disabled, false);
  assert.equal(view.projection, '');
  const discovered = recipesForOwnedItems(state, [hidden.id]).find(r => r.id === hidden.id);
  view = shop.shopRecipeView({ ...model(state), permanentRecipeDiscoveries: [hidden.id] }, discovered);
  assert.equal(view.title, '천체 융합봉');
  assert.match(view.projection, /생존.*수호핵.*화력/);
});

test('Game assigns successful state before discovery and retains shop visit selection with current survival context', () => {
  assert.match(game, /this\.equipmentState = result\.state;\s*if \(result\.newlyDiscoveredRecipeId\)\s*\{?\s*this\.recordEquipmentRecipeDiscovery/);
  assert.match(game, /shopActiveTab: ShopTab/);
  assert.match(game, /shopSelectedStackKey/);
  assert.match(game, /heroMaxHp: this\.hero\.maxHp/);
  for (const action of ['onEquip', 'onStrengthen', 'onCombine', 'onSell']) assert.match(game, new RegExp(action));
  assert.match(game, /equipmentDefinition\(stack\.id\)/);
});

function gameFixture(state) {
  const game = Object.create(Game.prototype);
  Object.assign(game, { equipmentState: state, elapsed: 480, hero: { profileId: 'arkan', maxHp: 333 },
    shopOffers: [equipmentDefinition('arcane-staff')], shopAccessoryChoice: null, shopActiveTab: 'forge', shopSelectedStackKey: null,
    metaProfile: { version: 1, shards: 0, upgrades: { vitality: 0, power: 0, bankroll: 0, magnet: 0 }, discoveredEquipmentRecipes: [] },
    rerollsThisVisit: 0, shopImpactMessage: '', audio: { play() {} }, currentBuildArchetype: () => 'burst',
    syncEquipmentState() {}, savedDiscoveries: [], saveStoredMetaProfile() { this.savedDiscoveries.push([...this.metaProfile.discoveredEquipmentRecipes]); },
    shopOverlay: { isOpen: false, open(model, handlers) { this.isOpen = true; this.model = model; this.handlers = handlers; },
      refresh(model, handlers) { this.model = model; this.handlers = handlers; }, hide() { this.isOpen = false; } },
  });
  game.refreshShopOverlay();
  return game;
}

test('real Game handlers buy into storage, equip, strengthen and sell while preserving selection across refresh', () => {
  const game = gameFixture({ ...empty(), weapon: item('arcane-staff') });
  game.shopOverlay.handlers.onPurchase(equipmentDefinition('arcane-staff'));
  assert.equal(game.equipmentState.weapon.rank, 1);
  assert.equal(game.equipmentState.inventory[0].count, 1);
  assert.equal(game.equipmentState.coins, 9780);
  game.shopOverlay.handlers.onSelectStack('equipped:weapon');
  game.shopOverlay.handlers.onStrengthen({ place: 'equipped', kind: 'weapon' });
  assert.equal(game.equipmentState.weapon.rank, 2);
  assert.equal(game.equipmentState.inventory.length, 0);
  assert.equal(game.shopOverlay.model.selectedStackKey, 'equipped:weapon');
  assert.equal(game.shopOverlay.model.activeTab, 'forge');
  game.shopOverlay.handlers.onPurchase(equipmentDefinition('rapid-wand'));
  game.shopOverlay.handlers.onEquip('rapid-wand@1');
  assert.equal(game.equipmentState.weapon.id, 'rapid-wand');
  assert.equal(game.equipmentState.inventory[0].id, 'arcane-staff');
  const coins = game.equipmentState.coins;
  game.shopOverlay.handlers.onSell('arcane-staff@2');
  assert.equal(game.equipmentState.coins, coins + 77);
  assert.equal(game.equipmentState.inventory.length, 0);
  const before = JSON.stringify(game.equipmentState);
  game.shopOverlay.handlers.onSell('unknown@1');
  assert.equal(JSON.stringify(game.equipmentState), before);
  assert.match(game.shopOverlay.model.impactMessage, /찾을 수 없습니다/);
});

test('real combine handler persists discovery after assigning crafted state and reveals it on refresh', () => {
  const game = gameFixture({ ...empty(), inventory: [item('arcane-accelerator', 3), item('alchemical-blast-staff', 3)] });
  const originalRecorder = game.recordEquipmentRecipeDiscovery;
  game.recordEquipmentRecipeDiscovery = function(id) {
    assert.equal(this.equipmentState.weapon.id, 'celestial-fusion-staff');
    originalRecorder.call(this, id);
  };
  assert.equal(game.shopOverlay.model.recipes.find(r => r.id === 'celestial-fusion-staff').name, '???');
  game.shopOverlay.handlers.onCombine('celestial-fusion-staff');
  assert.deepEqual(game.savedDiscoveries, [['celestial-fusion-staff']]);
  assert.equal(game.equipmentState.coins, 7200);
  assert.equal(game.shopOverlay.model.recipes.find(r => r.id === 'celestial-fusion-staff').name, '천체 융합봉');
  const before = JSON.stringify(game.equipmentState);
  game.shopOverlay.handlers.onCombine('celestial-fusion-staff');
  assert.equal(JSON.stringify(game.equipmentState), before);
  assert.equal(game.savedDiscoveries.length, 1);
});

test('supply grant is free and a full inventory retains the same crate with a visible reason', () => {
  const game = gameFixture({ ...empty(), coins: 0 });
  Object.assign(game, { supplyCrate: { x: 0, y: 0 }, supplyCrateOffer: equipmentDefinition('arcane-staff'), supplyCrateBlocked: false,
    fieldEvents: { active: { id: 'supplyDrop' }, completeActive() { return null; } }, messages: [],
    showTacticalStatusEventToast(message) { this.messages.push(message); } });
  Object.assign(game.hero, { pos: { x: 0, y: 0 }, radius: 10 });
  game.updateSupplyCrate();
  assert.equal(game.equipmentState.coins, 0);
  assert.equal(game.equipmentState.weapon.id, 'arcane-staff');
  assert.equal(game.supplyCrate, null);
  game.equipmentState.inventory = ['rapid-wand', 'blast-rod', 'golden-wand', 'iron-robe', 'gale-cloak', 'magnet-cloak'].map(id => item(id));
  game.supplyCrate = { x: 0, y: 0 };
  const before = JSON.stringify(game.equipmentState);
  game.updateSupplyCrate();
  game.updateSupplyCrate();
  assert.equal(JSON.stringify(game.equipmentState), before);
  assert.notEqual(game.supplyCrate, null);
  assert.equal(game.messages.length, 2, 'one success and one failure; waiting crate does not spam every frame');
  assert.match(game.messages[1], /보급 대기.*보관함.*가득/);
});
