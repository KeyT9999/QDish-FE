import assert from 'node:assert/strict';

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

await testRecommendationRequestPayloadAndPresentationCopy();
await testMalformedResponsesAreRejectedBeforeUiConsumption();
console.log('recommendation service tests passed');
