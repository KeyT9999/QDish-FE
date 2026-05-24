import { apiFetch } from './api';

export interface RestaurantTable {
  id?: string;
  _id?: string;
  restaurantId: string;
  code: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const tableService = {
  getAll: (restaurantId: string) => {
    const params = new URLSearchParams({ restaurantId });
    return apiFetch<RestaurantTable[]>(`/api/tables?${params.toString()}`);
  },

  createOrSync: (code: string) => apiFetch<RestaurantTable>('/api/tables', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
};
