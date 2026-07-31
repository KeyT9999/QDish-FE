import assert from 'node:assert/strict';

import { loadMerchantInsights } from '../src/services/merchantInsightLoader.ts';

const menuPayload = {
  menuCoverage: { totalItems: 10, itemsWithRecipe: 8, coveragePct: 80 },
  attributeDistribution: { HIGH_PROTEIN: 4 },
  topDishes: [{ dishId: 'dish-1', name: 'Chicken Bowl', orderCount: 5, revenue: 500000 }]
};

const customerPayload = {
  customerSegments: [{ segment: 'BALANCED', count: 3, label: 'Balanced' }],
  surveyResponseCount: 3,
  gapAnalysis: ['Add vegan dishes'],
  peakHours: {
    periods: [{ period: 'Lunch', count: 5, percentage: 100 }],
    hourly: Array(24).fill(0)
  }
};

async function testPlusOnlyRequestsMenuInsights() {
  const requests: string[] = [];
  const result = await loadMerchantInsights({
    restaurantId: 'restaurant-1',
    period: 'month',
    customerInsightsEnabled: false,
    fetcher: async (path) => {
      requests.push(path);
      return menuPayload as any;
    }
  });

  assert.deepEqual(requests, [
    '/api/restaurants/menu-insights?restaurantId=restaurant-1&period=month'
  ]);
  assert.deepEqual(result.customerSegments, []);
  assert.equal(result.surveyResponseCount, 0);
  assert.deepEqual(result.peakHours.hourly, Array(24).fill(0));
}

async function testProRequestsAndMergesBothInsightScopes() {
  const requests: string[] = [];
  const result = await loadMerchantInsights({
    restaurantId: 'restaurant-1',
    period: 'week',
    customerInsightsEnabled: true,
    fetcher: async (path) => {
      requests.push(path);
      return (path.includes('customer-insights') ? customerPayload : menuPayload) as any;
    }
  });

  assert.deepEqual(requests, [
    '/api/restaurants/menu-insights?restaurantId=restaurant-1&period=week',
    '/api/restaurants/customer-insights?restaurantId=restaurant-1&period=week'
  ]);
  assert.deepEqual(result, { ...menuPayload, ...customerPayload });
}

await testPlusOnlyRequestsMenuInsights();
await testProRequestsAndMergesBothInsightScopes();
console.log('merchant insight access tests passed');
