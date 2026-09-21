import assert from 'node:assert/strict';

import { resolveIngredientGrams } from '../src/services/ingredientUnitPolicy.ts';

const cases = [
  ['g', 100, undefined, 100],
  ['ml', 100, undefined, 100],
  ['tbsp', 1, undefined, 15],
  ['tsp', 1, undefined, 5],
  ['cup', 1, undefined, 200],
  ['bowl', 1, undefined, 350],
  ['piece', 2, 120, 240],
  ['piece', 1, 1, 1],
  ['piece', 2, undefined, 100],
] as const;

for (const [unit, quantity, gramsPerUnit, expected] of cases) {
  assert.equal(resolveIngredientGrams(quantity, unit, gramsPerUnit), expected, `${quantity} ${unit}`);
}

console.log('QAI-007 frontend unit parity tests passed');
