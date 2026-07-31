import type { DiningProfile } from '@/types';
import type { apiFetch } from './api';
import type { FitScoreMap } from './fitScorePresentation';

export async function loadBatchFitScores(input: {
  restaurantId: string;
  profile: DiningProfile;
  context: { timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'late_night'; postWorkout: boolean };
  fetcher: typeof apiFetch;
}): Promise<FitScoreMap> {
  const response = await input.fetcher<{ scores: FitScoreMap }>('/api/dishes/fit-scores', {
    method: 'POST',
    requireAuth: false,
    body: JSON.stringify({
      restaurantId: input.restaurantId,
      userProfile: {
        goals: input.profile.goals,
        preferences: input.profile.preferences,
        allergies: input.profile.allergies
      },
      context: input.context
    })
  });

  return response.scores;
}
