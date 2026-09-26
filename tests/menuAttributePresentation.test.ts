import assert from 'node:assert/strict';

import {
  getMenuAttributeMeta,
  groupMenuAttributes,
  MENU_ATTRIBUTE_GROUPS,
} from '../src/components/dashboard/restaurant/merchant-insights/menuAttributePresentation.ts';

const grouped = groupMenuAttributes({
  LOW_CALORIE: 4,
  HIGH_FIBER: 7,
  VEGAN: 2,
  SOCIAL_SHARING: 4,
  UNKNOWN_TAG: 3,
  LOW_FAT: 7,
  ZERO_VALUE: 0,
});

assert.deepEqual(
  grouped.find((group) => group.key === 'nutrition')?.attributes.map((item) => [item.key, item.count]),
  [['LOW_FAT', 7], ['HIGH_FIBER', 7], ['LOW_CALORIE', 4]],
  'nutrition attributes should sort by count and then by label'
);
assert.deepEqual(
  grouped.find((group) => group.key === 'diet')?.attributes.map((item) => item.key),
  ['VEGAN'],
  'diet attributes should be grouped separately'
);
assert.deepEqual(
  grouped.find((group) => group.key === 'context')?.attributes.map((item) => item.key),
  ['SOCIAL_SHARING'],
  'context attributes should be grouped separately'
);
assert.deepEqual(
  grouped.find((group) => group.key === 'other')?.attributes.map((item) => item.label),
  ['Unknown tag'],
  'unknown attributes should have a readable fallback label'
);
assert.equal(
  getMenuAttributeMeta('HIGH_FIBER').label,
  'Nhiều chất xơ',
  'known backend keys should be localized'
);
assert.equal(
  grouped.length,
  MENU_ATTRIBUTE_GROUPS.length,
  'the presentation model should preserve every group for empty-state rendering'
);

console.log('menu attribute presentation tests passed');
