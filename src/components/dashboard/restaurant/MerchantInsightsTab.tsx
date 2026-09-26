import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/services/api';
import { loadMerchantInsights, type MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import { getSurveyDataDisclosure, meetsMerchantInsightThreshold } from '@/services/merchantInsightPolicy';
import { Restaurant } from '@/types';
import { toast } from 'sonner';
import {
  InsightsSectionNavigation,
  type InsightsSection,
} from '@/components/dashboard/restaurant/merchant-insights/InsightsSectionNavigation';
import { MenuAttributesPanel } from '@/components/dashboard/restaurant/merchant-insights/MenuAttributesPanel';
import { PeakHoursPanel } from '@/components/dashboard/restaurant/merchant-insights/PeakHoursPanel';
import { QDishIntelligencePanel } from '@/components/dashboard/restaurant/merchant-insights/QDishIntelligencePanel';
import { SmartMenuPerformancePanel } from '@/components/dashboard/restaurant/merchant-insights/SmartMenuPerformancePanel';
import { SurveyTrendsPanel } from '@/components/dashboard/restaurant/merchant-insights/SurveyTrendsPanel';

export const MerchantInsightsTab: React.FC<{ restaurant: Restaurant | null }> = ({ restaurant }) => {
  const [insights, setInsights] = useState<MerchantInsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [period, setPeriod] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<InsightsSection>('qdish-intelligence');

  const features = restaurant?.features || {
    fitScoreEnabled: false,
    foodAttributesEnabled: false,
    recommendationEnabled: false,
    personalizedMenuEnabled: false,
    advancedAnalyticsEnabled: false,
    customerInsightsEnabled: false,
  };

  const isFree = !features.personalizedMenuEnabled;
  const isPlus = features.personalizedMenuEnabled && !features.customerInsightsEnabled;
  const restaurantId = restaurant?.id || (restaurant as (Restaurant & { _id?: string }) | null)?._id;
  const customerInsightsEnabled = features.customerInsightsEnabled === true;

  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (!restaurantId) return;

    if (isRefresh) {
      setRefreshingAI(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await loadMerchantInsights({
        restaurantId,
        period,
        customerInsightsEnabled,
        fetcher: apiFetch,
      });
      setInsights(data);
      if (isRefresh) toast.success('Đã làm mới báo cáo dữ liệu.');
    } catch (error) {
      console.error(isRefresh ? 'Error refreshing AI:' : 'Error fetching insights:', error);
      toast.error(isRefresh
        ? 'Không thể làm mới báo cáo dữ liệu.'
        : 'Không thể tải báo cáo phân tích thực đơn.');
    } finally {
      if (isRefresh) {
        setRefreshingAI(false);
      } else {
        setLoading(false);
      }
    }
  }, [customerInsightsEnabled, period, restaurantId]);

  useEffect(() => {
    if (!isFree) {
      void fetchInsights();
    } else {
      setLoading(false);
    }
  }, [fetchInsights, isFree]);

  if (loading) {
    return (
      <div role="region" aria-label="Phân tích nhà hàng" aria-busy="true" className="flex min-h-[400px] flex-col items-center justify-center">
        <div role="status" className="flex flex-col items-center">
          <Loader2 aria-hidden="true" className="mb-3 h-8 w-8 motion-safe:animate-spin text-green-600" />
          <p className="text-sm font-medium text-neutral-500">Đang tổng hợp báo cáo dữ liệu thực đơn...</p>
        </div>
      </div>
    );
  }

  if (isFree) {
    return (
      <div role="region" aria-label="Phân tích nhà hàng" className="space-y-6">
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
              <Sparkles className="h-5 w-5 text-amber-500 motion-safe:animate-pulse" />
              QDish Intelligence
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Tham khảo dữ liệu hoạt động và xu hướng khảo sát khi tối ưu thực đơn.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-[450px] flex-col items-center justify-center space-y-6 overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 text-center shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent opacity-60" />
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-3xl font-extrabold text-white shadow-xl shadow-indigo-500/20 motion-safe:animate-bounce">
            🔒
          </div>

          <div className="relative z-10 max-w-md space-y-2.5">
            <h3 className="text-xl font-bold tracking-tight text-neutral-900">Tính năng Phân tích chuyên sâu bị khóa</h3>
            <p className="text-xs leading-relaxed text-neutral-500">
              Bạn đang sử dụng gói <strong>FREE</strong>. Tính năng phân tích thực đơn, thị hiếu dinh dưỡng thực khách (Smart Menu Analysis &amp; Customer Insights) chỉ khả dụng từ gói <strong>PLUS</strong> trở lên.
            </p>
          </div>

          <div className="relative z-10 max-w-sm space-y-2 rounded-2xl border border-indigo-100/60 bg-indigo-50/50 p-5 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Đặc quyền gói PLUS &amp; PRO:</span>
            <ul className="list-inside list-disc space-y-1.5 text-[11px] font-medium text-neutral-600">
              <li>Biểu đồ thị hiếu &amp; xu hướng ăn uống của thực khách</li>
              <li>Bản đồ định vị thuộc tính dinh dưỡng thực đơn</li>
              <li>Phân tích khoảng trống thực đơn theo thuộc tính món</li>
              <li>Gợi ý tối ưu thực đơn dựa trên dữ liệu hiện có</li>
            </ul>
          </div>

          <Button onClick={() => { window.location.href = '/owner?tab=billing'; }} className="relative z-10 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform active:scale-[0.98] hover:from-purple-700 hover:to-indigo-700 motion-reduce:transition-none">
            Nâng cấp gói dịch vụ ngay ✨
          </Button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div role="region" aria-label="Phân tích nhà hàng" className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed bg-neutral-50 p-8 text-center">
        <AlertTriangle aria-hidden="true" className="mb-3 h-10 w-10 text-amber-500" />
        <h3 className="text-base font-bold text-neutral-800">Không thể tải dữ liệu phân tích</h3>
        <p className="mt-1 max-w-sm text-xs text-neutral-500">
          Đã xảy ra lỗi khi kết nối với máy chủ tính toán. Vui lòng làm mới lại trang.
        </p>
        <Button onClick={() => { void fetchInsights(); }} className="mt-4 h-9 rounded-xl bg-green-600 px-4 text-xs text-white hover:bg-green-700">
          Thử lại
        </Button>
      </div>
    );
  }

  const surveyResponseCount = insights.surveyResponseCount ?? 0;
  const realSurveyResponseCount = insights.realSurveyResponseCount ?? 0;
  const demoSurveyResponseCount = insights.demoSurveyResponseCount ?? 0;
  const completedOrderCount = insights.completedOrderCount ?? 0;
  const surveyDataDisclosure = getSurveyDataDisclosure({
    customerInsightsEnabled,
    surveyResponseCount,
    realSurveyResponseCount,
    demoSurveyResponseCount,
  });
  const hasEnoughInsightData = meetsMerchantInsightThreshold({
    surveyResponseCount,
    completedOrderCount,
  });
  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

  return (
    <div role="region" aria-label="Phân tích nhà hàng" className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <Sparkles className="h-5 w-5 text-amber-500 motion-safe:animate-pulse" />
            QDish Intelligence
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Tham khảo dữ liệu hoạt động và xu hướng khảo sát khi tối ưu thực đơn.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-emerald-100/50 pt-3 sm:flex-row sm:items-center">
          <div role="group" aria-label="Kỳ báo cáo" className="flex w-fit max-w-full shrink-0 gap-1 overflow-x-auto rounded-xl border border-slate-200/40 bg-slate-100/80 p-1">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'today', label: 'Hôm nay' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'year', label: 'Năm nay' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={period === item.id}
                onClick={() => setPeriod(item.id)}
                className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all motion-reduce:transition-none active:scale-95 ${period === item.id
                  ? 'border border-slate-200/30 bg-white text-slate-800 shadow-[0_1.5px_4px_rgba(0,0,0,0.06)]'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button
            onClick={() => { void fetchInsights(true); }}
            disabled={refreshingAI}
            aria-busy={refreshingAI}
            variant="outline"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border-slate-200 px-3.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 motion-reduce:transition-none active:scale-95"
          >
            <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${refreshingAI ? 'motion-safe:animate-spin' : ''}`} />
            Làm mới báo cáo
          </Button>
        </div>
      </div>

      <InsightsSectionNavigation selectedSection={selectedSection} onChange={setSelectedSection} />

      <div
        key={selectedSection}
        id={`insights-panel-${selectedSection}`}
        role="tabpanel"
        aria-labelledby={`insights-tab-${selectedSection}`}
        tabIndex={0}
        className="min-w-0 space-y-5 outline-none transition-opacity duration-150 motion-reduce:transition-none"
      >
        {selectedSection === 'qdish-intelligence' && (
          <QDishIntelligencePanel
            customerSegments={insights.customerSegments}
            gapAnalysis={insights.gapAnalysis}
            surveyResponseCount={surveyResponseCount}
            completedOrderCount={completedOrderCount}
            topDishes={insights.topDishes}
            isPlus={isPlus}
            refreshingAI={refreshingAI}
            hasEnoughInsightData={hasEnoughInsightData}
            formatVND={formatVND}
          />
        )}
        {selectedSection === 'survey-trends' && (
          <SurveyTrendsPanel
            customerSegments={insights.customerSegments}
            surveyDataDisclosure={surveyDataDisclosure}
            isPlus={isPlus}
          />
        )}
        {selectedSection === 'peak-hours' && (
          <PeakHoursPanel peakHours={insights.peakHours} isPlus={isPlus} />
        )}
        {selectedSection === 'menu-attributes' && (
          <MenuAttributesPanel attributeDistribution={insights.attributeDistribution} />
        )}
        {selectedSection === 'smart-menu-performance' && (
          <SmartMenuPerformancePanel
            topDishes={insights.topDishes}
            completedOrderCount={completedOrderCount}
            formatVND={formatVND}
          />
        )}
      </div>
    </div>
  );
};
