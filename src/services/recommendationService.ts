import type { DiningProfile, MenuItem } from '@/types';
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

function isRecommendationResponse(value: unknown): value is RecommendationResponse {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return isRecommendationMode(response.mode)
    && (response.emptyReason === undefined || isRecommendationEmptyReason(response.emptyReason))
    && Array.isArray(response.bestForYou)
    && Array.isArray(response.fullMenu)
    && Array.isArray(response.pairingSuggestions);
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

  if (!isRecommendationResponse(response)) {
    throw new Error('Malformed recommendation response');
  }

  return response;
}

export function getRecommendationHeading(mode: RecommendationMode): string {
  return mode === 'PERSONALIZED' ? 'Gợi ý dành cho bạn' : 'Gợi ý phù hợp lúc này';
}

export function getRecommendationEmptyMessage(emptyReason: RecommendationEmptyReason | undefined): string | undefined {
  return emptyReason === 'NO_ALLERGEN_SAFE_DISHES'
    ? 'Chưa tìm thấy món phù hợp với dị ứng đã chọn'
    : undefined;
}
