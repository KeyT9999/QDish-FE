import assert from 'node:assert/strict';
import {
  formatOrderAllergenWarning,
  getMenuAllergenWarning
} from '../src/services/allergenPresentation.ts';

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: [' nuts ', 'DAIRY']
}, ['NUTS']), {
  kind: 'CONFLICT',
  codes: ['NUTS'],
  message: 'Món này có chứa các loại hạt bạn đã khai báo dị ứng.'
});

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergens: []
}, ['NUTS']), { kind: 'NONE' });

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['NUTS']
}, ['NUTS']), {
  kind: 'UNKNOWN',
  message: 'Chưa xác nhận thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.'
});

assert.deepEqual(getMenuAllergenWarning({
  allergens: []
}, []), {
  kind: 'UNKNOWN',
  message: 'Chưa xác nhận thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.'
});

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergenWarnings: ['NUTS'],
  reportedAllergies: ['NUTS']
}), 'Khách khai báo dị ứng: Các loại hạt. Món có khai báo chứa: Các loại hạt.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergenWarnings: [],
  reportedAllergies: ['NUTS']
}), 'Khách khai báo dị ứng: Các loại hạt; cần xác nhận thông tin dị ứng món.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergenWarnings: []
}), 'Cần xác nhận thông tin dị ứng món.');

assert.equal(formatOrderAllergenWarning({
  allergenInfoStatus: 'REVIEWED',
  allergenWarnings: []
}), null);

console.log('allergen presentation tests passed');
