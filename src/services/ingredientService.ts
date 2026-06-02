import { apiFetch } from './api';

// ─── Types ──────────────────────────────────────────────────────────────────

export type IngredientUnit = 'g' | 'ml' | 'piece' | 'tbsp' | 'tsp' | 'cup' | 'bowl';

export interface Ingredient {
  _id: string;
  name: string;
  slug: string;
  category: string;
  defaultUnit: IngredientUnit;
  gramsPerUnit: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  sugarPer100g: number;
  sodiumPer100g: number;
  allergens: string[];
  isVerified: boolean;
  source: string;
}

export interface DishIngredientInput {
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
  gramsResolved: number;
}

export interface NutritionPreviewResult {
  perServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  totalDish: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  servingCount: number;
  attributes: string[];
  allergens: string[];
  confidence: number;
}

// Unit gram conversion table (mirrors backend logic)
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  ml: 1,
  tbsp: 15,
  tsp: 5,
  cup: 240,
  bowl: 300,
  piece: 1, // fallback — will use ingredient.gramsPerUnit
};

export function resolveGrams(quantity: number, unit: IngredientUnit, ingredient: Ingredient): number {
  if (unit === 'piece') {
    return quantity * (ingredient.gramsPerUnit || 100);
  }
  const factor = UNIT_TO_GRAMS[unit] ?? 1;
  return quantity * factor;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const ingredientService = {
  /**
   * Search verified ingredients (and custom ones for the restaurant).
   * Requires NO auth – public endpoint.
   */
  search: async (query: string, restaurantId?: string): Promise<Ingredient[]> => {
    if (!query.trim()) return [];
    const params = new URLSearchParams({ q: query });
    if (restaurantId) params.set('restaurantId', restaurantId);
    return apiFetch<Ingredient[]>(`/api/ingredients/search?${params.toString()}`, {
      requireAuth: false,
    });
  },

  /**
   * Create a custom ingredient for the restaurant.
   * Requires auth.
   */
  createCustom: async (data: Omit<Ingredient, '_id' | 'slug' | 'isVerified' | 'source'>): Promise<Ingredient> => {
    return apiFetch<Ingredient>('/api/ingredients/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Preview nutrition calculation for a recipe (no DB write).
   * Requires auth.
   */
  previewNutrition: async (
    ingredients: DishIngredientInput[],
    servingCount: number
  ): Promise<NutritionPreviewResult> => {
    return apiFetch<NutritionPreviewResult>('/api/nutrition/preview', {
      method: 'POST',
      body: JSON.stringify({ ingredients, servingCount }),
    });
  },
};
