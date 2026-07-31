import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { Restaurant } from '@/types';
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
  Info,
  RefreshCw,
  Check,
  Clock
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
  surveyResponseCount?: number;
  gapAnalysis: string[];
  peakHours: {
    periods: Array<{
      period: string;
      count: number;
      percentage: number;
    }>;
    hourly: number[];
  };
}

const attributeLabels: Record<string, { label: string; description: string; color: string; countColor: string }> = {
  LIGHT_MEAL: { label: 'Ăn nhẹ', description: 'Món ăn thanh đạm, ít calo', color: 'bg-teal-50 text-teal-700 border-teal-200/40', countColor: 'bg-teal-100/80 text-teal-800' },
  LOW_SUGAR: { label: 'Ít đường', description: 'Hàm lượng đường thấp, phù hợp ăn kiêng', color: 'bg-sky-50 text-sky-700 border-sky-200/40', countColor: 'bg-sky-100/80 text-sky-800' },
  LOW_CALORIE: { label: 'Ít Calo', description: 'Lượng calo thấp, tốt cho giảm cân', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/40', countColor: 'bg-emerald-100/80 text-emerald-800' },
  LOW_FAT: { label: 'Ít béo', description: 'Hàm lượng chất béo thấp', color: 'bg-blue-50 text-blue-700 border-blue-200/40', countColor: 'bg-blue-100/80 text-blue-800' },
  VEGETARIAN: { label: 'Món chay', description: 'Không chứa thịt, cá', color: 'bg-green-50 text-green-700 border-green-200/40', countColor: 'bg-green-100/80 text-green-800' },
  VEGAN: { label: 'Thuần chay', description: 'Hoàn toàn từ thực vật, không bơ sữa trứng', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/40', countColor: 'bg-emerald-100/80 text-emerald-800' },
  GLUTEN_FREE: { label: 'Không Gluten', description: 'Không chứa bột mì hoặc gluten', color: 'bg-amber-50 text-amber-700 border-amber-200/40', countColor: 'bg-amber-100/80 text-amber-800' },
  DAIRY_FREE: { label: 'Không bơ sữa', description: 'Không chứa sữa hoặc chế phẩm từ sữa', color: 'bg-pink-50 text-pink-700 border-pink-200/40', countColor: 'bg-pink-100/80 text-pink-800' },
  QUICK_BITE: { label: 'Ăn nhanh', description: 'Tiện lợi, ăn nhanh gọn', color: 'bg-purple-50 text-purple-700 border-purple-200/40', countColor: 'bg-purple-100/80 text-purple-800' },
  HIGH_PROTEIN: { label: 'Giàu đạm', description: 'Hàm lượng protein cao, tốt cho cơ bắp', color: 'bg-orange-50 text-orange-700 border-orange-200/40', countColor: 'bg-orange-100/80 text-orange-800' },
  VERY_HIGH_PROTEIN: { label: 'Cực giàu đạm', description: 'Hàm lượng protein rất cao', color: 'bg-red-50 text-red-700 border-red-200/40', countColor: 'bg-red-100/80 text-red-800' },
  POST_WORKOUT: { label: 'Sau tập luyện', description: 'Phục hồi thể lực và cơ bắp sau tập thể thao', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/40', countColor: 'bg-indigo-100/80 text-indigo-800' },
  OFFICE_LUNCH: { label: 'Trưa văn phòng', description: 'Bữa trưa đầy đủ dinh dưỡng, nhanh gọn cho dân công sở', color: 'bg-slate-50 text-slate-700 border-slate-200/40', countColor: 'bg-slate-200 text-slate-800' },
};

export const MerchantInsightsTab: React.FC<{ restaurant: Restaurant | null }> = ({ restaurant }) => {
  const [insights, setInsights] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [period, setPeriod] = useState<string>('all');

  const features = restaurant?.features || {
    fitScoreEnabled: false,
    foodAttributesEnabled: false,
    recommendationEnabled: false,
    personalizedMenuEnabled: false,
    advancedAnalyticsEnabled: false,
    customerInsightsEnabled: false
  };

  const isFree = !features.personalizedMenuEnabled;
  const isPlus = features.personalizedMenuEnabled && !features.advancedAnalyticsEnabled;

  const fetchInsights = async () => {
    const restId = restaurant?.id || (restaurant as any)?._id;
    if (!restId) return;
    setLoading(true);
    try {
      const data = await apiFetch<InsightsPayload>(`/api/restaurants/insights?restaurantId=${restId}&period=${period}`, {
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

  const handleRefreshAI = async () => {
    const restId = restaurant?.id || (restaurant as any)?._id;
    if (!restId) return;
    setRefreshingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const data = await apiFetch<InsightsPayload>(`/api/restaurants/insights?restaurantId=${restId}&period=${period}`, {
        requireAuth: true
      });
      setInsights(data);
      toast.success('Đã cập nhật phân tích AI mới nhất!');
    } catch (err: any) {
      console.error('Error refreshing AI:', err);
      toast.error('Không thể cập nhật phân tích AI.');
    } finally {
      setRefreshingAI(false);
    }
  };

  useEffect(() => {
    if (!isFree) {
      fetchInsights();
    } else {
      setLoading(false);
    }
  }, [isFree, period]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
        <p className="text-sm font-medium text-neutral-500">Đang tổng hợp báo cáo dữ liệu thực đơn...</p>
      </div>
    );
  }

  if (isFree) {
    return (
      <div className="space-y-6">
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
        </div>

        <div className="relative border border-neutral-200/80 rounded-3xl p-8 bg-white shadow-xl overflow-hidden flex flex-col items-center justify-center min-h-[450px] text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent opacity-60" />
          
          <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-indigo-500/20 animate-bounce">
            🔒
          </div>

          <div className="relative z-10 space-y-2.5 max-w-md">
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Tính năng Phân tích chuyên sâu bị khóa</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Bạn đang sử dụng gói <strong>FREE</strong>. Tính năng phân tích thực đơn, thị hiếu dinh dưỡng thực khách (Smart Menu Analysis & Customer Insights) chỉ khả dụng từ gói <strong>PLUS</strong> trở lên.
            </p>
          </div>

          <div className="relative z-10 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 max-w-sm text-left space-y-2">
            <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Đặc quyền gói PLUS & PRO:</span>
            <ul className="text-[11px] text-neutral-600 space-y-1.5 font-medium list-disc list-inside">
              <li>Biểu đồ thị hiếu & xu hướng ăn uống của thực khách</li>
              <li>Bản đồ định vị thuộc tính dinh dưỡng thực đơn</li>
              <li>AI phân tích khoảng trống thực đơn (Gap Analysis)</li>
              <li>Đề xuất tối ưu thực đơn tăng trưởng 18%+ doanh thu</li>
            </ul>
          </div>

          <Button
            onClick={() => window.location.href = '/owner?tab=billing'}
            className="relative z-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold px-6 h-11 shadow-lg shadow-indigo-500/25 transition-transform active:scale-[0.98]"
          >
            Nâng cấp gói dịch vụ ngay ✨
          </Button>
        </div>
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

  const {
    menuCoverage,
    attributeDistribution,
    topDishes,
    customerSegments,
    surveyResponseCount: rawSurveyResponseCount,
    gapAnalysis
  } = insights;
  const surveyResponseCount = rawSurveyResponseCount ?? 0;

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 rounded-2xl border border-emerald-100/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              QDish Intelligence Advisor
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Phân tích thói quen ăn uống của thực khách quét QR & tối ưu hóa thực đơn tăng trưởng doanh thu.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-emerald-100/50">
          <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 border border-slate-200/40 w-fit shrink-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'today', label: 'Hôm nay' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'year', label: 'Năm nay' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer
                  ${period === item.id
                    ? 'bg-white text-slate-800 shadow-[0_1.5px_4px_rgba(0,0,0,0.06)] border border-slate-200/30'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <Button onClick={fetchInsights} variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs px-3.5 h-9 shrink-0 flex items-center gap-1.5 font-bold transition-all active:scale-95 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
            Làm mới báo cáo
          </Button>
        </div>
      </div>

      {/* Revenue Impact Banner */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50">
              Doanh thu Smart-Menu
            </span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-3xl font-black text-neutral-900 tracking-tight">
              {formatVND(topDishes.reduce((sum, d) => sum + d.revenue, 0))}
            </h3>
            <span className="text-[11px] text-neutral-400 font-semibold">
              từ các món ăn có công thức dinh dưỡng
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-[65ch]">
            Tổng giá trị đơn hàng được tạo bởi các món ăn phổ biến có cấu hình dinh dưỡng ngữ cảnh.
          </p>
        </div>
        
        <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-100/50 text-xs text-amber-800 font-medium flex items-start gap-3 max-w-sm shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
          <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Món ăn có thông tin dinh dưỡng rõ ràng có tỷ lệ gọi món <strong>cao hơn 24%</strong> so với thông thường!
          </p>
        </div>
      </div>

      {/* Grid: AI advisor & distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: AI advisor gap analysis (Redesigned with Glassmorphism Premium style) */}
        <div
          style={{
            backgroundImage: 'linear-gradient(135deg, #f8fffb 0%, #ffffff 50%, #f0fdf4 100%)',
            border: '1px solid rgba(22, 163, 74, 0.12)',
            boxShadow: '0 20px 40px rgba(22, 163, 74, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className="rounded-3xl p-6 flex flex-col space-y-5 relative overflow-hidden"
        >
          <div className={isPlus ? "blur-[3px] select-none pointer-events-none flex-1 flex flex-col space-y-5" : "flex-1 flex flex-col space-y-5"}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-green-600/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-neutral-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
                    QDish Intelligence
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#dcfce7] text-[#15803d]">
                    AI ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Phân tích hành vi khách quét QR và đề xuất tăng doanh thu bằng AI.
                </p>
              </div>
              <Button
                onClick={handleRefreshAI}
                disabled={refreshingAI}
                variant="outline"
                className="rounded-xl border-green-600/20 hover:border-green-600/40 text-green-700 text-[11px] font-bold px-3 h-8 shrink-0 flex items-center gap-1.5 bg-white/50 backdrop-blur-sm self-start sm:self-auto shadow-sm"
              >
                <RefreshCw className={`w-3 h-3 ${refreshingAI ? 'animate-spin' : ''}`} />
                Làm mới AI
              </Button>
            </div>

            {refreshingAI ? (
              <div className="space-y-5 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="h-16 bg-emerald-50/60 rounded-2xl"></div>
                  <div className="h-16 bg-emerald-50/60 rounded-2xl"></div>
                  <div className="h-16 bg-emerald-50/60 rounded-2xl"></div>
                </div>
                <div className="p-4 bg-neutral-100 rounded-2xl h-24"></div>
                <div className="space-y-3">
                  <div className="h-20 bg-neutral-100 rounded-2xl"></div>
                  <div className="h-20 bg-neutral-100 rounded-2xl"></div>
                  <div className="h-20 bg-neutral-100 rounded-2xl"></div>
                </div>
              </div>
            ) : (() => {
              const totalOrders = topDishes.reduce((sum, d) => sum + d.orderCount, 0);
              const healthyCount = customerSegments
                .filter(s => ['LIGHT_MEAL', 'BALANCED', 'WEIGHT_LOSS'].includes(s.segment))
                .reduce((sum, segment) => sum + segment.count, 0);
              const gapCount = gapAnalysis.filter(g => !g.includes('Thực đơn của bạn')).length;

              if (surveyResponseCount < 20 || totalOrders < 10) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl animate-bounce">
                      🥦
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-xs font-bold text-neutral-800">Cần thêm dữ liệu hoạt động</h4>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Để phân tích xu hướng chính xác hơn, nhà hàng cần tích lũy tối thiểu <strong>20 lượt khảo sát QR</strong> và <strong>10 đơn hàng đặt món thành công</strong>.
                      </p>
                      <div className="flex justify-center gap-4 text-[10px] text-neutral-400 font-bold bg-neutral-50/50 p-2 rounded-xl border border-neutral-100">
                        <span>Lượt khảo sát: {surveyResponseCount}/20</span>
                        <span>Đơn hàng: {totalOrders}/10</span>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      className="text-xs text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 mt-2"
                      onClick={() => {
                        toast.info('Tính năng AI phân tích tự động dựa trên học máy (Machine Learning) để nhận diện khoảng trống dinh dưỡng trong thực đơn dựa theo hồ sơ người dùng thực khách.');
                      }}
                    >
                      Tìm hiểu thêm
                    </Button>
                  </div>
                );
              }

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
                <div className="space-y-5">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Card 1: Revenue growth opportunity */}
                    <div className="bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Cơ hội doanh thu</span>
                        <div className="text-sm font-black text-emerald-600 flex items-center gap-0.5">
                          +18% 📈
                        </div>
                      </div>
                      <div className="p-1.5 bg-emerald-50 rounded-xl">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>

                    {/* Card 2: Missing Category */}
                    <div className="bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Thiếu danh mục</span>
                        <div className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                          {getMissingCategory()}
                        </div>
                      </div>
                      <div className="p-1.5 bg-amber-50 rounded-xl">
                        <ChefHat className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>

                    {/* Card 3: Priority */}
                    <div className="bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Mức ưu tiên</span>
                        <div className="text-xs font-extrabold text-red-600 flex items-center gap-1">
                          Cao 🎯
                        </div>
                      </div>
                      <div className="p-1.5 bg-red-50 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* AI Chat Bubble */}
                  <div className="flex items-start gap-3 bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-base shrink-0">
                      🤖
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-800">QDish AI Assistant</span>
                        <span className="text-[9px] text-neutral-400 font-medium">Vừa phân tích xong</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        Xin chào! Hệ thống ghi nhận <strong>{surveyResponseCount} lượt khảo sát QR</strong> và <strong>{totalOrders} đơn đặt món</strong> thành công. Nhóm mục tiêu ăn uống lành mạnh có <strong>{healthyCount} lượt lựa chọn</strong>. QDish phát hiện thực đơn của bạn có <strong>{gapCount} điểm khuyết thiếu</strong>. Khắc phục các điểm này dự kiến mang lại <strong>+18% cơ hội tăng trưởng doanh thu</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Recommendations list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Đề xuất tối ưu thực đơn</span>
                    
                    {/* Card 1: Gap Analysis */}
                    <div className="bg-white/95 border border-neutral-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-base shrink-0 mt-0.5">
                          🍗
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-neutral-800">
                            {gapAnalysis[0]?.includes('Chay') ? 'Bổ sung món chay / thuần chay' : 'Bổ sung món ăn Giàu Đạm'}
                          </h4>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            {gapAnalysis[0] || 'Menu đang thiếu hụt món ăn chứa lượng dinh dưỡng phù hợp cho nhu cầu thực khách.'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold text-emerald-600 border-emerald-100 hover:bg-emerald-50 rounded-xl shrink-0 h-8 self-end sm:self-auto"
                        onClick={() => {
                          toast.success('Đang chuyển tới Recipe Builder để thêm nguyên liệu...');
                        }}
                      >
                        Xem gợi ý món
                      </Button>
                    </div>

                    {/* Card 2: Growth Segment */}
                    <div className="bg-white/95 border border-neutral-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-base shrink-0 mt-0.5">
                          🥗
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-neutral-800">Healthy đang tăng trưởng</h4>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            Mục tiêu ăn uống Healthy được chọn <strong>{healthyCount} lượt</strong> trong khảo sát. Hãy tối ưu các tag Calo.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold text-emerald-600 border-emerald-100 hover:bg-emerald-50 rounded-xl shrink-0 h-8 self-end sm:self-auto"
                        onClick={() => {
                          toast.success('Đang mở chi tiết phân khúc khách hàng...');
                        }}
                      >
                        Xem dữ liệu
                      </Button>
                    </div>

                    {/* Card 3: Performance Leader */}
                    <div className="bg-white/95 border border-neutral-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base shrink-0 mt-0.5">
                          💰
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-neutral-800">Món bán tốt nhất: {topDishes[0]?.name || 'N/A'}</h4>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            Mang lại <strong>{formatVND(topDishes[0]?.revenue || 0)}</strong> doanh thu. Đề xuất ghim món này lên đầu thực đơn QR.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold text-emerald-600 border-emerald-100 hover:bg-emerald-50 rounded-xl shrink-0 h-8 self-end sm:self-auto"
                        onClick={() => {
                          toast.success('Đang mở báo cáo chi tiết doanh thu món ăn...');
                        }}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer info (only if above threshold) */}
            {(!refreshingAI && (surveyResponseCount >= 20 && topDishes.reduce((sum, d) => sum + d.orderCount, 0) >= 10)) && (
              <div className="text-[10px] text-neutral-400 italic pt-2 border-t border-green-600/10 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span>Dữ liệu đề xuất được cập nhật tự động dựa trên thói quen ăn uống của các lượt quét QR gần nhất.</span>
              </div>
            )}
          </div>

          {isPlus && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1.5px] p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20 animate-pulse">
                🔒
              </div>
              <div className="space-y-1.5 max-w-[280px]">
                <h4 className="text-sm font-bold text-neutral-900">Tính năng AI Advisor bị khóa</h4>
                <p className="text-xs text-neutral-500 leading-normal">
                  Tính năng phân tích đề xuất tối ưu khoảng trống thực đơn bằng AI chỉ khả dụng cho gói <strong>PRO</strong>. Nâng cấp để sở hữu trợ lý AI tư vấn món ăn tăng trưởng 18%+ doanh thu!
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/owner?tab=billing'}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold px-4 h-9 shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
              >
                Nâng cấp gói PRO ngay ✨
              </Button>
            </div>
          )}
        </div>

        {/* Right: Customer Segment Profile Demands */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className={isPlus ? "blur-[3px] select-none pointer-events-none flex-1 flex flex-col space-y-4" : "flex-1 flex flex-col space-y-4"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-bold text-neutral-800">Xu hướng từ lượt khảo sát QR</h3>
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
                      <span className="text-green-600 font-bold">{seg.count} lượt lựa chọn</span>
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

          {isPlus && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1.5px] p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20 animate-pulse">
                🔒
              </div>
              <div className="space-y-1.5 max-w-[280px]">
                <h4 className="text-sm font-bold text-neutral-900">Xu hướng khảo sát chuyên sâu bị khóa</h4>
                <p className="text-xs text-neutral-500 leading-normal">
                  Biểu đồ phân tích sâu các lựa chọn trong khảo sát QR chỉ khả dụng cho gói <strong>PRO</strong>. Nâng cấp để theo dõi xu hướng ăn uống tại nhà hàng!
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/owner?tab=billing'}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold px-4 h-9 shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
              >
                Nâng cấp gói PRO ngay ✨
              </Button>
            </div>
          )}
        </div>

        {/* Right: Peak Ordering Hours & Meal Periods */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className={isPlus ? "blur-[3px] select-none pointer-events-none flex-1 flex flex-col space-y-4" : "flex-1 flex flex-col space-y-4"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-neutral-800">Khung giờ đặt món (Peak Hours)</h3>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">Báo cáo khung giờ</span>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {insights.peakHours?.periods.map((p) => {
                const maxCount = Math.max(...(insights.peakHours?.periods.map(x => x.count) || [1])) || 1;
                const widthPct = Math.max(15, Math.round((p.count / maxCount) * 100));

                return (
                  <div key={p.period} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-700">
                      <span>{p.period}</span>
                      <span className="text-indigo-600 font-bold">{p.count} đơn ({p.percentage}%)</span>
                    </div>
                    <div className="h-3 w-full bg-neutral-50 rounded-full overflow-hidden border border-neutral-100/50">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center justify-between text-[11px] text-indigo-800 font-medium">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Khung giờ cao điểm:</span>
              </span>
              <strong className="text-xs text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200/30 shadow-sm">
                {(() => {
                  if (!insights.peakHours?.hourly) return 'Chưa có';
                  const hourly = insights.peakHours.hourly;
                  const maxHour = hourly.indexOf(Math.max(...hourly));
                  return `${maxHour}:00 - ${maxHour + 1}:00`;
                })()}
              </strong>
            </div>
          </div>

          {isPlus && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1.5px] p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20 animate-pulse">
                🔒
              </div>
              <div className="space-y-1.5 max-w-[280px]">
                <h4 className="text-sm font-bold text-neutral-900">Tính năng Phân tích giờ vàng bị khóa</h4>
                <p className="text-xs text-neutral-500 leading-normal">
                  Biểu đồ phân tích khung giờ đặt món và mật độ gọi món cao điểm chỉ dành cho khách hàng đăng ký gói <strong>PRO</strong>.
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/owner?tab=billing'}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold px-4 h-9 shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
              >
                Nâng cấp gói PRO ngay ✨
              </Button>
            </div>
          )}
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
            {Object.entries(attributeDistribution).map(([attr, count]) => {
              const meta = attributeLabels[attr] || {
                label: attr,
                description: 'Thuộc tính dinh dưỡng của món ăn',
                color: 'bg-neutral-50 text-neutral-700 border-neutral-200/80',
                countColor: 'bg-neutral-200 text-neutral-800'
              };
              return (
                <span
                  key={attr}
                  title={meta.description}
                  className={`text-xs border rounded-2xl px-3 py-1.5 font-bold flex items-center gap-1.5 cursor-help transition-all hover:scale-[1.03] active:scale-95 duration-150 shadow-sm shadow-black/5 ${meta.color}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${meta.countColor}`}>
                    {count}
                  </span>
                  {meta.label}
                </span>
              );
            })}
            
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
