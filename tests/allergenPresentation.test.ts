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

assert.equal(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['TREE_NUTS']
}, ['NUTS'], 'en').message, 'This dish may contain tree nuts, which you reported as an allergy. Allergen information has not been verified.');
assert.equal(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['TREE_NUTS']
}, ['NUTS'], 'zh-CN').message, '这道菜可能含有您申报过敏的树坚果，过敏原信息尚未核实。');
assert.equal(getMenuAllergenWarning({ allergenInfoStatus: 'UNKNOWN' }, ['NUTS'], 'ru').message, 'Информация об аллергенах в этом блюде проверена не полностью. Если у вас есть аллергия, обратитесь к сотруднику.');
assert.equal(getMenuAllergenWarning({ allergenInfoStatus: 'UNKNOWN' }, ['NUTS'], 'ko').message, '이 메뉴의 알레르기 정보가 완전히 확인되지 않았습니다. 알레르기가 있다면 직원에게 문의하세요.');
assert.equal(getMenuAllergenWarning({ allergenInfoStatus: 'UNKNOWN' }, ['NUTS'], 'hi-IN').message, 'इस व्यंजन में मौजूद एलर्जी कारकों की जानकारी पूरी तरह सत्यापित नहीं है। यदि आपको एलर्जी है, तो कृपया कर्मचारी से पूछें।');
assert.match(getMenuAllergenWarning({ allergenInfoStatus: 'UNKNOWN', allergens: ['PEANUT'] }, ['PEANUT'], 'ru').message, /арахис/);
assert.match(getMenuAllergenWarning({ allergenInfoStatus: 'UNKNOWN', allergens: ['PEANUT'] }, ['PEANUT'], 'ko').message, /땅콩/);
assert.match(getMenuAllergenWarning({ allergenInfoStatus: 'UNKNOWN', allergens: ['PEANUT'] }, ['PEANUT'], 'hi-IN').message, /मूंगफली/);

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

assert.equal(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: []
}, ['NUTS']).kind, 'UNKNOWN');

assert.deepEqual(getMenuAllergenWarning({
  allergens: []
}, []), { kind: 'NONE' });

assert.deepEqual(getMenuAllergenWarning({
  allergenInfoStatus: 'UNKNOWN',
  allergens: ['TREE_NUTS']
}, []), { kind: 'NONE' });

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
