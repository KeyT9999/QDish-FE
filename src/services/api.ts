import { createApiGetRequestCacheKey } from '@/lib/apiRequestCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'qr_food_order_token';
const inFlightGetRequests = new Map<string, Promise<unknown>>();
const completedGetRequests = new Map<string, { expiresAt: number; value: unknown }>();
const GET_CACHE_TTL_MS = 1000;

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;
  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const selectedRestaurantId = localStorage.getItem('selected_restaurant_id');
  if (selectedRestaurantId) {
    headers.set('x-restaurant-id', selectedRestaurantId);
  }

  const method = rest.method?.toUpperCase() || 'GET';
  const url = `${API_BASE_URL}${endpoint}`;
  const requestKey = method === 'GET'
    ? createApiGetRequestCacheKey(
        url,
        requireAuth ? headers.get('Authorization') || 'no-token' : 'public',
        headers.get('x-restaurant-id'),
      )
    : null;

  if (requestKey && inFlightGetRequests.has(requestKey)) {
    return inFlightGetRequests.get(requestKey) as Promise<T>;
  }

  if (requestKey) {
    const cached = completedGetRequests.get(requestKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    completedGetRequests.delete(requestKey);
  } else {
    completedGetRequests.clear();
  }

  const request = (async () => {
  const response = await fetch(url, {
    headers,
    ...rest,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const headerSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    const bodySeconds = typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined;
    throw new ApiError(
      data?.message || 'Có lỗi xảy ra, vui lòng thử lại',
      response.status,
      typeof data?.code === 'string' ? data.code : undefined,
      bodySeconds ?? (Number.isFinite(headerSeconds) ? headerSeconds : undefined),
    );
  }

  return data as T;
  })();

  if (!requestKey) {
    return request;
  }

  inFlightGetRequests.set(requestKey, request);
  try {
    const result = await request;
    completedGetRequests.set(requestKey, {
      expiresAt: Date.now() + GET_CACHE_TTL_MS,
      value: result,
    });
    return result;
  } finally {
    inFlightGetRequests.delete(requestKey);
  }
}
