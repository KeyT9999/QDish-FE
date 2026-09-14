import React, { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Phone, ReceiptText } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { customerCrmService, CustomerDetailResponse } from '@/services/customerCrmService';
import { formatCurrency } from '@/lib/utils';

interface CustomerDetailSheetProps {
  restaurantId: string;
  customerId: string | null;
  onClose: () => void;
}

const formatDateTime = (value?: string) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa có';

export const CustomerDetailSheet: React.FC<CustomerDetailSheetProps> = ({
  restaurantId,
  customerId,
  onClose
}) => {
  const [detail, setDetail] = useState<CustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customerId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    customerCrmService.detail(restaurantId, customerId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message || 'Không thể tải lịch sử khách hàng.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId, restaurantId]);

  return (
    <Sheet open={Boolean(customerId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-white sm:max-w-2xl">
        <SheetHeader className="border-b border-neutral-200 pb-4 text-left">
          <SheetTitle>Chi tiết khách hàng</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex min-h-64 items-center justify-center text-sm text-neutral-500" role="status">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải lịch sử
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {!loading && detail && (
          <div className="space-y-6 py-6">
            <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="text-lg font-bold text-neutral-900">{detail.customer.displayName}</h2>
              <a
                href={`tel:${detail.customer.phone}`}
                className="mt-2 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Phone className="h-4 w-4" />
                {detail.customer.phone}
              </a>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-neutral-500">Số lần ghé</p>
                  <p className="font-bold text-neutral-900">{detail.customer.visitCount}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Tổng đơn</p>
                  <p className="font-bold text-neutral-900">{detail.customer.orderCount}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-neutral-500">
                {detail.customer.marketingConsent
                  ? `Đã đồng ý nhận ưu đãi: ${formatDateTime(detail.customer.consentAt)}`
                  : 'Chưa đồng ý nhận thông tin ưu đãi.'}
              </p>
            </section>

            <section aria-labelledby="visit-history-title">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-700" />
                <h2 id="visit-history-title" className="font-bold text-neutral-900">Lịch sử gọi món</h2>
              </div>

              {detail.visits.length === 0 ? (
                <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">Chưa có lịch sử gọi món.</p>
              ) : (
                <div className="space-y-4">
                  {detail.visits.map((visit) => (
                    <article key={visit.id} className="rounded-2xl border border-neutral-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div>
                          <p className="font-semibold text-neutral-900">Bàn {visit.tableNumber}</p>
                          <p className="text-xs text-neutral-500">{formatDateTime(visit.openedAt)}</p>
                        </div>
                        <p className="font-bold text-emerald-700">{formatCurrency(visit.totalAmount || 0)}</p>
                      </div>
                      <div className="mt-3 space-y-3">
                        {visit.orders.map((order) => (
                          <div key={order.id} className="rounded-xl bg-neutral-50 p-3">
                            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-neutral-500">
                              <span className="inline-flex items-center gap-1"><ReceiptText className="h-3.5 w-3.5" />{formatDateTime(order.createdAt)}</span>
                              <span>{order.status}</span>
                            </div>
                            {order.items.map((item) => (
                              <div key={`${order.id}-${item.menuItemId}`} className="flex justify-between gap-3 text-sm">
                                <span className="text-neutral-700">{item.quantity} x {item.name}</span>
                                <span className="font-medium text-neutral-900">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
