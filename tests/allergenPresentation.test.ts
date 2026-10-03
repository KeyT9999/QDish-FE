import assert from 'node:assert/strict';
import {
  formatOrderAllergenWarning,
  getMenuAllergenWarning,
  hasReviewedAllergenDeclaration
} from '../src/services/allergenPresentation.ts';

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: [' nuts ', 'DAIRY'],
  reviewedAllergens: [' nuts ', 'DAIRY'],
  mayContainAllergens: []
}, ['NUTS']), {
  kind: 'CONFLICT',
  codes: ['PEANUT', 'TREE_NUTS'],
  source: 'CONTAINS',
  informationIncomplete: false,
  message: 'Món này có chứa đậu phộng, hạt cây bạn đã khai báo dị ứng.'
});

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: [],
  reviewedAllergens: [],
  mayContainAllergens: []
}, ['NUTS']), { kind: 'NONE' });

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['TREE_NUTS']
}, ['NUTS']), {
  kind: 'CONFLICT',
  codes: ['TREE_NUTS'],
  source: 'CANDIDATE',
  informationIncomplete: true,
  message: 'Món này có thể chứa hạt cây bạn đã khai báo dị ứng. Thông tin dị ứng của món chưa được xác minh.'
});

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['PEANUT', 'LEGACY_UNKNOWN_CODE']
}, ['PEANUT', 'LEGACY_UNKNOWN_CODE']), {
  kind: 'CONFLICT',
  codes: ['PEANUT'],
  source: 'CANDIDATE',
  informationIncomplete: true,
  message: 'Món này có thể chứa đậu phộng bạn đã khai báo dị ứng. Thông tin dị ứng của món chưa được xác minh.'
});

const reviewedMayContain = getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: ['PEANUT'],
  reviewedAllergens: [],
  mayContainAllergens: ['PEANUT']
}, ['NUTS']);
assert.equal(reviewedMayContain.kind, 'CONFLICT');
assert.equal(reviewedMayContain.source, 'MAY_CONTAIN');
assert.equal(reviewedMayContain.informationIncomplete, false);
assert.deepEqual(reviewedMayContain.codes, ['PEANUT']);

assert.equal(getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: ['PEANUT'],
  reviewedAllergens: [],
  mayContainAllergens: []
}, ['NUTS']).kind, 'NONE');

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: ['PEANUT'],
  mayContainAllergens: []
}, ['PEANUT']), {
  kind: 'CONFLICT',
  codes: ['PEANUT'],
  source: 'CANDIDATE',
  informationIncomplete: true,
  message: 'Món này có thể chứa đậu phộng bạn đã khai báo dị ứng. Thông tin dị ứng của món chưa được xác minh.'
});
assert.equal(hasReviewedAllergenDeclaration({
  allergenInfoStatus: 'REVIEWED',
  reviewedAllergens: ['PEANUT'],
  mayContainAllergens: ['PEANUT']
}), false);

assert.equal(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['FISH']
}, ['NUTS']).kind, 'UNKNOWN');

assert.deepEqual(getMenuAllergenWarning({
  allergens: []
}, []), {
  kind: 'UNKNOWN',
  informationIncomplete: true,
  message: 'Chưa xác minh đầy đủ thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.'
});

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergenWarnings: ['NUTS'],
  allergenContainsWarnings: ['PEANUT', 'TREE_NUTS'],
  allergenMayContainWarnings: [],
  allergenWarningSource: 'CONTAINS',
  reportedAllergies: ['NUTS']
}), 'Khách khai báo dị ứng: Đậu phộng, hạt cây. Món có chứa Đậu phộng, hạt cây.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergenWarnings: ['SESAME'],
  allergenContainsWarnings: [],
  allergenMayContainWarnings: ['SESAME'],
  allergenWarningSource: 'MAY_CONTAIN',
  reportedAllergies: ['SESAME']
}), 'Khách khai báo dị ứng: Mè. Món có thể chứa do lây nhiễm chéo Mè.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergenWarnings: [],
  reportedAllergies: ['NUTS']
}), 'Khách khai báo dị ứng: Đậu phộng, hạt cây. Thông tin món chưa xác minh; cần nhân viên đối chiếu.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergenWarnings: ['TREE_NUTS'],
  reportedAllergies: ['TREE_NUTS']
}), 'Khách khai báo dị ứng: Hạt cây. Ứng viên của món: Hạt cây. Thông tin món chưa xác minh; cần nhân viên đối chiếu.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergenWarnings: []
}), 'Cần xác nhận thông tin dị ứng món.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergenWarnings: []
}), null);
assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergenWarnings: [],
  allergenContainsWarnings: [],
  allergenMayContainWarnings: [],
  reportedAllergies: ['TREE_NUTS']
}), 'Khách khai báo dị ứng: Hạt cây. Món đã xác minh, không có xung đột với allergen khách khai báo.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergenWarnings: [],
  allergyDisclosureStatus: 'NOT_ANSWERED'
}), 'Khách chưa trả lời khảo sát dị ứng; thông tin allergen của món chưa xác minh.');

console.log('allergen presentation tests passed');
