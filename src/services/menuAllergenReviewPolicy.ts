export type MenuAllergenReviewMethod = 'RECIPE' | 'MANUAL';
export type MenuAllergenReviewSourceType = 'SUPPLIER_LABEL' | 'RESTAURANT_RECIPE' | 'STAFF_ATTESTATION';

export interface MenuAllergenReviewDraft {
  method: MenuAllergenReviewMethod;
  containsAllergens: readonly string[];
  mayContainAllergens: readonly string[];
  sourceType: MenuAllergenReviewSourceType;
  sourceNote: string;
}

export type MenuAllergenReviewValidation =
  | { valid: true }
  | { valid: false; reason: 'RECIPE_INCOMPLETE' | 'EVIDENCE_REQUIRED' | 'LISTS_OVERLAP' | 'SOURCE_MISMATCH' | 'RECIPE_ALLERGENS_MISSING' };

const MENU_REVIEW_ALLERGEN_ORDER = [
  'GLUTEN', 'DAIRY', 'PEANUT', 'TREE_NUTS', 'SESAME', 'SHELLFISH', 'SOY', 'EGGS', 'FISH'
] as const;

export function normalizeMenuReviewAllergens(values: readonly string[] | undefined): string[] {
  const normalized = new Set<string>();
  for (const value of values ?? []) {
    const code = value.trim().toUpperCase();
    if (code === 'NUTS') {
      normalized.add('PEANUT');
      normalized.add('TREE_NUTS');
    } else if (MENU_REVIEW_ALLERGEN_ORDER.includes(code as typeof MENU_REVIEW_ALLERGEN_ORDER[number])) {
      normalized.add(code);
    }
  }
  return MENU_REVIEW_ALLERGEN_ORDER.filter((code) => normalized.has(code));
}

export function getInitialMenuReviewContains(
  status: 'UNKNOWN' | 'REVIEWED' | undefined,
  reviewedAllergens: readonly string[] | undefined,
  candidateAllergens: readonly string[] | undefined
): string[] {
  const initialValues = status === 'REVIEWED' ? reviewedAllergens ?? [] : candidateAllergens ?? [];
  return normalizeMenuReviewAllergens(initialValues);
}

export function validateMenuAllergenReviewDraft(
  draft: MenuAllergenReviewDraft,
  recipeComplete: boolean,
  recipeAllergens: readonly string[] = []
): MenuAllergenReviewValidation {
  if (draft.method === 'RECIPE' && !recipeComplete) {
    return { valid: false, reason: 'RECIPE_INCOMPLETE' };
  }
  if (draft.method === 'RECIPE' && draft.sourceType !== 'RESTAURANT_RECIPE') {
    return { valid: false, reason: 'SOURCE_MISMATCH' };
  }
  if (
    draft.sourceNote.trim().length === 0
    || draft.sourceNote.trim().length > 500
  ) {
    return { valid: false, reason: 'EVIDENCE_REQUIRED' };
  }
  if (draft.containsAllergens.some((code) => draft.mayContainAllergens.includes(code))) {
    return { valid: false, reason: 'LISTS_OVERLAP' };
  }
  if (draft.method === 'RECIPE') {
    const declared = new Set(normalizeMenuReviewAllergens(draft.containsAllergens));
    const required = normalizeMenuReviewAllergens(recipeAllergens);
    if (required.some((code) => !declared.has(code))) {
      return { valid: false, reason: 'RECIPE_ALLERGENS_MISSING' };
    }
  }
  return { valid: true };
}
