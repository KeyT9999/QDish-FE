import assert from 'node:assert/strict';
import { hydrateRecipeIngredientRows } from '../src/components/dashboard/restaurant/modals/recipeIngredientHydration.ts';

const savedRows = [
  { ingredientId: 'ingredient-1', quantity: 45, unit: 'g', gramsResolved: 45 },
  { ingredientId: 'ingredient-2', ingredientName: 'Tên cũ', quantity: 120, unit: 'ml', gramsResolved: 120 },
];
const availableIngredients = [
  { _id: 'ingredient-1', name: 'Yến mạch', category: 'tinh_bot', defaultUnit: 'g' },
];

const hydrated = hydrateRecipeIngredientRows(savedRows, availableIngredients);

assert.equal(hydrated[0].ingredientName, 'Yến mạch', 'resolve the saved ID from the existing ingredient catalog');
assert.equal(hydrated[0].ingredient?._id, 'ingredient-1');
assert.equal(hydrated[1].ingredientName, 'Tên cũ', 'keep a supplied display name if the catalog entry is unavailable');
assert.equal(hydrated[1].ingredient, null);
assert.equal(hydrated[0].quantity, 45, 'hydration must not alter recipe quantities');
assert.equal(hydrated[0].unit, 'g');
assert.equal(hydrated[0].gramsResolved, 45);

console.log('✅ Recipe ingredient hydration tests passed');
