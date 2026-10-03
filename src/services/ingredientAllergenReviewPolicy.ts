export type IngredientAllergenInfoStatus = 'UNKNOWN' | 'REVIEWED';

export function getIngredientAllergenSummary(status: IngredientAllergenInfoStatus | undefined, allergens: readonly string[]) {
  if (status === 'REVIEWED') {
    return allergens.length > 0
      ? { kind: 'REVIEWED_WITH_CODES' as const }
      : { kind: 'REVIEWED_EMPTY' as const };
  }
  return allergens.length > 0
    ? { kind: 'UNKNOWN_WITH_CANDIDATES' as const }
    : { kind: 'UNKNOWN_EMPTY' as const };
}

export function validateIngredientAllergenConfirmation(input: {
  confirmed: boolean;
  sourceNote: string;
}): boolean {
  return !input.confirmed || (input.sourceNote.trim().length > 0 && input.sourceNote.trim().length <= 500);
}
