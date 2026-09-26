import { TrendingUp } from 'lucide-react';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';

interface SmartMenuPerformancePanelProps {
  topDishes: MerchantInsightsPayload['topDishes'];
  completedOrderCount: number;
  formatVND: (amount: number) => string;
}

export const SmartMenuPerformancePanel = ({
  topDishes,
  completedOrderCount,
  formatVND,
}: SmartMenuPerformancePanelProps) => (
  <div className="space-y-5">
    <div className="flex flex-col justify-between gap-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-100/50 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            Doanh thu Smart-Menu
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-3xl font-black tracking-tight text-neutral-900">
            {formatVND(topDishes.reduce((sum, dish) => sum + dish.revenue, 0))}
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400">từ các món ăn có công thức dinh dưỡng</span>
        </div>
        <p className="max-w-[65ch] text-xs text-neutral-500">
          Tổng giá trị đơn hàng được tạo bởi các món ăn phổ biến có cấu hình dinh dưỡng ngữ cảnh.
        </p>
      </div>

      <div className="flex max-w-sm shrink-0 items-start gap-3 rounded-2xl border border-amber-100/50 bg-amber-50/70 p-4 text-xs font-medium text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          Doanh thu trong báo cáo phản ánh dữ liệu đơn hàng của kỳ đã chọn, không dự báo kết quả trong tương lai.
        </p>
      </div>
    </div>

    <div className="space-y-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-neutral-800">Hiệu suất món ăn Smart-Menu</h3>
        <span className="text-right text-[10px] font-semibold text-neutral-500">{completedOrderCount} đơn đã phục vụ/hoàn tất</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
              <th className="py-2.5">Tên món</th>
              <th className="py-2.5 text-center">Số lượng món đã bán</th>
              <th className="py-2.5 text-right">Doanh thu tạo ra</th>
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
                  Chưa có số lượng món bán cho các món có recipe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
