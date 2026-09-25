import React from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Hash,
  ReceiptText,
  ShoppingBag,
  XCircle,
} from 'lucide-react';

import { Bill, BillStatus, Order, TableSession } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface CurrentBillDetails {
  bill: Bill;
  session: TableSession | null;
  orders: Order[];
}

interface CurrentBillModalProps {
  open: boolean;
  details: CurrentBillDetails | null;
  onOpenChange: (open: boolean) => void;
  onPay: (bill: Bill) => void;
}

const billStatusLabels: Record<BillStatus, string> = {
  [BillStatus.UNPAID]: 'Chưa thanh toán',
  [BillStatus.PAYMENT_REQUESTED]: 'Chờ thanh toán',
  [BillStatus.PAID]: 'Đã thanh toán',
  [BillStatus.CANCELLED]: 'Đã hủy',
};

const billStatusClasses: Record<BillStatus, string> = {
  [BillStatus.UNPAID]: 'border-amber-200 bg-amber-50 text-amber-800',
  [BillStatus.PAYMENT_REQUESTED]: 'border-rose-200 bg-rose-50 text-rose-800',
  [BillStatus.PAID]: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  [BillStatus.CANCELLED]: 'border-neutral-200 bg-neutral-100 text-neutral-600',
};

const orderStatusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SERVED: 'Đã phục vụ',
  COMPLETED: 'Đã hoàn tất',
  CANCELLED: 'Đã hủy',
};

const formatDateTime = (value?: string | number) => {
  if (value === undefined || value === null) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getOrderId = (order: Order) => order.id || order._id || 'unknown';

const BillMeta = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-xl border border-neutral-200/70 bg-neutral-50/70 p-3">
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
      <Icon className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
      {label}
    </div>
    <div className="mt-1 truncate text-sm font-bold text-neutral-900" title={typeof value === 'string' ? value : undefined}>
      {value}
    </div>
  </div>
);

export const CurrentBillModal: React.FC<CurrentBillModalProps> = ({
  open,
  details,
  onOpenChange,
  onPay,
}) => {
  if (!details) return null;

  const { bill, session, orders } = details;
  const sessionCode = bill.sessionCode || session?.sessionCode || '-';
  const canPay = bill.status === BillStatus.UNPAID || bill.status === BillStatus.PAYMENT_REQUESTED;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[calc(100vh-1rem)] max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-h-[min(90vh,760px)] sm:max-w-3xl"
      >
        <div className="flex max-h-[calc(100vh-1rem)] flex-col sm:max-h-[min(90vh,760px)]">
          <DialogHeader className="border-b border-neutral-100 px-5 pb-4 pt-5 pr-12 sm:px-6 sm:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-neutral-950">
                  Bill hiện tại · Bàn {bill.tableNumber}
                </DialogTitle>
                <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="font-semibold text-neutral-700">{bill.billCode}</span>
                  <span aria-hidden="true">·</span>
                  <span>Mã phiên {sessionCode}</span>
                </DialogDescription>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${billStatusClasses[bill.status]}`}>
                {bill.status === BillStatus.CANCELLED ? (
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {billStatusLabels[bill.status]}
              </span>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <section aria-labelledby="bill-overview-title">
              <h3 id="bill-overview-title" className="sr-only">Tổng quan bill</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <BillMeta icon={Hash} label="Mã phiên" value={sessionCode} />
                <BillMeta icon={CalendarClock} label="Mở phiên" value={formatDateTime(session?.openedAt || bill.createdAt)} />
                <BillMeta icon={ClipboardList} label="Số order" value={bill.orderCount ?? bill.orderIds.length} />
                <BillMeta icon={ShoppingBag} label="Tổng món" value={bill.totalItems} />
              </div>
            </section>

            <section className="mt-6" aria-labelledby="bill-items-title">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h3 id="bill-items-title" className="text-sm font-extrabold text-neutral-900">Món trong bill</h3>
                  <p className="mt-1 text-xs text-neutral-500">Danh sách món đã được ghi nhận cho phiên này.</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-neutral-500">{bill.itemsSnapshot.length} món</span>
              </div>

              {bill.itemsSnapshot.length > 0 ? (
                <div className="space-y-2">
                  {bill.itemsSnapshot.map((item, index) => (
                    <div key={`${item.menuItemId || item.name}-${index}`} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-sm">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-neutral-900" title={item.name}>{item.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.notes ? ` · ${item.notes}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-neutral-900">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-center text-sm text-neutral-500">
                  Chưa có món nào trong bill.
                </div>
              )}
            </section>

            {orders.length > 0 && (
              <section className="mt-6" aria-labelledby="bill-orders-title">
                <div className="mb-3">
                  <h3 id="bill-orders-title" className="text-sm font-extrabold text-neutral-900">Các order trong phiên</h3>
                  <p className="mt-1 text-xs text-neutral-500">Theo dõi trạng thái từng order đã tạo tại bàn.</p>
                </div>
                <div className="space-y-2">
                  {orders.map((order) => {
                    const orderId = getOrderId(order);
                    return (
                      <div key={orderId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-neutral-900">Đơn {orderId}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {orderStatusLabels[order.status] || order.status} · {order.items.length} món · {formatDateTime(order.createdAt || order.timestamp)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-extrabold text-neutral-900">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 sm:p-5" aria-labelledby="bill-totals-title">
              <div className="mb-4 flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                <h3 id="bill-totals-title" className="text-sm font-extrabold text-neutral-900">Chi tiết tiền</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4 text-neutral-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-neutral-600">
                  <span>Giảm giá</span>
                  <span className="font-semibold text-neutral-900">- {formatCurrency(bill.discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-neutral-600">
                  <span>Phí dịch vụ</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(bill.serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-neutral-600">
                  <span>Thuế</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(bill.taxAmount)}</span>
                </div>
                <div className="my-3 border-t border-neutral-200" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-extrabold text-neutral-950">Tổng cộng</span>
                  <span className="text-xl font-black text-emerald-700">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-100 bg-neutral-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              <span>Bill {bill.billCode}</span>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" aria-label="Đóng bill" onClick={() => onOpenChange(false)} className="rounded-xl">
                Đóng
              </Button>
              {canPay && (
                <Button onClick={() => onPay(bill)} className="rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Thanh toán bill
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
