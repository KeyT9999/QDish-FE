import assert from 'node:assert/strict';

import { hasAllergenConflict } from '../src/services/allergenSafety.ts';

assert.equal(hasAllergenConflict(['dairy'], ['DAIRY']), true);
assert.equal(hasAllergenConflict(['GLUTEN'], [' gluten ']), true);
assert.equal(hasAllergenConflict(['soy'], ['dairy', 'gluten']), false);
assert.equal(hasAllergenConflict(['dairy', 'DAIRY'], ['dairy']), true);

console.log('QAI-001 frontend allergen normalization tests passed');
