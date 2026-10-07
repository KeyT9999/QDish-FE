import assert from 'node:assert/strict';
import {
  getApprovedCategoryTranslations,
  getApprovedMenuItemTranslations,
  persistMenuLocale,
  readMenuLocale,
  translateCategory,
  translateMenuItem,
} from '../src/lib/menuLocale.ts';

const item = { id: 'dish-1', name: 'Phở bò', description: 'Nước dùng bò.', category: 'Món nước' };
const publicTranslations = {
  en: { name: 'Beef pho', description: 'Beef broth.' },
  'zh-CN': { name: '牛肉粉', description: '牛肉汤。' },
};

assert.equal(translateMenuItem(item, 'en', publicTranslations).name, 'Beef pho');
assert.equal(translateMenuItem(item, 'zh-CN', publicTranslations).description, '牛肉汤。');
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
persistMenuLocale('restaurant-1', 'zh-CN', storage);
assert.equal(readMenuLocale('restaurant-1', storage), 'zh-CN');
assert.equal(readMenuLocale('restaurant-2', storage), 'vi', 'locale preference is scoped per restaurant');

console.log('menu locale tests passed');
