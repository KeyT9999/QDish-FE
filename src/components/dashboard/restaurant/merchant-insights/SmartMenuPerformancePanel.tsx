import { TrendingUp } from 'lucide-react';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';

interface SmartMenuPerformancePanelProps {
  topDishes: MerchantInsightsPayload['topDishes'];
  completedOrderCount: number | null;
  formatVND: (amount: number) => string;
}

export const SmartMenuPerformancePanel = ({
  topDishes,
  completedOrderCount,
  formatVND,
}: SmartMenuPerformancePanelProps) => {
  const { t } = useOwnerConsoleLocale();
  return (
  <div className="space-y-5">
    <div className="flex flex-col justify-between gap-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-100/50 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            {t('Doanh thu Smart-Menu')}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-3xl font-black tracking-tight text-neutral-900">
            {formatVND(topDishes.reduce((sum, dish) => sum + dish.revenue, 0))}
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400">{t('từ các món ăn có công thức dinh dưỡng')}</span>
        </div>
        <p className="max-w-[65ch] text-xs text-neutral-500">
          {t('Tổng giá trị đơn hàng được tạo bởi các món phổ biến có cấu hình dinh dưỡng.')}
        </p>
      </div>

      <div className="flex max-w-sm shrink-0 items-start gap-3 rounded-2xl border border-amber-100/50 bg-amber-50/70 p-4 text-xs font-medium text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          {t('Doanh thu phản ánh đơn hàng trong kỳ đã chọn và không dự báo kết quả tương lai.')}
        </p>
      </div>
    </div>

    <div className="space-y-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-neutral-800">{t('Hiệu suất món ăn Smart-Menu')}</h3>
        {completedOrderCount === null ? (
          <span className="text-right text-[10px] font-semibold text-neutral-500">
            {t('Số đơn đã phục vụ hoặc hoàn tất chỉ có trên gói PRO.')}
          </span>
        ) : (
          <span className="text-right text-[10px] font-semibold text-neutral-500">{t('{count} orders served or completed', { count: completedOrderCount })}</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
              <th className="py-2.5">{t('Tên món')}</th>
              <th className="py-2.5 text-center">{t('Số lượng món đã bán')}</th>
              <th className="py-2.5 text-right">{t('Doanh thu tạo ra')}</th>
            </tr>
          </thead>
          <tbody>
            {topDishes.map((dish) => (
              <tr key={dish.dishId} className="border-b border-neutral-50 font-semibold text-neutral-700 last:border-none">
                <td className="py-3 font-bold text-neutral-800">{dish.name}</td>
                <td className="py-3 text-center font-extrabold text-green-600">{dish.orderCount}</td>
                <td className="py-3 text-right text-neutral-900">{formatVND(dish.revenue)}</td>
              </tr>
            ))}

            {topDishes.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center italic text-neutral-400">
                  {t('Chưa có số liệu bán cho các món có công thức.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};
