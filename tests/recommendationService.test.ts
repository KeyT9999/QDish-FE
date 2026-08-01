import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  getRecommendationEmptyMessage,
  getRecommendationHeading,
  loadRecommendations,
} from '../src/services/recommendationService.ts';

const restaurantId = 'restaurant-1';

async function testRecommendationRequestPayloadAndPresentationCopy() {
  let body = '';
  let path = '';
  let options: (RequestInit & { requireAuth?: boolean }) | undefined;

  const result = await loadRecommendations({
    restaurantId,
    profile: {
      goals: ['BALANCED'],
      preferences: ['VEGAN'],
      allergies: ['NUTS'],
      conditions: ['DIABETES'],
    },
    context: { timeOfDay: 'lunch', postWorkout: false },
    fetcher: async <T>(requestPath: string, requestOptions?: RequestInit & { requireAuth?: boolean }) => {
      path = requestPath;
      options = requestOptions;
      body = requestOptions?.body as string;
      return {
        mode: 'PERSONALIZED',
        bestForYou: [],
        fullMenu: [],
        pairingSuggestions: [],
      } as T;
    },
  });

  assert.equal(path, '/api/recommendations');
  assert.equal(options?.method, 'POST');
  assert.equal(options?.requireAuth, false);
  assert.deepEqual(JSON.parse(body), {
    restaurantId,
    userProfile: {
      goals: ['BALANCED'],
      preferences: ['VEGAN'],
      allergies: ['NUTS'],
    },
    context: { timeOfDay: 'lunch', postWorkout: false },
  });
  assert.equal(body.includes('conditions'), false);
  assert.equal(body.includes('userId'), false);
  assert.equal(result.mode, 'PERSONALIZED');
  assert.equal(getRecommendationHeading('GENERAL'), 'Gợi ý phù hợp lúc này');
  assert.equal(getRecommendationHeading('PERSONALIZED'), 'Gợi ý dành cho bạn');
  assert.equal(
    getRecommendationEmptyMessage('NO_ALLERGEN_SAFE_DISHES'),
    'Chưa tìm thấy món phù hợp với dị ứng đã chọn',
  );
}

async function testMalformedResponsesAreRejectedBeforeUiConsumption() {
  await assert.rejects(
    loadRecommendations({
      restaurantId,
      profile: { goals: [], preferences: [], allergies: [], conditions: [] },
      context: { timeOfDay: 'lunch', postWorkout: false },
      fetcher: async <T>() => ({
        mode: 'UNSUPPORTED',
        bestForYou: [],
        fullMenu: [],
        pairingSuggestions: [],
      }) as T,
    }),
    /Malformed recommendation response/,
  );

  await assert.rejects(
    loadRecommendations({
      restaurantId,
      profile: { goals: [], preferences: [], allergies: [], conditions: [] },
      context: { timeOfDay: 'lunch', postWorkout: false },
      fetcher: async <T>() => ({
        mode: 'GENERAL',
        bestForYou: {},
        fullMenu: [],
        pairingSuggestions: [],
      }) as T,
    }),
    /Malformed recommendation response/,
  );
}

async function testMalformedRecommendationEntriesAreRejectedBeforeUiConsumption() {
  const profile = { goals: [], preferences: [], allergies: [], conditions: [] };
  const context = { timeOfDay: 'lunch' as const, postWorkout: false };

  await assert.rejects(
    loadRecommendations({
      restaurantId,
      profile,
      context,
      fetcher: async <T>() => ({
        mode: 'GENERAL',
        bestForYou: [{}],
        fullMenu: [],
        pairingSuggestions: [],
      }) as T,
    }),
    /Malformed recommendation response/,
  );

  await assert.rejects(
    loadRecommendations({
      restaurantId,
      profile,
      context,
      fetcher: async <T>() => ({
        mode: 'GENERAL',
        bestForYou: [],
        fullMenu: [{
          dish: { id: 'dish-1', name: 'Dish', price: 100_000 },
          fitScore: Infinity,
          bestContext: 'general',
          bestContextLabel: 'General',
          allergenWarnings: [],
        }],
        pairingSuggestions: [],
      }) as T,
    }),
    /Malformed recommendation response/,
  );

  await assert.rejects(
    loadRecommendations({
      restaurantId,
      profile,
      context,
      fetcher: async <T>() => ({
        mode: 'GENERAL',
        bestForYou: [],
        fullMenu: [],
        pairingSuggestions: [{
          mainDishId: 'dish-1',
          mainDishName: 'Dish',
          pairedDish: {},
          reason: 'Pair this dish',
        }],
      }) as T,
    }),
    /Malformed recommendation response/,
  );
}

async function testMinimalCustomerMenuDishDataRemainsAccepted() {
  const dish = { _id: 'dish-1', name: 'Dish', price: 100_000 };
  const result = await loadRecommendations({
    restaurantId,
    profile: { goals: [], preferences: [], allergies: [], conditions: [] },
    context: { timeOfDay: 'lunch', postWorkout: false },
    fetcher: async <T>() => ({
      mode: 'GENERAL',
      bestForYou: [{
        dish,
        fitScore: 80,
        bestContext: 'general',
        bestContextLabel: 'General',
        reason: 'Recommended',
        allergenWarnings: [],
      }],
      fullMenu: [{
        dish,
        fitScore: 80,
        bestContext: 'general',
        bestContextLabel: 'General',
        allergenWarnings: [],
      }],
      pairingSuggestions: [{
        mainDishId: 'dish-1',
        mainDishName: 'Dish',
        pairedDish: dish,
        reason: 'Pair this dish',
      }],
    }) as T,
  });

  assert.equal(result.bestForYou[0].dish.name, 'Dish');
  assert.equal(result.fullMenu[0].fitScore, 80);
  assert.equal(result.pairingSuggestions[0].pairedDish.price, 100_000);
}

function testCustomerMenuUsesTheTypedRecommendationFlow() {
  const customerMenu = readFileSync('src/pages/CustomerMenu.tsx', 'utf8');

  assert.equal(customerMenu.includes('qdish_guest_user_id'), false);
  assert.equal(customerMenu.includes('guestUserId'), false);
  assert.equal(customerMenu.includes('loadRecommendations'), true);
  assert.equal(customerMenu.includes('timeOfDay: timeOfDayBucket'), true);
  assert.equal(customerMenu.includes('onClearProfile={clearProfile}'), true);
}

await testRecommendationRequestPayloadAndPresentationCopy();
await testMalformedResponsesAreRejectedBeforeUiConsumption();
await testMalformedRecommendationEntriesAreRejectedBeforeUiConsumption();
await testMinimalCustomerMenuDishDataRemainsAccepted();
testCustomerMenuUsesTheTypedRecommendationFlow();
console.log('recommendation service tests passed');
