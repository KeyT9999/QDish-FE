import React from 'react';
import { AlertCircle, BarChart3, Database, ReceiptText, ShieldCheck, Table2, Trophy, Users, Utensils } from 'lucide-react';

import type { CustomerInsightsPayload } from '@/services/merchantInsightLoader';
import type { RestaurantStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  buildMenuPerformanceSummary,
  buildOrderStatusSummary,
  buildTablePerformanceSummary
} from './analyticsSummaryData';

interface SummaryPanelProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ title, description, icon, children, className = '' }) => (
  <section className={`min-w-0 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const SummarySkeleton = ({ label = 'Đang tải tóm tắt số liệu' }: { label?: string }) => (
  <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2" aria-label={label} aria-busy="true">
    {[0, 1].map((item) => (
      <div key={item} className="h-56 animate-pulse rounded-2xl bg-neutral-100" aria-hidden="true" />
    ))}
  </div>
);

const SummaryError = ({ message }: { message: string }) => (
  <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
    <span>{message}</span>
  </div>
);

const SummaryEmpty = ({ message }: { message: string }) => (
  <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/70 px-4 py-6 text-center">
    <Database className="h-6 w-6 text-neutral-300" aria-hidden="true" />
    <p className="mt-2 text-xs font-semibold text-neutral-600">Chưa có dữ liệu trong kỳ này</p>
    <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-neutral-400">{message}</p>
  </div>
);

const HorizontalBarRow = ({
  label,
  value,
  suffix,
  ratio,
  tone = 'emerald',
  ariaLabel
}: {
  label: string;
  value: string;
  suffix?: string;
  ratio: number;
  tone?: 'emerald' | 'blue' | 'amber' | 'violet';
  ariaLabel: string;
}) => {
  const toneClass = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500'
  }[tone];

  return (
    <div className="space-y-1.5" role="listitem" aria-label={ariaLabel}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="min-w-0 truncate font-semibold text-neutral-700">{label}</span>
        <span className="shrink-0 font-bold text-neutral-900">{value}{suffix ? ` ${suffix}` : ''}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
        <div className={`h-full rounded-full ${toneClass} transition-[width] duration-300`} style={{ width: `${Math.max(4, Math.min(100, ratio))}%` }} />
      </div>
    </div>
  );
};

export interface OrderAnalyticsSummaryProps {
  stats: RestaurantStats | null;
  isLoading: boolean;
  hasError: boolean;
}

export const OrderAnalyticsSummary: React.FC<OrderAnalyticsSummaryProps> = ({ stats, isLoading, hasError }) => {
  if (isLoading) return <SummarySkeleton label="Đang tải phân tích đơn hàng" />;
  if (hasError) return <SummaryError message="Chưa tải được phân tích đơn hàng. Vui lòng làm mới kỳ dữ liệu." />;

  const statuses = buildOrderStatusSummary(stats);
  const largestOrders = stats?.largestOrders?.slice(0, 5) || [];
  const totalStatusCount = statuses.reduce((total, status) => total + status.count, 0);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" aria-label="Tóm tắt hiệu quả đơn hàng">
      <SummaryPanel
        title="Trạng thái đơn hàng"
        description="Nhìn nhanh lượng đơn đang chờ xử lý, đã hoàn tất và bị huỷ."
        icon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}
      >
        {totalStatusCount === 0 ? <SummaryEmpty message="Các trạng thái sẽ xuất hiện sau khi nhà hàng phát sinh đơn." /> : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="list" aria-label="Các trạng thái đơn hàng">
            {statuses.map((status) => (
              <div key={status.key} role="listitem" className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-3">
                <p className="text-[10px] font-semibold leading-tight text-neutral-500">{status.label}</p>
                <p className="mt-2 text-xl font-black tracking-tight text-neutral-900">{status.count.toLocaleString('vi-VN')}</p>
                <p className="mt-1 text-[10px] text-neutral-400">
                  {totalStatusCount ? `${Math.round((status.count / totalStatusCount) * 100)}% tổng đơn` : 'Chưa có đơn'}
                </p>
              </div>
            ))}
          </div>
        )}
      </SummaryPanel>

      <SummaryPanel
        title="Đơn hàng giá trị cao"
        description="Các đơn có tổng tiền lớn nhất trong kỳ, hữu ích để kiểm tra combo và nhóm khách."
        icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
      >
        {largestOrders.length === 0 ? <SummaryEmpty message="Chưa có đơn hoàn tất trong kỳ này." /> : (
          <div className="space-y-2" role="list" aria-label="Đơn hàng giá trị cao nhất">
            {largestOrders.map((order, index) => (
              <div key={order.orderId} role="listitem" className="flex items-center gap-3 rounded-xl border border-neutral-100 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xs font-black text-amber-700">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-neutral-800">Bàn {order.tableNumber}{order.customerName ? ` · ${order.customerName}` : ''}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-400">Mã đơn {order.orderId.slice(-8)}</p>
                </div>
                <strong className="shrink-0 text-xs font-black text-emerald-700">{formatCurrency(order.totalAmount)}</strong>
              </div>
            ))}
          </div>
        )}
      </SummaryPanel>
    </div>
  );
};

export interface MenuAnalyticsSummaryProps {
  stats: RestaurantStats | null;
  isLoading: boolean;
  hasError: boolean;
}

export const MenuAnalyticsSummary: React.FC<MenuAnalyticsSummaryProps> = ({ stats, isLoading, hasError }) => {
  if (isLoading) return <SummarySkeleton label="Đang tải hiệu quả thực đơn" />;
  if (hasError) return <SummaryError message="Chưa tải được hiệu quả thực đơn. Vui lòng làm mới kỳ dữ liệu." />;

  const summary = buildMenuPerformanceSummary(stats);
  const maxDishQuantity = summary.topDishes[0]?.quantity || 0;
  const maxCategoryRevenue = summary.categories[0]?.revenue || 0;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Tóm tắt hiệu quả thực đơn">
      <SummaryPanel
        title="Top món bán chạy"
        description="Ưu tiên các món có lượng gọi cao khi tạo combo hoặc sắp xếp menu."
        icon={<Utensils className="h-4 w-4" aria-hidden="true" />}
      >
        {summary.topDishes.length === 0 ? <SummaryEmpty message="Chưa có món hoàn tất trong kỳ này." /> : (
          <div className="space-y-3" role="list" aria-label="Top món bán chạy">
            {summary.topDishes.map((dish) => (
              <HorizontalBarRow
                key={dish.menuItemId}
                label={dish.name}
                value={dish.quantity.toLocaleString('vi-VN')}
                suffix="suất"
                ratio={maxDishQuantity ? (dish.quantity / maxDishQuantity) * 100 : 0}
                ariaLabel={`${dish.name}, ${dish.quantity} suất, doanh thu ${formatCurrency(dish.revenue)}`}
              />
            ))}
          </div>
        )}
      </SummaryPanel>

      <SummaryPanel
        title="Doanh thu theo danh mục"
        description="Nhận biết nhóm món đang đóng góp nhiều nhất vào doanh thu."
        icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
      >
        {summary.categories.length === 0 ? <SummaryEmpty message="Chưa có danh mục phát sinh doanh thu trong kỳ này." /> : (
          <div className="space-y-3" role="list" aria-label="Doanh thu theo danh mục">
            {summary.categories.map((category) => (
              <HorizontalBarRow
                key={category.category}
                label={category.category}
                value={formatCurrency(category.revenue)}
                ratio={maxCategoryRevenue ? (category.revenue / maxCategoryRevenue) * 100 : 0}
                tone="blue"
                ariaLabel={`${category.category}, doanh thu ${formatCurrency(category.revenue)}, ${category.quantity} món`}
              />
            ))}
          </div>
        )}
      </SummaryPanel>
    </div>
  );
};

export interface TableAnalyticsSummaryProps {
  stats: RestaurantStats | null;
  isLoading: boolean;
  hasError: boolean;
}

export const TableAnalyticsSummary: React.FC<TableAnalyticsSummaryProps> = ({ stats, isLoading, hasError }) => {
  if (isLoading) return <SummarySkeleton label="Đang tải hiệu quả bàn" />;
  if (hasError) return <SummaryError message="Chưa tải được hiệu quả bàn. Vui lòng làm mới kỳ dữ liệu." />;

  const tables = buildTablePerformanceSummary(stats);
  const maxRevenue = tables[0]?.revenue || 0;

  return (
    <SummaryPanel
      title="Hiệu quả từng bàn"
      description="Xếp hạng bàn theo doanh thu trong kỳ để biết khu vực nào đang hoạt động tốt."
      icon={<Table2 className="h-4 w-4" aria-hidden="true" />}
      className="w-full"
    >
      {tables.length === 0 ? <SummaryEmpty message="Bàn sẽ được xếp hạng sau khi phát sinh đơn hoàn tất." /> : (
        <div className="space-y-3" role="list" aria-label="Xếp hạng hiệu quả từng bàn">
          {tables.map((table, index) => (
            <div key={table.tableNumber} role="listitem" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-xs font-black text-neutral-600">{index + 1}</span>
              <HorizontalBarRow
                label={`Bàn ${table.tableNumber}`}
                value={formatCurrency(table.revenue)}
                ratio={maxRevenue ? (table.revenue / maxRevenue) * 100 : 0}
                tone="violet"
                ariaLabel={`Bàn ${table.tableNumber}, doanh thu ${formatCurrency(table.revenue)}, ${table.orders} đơn`}
              />
              <span className="text-[10px] font-semibold text-neutral-400">{table.orders} đơn</span>
            </div>
          ))}
        </div>
      )}
    </SummaryPanel>
  );
};

export interface CustomerSegmentsSummaryProps {
  insights: CustomerInsightsPayload | null;
  isLoading: boolean;
  error: string;
  enabled: boolean;
  onRetry?: () => void;
}

export const CustomerSegmentsSummary: React.FC<CustomerSegmentsSummaryProps> = ({ insights, isLoading, error, enabled, onRetry }) => {
  if (!enabled) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5" aria-label="Phân khúc khách hàng bị khóa">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Phân khúc khách hàng</h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">Nâng cấp gói có Customer Insights để xem nhu cầu ăn uống được khách chọn khi quét QR.</p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) return <SummarySkeleton label="Đang tải phân khúc khách hàng" />;
  if (error) {
    return (
      <div className="space-y-3">
        <SummaryError message={error} />
        {onRetry && <button type="button" onClick={onRetry} className="text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">Thử tải lại phân khúc</button>}
      </div>
    );
  }

  const segments = insights?.customerSegments || [];
  const maxCount = segments[0]?.count || 0;

  return (
    <SummaryPanel
      title="Phân khúc khách hàng"
      description="Các nhu cầu ăn uống được khách lựa chọn khi bắt đầu trải nghiệm đặt món."
      icon={<Users className="h-4 w-4" aria-hidden="true" />}
    >
      <div className="mb-4 rounded-xl bg-emerald-50/70 px-3 py-2.5 text-xs text-emerald-800">
        Đã ghi nhận <strong>{insights?.surveyResponseCount || 0}</strong> lượt khảo sát trong kỳ này.
      </div>
      {segments.length === 0 || maxCount === 0 ? <SummaryEmpty message="Khách cần hoàn thành bước khảo sát khi quét QR để tạo phân khúc." /> : (
        <div className="space-y-3" role="list" aria-label="Các phân khúc khách hàng">
          {segments.slice(0, 6).map((segment) => (
            <HorizontalBarRow
              key={segment.segment}
              label={segment.label}
              value={segment.count.toLocaleString('vi-VN')}
              suffix="lượt"
              ratio={(segment.count / maxCount) * 100}
              tone="amber"
              ariaLabel={`${segment.label}, ${segment.count} lượt lựa chọn`}
            />
          ))}
        </div>
      )}
    </SummaryPanel>
  );
};
