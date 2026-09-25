import assert from 'node:assert/strict';
import { buildOwnerRestaurantListPath, getNextActiveRestaurantId, refreshOwnerRestaurantLists } from '../src/services/ownerRestaurantArchivePolicy.ts';

assert.equal(buildOwnerRestaurantListPath(), '/api/owner/restaurants');
assert.equal(buildOwnerRestaurantListPath('all'), '/api/owner/restaurants?period=all');
assert.equal(buildOwnerRestaurantListPath('month', true), '/api/owner/restaurants?period=month&archived=true');
assert.equal(
  getNextActiveRestaurantId([{ id: 'active-1', _id: 'active-1' }, { id: 'active-2', _id: 'active-2' }], 'archived'),
  'active-1',
  'archiving the selected branch falls back to an active branch'
);
assert.equal(
  getNextActiveRestaurantId([{ _id: 'active-1' }, { id: 'active-2', _id: 'active-2' }], 'active-2'),
  'active-2',
  'the current active selection is preserved'
);
assert.equal(getNextActiveRestaurantId([], 'archived'), null, 'no selection is retained when there are no active branches');

let archivedRefreshStarted = false;
const refreshResult = await refreshOwnerRestaurantLists(
  () => { throw new Error('temporary active list failure'); },
  async () => { archivedRefreshStarted = true; return [{ id: 'archived-1', _id: 'archived-1' }]; }
);
assert.equal(refreshResult.active.status, 'rejected', 'a failed list refresh is represented separately from the mutation');
assert.equal(refreshResult.archived.status, 'fulfilled', 'one failed list must not prevent the other list from refreshing');
if (refreshResult.archived.status === 'fulfilled') assert.equal(refreshResult.archived.value[0].id, 'archived-1');
assert.equal(archivedRefreshStarted, true, 'a synchronous failure in one loader must not prevent the other refresh from starting');

console.log('owner restaurant archive policy tests passed');
