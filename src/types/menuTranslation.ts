export const MENU_LOCALES = ['vi', 'en', 'zh-CN'] as const;

export type MenuLocale = (typeof MENU_LOCALES)[number];
export type BackendMenuLocaleKey = 'en' | 'zhCN' | 'zh-CN';
export type MenuTranslationStatus = 'APPROVED' | 'STALE';

export interface MenuItemTranslationValue {
  name: string;
  description: string;
}

export interface CategoryTranslationValue {
  name: string;
}

export interface TranslationReviewEntry<T> {
  approved?: {
    value: T;
    status: MenuTranslationStatus;
  };
  draft?: {
    value: T;
    generatedAt: string;
  };
  displayStatus: 'DRAFT' | MenuTranslationStatus;
}

export type PublicTranslations<T> = Partial<Record<Exclude<MenuLocale, 'vi'>, T>>;
export type ManagedTranslations<T> = Partial<Record<Exclude<MenuLocale, 'vi'>, TranslationReviewEntry<T>>>;
export type BackendTranslations<T> = Partial<Record<BackendMenuLocaleKey, T>>;
