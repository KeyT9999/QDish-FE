import { ChefHat, Info, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import { toast } from 'sonner';

interface QDishIntelligencePanelProps {
  customerSegments: MerchantInsightsPayload['customerSegments'];
  gapAnalysis: MerchantInsightsPayload['gapAnalysis'];
  surveyResponseCount: number;
  completedOrderCount: number;
  topDishes: MerchantInsightsPayload['topDishes'];
  isPlus: boolean;
  refreshingAI: boolean;
  hasEnoughInsightData: boolean;
  formatVND: (amount: number) => string;
}

export const QDishIntelligencePanel = ({
  customerSegments,
  gapAnalysis,
  surveyResponseCount,
  completedOrderCount,
  topDishes,
  isPlus,
  refreshingAI,
  hasEnoughInsightData,
  formatVND,
}: QDishIntelligencePanelProps) => {
  const healthyCount = customerSegments
    .filter((segment) => ['LIGHT_MEAL', 'BALANCED', 'WEIGHT_LOSS'].includes(segment.segment))
    .reduce((sum, segment) => sum + segment.count, 0);
  const gapCount = gapAnalysis.filter((gap) => !gap.includes('Thực đơn của bạn')).length;

  const getMissingCategory = () => {
    if (gapAnalysis.length === 0) return 'Đầy đủ ✨';
    const firstGap = gapAnalysis[0] || '';
    if (firstGap.includes('Giàu Đạm') || firstGap.includes('HIGH_PROTEIN')) return 'Giàu Đạm 🍗';
    if (firstGap.includes('Chay') || firstGap.includes('VEGETARIAN')) return 'Đồ Chay 🌱';
    if (firstGap.includes('Ăn nhanh') || firstGap.includes('QUICK_BITE')) return 'Ăn Nhẹ ⏱️';
    if (firstGap.includes('Ít đường') || firstGap.includes('LOW_SUGAR')) return 'Ít Đường 🍬';
    return 'Thực Đơn 📋';
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div
        style={{
          backgroundImage: 'linear-gradient(135deg, #f8fffb 0%, #ffffff 50%, #f0fdf4 100%)',
          border: '1px solid rgba(22, 163, 74, 0.12)',
          boxShadow: '0 20px 40px rgba(22, 163, 74, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        className="relative flex flex-col space-y-5 overflow-hidden rounded-3xl p-6 lg:col-span-3"
      >
        <div className={isPlus ? 'flex flex-1 select-none flex-col space-y-5 blur-[3px] pointer-events-none' : 'flex flex-1 flex-col space-y-5'}>
          <div className="flex flex-col justify-between gap-3 border-b border-green-600/10 pb-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-neutral-800">
                  <Sparkles className="h-4 w-4 fill-amber-400 text-amber-500 motion-safe:animate-pulse" />
                  QDish Intelligence
                </h3>
                <span className="inline-flex rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-extrabold text-[#15803d]">
                  BẢN DEMO
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Bản demo tóm tắt dữ liệu khảo sát và hoạt động đặt món.
              </p>
            </div>
          </div>

          {refreshingAI ? (
            <div className="space-y-5 motion-safe:animate-pulse" aria-label="Đang làm mới báo cáo">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="h-16 rounded-2xl bg-emerald-50/60" />
                <div className="h-16 rounded-2xl bg-emerald-50/60" />
                <div className="h-16 rounded-2xl bg-emerald-50/60" />
              </div>
              <div className="h-24 rounded-2xl bg-neutral-100 p-4" />
              <div className="space-y-3">
                <div className="h-20 rounded-2xl bg-neutral-100" />
                <div className="h-20 rounded-2xl bg-neutral-100" />
                <div className="h-20 rounded-2xl bg-neutral-100" />
              </div>
            </div>
          ) : !hasEnoughInsightData ? (
            <div className="flex flex-col items-center justify-center space-y-4 px-4 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-4xl motion-safe:animate-bounce">
                🥦
              </div>
              <div className="max-w-sm space-y-2">
                <h4 className="text-xs font-bold text-neutral-800">Cần thêm dữ liệu hoạt động</h4>
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  Để mở phần phân tích, nhà hàng cần tối thiểu <strong>20 lượt khảo sát QR</strong> và <strong>10 đơn đã phục vụ/hoàn tất</strong>.
                </p>
                <div className="flex justify-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50/50 p-2 text-[10px] font-bold text-neutral-400">
                  <span>Lượt khảo sát: {surveyResponseCount}/20</span>
                  <span>Đơn đã phục vụ/hoàn tất: {completedOrderCount}/10</span>
                </div>
              </div>
              <Button
                variant="link"
                className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                onClick={() => toast.info('Đây là bản demo minh họa cách tổng hợp dữ liệu khảo sát và thực đơn.')}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Chỉ số minh họa</span>
                    <div className="flex items-center gap-0.5 text-sm font-black text-emerald-600">+18%</div>
                    <span className="block text-[9px] leading-relaxed text-neutral-500">Không phải dự báo hay cam kết doanh thu</span>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-1.5"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Thiếu danh mục</span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600">{getMissingCategory()}</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-1.5"><ChefHat className="h-4 w-4 text-amber-500" /></div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Mức ưu tiên</span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-red-600">Cao 🎯</div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-1.5"><ShieldCheck className="h-4 w-4 text-red-500" /></div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-base">🤖</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-800">QDish Intelligence Demo</span>
                    <span className="text-[9px] font-medium text-neutral-400">Nội dung minh họa</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-neutral-600">
                    Báo cáo gồm <strong>{surveyResponseCount} lượt khảo sát QR</strong> và <strong>{completedOrderCount} đơn đã phục vụ/hoàn tất</strong>. Nhóm mục tiêu ăn uống lành mạnh có <strong>{healthyCount} lượt lựa chọn</strong>. Thực đơn có <strong>{gapCount} điểm cần xem xét</strong>. Các gợi ý và chỉ số trên màn hình là nội dung minh họa, không phải dự báo hay cam kết doanh thu.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Đề xuất tối ưu thực đơn</span>
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-100 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:shadow-md motion-reduce:transition-none sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-base">🍗</div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-neutral-800">{gapAnalysis[0]?.includes('Chay') ? 'Bổ sung món chay / thuần chay' : 'Bổ sung món ăn Giàu Đạm'}</h4>
                      <p className="text-[11px] leading-relaxed text-neutral-500">{gapAnalysis[0] || 'Menu đang thiếu hụt món ăn chứa lượng dinh dưỡng phù hợp cho nhu cầu thực khách.'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0 self-end rounded-xl border-emerald-100 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 sm:self-auto" onClick={() => toast.success('Đang chuyển tới Recipe Builder để thêm nguyên liệu...')}>
                    Xem gợi ý món
                  </Button>
                </div>

                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-100 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:shadow-md motion-reduce:transition-none sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-green-100 bg-green-50 text-base">🥗</div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-neutral-800">Healthy đang tăng trưởng</h4>
                      <p className="text-[11px] leading-relaxed text-neutral-500">Mục tiêu ăn uống Healthy được chọn <strong>{healthyCount} lượt</strong> trong khảo sát. Hãy tối ưu các tag Calo.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0 self-end rounded-xl border-emerald-100 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 sm:self-auto" onClick={() => toast.success('Đang mở chi tiết phân khúc khách hàng...')}>
                    Xem dữ liệu
                  </Button>
                </div>

                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-100 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:shadow-md motion-reduce:transition-none sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-base">💰</div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-neutral-800">Món bán tốt nhất: {topDishes[0]?.name || 'N/A'}</h4>
                      <p className="text-[11px] leading-relaxed text-neutral-500">Mang lại <strong>{formatVND(topDishes[0]?.revenue || 0)}</strong> doanh thu. Đề xuất ghim món này lên đầu thực đơn QR.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0 self-end rounded-xl border-emerald-100 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 sm:self-auto" onClick={() => toast.success('Đang mở báo cáo chi tiết doanh thu món ăn...')}>
                    Chi tiết
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!refreshingAI && hasEnoughInsightData && (
            <div className="flex items-center gap-1.5 border-t border-green-600/10 pt-2 text-[10px] italic text-neutral-400">
              <Info className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span>Báo cáo có thể gồm khảo sát mẫu đã gắn nhãn; số liệu đơn hàng và doanh thu lấy từ dữ liệu vận hành. Gợi ý chỉ mang tính tham khảo.</span>
            </div>
          )}
        </div>

        {isPlus && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-white/70 p-6 text-center backdrop-blur-[1.5px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-xl text-white shadow-lg shadow-indigo-500/20 motion-safe:animate-pulse">🔒</div>
            <div className="max-w-[280px] space-y-1.5">
              <h4 className="text-sm font-bold text-neutral-900">Tính năng QDish Intelligence bị khóa</h4>
              <p className="text-xs leading-normal text-neutral-500">
                Phân tích khoảng trống thực đơn và đề xuất món ăn chỉ khả dụng cho gói <strong>PRO</strong>. Các kết quả tham khảo không bảo đảm mức tăng trưởng doanh thu.
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
};
