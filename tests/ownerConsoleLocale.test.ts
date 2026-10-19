import assert from 'node:assert/strict';

import { ownerConsoleMessages, translateOwnerConsoleMessage } from '../src/i18n/ownerConsoleCatalog.ts';
import { ownerConsoleMessagesAdditional } from '../src/i18n/ownerConsoleCatalogAdditional.ts';

assert.deepEqual(Object.keys(ownerConsoleMessagesAdditional).sort(), Object.keys(ownerConsoleMessages).sort(),
  'each owner-console source message has all three additional locale translations');
for (const translations of Object.values(ownerConsoleMessagesAdditional)) {
  assert.equal(Boolean(translations.ru && translations.ko && translations['hi-IN']), true,
    'every additional locale has a non-empty catalog value');
}

assert.equal(
  translateOwnerConsoleMessage('vi', 'Ngôn ngữ giao diện'),
  'Ngôn ngữ giao diện',
  'Vietnamese remains the source text'
);
assert.equal(
  translateOwnerConsoleMessage('en', 'Ngôn ngữ giao diện'),
  'Interface language',
  'English catalog values are selected for the English locale'
);
assert.equal(
  translateOwnerConsoleMessage('zh-CN', 'Ngôn ngữ giao diện'),
  '界面语言',
  'Simplified Chinese catalog values are selected for the Chinese locale'
);
assert.equal(translateOwnerConsoleMessage('ru', 'Ngôn ngữ giao diện'), 'Язык интерфейса');
assert.equal(translateOwnerConsoleMessage('ko', 'Ngôn ngữ giao diện'), '인터페이스 언어');
assert.equal(translateOwnerConsoleMessage('hi-IN', 'Ngôn ngữ giao diện'), 'इंटरफ़ेस भाषा');
assert.equal(translateOwnerConsoleMessage('ko', 'Đã duyệt'), '승인됨', 'Korean approval state is translated accurately');
assert.equal(translateOwnerConsoleMessage('ru', 'Bắt đầu dịch {count} món', { count: 58 }), 'Начать перевод: 58 блюд');
assert.equal(translateOwnerConsoleMessage('ko', 'Duyệt & hiển thị {count} món', { count: 4 }), '메뉴 4개 승인 및 공개');
assert.equal(translateOwnerConsoleMessage('hi-IN', 'Đã duyệt và hiển thị {count} món cho khách.', { count: 3 }), '3 व्यंजन स्वीकृत करके ग्राहकों के लिए प्रकाशित किए गए।');
assert.equal(translateOwnerConsoleMessage('ru', 'Dịch sang tất cả ngôn ngữ'), 'Перевести на все поддерживаемые языки');
assert.equal(translateOwnerConsoleMessage('ko', 'Thực đơn'), '메뉴');
assert.equal(translateOwnerConsoleMessage('ko', 'Thiết lập'), '설정');
const russianCountMessage = translateOwnerConsoleMessage('ru', '{count} đơn', { count: 2 });
assert.match(russianCountMessage, /2/, 'Russian interpolation includes the supplied count');
assert.equal(russianCountMessage.includes('{count}'), false, 'Russian interpolation tokens are substituted');
assert.equal(
  translateOwnerConsoleMessage('vi', '{count} đơn'),
  '{count} đơn',
  'Vietnamese source keys stay Vietnamese for interpolated counts'
);
assert.equal(
  translateOwnerConsoleMessage('en', '{count} đơn'),
  '{count} orders',
  'interpolated counts use the English catalog value'
);
assert.equal(
  translateOwnerConsoleMessage('vi', 'Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.'),
  'Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.',
  'existing Vietnamese empty-state copy is preserved'
);
assert.equal(
  translateOwnerConsoleMessage('en', 'Chúc {restaurant} ngày mới kinh doanh phát đạt.', {
    restaurant: 'KURUMI'
  }),
  'Wishing KURUMI a great business day.',
  'interpolation preserves restaurant-provided names'
);
assert.equal(
  translateOwnerConsoleMessage('zh-CN', 'English'),
  'English',
  'language choices keep their native names in every locale'
);

console.log('owner console locale catalog tests passed');
