import assert from 'node:assert/strict';
import { createApiGetRequestCacheKey } from '../src/lib/apiRequestCache.ts';

const url = 'http://localhost:5000/api/menu/manage';

assert.equal(
  createApiGetRequestCacheKey(url, 'Bearer owner-token', 'restaurant-a'),
  createApiGetRequestCacheKey(url, 'Bearer owner-token', 'restaurant-a'),
  'identical scopes share a cached request',
);
assert.notEqual(
  createApiGetRequestCacheKey(url, 'Bearer owner-token', 'restaurant-a'),
  createApiGetRequestCacheKey(url, 'Bearer owner-token', 'restaurant-b'),
  'different selected restaurants must not share management responses',
);
assert.notEqual(
  createApiGetRequestCacheKey(url, 'Bearer owner-token', 'restaurant-a'),
  createApiGetRequestCacheKey(url, 'public', 'restaurant-a'),
  'authenticated and public requests must remain isolated',
);

console.log('API GET request cache scope tests passed');
