import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Search, ShieldCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { customerCrmService, CustomerListResponse, CustomerSummary } from '@/services/customerCrmService';
import { apiFetch } from '@/services/api';
import { loadMerchantInsights, CustomerInsightsPayload } from '@/services/merchantInsightLoader';
import { CustomerDetailSheet } from './CustomerDetailSheet';
import { CustomerSegmentsSummary } from './RestaurantAnalyticsSummary';

interface RestaurantCustomersTabProps {
  restaurantId: string;
  enabled: boolean;
  period: string;
  customerInsightsEnabled: boolean;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(new Date(value));

export const RestaurantCustomersTab: React.FC<RestaurantCustomersTabProps> = ({
  restaurantId,
  enabled,
  period,
  customerInsightsEnabled
}) => {
  const [result, setResult] = useState<CustomerListResponse | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsightsPayload | null>(null);
  const [customerInsightsLoading, setCustomerInsightsLoading] = useState(false);
  const [customerInsightsError, setCustomerInsightsError] = useState('');

  const loadCustomers = useCallback(async () => {
    if (!enabled || !restaurantId) return;
    setLoading(true);
    setError('');
    try {
      setResult(await customerCrmService.list(restaurantId, { page, limit: 20, search }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  }, [enabled, page, restaurantId, search]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const loadCustomerInsights = useCallback(async () => {
    if (!enabled || !customerInsightsEnabled || !restaurantId) return;

    setCustomerInsightsLoading(true);
    setCustomerInsightsError('');
    try {
      const data = await loadMerchantInsights({
        restaurantId,
        period,
        customerInsightsEnabled: true,
        fetcher: apiFetch
      });
      setCustomerInsights({
        customerSegments: data.customerSegments,
        surveyResponseCount: data.surveyResponseCount,
        gapAnalysis: data.gapAnalysis,
        peakHours: data.peakHours
      });
    } catch (reason) {
      setCustomerInsightsError(reason instanceof Error ? reason.message : 'Không thể tải phân khúc khách hàng.');
    } finally {
      setCustomerInsightsLoading(false);
    }
  }, [customerInsightsEnabled, enabled, period, restaurantId]);

  useEffect(() => {
    void loadCustomerInsights();
  }, [loadCustomerInsights]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-amber-700" />
        <h2 className="mt-3 text-lg font-bold text-neutral-900">CRM khách hàng dành cho PLUS và PRO</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600">
          Nâng cấp gói để xem số điện thoại, số lần ghé và lịch sử gọi món của khách đã cung cấp thông tin.
        </p>
        <Button className="mt-4 bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => { window.location.href = '/owner?tab=billing'; }}>
          Xem gói dịch vụ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
            <Users className="h-5 w-5 text-emerald-700" />
            Khách hàng
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Thông tin do khách tự nguyện cung cấp khi đặt món.</p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 sm:max-w-md" role="search">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên hoặc 4 số cuối"
            aria-label="Tìm khách hàng"
          />
          <Button type="submit" variant="outline" aria-label="Tìm kiếm">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <CustomerSegmentsSummary
        insights={customerInsights}
        isLoading={customerInsightsLoading}
        error={customerInsightsError}
        enabled={customerInsightsEnabled}
        onRetry={() => void loadCustomerInsights()}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => void loadCustomers()}>Thử lại</Button>
        </div>
      )}

      {loading && (
        <div className="space-y-3" aria-label="Đang tải danh sách khách hàng" aria-busy="true">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 w-full rounded-xl" />)}
        </div>
      )}

      {!loading && !error && result?.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-neutral-400" />
          <h3 className="mt-3 font-semibold text-neutral-800">Chưa có dữ liệu khách hàng</h3>
          <p className="mt-1 text-sm text-neutral-500">Khách có nhập số điện thoại khi đặt món sẽ xuất hiện tại đây.</p>
        </div>
      )}

      {!loading && result && result.data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {result.data.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => setSelectedCustomer(customer)}
              className="grid w-full grid-cols-1 gap-3 border-b border-neutral-100 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 sm:grid-cols-[minmax(0,1fr)_140px_120px_120px] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900">{customer.displayName}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{customer.maskedPhone}</p>
              </div>
              <p className="text-sm text-neutral-600"><span className="sm:hidden">Lần ghé: </span>{customer.visitCount}</p>
              <p className="text-sm text-neutral-600"><span className="sm:hidden">Đơn hàng: </span>{customer.orderCount}</p>
              <p className="text-sm text-neutral-600"><span className="sm:hidden">Gần nhất: </span>{formatDate(customer.lastSeenAt)}</p>
            </button>
          ))}
        </div>
      )}

      {result && result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Trước
          </Button>
          <span className="text-sm text-neutral-500">Trang {page}/{result.pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>
            Sau <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      <CustomerDetailSheet
        restaurantId={restaurantId}
        customerId={selectedCustomer?.id || null}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
