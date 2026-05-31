import { apiFetch } from './api';
import { Bill, TableSession, PaymentMethod, Order } from '../types';

export interface ResolveSessionResponse {
  session: TableSession;
  bill?: Bill;
}

export interface ActiveSessionsResponse {
  sessions: TableSession[];
}

export interface HistorySessionsResponse {
  sessions: TableSession[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SessionOrdersResponse {
  orders: Order[];
}

export const tableSessionService = {
  resolveSession: (restaurantId: string, tableNumber: string) => {
    return apiFetch<ResolveSessionResponse>('/api/table-sessions/resolve', {
      method: 'POST',
      body: JSON.stringify({ restaurantId, tableNumber }),
    });
  },

  requestPayment: (sessionId: string, paymentMethod: PaymentMethod) => {
    return apiFetch<ResolveSessionResponse>(`/api/table-sessions/${sessionId}/request-payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentMethod }),
    });
  },

  closeSession: (sessionId: string, note?: string, paymentMethod?: PaymentMethod) => {
    return apiFetch<ResolveSessionResponse>(`/api/table-sessions/${sessionId}/close`, {
      method: 'PATCH',
      body: JSON.stringify({ note, paymentMethod }),
    });
  },

  getActiveSessions: (restaurantId: string) => {
    const params = new URLSearchParams({ restaurantId });
    return apiFetch<ActiveSessionsResponse>(`/api/table-sessions/active?${params.toString()}`);
  },

  getSessionHistory: (restaurantId: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      restaurantId,
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiFetch<HistorySessionsResponse>(`/api/table-sessions?${params.toString()}`);
  },

  getSessionOrders: (sessionId: string) => {
    return apiFetch<SessionOrdersResponse>(`/api/table-sessions/${sessionId}/orders`);
  },
};
