export type SupportedIngredientUnit = 'g' | 'ml' | 'piece' | 'tbsp' | 'tsp' | 'cup' | 'bowl';

export const resolveIngredientGrams = (
  quantity: number,
  unit: SupportedIngredientUnit,
  gramsPerUnit?: number | null
): number => {
  if (unit === 'piece') {
    return quantity * (typeof gramsPerUnit === 'number' && Number.isFinite(gramsPerUnit) && gramsPerUnit > 0 ? gramsPerUnit : 50);
  }

  const factors: Record<Exclude<SupportedIngredientUnit, 'piece'>, number> = {
    g: 1,
    ml: 1,
    tbsp: 15,
    tsp: 5,
    cup: 200,
    bowl: 350,
  };

  return quantity * (factors[unit] ?? 1);
};
