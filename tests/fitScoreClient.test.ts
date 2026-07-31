import assert from 'node:assert/strict';

import {
  getFitScoreTone,
  hasFitScoreProfile,
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

await testProfileEligibilityAndRequestPayload();
testFitScoreRequestGate();
testFitScoreTones();
console.log('fit score client tests passed');
