import { apiFetch } from './api';
import { Restaurant, NewRestaurantPayload, OverviewStats, RestaurantRevenueStats, RestaurantStats } from '@/types';

type BackendRestaurant = Restaurant & { _id?: string };

const normalizeRestaurant = (restaurant: BackendRestaurant): Restaurant => ({
  ...restaurant,
  id: restaurant.id || restaurant._id || ''
});

export const restaurantService = {
  getPublicById: async (id: string) => {
    const restaurant = await apiFetch<BackendRestaurant>(`/api/restaurants/public/${id}`, {
      requireAuth: false
    });
    return normalizeRestaurant(restaurant);
  },

  getAll: async (search?: string, status?: string, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    
    const qs = params.toString();
    const restaurants = await apiFetch<BackendRestaurant[]>(`/api/restaurants${qs ? `?${qs}` : ''}`);
    return restaurants.map(normalizeRestaurant);
  },
  
  create: async (data: NewRestaurantPayload) => {
    const restaurant = await apiFetch<BackendRestaurant>('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return normalizeRestaurant(restaurant);
  },
  
  update: async (id: string, data: Partial<Restaurant>) => {
    const restaurant = await apiFetch<BackendRestaurant>(`/api/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return normalizeRestaurant(restaurant);
  },
  
  toggleActive: async (id: string, active: boolean) => {
    const restaurant = await apiFetch<BackendRestaurant>(`/api/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active })
    });
    return normalizeRestaurant(restaurant);
  },
  
  resetPassword: (id: string, newPassword: string) => apiFetch<void>(`/api/restaurants/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword })
  }),
  
  getOverviewStats: () => apiFetch<OverviewStats>('/api/restaurants/stats/overview'),
  
  getRevenueStats: (id: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const qs = params.toString();
    return apiFetch<RestaurantRevenueStats>(`/api/restaurants/${id}/stats/revenue${qs ? `?${qs}` : ''}`);
  },

  // Admin restaurant methods
  getSettings: async () => {
    const restaurant = await apiFetch<BackendRestaurant>('/api/restaurants/me');
    return normalizeRestaurant(restaurant);
  },
  
  updateSettings: async (data: any) => {
    const restaurant = await apiFetch<BackendRestaurant>('/api/restaurants/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return normalizeRestaurant(restaurant);
  },

  getMeStats: (period?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const qs = params.toString();
    return apiFetch<RestaurantStats>(`/api/restaurants/me/stats${qs ? `?${qs}` : ''}`);
  },

  requestEmailChangeOtp: (newEmail: string) => apiFetch<{ message: string }>('/api/restaurants/me/request-email-change', {
    method: 'POST',
    body: JSON.stringify({ newEmail })
  }),

  requestBankChangeOtp: (newBankAccount: string, newBankName: string) => apiFetch<{ message: string }>('/api/restaurants/me/request-bank-change', {
    method: 'POST',
    body: JSON.stringify({ newBankAccount, newBankName })
  }),

  generateQr: (bankCode: string, accountNumber: string, accountName: string, amount?: number) => 
    apiFetch<any>('/api/restaurants/generate-qr', {
      method: 'POST',
      body: JSON.stringify({ bankCode, accountNumber, accountName, amount }),
      requireAuth: false
    })
};
