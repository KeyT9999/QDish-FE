import assert from 'node:assert/strict';
import {
  getApprovedCategoryTranslations,
  getApprovedMenuItemTranslations,
  getMenuMessage,
  MENU_MESSAGES,
  MENU_LOCALE_OPTIONS,
  persistMenuLocale,
  readMenuLocale,
  translateCategory,
  translateMenuItem,
} from '../src/lib/menuLocale.ts';
import { getIntlLocale } from '../src/lib/localeFormatting.ts';

const item = { id: 'dish-1', name: 'Phở bò', description: 'Nước dùng bò.', category: 'Món nước' };
assert.deepEqual(MENU_LOCALE_OPTIONS.map(({ locale }) => locale), ['vi', 'en', 'zh-CN', 'ru', 'ko', 'hi-IN']);
assert.deepEqual(MENU_LOCALE_OPTIONS.map(({ shortCode }) => shortCode), ['VI', 'EN', 'ZH', 'RU', 'KO', 'HI']);
for (const option of MENU_LOCALE_OPTIONS) {
  assert.ok(option.nativeHint.trim(), `${option.locale} has a nativeHint`);
}
assert.deepEqual(['ru', 'ko', 'hi-IN'].map(getIntlLocale), ['ru-RU', 'ko-KR', 'hi-IN']);
for (const locale of ['vi', 'en', 'zh-CN', 'ru', 'ko', 'hi-IN'] as const) {
  assert.ok(getMenuMessage(locale, 'languageSheetTitle').trim(), `${locale} has languageSheetTitle`);
  assert.ok(getMenuMessage(locale, 'languageSheetDescription').trim(), `${locale} has languageSheetDescription`);
}
for (const locale of ['ru', 'ko', 'hi-IN'] as const) {
  for (const key of Object.keys(MENU_MESSAGES.vi) as Array<keyof typeof MENU_MESSAGES.vi>) {
    assert.ok(getMenuMessage(locale, key).trim(), `${locale} has a translation for ${key}`);
  }
}
assert.equal(getMenuMessage('ru', 'checkout'), 'Оформление заказа');
assert.equal(getMenuMessage('ko', 'outOfStock'), '품절');
assert.equal(getMenuMessage('hi-IN', 'placeOrder'), 'ऑर्डर करें');
const publicTranslations = {
  en: { name: 'Beef pho', description: 'Beef broth.' },
  'zh-CN': { name: '牛肉粉', description: '牛肉汤。' },
};

assert.equal(translateMenuItem(item, 'en', publicTranslations).name, 'Beef pho');
assert.equal(translateMenuItem(item, 'zh-CN', publicTranslations).description, '牛肉汤。');
assert.equal(translateMenuItem(item, 'ru', { ru: { name: 'Фо бо', description: 'Говяжий бульон.' } }).name, 'Фо бо');
assert.equal(translateMenuItem(item, 'ko', { ko: { name: '소고기 쌀국수', description: '소고기 육수.' } }).description, '소고기 육수.');
assert.equal(translateMenuItem(item, 'hi-IN', { 'hi-IN': { name: 'बीफ़ फ़ो', description: 'बीफ़ शोरबा।' } }).name, 'बीफ़ फ़ो');
assert.equal(translateMenuItem(item, 'en', {}).name, 'Phở bò', 'missing translations fall back to Vietnamese');
assert.equal(translateCategory('Món nước', 'zh-CN', { 'zh-CN': { name: '汤粉类' } }), '汤粉类');

const managed = {
  en: { approved: { value: { name: 'Beef pho', description: 'Beef broth.' }, status: 'APPROVED' as const }, displayStatus: 'APPROVED' as const },
  'zh-CN': { approved: { value: { name: '牛肉粉', description: '牛肉汤。' }, status: 'STALE' as const }, displayStatus: 'STALE' as const },
};
assert.deepEqual(Object.keys(getApprovedMenuItemTranslations(managed)), ['en']);
assert.deepEqual(Object.keys(getApprovedCategoryTranslations({
  en: { approved: { value: { name: 'Main dishes' }, status: 'APPROVED' }, displayStatus: 'APPROVED' },
  'zh-CN': { draft: { value: { name: '主菜' }, generatedAt: '2026-10-07T00:00:00.000Z' }, displayStatus: 'DRAFT' },
})), ['en']);

const data = new Map<string, string>();
const storage = {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => { data.set(key, value); },
};
assert.equal(readMenuLocale('restaurant-1', storage), 'vi');
persistMenuLocale('restaurant-1', 'hi-IN', storage);
assert.equal(readMenuLocale('restaurant-1', storage), 'hi-IN');
assert.equal(readMenuLocale('restaurant-2', storage), 'vi', 'locale preference is scoped per restaurant');

console.log('menu locale tests passed');
