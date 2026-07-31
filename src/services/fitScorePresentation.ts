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

export interface FitScoreTone {
  name: 'blocked' | 'high' | 'medium' | 'low';
  className: string;
}

export function hasFitScoreProfile(profile: DiningProfile): boolean {
  return profile.goals.length > 0 || profile.preferences.length > 0;
}

export function getFitScoreTone(summary: FitScoreSummary): FitScoreTone {
  if (summary.blocked) return { name: 'blocked', className: 'bg-red-600 text-white' };
  if (summary.score >= 80) return { name: 'high', className: 'bg-emerald-600 text-white' };
  if (summary.score >= 60) return { name: 'medium', className: 'bg-amber-100 text-amber-800' };
  return { name: 'low', className: 'bg-neutral-100 text-neutral-700' };
}
