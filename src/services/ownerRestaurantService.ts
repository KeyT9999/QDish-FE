import { apiFetch } from './api';

export const ownerRestaurantService = {
  createRestaurant: (data: any) => apiFetch<any>('/api/owner/restaurants', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getMyRestaurants: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return apiFetch<any[]>(`/api/owner/restaurants${qs}`);
  },

  getRestaurantDetails: (id: string) => apiFetch<any>(`/api/owner/restaurants/${id}`, {
    method: 'GET'
  }),

  copyMenu: (targetId: string, sourceRestaurantId: string) => apiFetch<any>(`/api/owner/restaurants/${targetId}/copy-menu`, {
    method: 'POST',
    body: JSON.stringify({ sourceRestaurantId })
  })
};
