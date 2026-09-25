import React from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BarChart3, Database } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { RestaurantStats } from '@/types';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import {
  buildCategoryRevenueData,
  buildCustomerSegmentData,
  buildHourlyOrderData,
  buildOrderStatusData,
  buildRevenueTrendData,
  buildTopDishData
} from './charts/merchantInsightsChartData';

interface MerchantInsightsChartsProps {
  stats: RestaurantStats | null;
  insights: MerchantInsightsPayload;
  isLoadingStats: boolean;
  hasStatsError: boolean;
}

interface ChartCardProps {
  title: string;
  description: string;
  ariaLabel: string;
  children: React.ReactNode;
}

const categoryColors = ['#16a34a', '#2563eb', '#d97706', '#db2777', '#7c3aed', '#0891b2'];
const chartInitialDimension = { width: 320, height: 288 };
const statusColors: Record<string, string> = {
  'Đang chờ': '#f59e0b',
  'Đã xác nhận': '#3b82f6',
  'Đã phục vụ': '#8b5cf6',
  'Hoàn tất': '#16a34a',
  'Đã hủy': '#e11d48'
};

const currencyTooltip = (value: number | string | undefined) => [
  formatCurrency(Number(value || 0)),
  'Doanh thu'
];

const numberTooltip = (value: number | string | undefined, name: string) => [
  `${Number(value || 0).toLocaleString('vi-VN')} ${name}`,
  name === 'orders' ? 'Số đơn' : 'Số lượng'
];

const ChartEmptyState = () => (
  <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 text-center">
    <Database className="h-6 w-6 text-neutral-300" aria-hidden="true" />
    <p className="text-xs font-semibold text-neutral-500">Chưa có dữ liệu trong kỳ này</p>
    <p className="max-w-xs text-[11px] leading-relaxed text-neutral-400">
      Hãy thử đổi khoảng thời gian hoặc tiếp tục nhận đơn để biểu đồ có thêm số liệu.
    </p>
  </div>
);

const ChartSkeleton = () => (
  <div className="h-72 animate-pulse rounded-2xl bg-neutral-100" aria-hidden="true" />
);

const ChartCard: React.FC<ChartCardProps> = ({ title, description, ariaLabel, children }) => (
  <article
    className="min-w-0 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm"
    aria-label={ariaLabel}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">{description}</p>
      </div>
      <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
    </div>
    {children}
  </article>
);

export const MerchantInsightsCharts: React.FC<MerchantInsightsChartsProps> = ({
  stats,
  insights,
  isLoadingStats,
  hasStatsError
}) => {
  const revenueTrendData = buildRevenueTrendData(stats);
  const hourlyOrderData = buildHourlyOrderData(stats, insights);
  const topDishData = buildTopDishData(stats, insights).slice(0, 8);
  const categoryRevenueData = buildCategoryRevenueData(stats);
  const orderStatusData = buildOrderStatusData(stats);
  const customerSegmentData = buildCustomerSegmentData(insights);

  return (
    <section
      id="merchant-insights-charts"
      role="region"
      aria-label="Bảng điều khiển biểu đồ"
      className="scroll-mt-6 space-y-5 rounded-3xl border border-emerald-100/80 bg-emerald-50/20 p-4 transition-[opacity,transform] duration-200 sm:p-5"
    >
      <div className="flex flex-col gap-2 border-b border-emerald-100/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Bảng điều khiển biểu đồ</h2>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-500">
            Đọc nhanh nhịp đặt món, doanh thu và hiệu suất thực đơn trong cùng một kỳ dữ liệu.
          </p>
        </div>
        <span className="w-fit rounded-lg border border-emerald-100 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          Số liệu vận hành
        </span>
      </div>

      {hasStatsError && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900"
        >
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            Chưa tải được số liệu vận hành cho kỳ này. Các biểu đồ có dữ liệu insight vẫn được giữ lại, bạn có thể thử đổi kỳ hoặc làm mới báo cáo.
          </p>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Doanh thu và số đơn theo thời gian"
          description="Theo dõi doanh thu và lượng đơn thay đổi theo từng ngày."
          ariaLabel="Biểu đồ doanh thu và số đơn theo thời gian"
        >
          {isLoadingStats ? <ChartSkeleton /> : revenueTrendData.length === 0 ? <ChartEmptyState /> : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                <ComposedChart data={revenueTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="insightsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="revenue" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                  <YAxis yAxisId="orders" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                    formatter={(value, name) => name === 'revenue' ? currencyTooltip(value as number) : numberTooltip(value as number, 'orders')}
                  />
                  <Legend formatter={(value) => value === 'revenue' ? 'Doanh thu' : 'Số đơn'} wrapperStyle={{ fontSize: 11 }} />
                  <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#insightsRevenueFill)" />
                  <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Khung giờ đặt món"
          description="Xác định giờ cao điểm để chuẩn bị bếp và nhân sự."
          ariaLabel="Biểu đồ khung giờ đặt món"
        >
          {isLoadingStats ? <ChartSkeleton /> : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                <BarChart data={hourlyOrderData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" interval={1} stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                    formatter={(value, name) => name === 'orders' ? numberTooltip(value as number, 'orders') : currencyTooltip(value as number)}
                  />
                  <Bar dataKey="orders" name="Số đơn" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Top món bán chạy"
          description="Xếp hạng các món được gọi nhiều nhất trong kỳ."
          ariaLabel="Biểu đồ top món bán chạy"
        >
          {isLoadingStats ? <ChartSkeleton /> : topDishData.length === 0 ? <ChartEmptyState /> : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                <BarChart layout="vertical" data={topDishData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                    formatter={(value, name) => name === 'quantity' ? numberTooltip(value as number, 'quantity') : currencyTooltip(value as number)}
                  />
                  <Bar dataKey="quantity" name="Số lượng" fill="#0f766e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Doanh thu theo danh mục"
          description="Tỷ trọng doanh thu giữa các nhóm món trong kỳ."
          ariaLabel="Biểu đồ doanh thu theo danh mục"
        >
          {isLoadingStats ? <ChartSkeleton /> : categoryRevenueData.length === 0 ? <ChartEmptyState /> : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                <PieChart>
                  <Pie
                    data={categoryRevenueData}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryRevenueData.map((item, index) => (
                      <Cell key={item.category} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                    formatter={(value) => currencyTooltip(value as number)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Trạng thái đơn hàng"
          description="Theo dõi đơn đang xử lý, hoàn tất và bị hủy."
          ariaLabel="Biểu đồ trạng thái đơn hàng"
        >
          {isLoadingStats ? <ChartSkeleton /> : orderStatusData.length === 0 ? <ChartEmptyState /> : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="45%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {orderStatusData.map((item) => (
                      <Cell key={item.key} fill={statusColors[item.label] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                    formatter={(value) => numberTooltip(value as number, 'orders')}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Phân khúc khách hàng"
          description="Các nhu cầu ăn uống được chọn nhiều từ khảo sát QR."
          ariaLabel="Biểu đồ phân khúc khách hàng"
        >
          {isLoadingStats ? <ChartSkeleton /> : customerSegmentData.length === 0 ? <ChartEmptyState /> : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" initialDimension={chartInitialDimension}>
                <BarChart layout="vertical" data={customerSegmentData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={100} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                    formatter={(value) => numberTooltip(value as number, 'lượt')}
                  />
                  <Bar dataKey="count" name="Lượt lựa chọn" fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </section>
  );
};
