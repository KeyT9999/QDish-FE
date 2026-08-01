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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isRecommendationDish(value: unknown): value is MenuItem {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = (typeof value.id === 'string' && value.id.length > 0)
    || (typeof value._id === 'string' && value._id.length > 0);

  return hasIdentity
    && typeof value.name === 'string'
    && isFiniteNumber(value.price);
}

function isRecommendedDish(value: unknown): value is RecommendedDish {
  if (!isRecord(value)) {
    return false;
  }

  return isRecommendationDish(value.dish)
    && isFiniteNumber(value.fitScore)
    && typeof value.bestContext === 'string'
    && typeof value.bestContextLabel === 'string'
    && typeof value.reason === 'string'
    && isStringArray(value.allergenWarnings);
}

function isScoredDish(value: unknown): value is ScoredDish {
  if (!isRecord(value)) {
    return false;
  }

  return isRecommendationDish(value.dish)
    && isFiniteNumber(value.fitScore)
    && typeof value.bestContext === 'string'
    && typeof value.bestContextLabel === 'string'
    && isStringArray(value.allergenWarnings);
}

function isPairingSuggestion(value: unknown): value is PairingSuggestion {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.mainDishId === 'string'
    && typeof value.mainDishName === 'string'
    && isRecommendationDish(value.pairedDish)
    && typeof value.reason === 'string';
}

function isRecommendationResponse(value: unknown): value is RecommendationResponse {
  if (!isRecord(value)) {
    return false;
  }

  return isRecommendationMode(value.mode)
    && (value.emptyReason === undefined || isRecommendationEmptyReason(value.emptyReason))
    && Array.isArray(value.bestForYou)
    && value.bestForYou.every(isRecommendedDish)
    && Array.isArray(value.fullMenu)
    && value.fullMenu.every(isScoredDish)
    && Array.isArray(value.pairingSuggestions)
    && value.pairingSuggestions.every(isPairingSuggestion);
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
