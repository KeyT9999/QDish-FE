import type { FitScoreSummary } from '@/services/fitScorePresentation';
import { getFitScoreTone } from '@/services/fitScorePresentation';

export function FitScoreBadge({
  summary,
  loading = false,
}: {
  summary?: FitScoreSummary;
  loading?: boolean;
}) {
  if (loading) {
    return <span className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />;
  }

  if (!summary) return null;

  if (summary.blocked) {
    return <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white">Có dị ứng</span>;
  }

  if (summary.isScoreReliable === false) {
    return <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600">Nutrition data incomplete</span>;
  }

  const tone = getFitScoreTone(summary);

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${tone.className}`}>
      {summary.score}% phù hợp
    </span>
  );
}
