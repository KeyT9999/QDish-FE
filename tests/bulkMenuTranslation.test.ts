import assert from 'node:assert/strict';
import type { MenuItem } from '../src/types/index.ts';
import type { TranslationReviewEntry, MenuItemTranslationValue } from '../src/types/menuTranslation.ts';
import { isReadyForBulkTranslationPublish, planBulkMenuTranslations } from '../src/lib/bulkMenuTranslation.ts';

const approved: TranslationReviewEntry<MenuItemTranslationValue> = {
  approved: { value: { name: 'Translated dish', description: 'Description' }, status: 'APPROVED' },
  displayStatus: 'APPROVED',
};
const stale: TranslationReviewEntry<MenuItemTranslationValue> = {
  approved: { value: { name: 'Old dish', description: 'Old description' }, status: 'STALE' },
  displayStatus: 'STALE',
};
const draft: TranslationReviewEntry<MenuItemTranslationValue> = {
  draft: { value: { name: 'Draft dish', description: 'Draft description' }, generatedAt: '2026-10-07T00:00:00.000Z' },
  displayStatus: 'DRAFT',
};
const allApproved = () => Object.fromEntries(
  ['en', 'zh-CN', 'ru', 'ko', 'hi-IN'].map((locale) => [locale, approved])
) as NonNullable<MenuItem['translationManagement']>;
const item = (id: string, translationManagement?: MenuItem['translationManagement']): MenuItem => ({
  id, restaurantId: 'restaurant-1', name: 'Dish', description: '', price: 10,
  category: 'Main', imageUrl: '', available: true, translationManagement,
});

const stable = item('stable', allApproved());
assert.equal(
  isReadyForBulkTranslationPublish(stable),
  true,
  'all five approved locale values make an item fully translated'
);
assert.deepEqual(planBulkMenuTranslations([stable]), {
  stableItemIds: ['stable'], reviewItemIds: [], generationItemIds: [],
}, 'an item with all five approved translations needs no review or generation');
const missingChinese = item('missing-chinese', { en: approved });
const staleEnglish = item('stale-english', { ...allApproved(), en: stale });
const existingDraft = item('existing-draft', { en: draft });
const mixedReady = item('mixed-ready', { ...allApproved(), 'zh-CN': draft });
const approvedWithDraft = item('approved-with-draft', { ...allApproved(), en: { ...approved, ...draft } });
const bothDrafts = item('both-drafts', { ...allApproved(), en: draft, 'zh-CN': draft });
const staleWithDraft = item('stale-with-draft', { ...allApproved(), en: { ...stale, ...draft } });

assert.deepEqual(planBulkMenuTranslations([
  stable, missingChinese, staleEnglish, existingDraft, mixedReady,
  approvedWithDraft, bothDrafts, staleWithDraft,
]), {
  stableItemIds: ['stable'],
  reviewItemIds: ['missing-chinese', 'stale-english', 'existing-draft', 'mixed-ready', 'approved-with-draft', 'both-drafts', 'stale-with-draft'],
  generationItemIds: ['missing-chinese', 'stale-english', 'existing-draft'],
}, 'all five locales are evaluated; existing drafts need review, while missing or stale locales need generation');

assert.equal(isReadyForBulkTranslationPublish(stable), true, 'all five stable approvals are ready');
assert.equal(isReadyForBulkTranslationPublish(mixedReady), true, 'an approval and a draft are ready');
assert.equal(isReadyForBulkTranslationPublish(bothDrafts), true, 'two drafts are ready');
assert.equal(isReadyForBulkTranslationPublish(staleWithDraft), true, 'a draft replaces a stale approval for readiness');
assert.equal(isReadyForBulkTranslationPublish(missingChinese), false, 'a missing locale blocks publishing');
assert.equal(isReadyForBulkTranslationPublish(staleEnglish), false, 'a stale locale without a draft blocks publishing');
assert.equal(isReadyForBulkTranslationPublish(existingDraft), false, 'one draft cannot cover a missing second locale');
assert.equal(isReadyForBulkTranslationPublish(item('no-management')), false, 'missing management blocks publishing');

assert.deepEqual(planBulkMenuTranslations([
  { ...stable, id: '', _id: 'fallback-id' },
  { ...stable, id: 'primary-id', _id: 'unused-id' },
  item(''),
]), {
  stableItemIds: ['fallback-id', 'primary-id'], reviewItemIds: [], generationItemIds: [],
}, 'use the primary ID, fall back to _id, and ignore records without either ID');
assert.deepEqual(planBulkMenuTranslations([item('untranslated')]), {
  stableItemIds: [], reviewItemIds: ['untranslated'], generationItemIds: ['untranslated'],
}, 'two missing locales produce one generation request per item');
assert.deepEqual(planBulkMenuTranslations([]), {
  stableItemIds: [], reviewItemIds: [], generationItemIds: [],
});

console.log('bulk menu translation policy tests passed');
