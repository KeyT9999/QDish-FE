import { apiFetch } from './api';
import { Order, OrderStatus } from '@/types';

type BackendOrder = Order & { _id?: string };

const normalizeOrder = (order: BackendOrder): Order => ({
  ...order,
  id: order.id || order._id || ''
});

const filterOrders = (orders: Order[], status?: string, startDate?: string, endDate?: string) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (end) end.setHours(23, 59, 59, 999);

  return orders.filter(order => {
    if (status && status !== 'ALL' && order.status !== status) return false;

    const rawDate = order.createdAt || (order.timestamp ? new Date(order.timestamp).toISOString() : '');
    if (!rawDate) return true;

    const createdAt = new Date(rawDate);
    if (start && createdAt < start) return false;
    if (end && createdAt > end) return false;
    return true;
  });
};

export const orderService = {
  // Public routes
  createOrder: async (restaurantId: string, data: any) => {
    const created = await apiFetch<BackendOrder>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ ...data, restaurantId }),
      requireAuth: false
    });
    return normalizeOrder(created);
  },
  
  checkStatus: async (orderId: string) => {
    const order = await apiFetch<BackendOrder>(`/api/orders/${orderId}`, {
      requireAuth: false
    });
    return normalizeOrder(order);
  },
  
  getOrdersByTable: async (restaurantId: string, tableNumber: string) => {
    const params = new URLSearchParams({ restaurantId, tableNumber });
    const data = await apiFetch<BackendOrder[]>(`/api/orders?${params.toString()}`, {
      requireAuth: false
    });
    return data.map(normalizeOrder);
  },

  // Admin / Staff routes
  getAll: async (status?: string, startDate?: string, endDate?: string) => {
    const data = await apiFetch<BackendOrder[]>('/api/staff/orders');
    return filterOrders(data.map(normalizeOrder), status, startDate, endDate);
  },
  
  updateStatus: (id: string, status: OrderStatus, paymentMethod?: string) => {
    const body: any = { status };
    if (paymentMethod) body.paymentMethod = paymentMethod;
    
    return apiFetch<Order>(`/api/staff/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }).then(normalizeOrder);
  },
  
  // Only staff
  getStaffOrders: async () => {
    const data = await apiFetch<BackendOrder[]>('/api/staff/orders');
    return data.map(normalizeOrder);
  },
  updateStaffOrderStatus: async (id: string, status: OrderStatus, paymentMethod?: string) => {
    const body: { status: OrderStatus; paymentMethod?: string } = { status };
    if (paymentMethod) body.paymentMethod = paymentMethod;

    const updated = await apiFetch<BackendOrder>(`/api/staff/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return normalizeOrder(updated);
  }
};
