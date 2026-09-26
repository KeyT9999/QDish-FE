import assert from 'node:assert/strict';

import {
  buildCategoryRevenueData,
  buildCustomerSegmentData,
  buildHourlyOrderData,
  buildOrderStatusData,
  buildRevenueTrendData,
  buildTopDishData
} from '../src/components/dashboard/restaurant/charts/merchantInsightsChartData.ts';
import { buildOperationalRecommendations } from '../src/components/dashboard/restaurant/insightRecommendations.ts';
import type { MerchantInsightsPayload } from '../src/services/merchantInsightLoader.ts';
import type { RestaurantStats } from '../src/types/index.ts';

const stats = {
  overview: {
    totalRevenue: 300000,
    previousRevenue: 250000,
    revenueChange: 20,
    totalOrders: 11,
    previousOrders: 9,
    ordersChange: 22.22,
    averageOrderValue: 27273,
    previousAverageOrderValue: 27778,
    totalCustomers: 7,
    cancellationRate: 6,
    averageProcessingTime: 24,
    topSellingItem: { name: 'Cơm gà', quantity: 8 },
    peakHour: 12
  },
  revenueByDate: [
    { date: '2026-09-12', revenue: 120000, orders: 3 },
    { date: '2026-09-13', revenue: 180000, orders: 5 }
  ],
  revenueByHour: [
    { hour: 12, revenue: 420000, orders: 8 },
    { hour: 19, revenue: 360000, orders: 6 }
  ],
  topMenuItems: [
    { menuItemId: 'dish-1', name: 'Cơm gà', quantity: 8, revenue: 640000 },
    { menuItemId: 'dish-2', name: 'Trà đào', quantity: 4, revenue: 120000 }
  ],
  revenueByCategory: [
    { category: 'Món chính', revenue: 640000, quantity: 8 },
    { category: 'Đồ uống', revenue: 120000, quantity: 4 }
  ],
  ordersByStatus: {
    pending: 2,
    confirmed: 3,
    served: 4,
    completed: 8,
    cancelled: 1
  }
} as RestaurantStats;

const insights = {
  menuCoverage: { totalItems: 10, itemsWithRecipe: 8, coveragePct: 80 },
  attributeDistribution: { HIGH_PROTEIN: 4 },
  topDishes: [{ dishId: 'dish-1', name: 'Cơm gà', orderCount: 5, revenue: 500000 }],
  customerSegments: [{ segment: 'BALANCED', count: 3, label: 'Cân bằng' }],
  surveyResponseCount: 3,
  gapAnalysis: [],
  peakHours: {
    periods: [{ period: 'Bữa trưa', count: 5, percentage: 100 }],
    hourly: Array(24).fill(0)
  }
} as MerchantInsightsPayload;

const statsWithoutOperationalData = {
  ...stats,
  revenueByHour: [],
  topMenuItems: []
} as RestaurantStats;

const testRevenueTrendUsesReadableDateAndNumbers = () => {
  assert.deepEqual(buildRevenueTrendData(stats)[0], {
    label: '12/09',
    revenue: 120000,
    orders: 3
  });
};

const testHourlyDataKeepsAll24HoursAndUsesStats = () => {
  const hourly = buildHourlyOrderData(stats, insights);

  assert.equal(hourly.length, 24);
  assert.deepEqual(hourly[12], {
    hour: 12,
    label: '12h',
    revenue: 420000,
    orders: 8
  });
  assert.equal(hourly[0].orders, 0);
};

const testTopDishFallsBackToInsightPayload = () => {
  assert.deepEqual(buildTopDishData(statsWithoutOperationalData, insights)[0], {
    name: 'Cơm gà',
    quantity: 5,
    revenue: 500000
  });
};

const testEmptyCategoryAndStatusDataStayEmpty = () => {
  assert.deepEqual(buildCategoryRevenueData(null), []);
  assert.deepEqual(buildOrderStatusData(null), []);
};

const testStatusAndCustomerLabelsAreReadyForCharts = () => {
  assert.equal(buildOrderStatusData(stats)[0].label, 'Đang chờ');
  assert.deepEqual(buildCustomerSegmentData(insights), [
    { label: 'Cân bằng', count: 3 }
  ]);
};

const testOperationalRecommendationsPrioritizeConcreteActions = () => {
  const recommendations = buildOperationalRecommendations(stats);

  assert.equal(recommendations.length, 3);
  assert.equal(recommendations[0].id, 'peak-hour');
  assert.match(recommendations[0].title, /12:00/);
  assert.equal(recommendations[1].id, 'cancellation-rate');
  assert.equal(recommendations[2].id, 'processing-time');
};

const testOperationalRecommendationsStayEmptyWithoutStats = () => {
  assert.deepEqual(buildOperationalRecommendations(null), []);
  assert.deepEqual(buildOperationalRecommendations({} as RestaurantStats), []);
};

testRevenueTrendUsesReadableDateAndNumbers();
testHourlyDataKeepsAll24HoursAndUsesStats();
testTopDishFallsBackToInsightPayload();
testEmptyCategoryAndStatusDataStayEmpty();
testStatusAndCustomerLabelsAreReadyForCharts();
testOperationalRecommendationsPrioritizeConcreteActions();
testOperationalRecommendationsStayEmptyWithoutStats();

console.log('merchant insights chart data tests passed');
