import type { DiningProfile } from '@/types';

export interface FitScoreSummary {
  score: number;
  label: string;
  contextType: string;
  reasons: string[];
  blocked: boolean;
  blockReason?: 'allergen';
}

export type FitScoreMap = Record<string, FitScoreSummary>;
export type TimeOfDayBucket = 'breakfast' | 'lunch' | 'dinner' | 'late_night';

export interface FitScoreTone {
  name: 'blocked' | 'high' | 'medium' | 'low';
  className: string;
}

export function hasFitScoreProfile(profile: DiningProfile): boolean {
  return profile.goals.length > 0 || profile.preferences.length > 0;
}

export function shouldLoadFitScores(input: {
  fitScoreEnabled?: boolean;
  restaurantId?: string;
  profile: DiningProfile;
}): boolean {
  return Boolean(input.fitScoreEnabled && input.restaurantId && hasFitScoreProfile(input.profile));
}

export function getMenuItemIdentity(item?: { id?: string; _id?: string }): string | undefined {
  return item?.id || item?._id;
}

export function getTimeOfDayBucket(date: Date): TimeOfDayBucket {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'late_night';
}

export function getMillisecondsUntilNextTimeBucket(date: Date): number {
  const nextBoundary = new Date(date);
  const hour = date.getHours();

  if (hour < 11) {
    nextBoundary.setHours(11, 0, 0, 0);
  } else if (hour < 15) {
    nextBoundary.setHours(15, 0, 0, 0);
  } else if (hour < 21) {
    nextBoundary.setHours(21, 0, 0, 0);
  } else {
    nextBoundary.setDate(nextBoundary.getDate() + 1);
    nextBoundary.setHours(0, 0, 0, 0);
  }

  return Math.max(0, nextBoundary.getTime() - date.getTime());
}

const FIT_SCORE_CONTEXT_LABELS: Record<string, string> = {
  gym_fit: 'T\u1eadp luy\u1ec7n',
  keto_fit: 'Keto',
  quick_lunch_fit: 'B\u1eefa \u0103n nh\u1eb9',
  office_lunch_fit: 'B\u1eefa tr\u01b0a v\u0103n ph\u00f2ng',
  late_night_fit: 'B\u1eefa khuya',
  energy_boost_fit: 'T\u0103ng n\u0103ng l\u01b0\u1ee3ng',
  post_workout_fit: 'Sau t\u1eadp',
  family_sharing_fit: 'Chia s\u1ebb gia \u0111\u00ecnh',
  date_night_fit: 'H\u1eb9n h\u00f2',
  general: 'Ph\u00f9 h\u1ee3p chung',
  legacy_recommendation: 'G\u1ee3i \u00fd c\u00e1 nh\u00e2n'
};

export function getFitScoreContextLabel(contextType: string): string {
  return FIT_SCORE_CONTEXT_LABELS[contextType] ?? 'Ph\u00f9 h\u1ee3p c\u00e1 nh\u00e2n';
}

export function selectRecommendationFitScore(input: {
  fitScoreEnabled?: boolean;
  recommendationEnabled?: boolean;
  profile: DiningProfile;
  independentSummary?: FitScoreSummary;
  legacyScore?: number;
}): FitScoreSummary | undefined {
  if (input.fitScoreEnabled) {
    return input.independentSummary;
  }

  if (
    !input.recommendationEnabled
    || !hasFitScoreProfile(input.profile)
    || typeof input.legacyScore !== 'number'
    || !Number.isFinite(input.legacyScore)
  ) {
    return undefined;
  }

  return {
    score: input.legacyScore,
    label: 'Ph\u00f9 h\u1ee3p',
    contextType: 'legacy_recommendation',
    reasons: [],
    blocked: false
  };
}

export function getFitScoreTone(summary: FitScoreSummary): FitScoreTone {
  if (summary.blocked) return { name: 'blocked', className: 'bg-red-600 text-white' };
  if (summary.score >= 80) return { name: 'high', className: 'bg-emerald-600 text-white' };
  if (summary.score >= 60) return { name: 'medium', className: 'bg-amber-100 text-amber-800' };
  return { name: 'low', className: 'bg-neutral-100 text-neutral-700' };
}
