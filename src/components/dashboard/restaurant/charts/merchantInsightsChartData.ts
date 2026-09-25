import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import type { RestaurantStats } from '@/types';

export interface RevenueTrendPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface HourlyOrderPoint {
  hour: number;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopDishPoint {
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategoryRevenuePoint {
  category: string;
  revenue: number;
  quantity: number;
}

export interface OrderStatusPoint {
  key: keyof RestaurantStats['ordersByStatus'];
  label: string;
  count: number;
}

export interface CustomerSegmentPoint {
  label: string;
  count: number;
}

const statusLabels: Record<OrderStatusPoint['key'], string> = {
  pending: 'Đang chờ',
  confirmed: 'Đã xác nhận',
  served: 'Đã phục vụ',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy'
};

const formatDateLabel = (date: string) => {
  const [, month, day] = date.split('-');
  return month && day ? `${day}/${month}` : date;
};

const hasPositiveOrderData = (items: Array<{ orders: number; revenue: number }>) =>
  items.some((item) => item.orders > 0 || item.revenue > 0);

export const buildRevenueTrendData = (stats: RestaurantStats | null): RevenueTrendPoint[] => {
  if (!stats?.revenueByDate?.length) return [];

  return stats.revenueByDate.map((item) => ({
    label: formatDateLabel(item.date),
    revenue: item.revenue || 0,
    orders: item.orders || 0
  }));
};

export const buildHourlyOrderData = (
  stats: RestaurantStats | null,
  insights: MerchantInsightsPayload
): HourlyOrderPoint[] => {
  const statsByHour = stats?.revenueByHour || [];
  const hasStatsData = hasPositiveOrderData(statsByHour);
  const insightHourly = insights.peakHours?.hourly || [];

  return Array.from({ length: 24 }, (_, hour) => {
    const statsPoint = statsByHour.find((item) => item.hour === hour);
    const orders = hasStatsData ? statsPoint?.orders || 0 : insightHourly[hour] || 0;
    const revenue = hasStatsData ? statsPoint?.revenue || 0 : 0;

    return {
      hour,
      label: `${hour}h`,
      revenue,
      orders
    };
  });
};

export const buildTopDishData = (
  stats: RestaurantStats | null,
  insights: MerchantInsightsPayload
): TopDishPoint[] => {
  const statsItems = stats?.topMenuItems || [];
  if (statsItems.length > 0) {
    return statsItems.map((item) => ({
      name: item.name,
      quantity: item.quantity || 0,
      revenue: item.revenue || 0
    }));
  }

  return (insights.topDishes || []).map((item) => ({
    name: item.name,
    quantity: item.orderCount || 0,
    revenue: item.revenue || 0
  }));
};

export const buildCategoryRevenueData = (
  stats: RestaurantStats | null
): CategoryRevenuePoint[] => {
  if (!stats?.revenueByCategory?.length) return [];

  return stats.revenueByCategory
    .filter((item) => item.revenue > 0 || item.quantity > 0)
    .map((item) => ({
      category: item.category,
      revenue: item.revenue || 0,
      quantity: item.quantity || 0
    }));
};

export const buildOrderStatusData = (stats: RestaurantStats | null): OrderStatusPoint[] => {
  if (!stats?.ordersByStatus) return [];

  return (Object.keys(statusLabels) as OrderStatusPoint['key'][])
    .map((key) => ({
      key,
      label: statusLabels[key],
      count: stats.ordersByStatus[key] || 0
    }))
    .filter((item) => item.count > 0);
};

export const buildCustomerSegmentData = (
  insights: MerchantInsightsPayload
): CustomerSegmentPoint[] => (insights.customerSegments || [])
  .filter((item) => item.count > 0)
  .map((item) => ({
    label: item.label,
    count: item.count
  }));
