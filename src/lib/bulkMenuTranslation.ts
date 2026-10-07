import type { MenuItem } from '../types/index';
import type { MenuItemTranslationValue, TranslationReviewEntry } from '../types/menuTranslation';

const TRANSLATION_LOCALES = ['en', 'zh-CN'] as const;

export interface BulkMenuTranslationPlan {
  stableItemIds: string[];
  reviewItemIds: string[];
  generationItemIds: string[];
}

const hasApprovedTranslation = (entry?: TranslationReviewEntry<MenuItemTranslationValue>): boolean =>
  Boolean(entry?.approved?.value && entry.approved.status === 'APPROVED');

const hasDraftTranslation = (entry?: TranslationReviewEntry<MenuItemTranslationValue>): boolean =>
  Boolean(entry?.draft);

export function isReadyForBulkTranslationPublish(item: MenuItem): boolean {
  return TRANSLATION_LOCALES.every((locale) => {
    const entry = item.translationManagement?.[locale];
    return hasDraftTranslation(entry) || hasApprovedTranslation(entry);
  });
}

export function planBulkMenuTranslations(items: MenuItem[]): BulkMenuTranslationPlan {
  const plan: BulkMenuTranslationPlan = { stableItemIds: [], reviewItemIds: [], generationItemIds: [] };

  for (const item of items) {
    const id = item.id || item._id;
    if (!id) continue;

    const entries = TRANSLATION_LOCALES.map((locale) => item.translationManagement?.[locale]);
    const isStable = entries.every((entry) => hasApprovedTranslation(entry) && !hasDraftTranslation(entry));
    if (isStable) {
      plan.stableItemIds.push(id);
    } else {
      plan.reviewItemIds.push(id);
      if (entries.some((entry) => !hasDraftTranslation(entry) && !hasApprovedTranslation(entry))) {
        plan.generationItemIds.push(id);
      }
    }
  }

  return plan;
}
