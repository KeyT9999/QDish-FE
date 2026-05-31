import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Bill, BillStatus, Order, OrderStatus } from '@/types';
import { billService } from '@/services/billService';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  tableNumber: string;
  sessionId?: string;
  onSessionClosed?: () => void;
}

const getOrderId = (order: Order) => String(order.id || (order as any)._id || '');
const getOrderVersion = (order: Order) => String((order as any).updatedAt || (order as any).createdAt || order.timestamp || '');

const areOrdersEquivalent = (current: Order[], next: Order[]) => {
  if (current.length !== next.length) return false;

  return current.every((order, index) => {
    const nextOrder = next[index];
    if (!nextOrder) return false;

    return (
      getOrderId(order) === getOrderId(nextOrder) &&
      getOrderVersion(order) === getOrderVersion(nextOrder) &&
      order.status === nextOrder.status &&
      order.totalAmount === nextOrder.totalAmount &&
      order.items.length === nextOrder.items.length
    );
  });
};

const getBillStatusLabel = (status?: BillStatus) => {
  switch (status) {
    case BillStatus.PAYMENT_REQUESTED:
      return 'Chờ thanh toán';
    case BillStatus.PAID:
      return 'Đã thanh toán';
    case BillStatus.CANCELLED:
      return 'Đã hủy';
    case BillStatus.UNPAID:
    default:
      return 'Chưa thanh toán';
  }
};

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({
  isOpen,
  onClose,
  restaurantId,
  tableNumber,
  sessionId,
  onSessionClosed
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hadOrdersRef = useRef(false);
  const notifiedClosedSessionRef = useRef<string | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!restaurantId || !tableNumber || !sessionId) {
      setOrders([]);
      setBill(null);
      return;
    }

    if (!silent) setIsLoading(true);
    try {
      const currentBill = await billService.getCurrentBill(restaurantId, tableNumber, sessionId);
      const fetchedOrders = currentBill.orders;
      setBill(currentBill.bill);

      if (
        hadOrdersRef.current &&
        (!currentBill.bill || fetchedOrders.length === 0) &&
        notifiedClosedSessionRef.current !== sessionId
      ) {
        notifiedClosedSessionRef.current = sessionId;
        onSessionClosed?.();
      }

      hadOrdersRef.current = fetchedOrders.length > 0;
      setOrders((current) => areOrdersEquivalent(current, fetchedOrders) ? current : fetchedOrders);
    } catch (err) {
      if (!silent) toast.error('Không thể tải lịch sử gọi món');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [onSessionClosed, restaurantId, tableNumber, sessionId]);

  useEffect(() => {
    setOrders([]);
    setBill(null);
    hadOrdersRef.current = false;
    notifiedClosedSessionRef.current = null;
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, fetchOrders]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId, fetchOrders]);

  const activeOrders = useMemo(() => orders.filter(o =>
    o.status === OrderStatus.PENDING ||
    o.status === OrderStatus.CONFIRMED ||
    o.status === OrderStatus.SERVED
  ), [orders]);

  const unpaidTotal = useMemo(
    () => bill?.totalAmount ?? activeOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    [activeOrders, bill]
  );

  const totalBillItems = useMemo(
    () => bill?.totalItems ?? activeOrders.reduce((sum, order) => (
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    ), 0),
    [activeOrders, bill]
  );

  const showBillSummary = unpaidTotal > 0 && bill?.status !== BillStatus.PAID && bill?.status !== BillStatus.CANCELLED;

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { label: 'Đang chờ bếp nhận', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock };
      case OrderStatus.CONFIRMED:
        return { label: 'Đang chế biến', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw };
      case OrderStatus.SERVED:
        return { label: 'Đã phục vụ', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 };
      case OrderStatus.COMPLETED:
        return { label: 'Đã thanh toán', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle2 };
      case OrderStatus.CANCELLED:
        return { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle };
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[100vw] sm:max-w-md p-0 flex flex-col bg-surface border-none shadow-xl">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <SheetTitle className="text-lg font-heading font-bold text-gray-900 flex items-center justify-between">
            <span>Đơn hàng đã gọi (Bàn {tableNumber})</span>
          </SheetTitle>
          <SheetDescription className="text-gray-500 text-xs">
            Theo dõi trạng thái chế biến và tổng bill hiện tại. Thanh toán sẽ do nhân viên xác nhận tại bàn.
          </SheetDescription>
        </SheetHeader>

        {isLoading && orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-green-600 mb-2" />
            <p className="text-gray-500 text-sm">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Chưa có món nào được gọi</h3>
            <p className="text-gray-500 text-xs max-w-[250px]">
              Hãy chọn món từ thực đơn và nhấn đặt món để bắt đầu thưởng thức bữa ăn.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5 py-4">
              <div className={`space-y-4 ${showBillSummary ? 'pb-32' : 'pb-6'}`}>
                {bill && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Bill hiện tại</p>
                        <p className="mt-1 font-mono text-sm font-bold text-gray-900">{bill.billCode}</p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        {getBillStatusLabel(bill.status)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="block text-gray-500">Số đơn</span>
                        <span className="font-bold text-gray-900">{bill.orderIds.length || orders.length}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Tổng món</span>
                        <span className="font-bold text-gray-900">{totalBillItems}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-gray-500">Tổng bill</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(unpaidTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;
                  const rawTime = order.timestamp || (order as any).createdAt;
                  const dateStr = rawTime
                    ? new Date(rawTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div key={getOrderId(order)} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                        <div>
                          <span className="text-xs text-gray-500 block">Mã đơn: #{getOrderId(order).slice(-6)}</span>
                          <span className="text-xs font-semibold text-gray-700">{dateStr}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        {order.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-900 font-medium">
                              {item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span>
                            </span>
                            <span className="text-gray-600 font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {order.note && (
                          <div className="text-xs bg-yellow-50/50 text-yellow-800 p-2 rounded-lg border border-yellow-100/50">
                            <span className="font-semibold">Ghi chú:</span> {order.note}
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-900">Tổng tiền đơn</span>
                          <span className="font-bold text-green-700">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {showBillSummary && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-gray-100 z-10 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-600">Tổng bill hiện tại:</span>
                  <span className="text-lg font-bold text-green-700">{formatCurrency(unpaidTotal)}</span>
                </div>
                <p className="text-xs font-medium text-gray-500">
                  Khi muốn thanh toán, vui lòng gọi nhân viên. Nhà hàng sẽ chọn tiền mặt hoặc chuyển khoản trên hệ thống.
                </p>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
