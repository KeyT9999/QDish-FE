import type { FitScoreSummary } from '@/services/fitScorePresentation';
import { getFitScoreContextLabel } from '@/services/fitScorePresentation';

export function FitScorePanel({
  summary,
  onEditProfile,
}: {
  summary: FitScoreSummary;
  onEditProfile: () => void;
}) {
  if (summary.blocked) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <h3 className="font-bold text-red-700">Có thành phần gây dị ứng</h3>
        <p className="mt-1 text-xs text-red-600">{summary.reasons[0]}</p>
        <button type="button" onClick={onEditProfile} className="mt-3 text-xs font-bold text-red-700">
          Cập nhật sở thích
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
      <div className="flex items-baseline gap-2">
        <strong className="text-2xl text-emerald-700">{summary.score}%</strong>
        <span className="text-xs font-bold text-emerald-800">{summary.label}</span>
      </div>
      <p className="mt-1 text-xs font-semibold text-emerald-800/80">
        {'Ng\u1eef c\u1ea3nh: '}{getFitScoreContextLabel(summary.contextType)}
      </p>
      <ul className="mt-3 space-y-1 text-xs text-neutral-600">
        {summary.reasons.slice(0, 3).map((reason) => <li key={reason}>• {reason}</li>)}
      </ul>
      <button type="button" onClick={onEditProfile} className="mt-3 text-xs font-bold text-emerald-700">
        Cập nhật sở thích
      </button>
    </section>
  );
}
