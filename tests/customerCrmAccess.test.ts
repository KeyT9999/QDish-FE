import assert from 'node:assert/strict';

import { createCustomerCrmClient } from '../src/services/customerCrmService.ts';

const requests: string[] = [];
const client = createCustomerCrmClient(async (path) => {
  requests.push(path);
  return { data: [], pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 } } as any;
});

await client.list('restaurant 1', { page: 2, limit: 20, search: 'Minh Anh' });

assert.deepEqual(requests, [
  '/api/restaurants/customers?restaurantId=restaurant+1&page=2&limit=20&search=Minh+Anh'
]);

console.log('customer CRM client tests passed');
