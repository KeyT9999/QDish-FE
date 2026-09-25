import { apiFetch } from './api';
import { buildOwnerRestaurantListPath } from './ownerRestaurantArchivePolicy';

export interface OwnerRestaurant {
  id?: string;
  _id: string;
  name: string;
  username?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  archivedAt?: string | null;
  revenue?: number;
  orderCount?: number;
}

export const ownerRestaurantService = {
  createRestaurant: (data: any) => apiFetch<any>('/api/owner/restaurants', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getMyRestaurants: (period?: string) => {
    return apiFetch<OwnerRestaurant[]>(buildOwnerRestaurantListPath(period));
  },

  getArchivedRestaurants: (period?: string) => apiFetch<OwnerRestaurant[]>(buildOwnerRestaurantListPath(period, true)),

  archiveRestaurant: (restaurantId: string) => apiFetch<{ restaurantId: string; archivedAt: string }>(
    `/api/owner/restaurants/${encodeURIComponent(restaurantId)}`,
    { method: 'DELETE' }
  ),

  restoreRestaurant: (restaurantId: string) => apiFetch<OwnerRestaurant>(
    `/api/owner/restaurants/${encodeURIComponent(restaurantId)}/restore`,
    { method: 'POST' }
  ),

  getRestaurantDetails: (id: string) => apiFetch<any>(`/api/owner/restaurants/${id}`, {
    method: 'GET'
  }),

  copyMenu: (targetId: string, sourceRestaurantId: string) => apiFetch<any>(`/api/owner/restaurants/${targetId}/copy-menu`, {
    method: 'POST',
    body: JSON.stringify({ sourceRestaurantId })
  })
};
