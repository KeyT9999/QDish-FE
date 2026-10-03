import assert from 'node:assert/strict';
import { getInitialMenuReviewContains, validateMenuAllergenReviewDraft } from '../src/services/menuAllergenReviewPolicy.ts';

const base = {
  method: 'MANUAL' as const,
  containsAllergens: [],
  mayContainAllergens: [],
  sourceType: 'STAFF_ATTESTATION' as const,
  sourceNote: 'Đã đối chiếu nguyên liệu và nhãn nhà cung cấp.'
};

assert.deepEqual(validateMenuAllergenReviewDraft(base, false), { valid: true });
assert.deepEqual(validateMenuAllergenReviewDraft({ ...base, method: 'RECIPE', sourceType: 'RESTAURANT_RECIPE' }, false), {
  valid: false,
  reason: 'RECIPE_INCOMPLETE'
});
assert.deepEqual(validateMenuAllergenReviewDraft({ ...base, method: 'RECIPE', sourceType: 'RESTAURANT_RECIPE' }, true), { valid: true });
assert.deepEqual(validateMenuAllergenReviewDraft({ ...base, sourceNote: '  ' }, true), {
  valid: false,
  reason: 'EVIDENCE_REQUIRED'
});
assert.deepEqual(validateMenuAllergenReviewDraft({ ...base, sourceNote: 'x'.repeat(501) }, true), {
  valid: false,
  reason: 'EVIDENCE_REQUIRED'
});
assert.deepEqual(validateMenuAllergenReviewDraft({
  ...base,
  containsAllergens: ['PEANUT'],
  mayContainAllergens: ['PEANUT']
}, true), {
  valid: false,
  reason: 'LISTS_OVERLAP'
});
assert.deepEqual(validateMenuAllergenReviewDraft({ ...base, method: 'RECIPE' }, true), {
  valid: false,
  reason: 'SOURCE_MISMATCH'
});
assert.deepEqual(getInitialMenuReviewContains('UNKNOWN', undefined, ['NUTS', 'SESAME']), [
  'PEANUT', 'TREE_NUTS', 'SESAME'
]);
assert.deepEqual(getInitialMenuReviewContains('REVIEWED', [], ['PEANUT']), [], 'reviewed-empty stays an explicit empty declaration');
assert.deepEqual(getInitialMenuReviewContains('REVIEWED', ['TREE_NUTS'], ['PEANUT']), ['TREE_NUTS']);

console.log('menu allergen review UI tests passed');
