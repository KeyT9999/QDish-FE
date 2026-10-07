import { apiFetch } from './api';
import type { BackendTranslations, CategoryTranslationValue, ManagedTranslations, MenuLocale, PublicTranslations, TranslationReviewEntry } from '@/types/menuTranslation';
import { getApprovedCategoryTranslations, normalizeBackendManagedTranslations, normalizeBackendTranslations } from '@/lib/menuLocale';

export interface CategoryItem {
  _id: string;
  restaurantId: string;
  name: string;
  translations?: PublicTranslations<CategoryTranslationValue>;
  translationManagement?: ManagedTranslations<CategoryTranslationValue>;
  createdAt?: string;
  updatedAt?: string;
}

type BackendCategoryItem = Omit<CategoryItem, 'translations' | 'translationManagement'> & {
  translations?: BackendTranslations<CategoryTranslationValue | TranslationReviewEntry<CategoryTranslationValue>>;
};

const isManagedTranslations = (translations?: BackendCategoryItem['translations']): translations is BackendTranslations<TranslationReviewEntry<CategoryTranslationValue>> => Boolean(
  translations && Object.values(translations).some((entry) => entry && ('displayStatus' in entry || 'approved' in entry || 'draft' in entry)),
);

const normalizeCategory = (category: BackendCategoryItem): CategoryItem => {
  const translationManagement = isManagedTranslations(category.translations)
    ? normalizeBackendManagedTranslations(category.translations)
    : undefined;
  return {
    ...category,
    translations: translationManagement
      ? getApprovedCategoryTranslations(translationManagement)
      : normalizeBackendTranslations(category.translations as BackendTranslations<CategoryTranslationValue> | undefined),
    translationManagement,
  };
};

export const categoryService = {
  getAll: async (restaurantId: string) => {
    const data = await apiFetch<BackendCategoryItem[]>(`/api/categories?restaurantId=${restaurantId}`, { requireAuth: false });
    return data.map(normalizeCategory);
  },

  getManagement: async () => {
    const data = await apiFetch<BackendCategoryItem[]>('/api/categories/manage');
    return data.map(normalizeCategory);
  },

  generateTranslationDraft: async (id: string) => {
    const updated = await apiFetch<BackendCategoryItem>(`/api/categories/${id}/translations/draft`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return normalizeCategory(updated);
  },

  saveTranslation: async (id: string, locale: Exclude<MenuLocale, 'vi'>, value: CategoryTranslationValue, publish: boolean) => {
    const updated = await apiFetch<BackendCategoryItem>(`/api/categories/${id}/translations/${locale}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...value, publish }),
    });
    return normalizeCategory(updated);
  },
  
  create: (name: string) => apiFetch<CategoryItem>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  
  update: (id: string, name: string) => apiFetch<CategoryItem>(`/api/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  }),
  
  delete: (id: string) => apiFetch<void>(`/api/categories/${id}`, {
    method: 'DELETE'
  })
};
