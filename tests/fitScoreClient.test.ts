import assert from 'node:assert/strict';

import {
  getFitScoreContextLabel,
  getMenuItemIdentity,
  getMillisecondsUntilNextTimeBucket,
  getTimeOfDayBucket,
  getFitScoreTone,
  hasFitScoreProfile,
  selectRecommendationFitScore,
  shouldLoadFitScores,
  type FitScoreSummary
} from '../src/services/fitScorePresentation.ts';
import { loadBatchFitScores } from '../src/services/fitScoreService.ts';
import type { DiningProfile } from '../src/types/index.ts';

const emptyProfile: DiningProfile = {
  goals: [],
  preferences: [],
  allergies: [],
  conditions: []
};

async function testProfileEligibilityAndRequestPayload() {
  assert.equal(hasFitScoreProfile(emptyProfile), false);
  assert.equal(hasFitScoreProfile({ ...emptyProfile, preferences: ['VEGAN'] }), true);

  const requests: Array<{ path: string; options: RequestInit & { requireAuth?: boolean } }> = [];
  const scores = {
    'dish-1': {
      score: 90,
      label: 'Great fit',
      contextType: 'lunch',
      reasons: ['High protein'],
      blocked: false
    }
  };

  const result = await loadBatchFitScores({
    restaurantId: 'restaurant-1',
    profile: {
      ...emptyProfile,
      goals: ['MUSCLE_GAIN'],
      preferences: ['HIGH_PROTEIN'],
      allergies: ['SOY']
    },
    context: { timeOfDay: 'lunch', postWorkout: true },
    fetcher: async <T>(path: string, options?: RequestInit & { requireAuth?: boolean }) => {
      requests.push({ path, options: options ?? {} });
      return { scores } as T;
    }
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].path, '/api/dishes/fit-scores');
  assert.deepEqual(JSON.parse(requests[0].options.body as string), {
    restaurantId: 'restaurant-1',
    userProfile: {
      goals: ['MUSCLE_GAIN'],
      preferences: ['HIGH_PROTEIN'],
      allergies: ['SOY']
    },
    context: { timeOfDay: 'lunch', postWorkout: true }
  });
  assert.equal(requests[0].options.requireAuth, false);
  assert.deepEqual(result, scores);
}

function testFitScoreRequestGate() {
  assert.equal(shouldLoadFitScores({
    fitScoreEnabled: false,
    restaurantId: 'restaurant-1',
    profile: { ...emptyProfile, goals: ['MUSCLE_GAIN'] }
  }), false);
  assert.equal(shouldLoadFitScores({
    fitScoreEnabled: true,
    restaurantId: '',
    profile: { ...emptyProfile, goals: ['MUSCLE_GAIN'] }
  }), false);
  assert.equal(shouldLoadFitScores({
    fitScoreEnabled: true,
    restaurantId: 'restaurant-1',
    profile: emptyProfile
  }), false);
  assert.equal(shouldLoadFitScores({
    fitScoreEnabled: true,
    restaurantId: 'restaurant-1',
    profile: { ...emptyProfile, preferences: ['HIGH_PROTEIN'] }
  }), true);
}

function testFitScoreTones() {
  const summary = (overrides: Partial<FitScoreSummary>): FitScoreSummary => ({
    score: 0,
    label: 'Fit',
    contextType: 'lunch',
    reasons: [],
    blocked: false,
    ...overrides
  });

  assert.deepEqual(getFitScoreTone(summary({ blocked: true, score: 100 })), {
    name: 'blocked', className: 'bg-red-600 text-white'
  });
  assert.deepEqual(getFitScoreTone(summary({ score: 80 })), {
    name: 'high', className: 'bg-emerald-600 text-white'
  });
  assert.deepEqual(getFitScoreTone(summary({ score: 60 })), {
    name: 'medium', className: 'bg-amber-100 text-amber-800'
  });
  assert.deepEqual(getFitScoreTone(summary({ score: 59 })), {
    name: 'low', className: 'bg-neutral-100 text-neutral-700'
  });
}

function testRecommendationScoreSelection() {
  const independent: FitScoreSummary = {
    score: 88,
    label: 'Great fit',
    contextType: 'gym_fit',
    reasons: ['High protein'],
    blocked: false
  };
  const blocked: FitScoreSummary = {
    score: 0,
    label: 'Allergen conflict',
    contextType: 'allergen_block',
    reasons: ['Contains soy'],
    blocked: true,
    blockReason: 'allergen'
  };
  const eligibleProfile: DiningProfile = { ...emptyProfile, goals: ['MUSCLE_GAIN'] };

  assert.equal(selectRecommendationFitScore({
    fitScoreEnabled: true,
    recommendationEnabled: true,
    profile: eligibleProfile,
    independentSummary: independent,
    legacyScore: 73
  }), independent);
  assert.equal(selectRecommendationFitScore({
    fitScoreEnabled: true,
    recommendationEnabled: true,
    profile: eligibleProfile,
    independentSummary: blocked,
    legacyScore: 73
  }), blocked);
  assert.deepEqual(selectRecommendationFitScore({
    fitScoreEnabled: false,
    recommendationEnabled: true,
    profile: eligibleProfile,
    independentSummary: undefined,
    legacyScore: 73
  }), {
    score: 73,
    label: 'Ph\u00f9 h\u1ee3p',
    contextType: 'legacy_recommendation',
    reasons: [],
    blocked: false
  });
  assert.equal(selectRecommendationFitScore({
    fitScoreEnabled: true,
    recommendationEnabled: true,
    profile: eligibleProfile,
    independentSummary: undefined,
    legacyScore: 73
  }), undefined);
  assert.equal(selectRecommendationFitScore({
    fitScoreEnabled: false,
    recommendationEnabled: true,
    profile: emptyProfile,
    independentSummary: undefined,
    legacyScore: 73
  }), undefined);
}

function testTimeBucketSelectionAndRolloverDelay() {
  assert.equal(getTimeOfDayBucket(new Date(2026, 6, 31, 10, 59, 59, 999)), 'breakfast');
  assert.equal(getTimeOfDayBucket(new Date(2026, 6, 31, 11, 0, 0, 0)), 'lunch');
  assert.equal(getTimeOfDayBucket(new Date(2026, 6, 31, 14, 59, 59, 999)), 'lunch');
  assert.equal(getTimeOfDayBucket(new Date(2026, 6, 31, 15, 0, 0, 0)), 'dinner');
  assert.equal(getTimeOfDayBucket(new Date(2026, 6, 31, 20, 59, 59, 999)), 'dinner');
  assert.equal(getTimeOfDayBucket(new Date(2026, 6, 31, 21, 0, 0, 0)), 'late_night');

  assert.equal(getMillisecondsUntilNextTimeBucket(new Date(2026, 6, 31, 10, 59, 59, 500)), 500);
  assert.equal(getMillisecondsUntilNextTimeBucket(new Date(2026, 6, 31, 11, 0, 0, 0)), 4 * 60 * 60 * 1000);
  assert.equal(getMillisecondsUntilNextTimeBucket(new Date(2026, 6, 31, 20, 59, 59, 250)), 750);
  assert.equal(getMillisecondsUntilNextTimeBucket(new Date(2026, 6, 31, 21, 0, 0, 0)), 3 * 60 * 60 * 1000);
}

function testScoreIdentityAndContextLabels() {
  assert.equal(getMenuItemIdentity({ id: 'public-id', _id: 'mongo-id' }), 'public-id');
  assert.equal(getMenuItemIdentity({ _id: 'mongo-id' }), 'mongo-id');
  assert.equal(getMenuItemIdentity({}), undefined);
  assert.equal(getFitScoreContextLabel('gym_fit'), 'T\u1eadp luy\u1ec7n');
  assert.equal(getFitScoreContextLabel('keto_fit'), 'Keto');
  assert.equal(getFitScoreContextLabel('post_workout_fit'), 'Sau t\u1eadp');
  assert.equal(getFitScoreContextLabel('family_sharing_fit'), 'Chia s\u1ebb gia \u0111\u00ecnh');
  assert.equal(getFitScoreContextLabel('date_night_fit'), 'H\u1eb9n h\u00f2');
  assert.equal(getFitScoreContextLabel('general'), 'Ph\u00f9 h\u1ee3p chung');
  assert.equal(getFitScoreContextLabel('unknown_context'), 'Ph\u00f9 h\u1ee3p c\u00e1 nh\u00e2n');
}

await testProfileEligibilityAndRequestPayload();
testFitScoreRequestGate();
testFitScoreTones();
testRecommendationScoreSelection();
testTimeBucketSelectionAndRolloverDelay();
testScoreIdentityAndContextLabels();
console.log('fit score client tests passed');
