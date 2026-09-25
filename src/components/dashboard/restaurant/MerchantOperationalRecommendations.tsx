import React from 'react';
import { AlertTriangle, Clock3, Lightbulb, TrendingUp } from 'lucide-react';

import type { RestaurantStats } from '@/types';
import {
  buildOperationalRecommendations,
  MerchantOperationalRecommendation
} from './insightRecommendations';

interface MerchantOperationalRecommendationsProps {
  stats: RestaurantStats | null;
  isLoadingStats: boolean;
}

const toneStyles: Record<MerchantOperationalRecommendation['tone'], {
  wrapper: string;
  icon: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}> = {
  info: {
    wrapper: 'border-blue-100 bg-blue-50/60',
    icon: 'bg-blue-100 text-blue-700',
    Icon: Lightbulb
  },
  warning: {
    wrapper: 'border-amber-100 bg-amber-50/70',
    icon: 'bg-amber-100 text-amber-700',
    Icon: AlertTriangle
  },
  positive: {
    wrapper: 'border-emerald-100 bg-emerald-50/70',
    icon: 'bg-emerald-100 text-emerald-700',
    Icon: TrendingUp
  }
};

const RecommendationSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-3" aria-label="Đang tạo đề xuất vận hành" aria-busy="true">
    {[0, 1, 2].map((item) => (
      <div key={item} className="h-32 animate-pulse rounded-2xl bg-neutral-100" aria-hidden="true" />
    ))}
  </div>
);

export const MerchantOperationalRecommendations: React.FC<MerchantOperationalRecommendationsProps> = ({ stats, isLoadingStats }) => {
  if (isLoadingStats) return <RecommendationSkeleton />;

  const recommendations = buildOperationalRecommendations(stats);
  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-3" aria-label="Đề xuất vận hành">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Đề xuất hôm nay</p>
          <h2 className="mt-1 text-base font-bold text-neutral-900">Biến số liệu thành việc nên làm</h2>
        </div>
        <Clock3 className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {recommendations.map((recommendation) => {
          const style = toneStyles[recommendation.tone];
          const Icon = style.Icon;

          return (
            <article key={recommendation.id} className={`min-w-0 rounded-2xl border p-4 ${style.wrapper}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${style.icon}`}>
                <Icon className="h-4 w-4" aria-hidden={true} />
              </div>
              <h3 className="mt-3 text-xs font-extrabold text-neutral-900">{recommendation.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600">{recommendation.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
