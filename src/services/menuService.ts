import { apiFetch } from './api';
import { MenuItem } from '@/types';

type BackendMenuItem = MenuItem & {
  _id?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidenceScore?: number;
  ingredients?: any[];
  servingCount?: number;
  servingSizeGrams?: number;
  cookingMethod?: string;
  foodAttributes?: string[];
};

const normalizeMenuItem = (item: BackendMenuItem): MenuItem => ({
  ...item,
  id: item.id || item._id || '',
  nutrition: item.nutrition || {
    calories: item.calories ?? 0,
    protein: item.protein ?? 0,
    carbs: item.carbs ?? 0,
    fat: item.fat ?? 0,
    fiber: item.fiber ?? 0,
    sugar: item.sugar ?? 0,
    sodium: item.sodium ?? 0,
    confidenceScore: item.confidenceScore ?? 0
  },
  // Pass through recipe fields
  ingredients: item.ingredients || [],
  servingCount: item.servingCount ?? 1,
  servingSizeGrams: item.servingSizeGrams ?? 0,
  cookingMethod: item.cookingMethod ?? 'raw',
  foodAttributes: item.foodAttributes || [],
  allergens: item.allergens || [],
});

const toBackendMenuPayload = (data: Partial<MenuItem>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    ...data,
    // Flatten nutrition for backend (it stores flat fields + NutritionService populates cache)
    calories: data.calories ?? data.nutrition?.calories,
    protein: data.protein ?? data.nutrition?.protein,
    carbs: data.carbs ?? data.nutrition?.carbs,
    fat: data.fat ?? data.nutrition?.fat,
    fiber: data.fiber ?? data.nutrition?.fiber,
    sugar: data.sugar ?? data.nutrition?.sugar,
    sodium: data.sodium ?? data.nutrition?.sodium,
    confidenceScore: data.confidenceScore ?? data.nutrition?.confidenceScore,
    // QDish Step 1 recipe fields
    ingredients: data.ingredients ?? [],
    servingCount: data.servingCount ?? 1,
    cookingMethod: data.cookingMethod ?? 'raw',
  };

  delete payload.id;
  delete payload._id;
  delete payload.nutrition;

  return payload;
};

export const menuService = {
  // Public route for customers
  getPublicMenu: async (restaurantId: string) => {
    const data = await apiFetch<BackendMenuItem[]>(`/api/menu?restaurantId=${restaurantId}`, { requireAuth: false });
    return data.map(normalizeMenuItem);
  },
  
  // Admin routes
  getAll: async (restaurantId: string, includeUnavailable = true) => {
    const params = new URLSearchParams({ restaurantId });
    if (includeUnavailable) params.set('includeUnavailable', 'true');
    const data = await apiFetch<BackendMenuItem[]>(`/api/menu?${params.toString()}`);
    return data.map(normalizeMenuItem);
  },
  
  create: async (data: Partial<MenuItem>) => {
    const created = await apiFetch<BackendMenuItem>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(toBackendMenuPayload(data))
    });
    return normalizeMenuItem(created);
  },
  
  update: async (id: string, data: Partial<MenuItem>) => {
    const updated = await apiFetch<BackendMenuItem>(`/api/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackendMenuPayload(data))
    });
    return normalizeMenuItem(updated);
  },
  
  delete: (id: string) => apiFetch<void>(`/api/menu/${id}`, {
    method: 'DELETE'
  }),
  
  toggleStatus: (id: string, available: boolean) => menuService.update(id, { available })
};
