import { apiFetch } from './api';

export const ownerRestaurantService = {
  createRestaurant: (data: any) => apiFetch<any>('/api/owner/restaurants', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getMyRestaurants: () => apiFetch<any[]>('/api/owner/restaurants', {
    method: 'GET'
  }),

  getRestaurantDetails: (id: string) => apiFetch<any>(`/api/owner/restaurants/${id}`, {
    method: 'GET'
  })
};
