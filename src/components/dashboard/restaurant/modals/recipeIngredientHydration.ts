export interface IngredientCatalogEntry {
  _id: string;
  name: string;
}

export interface RecipeIngredientRowWithId {
  ingredientId: string;
  ingredientName?: string;
}

export function hydrateRecipeIngredientRows<
  Row extends RecipeIngredientRowWithId,
  Ingredient extends IngredientCatalogEntry
>(
  rows: readonly Row[],
  catalog: readonly Ingredient[]
): Array<Row & { ingredient: Ingredient | null; ingredientName: string }> {
  const ingredientsById = new Map(catalog.map((ingredient) => [ingredient._id, ingredient]));

  return rows.map((row) => {
    const ingredient = ingredientsById.get(row.ingredientId) ?? null;
    return {
      ...row,
      ingredient,
      ingredientName: ingredient?.name ?? row.ingredientName?.trim() ?? '',
    };
  });
}
