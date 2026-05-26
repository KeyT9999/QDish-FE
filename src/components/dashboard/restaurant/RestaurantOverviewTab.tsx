import React from 'react';
import { RestaurantStats } from '@/types';
import { DollarSign, ShoppingBag, TrendingUp, Flame, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RevenueChart } from './charts/RevenueChart';
import { PeakHourChart } from './charts/PeakHourChart';
import { CategoryRevenueChart } from './charts/CategoryRevenueChart';
import { TopSellingItemsTable } from './charts/TopSellingItemsTable';

export interface RestaurantOverviewTabProps {
  stats: RestaurantStats | null;
  statsPeriod: string;
  isLoadingStats: boolean;
  onSetStatsPeriod: (period: string) => void;
}

const renderGrowthBadge = (change: number | null) => {
  if (change === null || change === undefined) return null;
  const isPositive = change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
      isPositive 
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/20' 
        : 'bg-rose-50 text-rose-700 border border-rose-250/20'
    }`}>
      {isPositive ? '↑' : '↓'} {Math.abs(change)}%
    </span>
  );
};

export const RestaurantOverviewTab: React.FC<RestaurantOverviewTabProps> = ({
  stats,
  statsPeriod,
  isLoadingStats,
  onSetStatsPeriod
}) => {
  const revenueChartData = stats?.revenueByDate || [];
  const hourlyChartData = stats?.revenueByHour || [];
  const categoryChartData = stats?.revenueByCategory || [];
  const topDishesData = stats?.topMenuItems || [];

  return (
    <div className="space-y-6 outline-none">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Số liệu kinh doanh</h2>
        <div className="bg-neutral-100/80 p-1 rounded-xl flex gap-1 w-fit border border-neutral-200/20">
          {['today', 'week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => onSetStatsPeriod(p)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                statsPeriod === p 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              {p === 'today' ? 'Hôm nay' : p === 'week' ? 'Tuần này' : p === 'month' ? 'Tháng này' : 'Năm nay'}
            </button>
          ))}
        </div>
      </div>

      {isLoadingStats ? (
        <div className="flex py-24 justify-center items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mr-2" />
          <span className="text-sm font-semibold text-neutral-500">Đang tải báo cáo...</span>
        </div>
      ) : (
        <>
          {/* Stats Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Doanh thu tích lũy */}
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Doanh thu tích lũy</span>
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-neutral-900 block">
                  {formatCurrency(stats?.overview.totalRevenue || 0)}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {renderGrowthBadge(stats?.overview.revenueChange ?? null)}
                  <span className="text-[10px] text-neutral-400 font-semibold">So với chu kỳ trước</span>
                </div>
              </div>
            </div>

            {/* Card 2: Số lượng đơn hàng */}
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Số lượng đơn hàng</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-neutral-900 block">
                  {stats?.overview.totalOrders || 0} <span className="text-sm font-semibold text-neutral-400">đơn</span>
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {renderGrowthBadge(stats?.overview.ordersChange ?? null)}
                  <span className="text-[10px] text-neutral-400 font-semibold">So với chu kỳ trước</span>
                </div>
              </div>
            </div>

            {/* Card 3: Đơn hàng trung bình */}
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Đơn hàng trung bình</span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-neutral-900 block">
                  {formatCurrency(stats?.overview.averageOrderValue || 0)}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-neutral-400 font-semibold">Đơn hoàn thành / Doanh số</span>
                </div>
              </div>
            </div>

            {/* Card 4: Món bán chạy nhất */}
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Món bán chạy nhất</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-lg font-bold tracking-tight text-neutral-950 block truncate" title={stats?.overview.topSellingItem?.name || 'Không có'}>
                  {stats?.overview.topSellingItem?.name || 'Không có'}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
                    Đã bán {stats?.overview.topSellingItem?.quantity || 0} suất
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Grid charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RevenueChart data={revenueChartData} />
            <PeakHourChart data={hourlyChartData} />
            <CategoryRevenueChart data={categoryChartData} />
            <TopSellingItemsTable data={topDishesData} />
          </div>
        </>
      )}
    </div>
  );
};
