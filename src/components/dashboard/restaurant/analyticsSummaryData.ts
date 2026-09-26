import type { RestaurantStats } from '@/types';

export interface OrderStatusSummaryRow {
  key: keyof RestaurantStats['ordersByStatus'];
  label: string;
  count: number;
}

export interface MenuPerformanceSummary {
  topDishes: RestaurantStats['topMenuItems'];
  categories: RestaurantStats['revenueByCategory'];
}

export type TablePerformanceSummaryRow = RestaurantStats['revenueByTable'][number];

const orderStatusLabels: Record<keyof RestaurantStats['ordersByStatus'], string> = {
  pending: 'Đang chờ',
  confirmed: 'Đã xác nhận',
  served: 'Đã phục vụ',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy'
};

const orderStatusKeys: Array<keyof RestaurantStats['ordersByStatus']> = [
  'pending',
  'confirmed',
  'served',
  'completed',
  'cancelled'
];

export const buildOrderStatusSummary = (
  stats: RestaurantStats | null
): OrderStatusSummaryRow[] => {
  if (!stats?.ordersByStatus) return [];

  return orderStatusKeys.map((key) => ({
    key,
    label: orderStatusLabels[key],
    count: stats.ordersByStatus[key] || 0
  }));
};

export const buildMenuPerformanceSummary = (
  stats: RestaurantStats | null
): MenuPerformanceSummary => ({
  topDishes: [...(stats?.topMenuItems || [])].slice(0, 5),
  categories: [...(stats?.revenueByCategory || [])].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
});

export const buildTablePerformanceSummary = (
  stats: RestaurantStats | null
): TablePerformanceSummaryRow[] => [...(stats?.revenueByTable || [])]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);
