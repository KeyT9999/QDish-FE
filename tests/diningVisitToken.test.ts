import assert from 'node:assert/strict';

import { getOrCreateDiningVisitToken } from '../src/services/diningVisitToken.ts';

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value)
  };
};

function testReusesTokenWithinTheSameRestaurantSession() {
  const storage = createStorage();
  let generated = 0;
  const randomUUID = () => {
    generated += 1;
    return `token-${generated}`;
  };

  const first = getOrCreateDiningVisitToken('restaurant-a', 'session-1', storage, randomUUID);
  const second = getOrCreateDiningVisitToken('restaurant-a', 'session-1', storage, randomUUID);

  assert.equal(first, 'token-1');
  assert.equal(second, first);
  assert.equal(generated, 1);
}

function testCreatesDifferentTokensForDifferentSessionsOrRestaurants() {
  const storage = createStorage();
  let generated = 0;
  const randomUUID = () => `token-${++generated}`;

  const firstSession = getOrCreateDiningVisitToken('restaurant-a', 'session-1', storage, randomUUID);
  const secondSession = getOrCreateDiningVisitToken('restaurant-a', 'session-2', storage, randomUUID);
  const otherRestaurant = getOrCreateDiningVisitToken('restaurant-b', 'session-1', storage, randomUUID);

  assert.notEqual(firstSession, secondSession);
  assert.notEqual(firstSession, otherRestaurant);
  assert.notEqual(secondSession, otherRestaurant);
}

testReusesTokenWithinTheSameRestaurantSession();
testCreatesDifferentTokensForDifferentSessionsOrRestaurants();
console.log('dining visit token tests passed');
