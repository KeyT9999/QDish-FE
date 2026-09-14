import type { DiningProfile, MenuItem, NutritionInfo } from '@/types';
import type { apiFetch } from './api';

export type RecommendationMode = 'GENERAL' | 'PERSONALIZED';
export type RecommendationEmptyReason = 'NO_AVAILABLE_DISHES' | 'NO_ALLERGEN_SAFE_DISHES';

export interface RecommendationContext {
  timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'late_night';
  postWorkout?: boolean;
  weather?: 'hot' | 'cold' | 'rainy';
  occasion?: 'casual' | 'date' | 'family';
}

export interface RecommendedDish {
  dish: MenuItem;
  fitScore: number;
  bestContext: string;
  bestContextLabel: string;
  reason: string;
  allergenWarnings: string[];
}

export interface ScoredDish {
  dish: MenuItem;
  fitScore: number;
  bestContext: string;
  bestContextLabel: string;
  allergenWarnings: string[];
}

export interface PairingSuggestion {
  mainDishId: string;
  mainDishName: string;
  pairedDish: MenuItem;
  reason: string;
}

export interface RecommendationResponse {
  mode: RecommendationMode;
  emptyReason?: RecommendationEmptyReason;
  bestForYou: RecommendedDish[];
  fullMenu: ScoredDish[];
  pairingSuggestions: PairingSuggestion[];
}

function isRecommendationMode(value: unknown): value is RecommendationMode {
  return value === 'GENERAL' || value === 'PERSONALIZED';
}

function isRecommendationEmptyReason(value: unknown): value is RecommendationEmptyReason {
  return value === 'NO_AVAILABLE_DISHES' || value === 'NO_ALLERGEN_SAFE_DISHES';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function normalizeNutrition(value: unknown): NutritionInfo | undefined {
  if (!isRecord(value)
    || !isFiniteNumber(value.calories)
    || !isFiniteNumber(value.protein)
    || !isFiniteNumber(value.carbs)
    || !isFiniteNumber(value.fat)
    || (value.fiber !== undefined && !isFiniteNumber(value.fiber))
    || (value.sugar !== undefined && !isFiniteNumber(value.sugar))
    || (value.sodium !== undefined && !isFiniteNumber(value.sodium))
    || (value.confidenceScore !== undefined && !isFiniteNumber(value.confidenceScore))) {
    return undefined;
  }

  return {
    calories: value.calories,
    protein: value.protein,
    carbs: value.carbs,
    fat: value.fat,
    ...(isFiniteNumber(value.fiber) ? { fiber: value.fiber } : {}),
    ...(isFiniteNumber(value.sugar) ? { sugar: value.sugar } : {}),
    ...(isFiniteNumber(value.sodium) ? { sodium: value.sodium } : {}),
    ...(isFiniteNumber(value.confidenceScore) ? { confidenceScore: value.confidenceScore } : {}),
  };
}

function normalizeRecommendationDish(value: unknown): MenuItem | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const hasIdentity = (typeof value.id === 'string' && value.id.length > 0)
    || (typeof value._id === 'string' && value._id.length > 0);

  if (!hasIdentity || typeof value.name !== 'string' || !isFiniteNumber(value.price)) {
    return undefined;
  }

  if ((value.description !== undefined && typeof value.description !== 'string')
    || (value.imageUrl !== undefined && typeof value.imageUrl !== 'string')
    || (value.available !== undefined && typeof value.available !== 'boolean')
    || (value.allergens !== undefined && !isStringArray(value.allergens))
    || (value.foodAttributes !== undefined && !isStringArray(value.foodAttributes))) {
    return undefined;
  }

  const nutrition = value.nutrition === undefined ? undefined : normalizeNutrition(value.nutrition);
  if (value.nutrition !== undefined && nutrition === undefined) {
    return undefined;
  }

  return {
    ...value,
    id: typeof value.id === 'string' ? value.id : '',
    _id: typeof value._id === 'string' ? value._id : undefined,
    restaurantId: typeof value.restaurantId === 'string' ? value.restaurantId : '',
    name: value.name,
    description: typeof value.description === 'string' ? value.description : '',
    price: value.price,
    category: typeof value.category === 'string' ? value.category : '',
    imageUrl: typeof value.imageUrl === 'string' ? value.imageUrl : '',
    available: typeof value.available === 'boolean' ? value.available : true,
    allergens: isStringArray(value.allergens) ? [...value.allergens] : [],
    foodAttributes: isStringArray(value.foodAttributes) ? [...value.foodAttributes] : [],
    nutrition,
  } as MenuItem;
}

function normalizeRecommendedDish(value: unknown): RecommendedDish | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const dish = normalizeRecommendationDish(value.dish);
  if (!dish
    || !isFiniteNumber(value.fitScore)
    || typeof value.bestContext !== 'string'
    || typeof value.bestContextLabel !== 'string'
    || typeof value.reason !== 'string'
    || !isStringArray(value.allergenWarnings)) {
    return undefined;
  }

  return {
    dish,
    fitScore: value.fitScore,
    bestContext: value.bestContext,
    bestContextLabel: value.bestContextLabel,
    reason: value.reason,
    allergenWarnings: [...value.allergenWarnings],
  };
}

function normalizeScoredDish(value: unknown): ScoredDish | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const dish = normalizeRecommendationDish(value.dish);
  if (!dish
    || !isFiniteNumber(value.fitScore)
    || typeof value.bestContext !== 'string'
    || typeof value.bestContextLabel !== 'string'
    || !isStringArray(value.allergenWarnings)) {
    return undefined;
  }

  return {
    dish,
    fitScore: value.fitScore,
    bestContext: value.bestContext,
    bestContextLabel: value.bestContextLabel,
    allergenWarnings: [...value.allergenWarnings],
  };
}

function normalizePairingSuggestion(value: unknown): PairingSuggestion | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const pairedDish = normalizeRecommendationDish(value.pairedDish);
  if (typeof value.mainDishId !== 'string'
    || typeof value.mainDishName !== 'string'
    || !pairedDish
    || typeof value.reason !== 'string') {
    return undefined;
  }

  return {
    mainDishId: value.mainDishId,
    mainDishName: value.mainDishName,
    pairedDish,
    reason: value.reason,
  };
}

function normalizeArray<T>(value: unknown, normalize: (entry: unknown) => T | undefined): T[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const normalized: T[] = [];
  for (const entry of value) {
    const result = normalize(entry);
    if (result === undefined) return undefined;
    normalized.push(result);
  }
  return normalized;
}

function normalizeRecommendationResponse(value: unknown): RecommendationResponse | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const bestForYou = normalizeArray(value.bestForYou, normalizeRecommendedDish);
  const fullMenu = normalizeArray(value.fullMenu, normalizeScoredDish);
  const pairingSuggestions = normalizeArray(value.pairingSuggestions, normalizePairingSuggestion);
  if (!isRecommendationMode(value.mode)
    || (value.emptyReason !== undefined && !isRecommendationEmptyReason(value.emptyReason))
    || !bestForYou
    || !fullMenu
    || !pairingSuggestions) {
    return undefined;
  }

  return {
    mode: value.mode,
    ...(value.emptyReason ? { emptyReason: value.emptyReason } : {}),
    bestForYou,
    fullMenu,
    pairingSuggestions,
  };
}

export async function loadRecommendations(input: {
  restaurantId: string;
  profile: DiningProfile;
  context: RecommendationContext;
  fetcher: typeof apiFetch;
}): Promise<RecommendationResponse> {
  const response = await input.fetcher<unknown>('/api/recommendations', {
    method: 'POST',
    requireAuth: false,
    body: JSON.stringify({
      restaurantId: input.restaurantId,
      userProfile: {
        goals: input.profile.goals,
        preferences: input.profile.preferences,
        allergies: input.profile.allergies,
      },
      context: input.context,
    }),
  });

  const normalized = normalizeRecommendationResponse(response);
  if (!normalized) {
    throw new Error('Malformed recommendation response');
  }

  return normalized;
}

export function getRecommendationHeading(mode: RecommendationMode): string {
  return mode === 'PERSONALIZED' ? 'Gợi ý dành cho bạn' : 'Gợi ý phù hợp lúc này';
}

export function getRecommendationEmptyMessage(emptyReason: RecommendationEmptyReason | undefined): string | undefined {
  return emptyReason === 'NO_ALLERGEN_SAFE_DISHES'
    ? 'Chưa tìm thấy món phù hợp với dị ứng đã chọn'
    : undefined;
}
