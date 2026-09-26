import { Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';

interface PeakHoursPanelProps {
  peakHours: MerchantInsightsPayload['peakHours'];
  isPlus: boolean;
}

export const PeakHoursPanel = ({ peakHours, isPlus }: PeakHoursPanelProps) => (
  <div className="relative flex min-h-[300px] flex-col justify-between space-y-4 overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
    <div className={isPlus ? 'flex flex-1 select-none flex-col space-y-4 blur-[3px] pointer-events-none' : 'flex flex-1 flex-col space-y-4'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-neutral-800">Khung giờ đặt món (Peak Hours)</h3>
        </div>
        <span className="text-[10px] font-medium text-neutral-400">Báo cáo khung giờ</span>
      </div>

      <div className="max-h-[350px] space-y-3.5 overflow-y-auto pr-1">
        {peakHours.periods.map((period) => {
          const maxCount = Math.max(...(peakHours.periods.map((item) => item.count) || [1])) || 1;
          const widthPct = Math.max(15, Math.round((period.count / maxCount) * 100));

          return (
            <div key={period.period} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-neutral-700">
                <span>{period.period}</span>
                <span className="font-bold text-indigo-600">{period.count} đơn ({period.percentage}%)</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full border border-neutral-100/50 bg-neutral-50">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600" style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-3 text-[11px] font-medium text-indigo-800">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
          <span>Khung giờ cao điểm:</span>
        </span>
        <strong className="rounded-lg border border-indigo-200/30 bg-white px-2 py-0.5 text-xs text-indigo-900 shadow-sm">
          {(() => {
            if (!peakHours.hourly) return 'Chưa có';
            const maxHour = peakHours.hourly.indexOf(Math.max(...peakHours.hourly));
            return `${maxHour}:00 - ${maxHour + 1}:00`;
          })()}
        </strong>
      </div>
    </div>

    {isPlus && (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-white/70 p-6 text-center backdrop-blur-[1.5px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-xl text-white shadow-lg shadow-indigo-500/20 motion-safe:animate-pulse">🔒</div>
        <div className="max-w-[280px] space-y-1.5">
          <h4 className="text-sm font-bold text-neutral-900">Tính năng Phân tích giờ vàng bị khóa</h4>
          <p className="text-xs leading-normal text-neutral-500">
            Biểu đồ phân tích khung giờ đặt món và mật độ gọi món cao điểm chỉ dành cho khách hàng đăng ký gói <strong>PRO</strong>.
          </p>
        </div>
        <Button onClick={() => { window.location.href = '/owner?tab=billing'; }} className="h-9 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-transform active:scale-95 hover:from-purple-700 hover:to-indigo-700 motion-reduce:transition-none">
          Nâng cấp gói PRO ngay ✨
        </Button>
      </div>
    )}
  </div>
);
