import assert from 'node:assert/strict';

import { resolveOwnerRestaurantSelection } from '../src/components/layout/ownerWorkspaceSelection.ts';

const restaurants = [
  { id: 'branch-1', _id: 'branch-1', name: 'Chi nhánh 1' },
  { _id: 'branch-2', name: 'Chi nhánh 2' }
];

assert.equal(
  resolveOwnerRestaurantSelection(restaurants, 'branch-2'),
  'branch-2',
  'a valid stored selection should be preserved'
);
assert.equal(
  resolveOwnerRestaurantSelection(restaurants, 'missing'),
  'branch-1',
  'an invalid stored selection should fall back to the first active branch'
);
assert.equal(
  resolveOwnerRestaurantSelection(restaurants, ''),
  'branch-1',
  'a missing stored selection should select the first active branch'
);
assert.equal(
  resolveOwnerRestaurantSelection([], 'branch-1'),
  null,
  'an empty active list should have no selected branch'
);

console.log('owner workspace selection tests passed');
