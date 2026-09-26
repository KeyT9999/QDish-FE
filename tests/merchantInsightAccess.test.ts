import assert from 'node:assert/strict';

import { loadMerchantInsights } from '../src/services/merchantInsightLoader.ts';
import {
  getSurveyDataDisclosure,
  meetsMerchantInsightThreshold
} from '../src/services/merchantInsightPolicy.ts';

const menuPayload = {
  menuCoverage: { totalItems: 10, itemsWithRecipe: 8, coveragePct: 80 },
  attributeDistribution: { HIGH_PROTEIN: 4 },
  topDishes: [{ dishId: 'dish-1', name: 'Chicken Bowl', orderCount: 5, revenue: 500000 }]
};

const customerPayload = {
  customerSegments: [{ segment: 'BALANCED', count: 3, label: 'Balanced' }],
  surveyResponseCount: 3,
  realSurveyResponseCount: 2,
  demoSurveyResponseCount: 1,
  completedOrderCount: 11,
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
  assert.equal(result.realSurveyResponseCount, 0);
  assert.equal(result.demoSurveyResponseCount, 0);
  assert.equal(result.completedOrderCount, 0);
  assert.deepEqual(result.peakHours.hourly, Array(24).fill(0));
}

async function testProRequestsTheCompleteCustomerInsightDashboardOnce() {
  const requests: string[] = [];
  const completePayload = { ...menuPayload, ...customerPayload };
  const result = await loadMerchantInsights({
    restaurantId: 'restaurant-1',
    period: 'week',
    customerInsightsEnabled: true,
    fetcher: async (path) => {
      requests.push(path);
      return completePayload as any;
    }
  });

  assert.deepEqual(requests, [
    '/api/restaurants/customer-insights?restaurantId=restaurant-1&period=week'
  ]);
  assert.deepEqual(result, completePayload);
  assert.equal(
    result.surveyResponseCount,
    result.realSurveyResponseCount + result.demoSurveyResponseCount
  );
}

function testIntelligenceThresholdUsesCompletedOrderDocuments() {
  assert.equal(
    meetsMerchantInsightThreshold({ surveyResponseCount: 20, completedOrderCount: 9 }),
    false
  );
  assert.equal(
    meetsMerchantInsightThreshold({ surveyResponseCount: 20, completedOrderCount: 10 }),
    true
  );
  assert.equal(
    meetsMerchantInsightThreshold({ surveyResponseCount: 19, completedOrderCount: 100 }),
    false
  );
}

function testSurveyDisclosureDoesNotClaimDataWasCheckedWhenPlanCannotLoadIt() {
  assert.equal(
    getSurveyDataDisclosure({
      customerInsightsEnabled: false,
      surveyResponseCount: 0,
      realSurveyResponseCount: 0,
      demoSurveyResponseCount: 0
    }),
    null
  );

  assert.deepEqual(
    getSurveyDataDisclosure({
      customerInsightsEnabled: true,
      surveyResponseCount: 0,
      realSurveyResponseCount: 0,
      demoSurveyResponseCount: 0
    }),
    {
      surveyResponseCount: 0,
      realSurveyResponseCount: 0,
      demoSurveyResponseCount: 0,
      hasDemoResponses: false
    }
  );
}

await testPlusOnlyRequestsMenuInsights();
await testProRequestsTheCompleteCustomerInsightDashboardOnce();
testIntelligenceThresholdUsesCompletedOrderDocuments();
testSurveyDisclosureDoesNotClaimDataWasCheckedWhenPlanCannotLoadIt();
console.log('merchant insight access tests passed');
