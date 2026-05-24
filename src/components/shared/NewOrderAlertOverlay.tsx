import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Clock, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { REALTIME_ORDER_ALERT_DURATION_MS } from '@/hooks/useRealtimeOrders';

type NewOrderAlertOverlayProps = {
  order: Order | null;
  startedAt: number | null;
  isAudioReady: boolean;
  isConfirming?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onEnableAudio?: () => void;
};

const getOrderId = (order: Order) => String(order.id || (order as any)._id || '');

export const NewOrderAlertOverlay: React.FC<NewOrderAlertOverlayProps> = ({
  order,
  startedAt,
  isAudioReady,
  isConfirming = false,
  confirmLabel = 'Nhận đơn ngay',
  onConfirm,
  onEnableAudio,
}) => {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!order) return;

    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [order]);

  const remainingSeconds = useMemo(() => {
    if (!startedAt || !now) return Math.ceil(REALTIME_ORDER_ALERT_DURATION_MS / 1000);
    const remainingMs = Math.max(0, REALTIME_ORDER_ALERT_DURATION_MS - (now - startedAt));
    return Math.ceil(remainingMs / 1000);
  }, [now, startedAt]);

  if (!order) return null;

  const orderId = getOrderId(order).slice(-6).toUpperCase();
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const visibleItems = order.items.slice(0, 4);
  const hiddenItemCount = Math.max(0, order.items.length - visibleItems.length);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/75 px-4 py-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="new-order-alert-title"
    >
      <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-amber-300 bg-neutral-50 shadow-2xl">
        <div className="bg-amber-500 px-6 py-4 text-neutral-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-amber-300">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-950 opacity-30" />
                <BellRing className="relative h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em]">Cảnh báo bếp</p>
                <h2 id="new-order-alert-title" className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
                  Đơn mới
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-amber-200">
              <Clock className="h-5 w-5" />
              <span className="text-2xl font-black tabular-nums">{remainingSeconds}s</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Bàn</p>
            <div className="mt-2 text-7xl font-black leading-none text-neutral-950">{order.tableNumber}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-neutral-700">
              <span className="rounded-full bg-neutral-100 px-3 py-1">#{orderId}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">{totalQuantity} món</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">{formatCurrency(order.totalAmount)}</span>
            </div>
            {!isAudioReady && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Chuông chưa bật trên trình duyệt này.
                </div>
                {onEnableAudio && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full rounded-lg border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-100"
                    onClick={onEnableAudio}
                  >
                    Bật chuông
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex min-h-[280px] flex-col justify-between gap-5">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">Món cần xử lý</p>
              <div className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
                {visibleItems.map((item, index) => (
                  <div key={`${item.menuItemId}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-lg font-bold text-neutral-950">{item.name}</span>
                    <span className="rounded-lg bg-amber-100 px-3 py-1 text-2xl font-black text-amber-900">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
                {hiddenItemCount > 0 && (
                  <div className="px-4 py-3 text-sm font-bold text-neutral-500">
                    Còn {hiddenItemCount} dòng món khác trong đơn.
                  </div>
                )}
              </div>

              {order.note && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                  Ghi chú: {order.note}
                </div>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              className="h-16 rounded-xl bg-neutral-950 text-lg font-black text-white hover:bg-neutral-800"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              <CheckCircle2 className="mr-2 h-6 w-6" />
              {isConfirming ? 'Đang xác nhận...' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
