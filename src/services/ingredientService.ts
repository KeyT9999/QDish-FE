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
  restaurantId?: string | null;
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
   * Get paginated and filtered ingredients.
   * Requires auth.
   */
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    type?: 'all' | 'global' | 'custom';
  } = {}): Promise<{ ingredients: Ingredient[]; total: number; pages: number; page: number }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.category) queryParams.set('category', params.category);
    if (params.type) queryParams.set('type', params.type);

    return apiFetch<{ ingredients: Ingredient[]; total: number; pages: number; page: number }>(
      `/api/ingredients?${queryParams.toString()}`,
      { requireAuth: true }
    );
  },

  /**
   * Create an ingredient (global or custom depending on role).
   * Requires auth.
   */
  create: async (data: Omit<Ingredient, '_id' | 'slug' | 'isVerified' | 'source'>): Promise<Ingredient> => {
    return apiFetch<Ingredient>('/api/ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create a custom ingredient for the restaurant (legacy compatibility).
   * Requires auth.
   */
  createCustom: async (data: Omit<Ingredient, '_id' | 'slug' | 'isVerified' | 'source'>): Promise<Ingredient> => {
    return apiFetch<Ingredient>('/api/ingredients/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an ingredient.
   * Requires auth.
   */
  update: async (id: string, data: Partial<Ingredient>): Promise<Ingredient> => {
    return apiFetch<Ingredient>(`/api/ingredients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an ingredient.
   * Requires auth.
   */
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/ingredients/${id}`, {
      method: 'DELETE',
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
