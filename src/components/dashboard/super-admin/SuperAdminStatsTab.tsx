import React from 'react';
import { OverviewStats } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, ShieldAlert, CreditCard, ReceiptText } from 'lucide-react';
import { TopRestaurantsChart } from './charts/TopRestaurantsChart';
import { SubscriptionTransactionsTable } from './charts/SubscriptionTransactionsTable';

export interface SuperAdminStatsTabProps {
  overviewStats: OverviewStats | null;
  subscriptionRevenue: any | null;
  isLoadingStats: boolean;
}

export const SuperAdminStatsTab: React.FC<SuperAdminStatsTabProps> = ({
  overviewStats,
  subscriptionRevenue,
  isLoadingStats
}) => {
  const topRevenueData = overviewStats?.top5Restaurants || [];
  const transactions = subscriptionRevenue?.transactions || [];

  if (isLoadingStats) {
    return (
      <div className="flex py-16 justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SaaS cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Chi nhánh đang hoạt động</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600 flex items-center gap-1.5">
              <CheckCircle className="w-7 h-7 text-green-500" />
              {overviewStats?.totalActive || 0} chi nhánh
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Chi nhánh tạm dừng/khóa</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-500 flex items-center gap-1.5">
              <ShieldAlert className="w-7 h-7 text-red-400" />
              {overviewStats?.totalInactive || 0} chi nhánh
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Doanh thu subscription</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
              <CreditCard className="w-6 h-6 text-emerald-500" />
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subscriptionRevenue?.totalRevenue || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Doanh thu tháng này</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subscriptionRevenue?.monthRevenue || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Giao dịch subscription</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-1.5">
              <ReceiptText className="w-6 h-6 text-slate-500" />
              {subscriptionRevenue?.paidCount || 0} paid
            </CardTitle>
            <CardDescription className="text-[11px]">
              Pending: {subscriptionRevenue?.pendingCount || 0} | Cancelled: {subscriptionRevenue?.cancelledCount || 0}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <TopRestaurantsChart data={topRevenueData} />
      <SubscriptionTransactionsTable transactions={transactions} />
    </div>
  );
};
