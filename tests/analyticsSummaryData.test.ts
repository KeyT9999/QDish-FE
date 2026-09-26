import assert from 'node:assert/strict';

import {
  buildMenuPerformanceSummary,
  buildOrderStatusSummary,
  buildTablePerformanceSummary
} from '../src/components/dashboard/restaurant/analyticsSummaryData.ts';
import type { RestaurantStats } from '../src/types/index.ts';

const stats = {
  topMenuItems: Array.from({ length: 7 }, (_, index) => ({
    menuItemId: `dish-${index}`,
    name: `Món ${index}`,
    quantity: 20 - index,
    revenue: (20 - index) * 10000
  })),
  revenueByCategory: [
    { category: 'Món chính', revenue: 900000, quantity: 30 },
    { category: 'Đồ uống', revenue: 300000, quantity: 40 }
  ],
  revenueByTable: [
    { tableNumber: 'B02', revenue: 200000, orders: 2 },
    { tableNumber: 'B01', revenue: 500000, orders: 4 },
    { tableNumber: 'B03', revenue: 100000, orders: 1 }
  ],
  ordersByStatus: {
    pending: 2,
    confirmed: 3,
    served: 1,
    completed: 8,
    cancelled: 1
  }
} as RestaurantStats;

const testOrderStatusSummaryUsesStableLabelsAndCounts = () => {
  assert.deepEqual(buildOrderStatusSummary(stats)[0], {
    key: 'pending',
    label: 'Đang chờ',
    count: 2
  });
  assert.equal(buildOrderStatusSummary(stats).length, 5);
};

const testMenuSummaryLimitsRowsAndKeepsCategories = () => {
  const summary = buildMenuPerformanceSummary(stats);

  assert.equal(summary.topDishes.length, 5);
  assert.equal(summary.topDishes[0].name, 'Món 0');
  assert.deepEqual(summary.categories, stats.revenueByCategory);
};

const testTableSummarySortsByRevenueAndLimitsRows = () => {
  assert.deepEqual(buildTablePerformanceSummary(stats), [
    { tableNumber: 'B01', revenue: 500000, orders: 4 },
    { tableNumber: 'B02', revenue: 200000, orders: 2 },
    { tableNumber: 'B03', revenue: 100000, orders: 1 }
  ]);
};

const testSummaryAdaptersAreSafeForEmptyStats = () => {
  assert.deepEqual(buildOrderStatusSummary(null), []);
  assert.deepEqual(buildMenuPerformanceSummary(null), { topDishes: [], categories: [] });
  assert.deepEqual(buildTablePerformanceSummary(null), []);
};

testOrderStatusSummaryUsesStableLabelsAndCounts();
testMenuSummaryLimitsRowsAndKeepsCategories();
testTableSummarySortsByRevenueAndLimitsRows();
testSummaryAdaptersAreSafeForEmptyStats();

console.log('analytics summary data tests passed');
