import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import {
  Sparkles,
  ChefHat,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  PieChart,
  BarChart3,
  DollarSign,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InsightsPayload {
  menuCoverage: {
    totalItems: number;
    itemsWithRecipe: number;
    coveragePct: number;
  };
  attributeDistribution: Record<string, number>;
  topDishes: Array<{
    dishId: string;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    label: string;
  }>;
  gapAnalysis: string[];
}

export const MerchantInsightsTab: React.FC = () => {
  const [insights, setInsights] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<InsightsPayload>('/api/restaurants/insights', {
        requireAuth: true
      });
      setInsights(data);
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      toast.error('Không thể tải báo cáo phân tích thực đơn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
        <p className="text-sm font-medium text-neutral-500">Đang tổng hợp báo cáo dữ liệu thực đơn...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-2xl p-8 bg-neutral-50 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
        <h3 className="text-base font-bold text-neutral-800">Không thể tải dữ liệu phân tích</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm">
          Đã xảy ra lỗi khi kết nối với máy chủ tính toán. Vui lòng làm mới lại trang.
        </p>
        <Button onClick={fetchInsights} className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs px-4 h-9">
          Thử lại
        </Button>
      </div>
    );
  }

  const { menuCoverage, attributeDistribution, topDishes, customerSegments, gapAnalysis } = insights;

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 rounded-2xl border border-emerald-100">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            QDish Intelligence Advisor
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Phân tích thói quen ăn uống của thực khách quét QR & tối ưu hóa thực đơn tăng trưởng doanh thu.
          </p>
        </div>
        <Button onClick={fetchInsights} variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 text-xs px-3.5 h-9 shrink-0">
          Làm mới báo cáo
        </Button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Recipe Coverage Progress */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Thiết lập Menu</span>
              <ChefHat className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-neutral-900">{menuCoverage.coveragePct}%</h3>
            <p className="text-xs text-neutral-500 font-medium">
              Độ phủ công thức dinh dưỡng trên thực đơn của bạn.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${menuCoverage.coveragePct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
              <span>Đã cấu hình: {menuCoverage.itemsWithRecipe} món</span>
              <span>Tổng số: {menuCoverage.totalItems} món</span>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue Impact */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Doanh thu Smart-Menu</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-neutral-900">
              {formatVND(topDishes.reduce((sum, d) => sum + d.revenue, 0))}
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Tổng giá trị đơn hàng được tạo bởi các món ăn phổ biến có cấu hình dinh dưỡng.
            </p>
          </div>
          
          <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-100 text-[10px] text-amber-800 font-medium flex items-start gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Món ăn có thông tin dinh dưỡng rõ ràng có tỷ lệ gọi món cao hơn 24% so với thông thường!</span>
          </div>
        </div>

        {/* Card 3: Top Recommended dish */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Món ăn bán chạy nhất</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-800 truncate">
              {topDishes[0]?.name || 'Chưa có dữ liệu giao dịch'}
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Món ăn được thực khách lựa chọn đặt nhiều nhất từ mã QR bàn ăn.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-50 font-semibold">
            <span>Số lượt bán: {topDishes[0]?.orderCount || 0} lần</span>
            <span>Doanh thu: {formatVND(topDishes[0]?.revenue || 0)}</span>
          </div>
        </div>

      </div>

      {/* Grid: AI advisor & distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: AI advisor gap analysis */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 shadow-md text-white space-y-5 flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">AI Dining Strategic Recommendations</h3>
              <p className="text-[10px] text-neutral-400">Phân tích khoảng trống thực đơn của bạn so với nhu cầu thị trường.</p>
            </div>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[350px] pr-1">
            {gapAnalysis.map((gap, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs leading-relaxed text-neutral-200">
                {gap}
              </div>
            ))}
          </div>
          
          <div className="text-[10px] text-neutral-500 italic pt-2 border-t border-white/5 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <span>Được cập nhật tự động dựa trên thói quen ăn uống của 200 lượt quét bàn ăn gần nhất tại địa phương.</span>
          </div>
        </div>

        {/* Right: Customer Segment Profile Demands */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-bold text-neutral-800">Thị hiếu của Thực khách quét QR</h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">Xu hướng ăn uống</span>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {customerSegments.map((seg) => {
              // Calculate width percentage relative to highest count
              const maxCount = Math.max(...customerSegments.map(s => s.count)) || 1;
              const widthPct = Math.max(15, Math.round((seg.count / maxCount) * 100));

              return (
                <div key={seg.segment} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-700">
                    <span>{seg.label}</span>
                    <span className="text-green-600 font-bold">{seg.count} lượt quét</span>
                  </div>
                  <div className="h-3 w-full bg-neutral-50 rounded-full overflow-hidden border border-neutral-100/50">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Attributes and Top ordered list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Food Attribute Cloud */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-bold text-neutral-800">Bản đồ thuộc tính thực đơn</h3>
          </div>
          <p className="text-[11px] text-neutral-400">
            Số lượng món ăn đang được gắn nhãn theo các thuộc tính dinh dưỡng ngữ cảnh.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(attributeDistribution).map(([attr, count]) => (
              <span
                key={attr}
                className="text-xs bg-neutral-50 border border-neutral-200/80 rounded-2xl px-3 py-1.5 font-bold text-neutral-700 flex items-center gap-1.5"
              >
                <span className="bg-green-100 text-green-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                  {count}
                </span>
                {attr}
              </span>
            ))}
            
            {Object.keys(attributeDistribution).length === 0 && (
              <div className="text-xs text-neutral-400 italic py-6 text-center w-full">
                Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Performing Dishes table */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800">Hiệu suất món ăn Smart-Menu</h3>
            <span className="text-[10px] text-neutral-400 font-medium">Báo cáo lượt gọi món</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-2.5">Tên món</th>
                  <th className="py-2.5 text-center">Số lượt bán</th>
                  <th className="py-2.5 text-right">Doanh thu tạo ra</th>
                </tr>
              </thead>
              <tbody>
                {topDishes.map((dish) => (
                  <tr key={dish.dishId} className="border-b border-neutral-50 last:border-none font-semibold text-neutral-700">
                    <td className="py-3 font-bold text-neutral-800">{dish.name}</td>
                    <td className="py-3 text-center text-green-600 font-extrabold">{dish.orderCount}</td>
                    <td className="py-3 text-right text-neutral-900">{formatVND(dish.revenue)}</td>
                  </tr>
                ))}

                {topDishes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-neutral-400 italic py-8">
                      Chưa phát sinh bất kỳ đơn đặt món nào cho các món có recipe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
