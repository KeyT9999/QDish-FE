export function normalizeAllergen(value: string): string {
  return value.trim().toUpperCase();
}

export function hasAllergenConflict(
  dishAllergens: Array<string | undefined> | undefined,
  userAllergies: Array<string | undefined> | undefined,
): boolean {
  const requested = new Set((userAllergies ?? []).filter(Boolean).map((value) => normalizeAllergen(value!)));
  return (dishAllergens ?? [])
    .filter(Boolean)
    .some((value) => requested.has(normalizeAllergen(value!)));
}
