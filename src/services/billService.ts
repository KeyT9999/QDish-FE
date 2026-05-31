import { apiFetch } from './api';
import { ActiveBill, Bill, Order, PaymentMethod, TableSession } from '@/types';

type BackendBill = Bill & { _id?: string; billId?: string };
type BackendOrder = Order & { _id?: string };
type BackendSession = TableSession & { _id?: string };
type BackendActiveBill = Omit<ActiveBill, 'orders'> & {
  billId?: string;
  _id?: string;
  orders?: BackendOrder[];
};

const normalizeBill = (bill: BackendBill | null | undefined): Bill | null => {
  if (!bill) return null;
  return {
    ...bill,
    id: bill.id || bill._id || bill.billId || '',
    orderIds: Array.isArray(bill.orderIds) ? bill.orderIds.map(String) : [],
    itemsSnapshot: Array.isArray(bill.itemsSnapshot) ? bill.itemsSnapshot : []
  };
};

const normalizeOrder = (order: BackendOrder): Order => ({
  ...order,
  id: order.id || order._id || ''
});

const normalizeSession = (session: BackendSession | null | undefined): TableSession | null => {
  if (!session) return null;
  return {
    ...session,
    id: session.id || session._id || ''
  };
};

const normalizeActiveBill = (bill: BackendActiveBill): ActiveBill => ({
  ...bill,
  billId: String(bill.billId || bill._id || ''),
  orders: Array.isArray(bill.orders) ? bill.orders.map(normalizeOrder) : []
});

export interface CurrentBillResponse {
  session: TableSession | null;
  bill: Bill | null;
  orders: Order[];
}

export interface BillListResponse {
  bills: Bill[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BillDetailResponse {
  bill: Bill;
  orders: Order[];
}

export interface ActiveBillsResponse {
  bills: ActiveBill[];
}

export interface BillGroupsResponse extends ActiveBillsResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BillHistoryFilters {
  tableNumber?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PayBillPayload {
  paymentMethod: PaymentMethod;
  cashReceived?: number;
}

export const billService = {
  getCurrentBill: async (restaurantId: string, tableNumber: string, sessionId?: string) => {
    const params = new URLSearchParams({ restaurantId, tableNumber });
    if (sessionId) params.set('sessionId', sessionId);

    const data = await apiFetch<{
      session?: BackendSession | null;
      bill?: BackendBill | null;
      orders?: BackendOrder[];
    }>(`/api/bills/current?${params.toString()}`, {
      requireAuth: false
    });

    return {
      session: normalizeSession(data.session),
      bill: normalizeBill(data.bill),
      orders: Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : []
    } as CurrentBillResponse;
  },

  payBill: (billId: string, payload: PaymentMethod | PayBillPayload) => {
    const body = typeof payload === 'string'
      ? { paymentMethod: payload }
      : payload;

    return apiFetch<{ bill: BackendBill; session: BackendSession; table?: unknown }>(
      `/api/bills/${billId}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify(body)
      }
    ).then((data) => ({
      ...data,
      bill: normalizeBill(data.bill) as Bill,
      session: normalizeSession(data.session) as TableSession
    }));
  },

  getActiveBills: async (restaurantId: string) => {
    const params = new URLSearchParams({ restaurantId });
    const data = await apiFetch<{ bills?: BackendActiveBill[] }>(`/api/bills/active?${params.toString()}`);

    return {
      bills: Array.isArray(data.bills) ? data.bills.map(normalizeActiveBill) : []
    } as ActiveBillsResponse;
  },

  getBillGroups: async (restaurantId: string, filters: BillHistoryFilters = {}) => {
    const params = new URLSearchParams({
      restaurantId,
      page: String(filters.page || 1),
      limit: String(filters.limit || 50)
    });
    if (filters.tableNumber) params.set('tableNumber', filters.tableNumber);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const data = await apiFetch<{
      bills?: BackendActiveBill[];
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    }>(`/api/bills?${params.toString()}`);

    const bills = Array.isArray(data.bills)
      ? data.bills.map(normalizeActiveBill)
      : [];

    return {
      bills,
      page: data.page || filters.page || 1,
      limit: data.limit || filters.limit || 50,
      total: data.total || bills.length,
      totalPages: data.totalPages || 1
    } as BillGroupsResponse;
  },

  getBills: async (restaurantId: string, filters: BillHistoryFilters = {}) => {
    const params = new URLSearchParams({
      restaurantId,
      page: String(filters.page || 1),
      limit: String(filters.limit || 20)
    });
    if (filters.tableNumber) params.set('tableNumber', filters.tableNumber);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const data = await apiFetch<{
      bills?: BackendBill[];
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    }>(`/api/bills?${params.toString()}`);

    const bills = Array.isArray(data.bills)
      ? data.bills.map((bill) => normalizeBill(bill) as Bill)
      : [];

    return {
      bills,
      page: data.page || filters.page || 1,
      limit: data.limit || filters.limit || 20,
      total: data.total || bills.length,
      totalPages: data.totalPages || 1
    } as BillListResponse;
  },

  getBillDetail: async (billId: string, restaurantId?: string) => {
    const params = restaurantId ? `?${new URLSearchParams({ restaurantId }).toString()}` : '';
    const data = await apiFetch<{ bill: BackendBill; orders?: BackendOrder[] }>(`/api/bills/${billId}${params}`);

    return {
      bill: normalizeBill(data.bill) as Bill,
      orders: Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : []
    } as BillDetailResponse;
  }
};
