import assert from 'node:assert/strict';
import { matchesNutritionFilter } from '../src/services/nutritionAttributeFilters.ts';

function item(overrides: Record<string, unknown> = {}) {
  return {
    nutrition: { calories: 400, protein: 25, carbs: 30, fat: 10, fiber: 6, sugar: 5 },
    nutritionComplete: true,
    foodAttributes: [],
    ...overrides,
  };
}

assert.equal(matchesNutritionFilter(item({ nutrition: { calories: 400, protein: 24.9, carbs: 30, fat: 10, fiber: 6, sugar: 5 } }), 'HIGH_PROTEIN'), false);
assert.equal(matchesNutritionFilter(item(), 'HIGH_PROTEIN'), true);
assert.equal(matchesNutritionFilter(item({ nutrition: { calories: 400, protein: 25, carbs: 30, fat: 10, fiber: 5.9, sugar: 5 } }), 'HIGH_FIBER'), false);
assert.equal(matchesNutritionFilter(item(), 'HIGH_FIBER'), true);
assert.equal(matchesNutritionFilter(item({ nutrition: { calories: 400, protein: 25, carbs: 30, fat: 10, fiber: 6, sugar: 0 } }), 'LOW_SUGAR'), true);
assert.equal(matchesNutritionFilter(item({ nutrition: { calories: 400, protein: 25, carbs: 30, fat: 10, fiber: 6, sugar: 5.1 } }), 'LOW_SUGAR'), false);
assert.equal(matchesNutritionFilter(item(), 'UNDER_400_KCAL'), true);
assert.equal(matchesNutritionFilter(item({ nutrition: { calories: 400.1, protein: 25, carbs: 30, fat: 10, fiber: 6, sugar: 5 } }), 'UNDER_400_KCAL'), false);
assert.equal(matchesNutritionFilter(item({ nutritionComplete: false, nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 } }), 'LOW_SUGAR'), false);

console.log('QAI-018 frontend nutrition filter consistency tests passed');
