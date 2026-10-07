import assert from 'node:assert/strict';

import { translateOwnerConsoleMessage } from '../src/i18n/ownerConsoleCatalog.ts';

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
