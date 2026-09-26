import { BarChart3, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import { getSurveyDataDisclosure } from '@/services/merchantInsightPolicy';

type SurveyDataDisclosure = NonNullable<ReturnType<typeof getSurveyDataDisclosure>>;

interface SurveyTrendsPanelProps {
  customerSegments: MerchantInsightsPayload['customerSegments'];
  surveyDataDisclosure: SurveyDataDisclosure | null;
  isPlus: boolean;
}

export const SurveyTrendsPanel = ({
  customerSegments,
  surveyDataDisclosure,
  isPlus,
}: SurveyTrendsPanelProps) => (
  <div className="space-y-5">
    {surveyDataDisclosure && (
      <div
        role="note"
        aria-label="Nguồn dữ liệu khảo sát"
        className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div className="space-y-1">
          <p className="font-bold">Minh bạch dữ liệu khảo sát</p>
          <p>
            Trong kỳ đã chọn, báo cáo gồm {surveyDataDisclosure.surveyResponseCount} lượt khảo sát: {surveyDataDisclosure.realSurveyResponseCount} phản hồi thực tế và {surveyDataDisclosure.demoSurveyResponseCount} phản hồi mẫu.
          </p>
          <p>
            {surveyDataDisclosure.hasDemoResponses
              ? 'Phản hồi mẫu trong kỳ được thêm cho mục đích trình diễn và không phải dữ liệu khách hàng thật.'
              : 'Kỳ đã chọn không có phản hồi khảo sát mẫu.'}
          </p>
        </div>
      </div>
    )}

    <div className="relative flex min-h-[300px] flex-col justify-between space-y-4 overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className={isPlus ? 'flex flex-1 select-none flex-col space-y-4 blur-[3px] pointer-events-none' : 'flex flex-1 flex-col space-y-4'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-bold text-neutral-800">Xu hướng từ lượt khảo sát QR</h3>
          </div>
          <span className="text-[10px] font-medium text-neutral-400">Xu hướng ăn uống</span>
        </div>

        <div className="max-h-[350px] space-y-3.5 overflow-y-auto pr-1">
          {customerSegments.map((segment) => {
            const maxCount = Math.max(...customerSegments.map((item) => item.count)) || 1;
            const widthPct = Math.max(15, Math.round((segment.count / maxCount) * 100));

            return (
              <div key={segment.segment} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-neutral-700">
                  <span>{segment.label}</span>
                  <span className="font-bold text-green-600">{segment.count} lượt lựa chọn</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-neutral-100/50 bg-neutral-50">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: `${widthPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isPlus && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-white/70 p-6 text-center backdrop-blur-[1.5px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-xl text-white shadow-lg shadow-indigo-500/20 motion-safe:animate-pulse">🔒</div>
          <div className="max-w-[280px] space-y-1.5">
            <h4 className="text-sm font-bold text-neutral-900">Xu hướng khảo sát chuyên sâu bị khóa</h4>
            <p className="text-xs leading-normal text-neutral-500">
              Biểu đồ phân tích sâu các lựa chọn trong khảo sát QR chỉ khả dụng cho gói <strong>PRO</strong>. Nâng cấp để theo dõi xu hướng ăn uống tại nhà hàng!
            </p>
          </div>
          <Button onClick={() => { window.location.href = '/owner?tab=billing'; }} className="h-9 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-transform active:scale-95 hover:from-purple-700 hover:to-indigo-700 motion-reduce:transition-none">
            Nâng cấp gói PRO ngay ✨
          </Button>
        </div>
      )}
    </div>
  </div>
);
