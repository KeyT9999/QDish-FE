import assert from 'node:assert/strict';
import { getIngredientAllergenSummary, validateIngredientAllergenConfirmation } from '../src/services/ingredientAllergenReviewPolicy.ts';

assert.deepEqual(getIngredientAllergenSummary('UNKNOWN', []), { kind: 'UNKNOWN_EMPTY' });
assert.deepEqual(getIngredientAllergenSummary('UNKNOWN', ['PEANUT']), { kind: 'UNKNOWN_WITH_CANDIDATES' });
assert.deepEqual(getIngredientAllergenSummary('REVIEWED', []), { kind: 'REVIEWED_EMPTY' });
assert.deepEqual(getIngredientAllergenSummary('REVIEWED', ['TREE_NUTS']), { kind: 'REVIEWED_WITH_CODES' });
assert.equal(validateIngredientAllergenConfirmation({ confirmed: true, sourceNote: '  ' }), false);
assert.equal(validateIngredientAllergenConfirmation({ confirmed: true, sourceNote: 'Đối chiếu nhãn.' }), true);
assert.equal(validateIngredientAllergenConfirmation({ confirmed: true, sourceNote: 'x'.repeat(501) }), false);
assert.equal(validateIngredientAllergenConfirmation({ confirmed: false, sourceNote: '' }), true);

console.log('ingredient allergen review UI tests passed');
