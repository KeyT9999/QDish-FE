import { apiFetch } from './api';

export enum TableStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  CLOSED = "CLOSED"
}

export interface RestaurantTable {
  id?: string;
  _id?: string;
  restaurantId: string;
  code: string;
  isActive?: boolean;
  status?: TableStatus;
  activeSessionId?: string;
  currentSessionCode?: string;
  lastSessionClosedAt?: string;
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

