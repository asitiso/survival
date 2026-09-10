import test from 'node:test';
import assert from 'node:assert/strict';
import {
  equipmentRecipe,
  equipmentRecipes,
  hiddenRecipePresentation,
  recipesForOwnedItems,
} from '../dist/game/equipment-recipes.js';

const item = (id, kind = 'weapon', rank = 1) => ({
  id, kind, name: id, rank, power: 0.1, legendary: rank >= 5,
});
const empty = () => ({
  coins: 0, weapon: null, armor: null, accessory: null,
  healingPotions: 1, inventory: [], discoveredRecipes: [],
});

test('catalog contains six visible and three hidden recipes with approved inputs', () => {
  const recipes = equipmentRecipes();
  assert.equal(recipes.filter((recipe) => !recipe.hidden).length, 6);
  assert.equal(recipes.filter((recipe) => recipe.hidden).length, 3);
  assert.deepEqual(equipmentRecipe('celestial-fusion-staff').ingredientIds,
    ['arcane-accelerator', 'alchemical-blast-staff']);
  assert.deepEqual(recipes.filter((recipe) => !recipe.hidden).map((recipe) => recipe.goldCost),
    [700, 650, 750, 800, 600, 650]);
  assert.deepEqual(recipes.filter((recipe) => recipe.hidden).map((recipe) => recipe.goldCost),
    [2800, 3200, 2500]);
});

test('hidden recipe reveals hint, craft readiness, then permanent details', () => {
  const hiddenRecipe = equipmentRecipe('celestial-fusion-staff');
  const oneIngredient = { ...item('arcane-accelerator', 'weapon', 3), count: 1 };
  const otherIngredient = { ...item('alchemical-blast-staff', 'weapon', 3), count: 1 };

  assert.equal(hiddenRecipePresentation(hiddenRecipe, [], [], []).visibility, 'hidden');
  assert.equal(hiddenRecipePresentation(hiddenRecipe, [oneIngredient], [], []).visibility, 'hint');
  const ready = hiddenRecipePresentation(hiddenRecipe, [oneIngredient, otherIngredient], [], []);
  assert.equal(ready.visibility, 'ready-secret');
  assert.equal(ready.name, '???');
  assert.equal(hiddenRecipePresentation(hiddenRecipe, [], [], [hiddenRecipe.id]).visibility, 'revealed');
});

test('owned recipe list omits unseen secrets but includes eligible hidden cards', () => {
  const hidden = equipmentRecipe('celestial-fusion-staff');
  assert.equal(recipesForOwnedItems(empty(), []).some((recipe) => recipe.id === hidden.id), false);

  const hinted = recipesForOwnedItems({
    ...empty(), inventory: [{ ...item('arcane-accelerator', 'weapon', 3), count: 1 }],
  }, []);
  assert.equal(hinted.find((recipe) => recipe.id === hidden.id).visibility, 'hint');
});
