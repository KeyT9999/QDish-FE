import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, OrderStatus, Restaurant, PaymentMethod } from '@/types';
import { orderService } from '@/services/orderService';
import { restaurantService } from '@/services/restaurantService';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, Landmark, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  tableNumber: string;
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

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({
  isOpen,
  onClose,
  restaurantId,
  tableNumber
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);

  // Fetch orders and restaurant details
  const fetchOrders = useCallback(async (silent = false) => {
    if (!restaurantId || !tableNumber) return;

    if (!silent) setIsLoading(true);
    try {
      const fetchedOrders = await orderService.getOrdersByTable(restaurantId, tableNumber);
      setOrders((current) => areOrdersEquivalent(current, fetchedOrders) ? current : fetchedOrders);
    } catch (err) {
      if (!silent) toast.error('Không thể tải lịch sử gọi món');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [restaurantId, tableNumber]);

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const matched = await restaurantService.getPublicById(restaurantId);
      setRestaurant(matched);
    } catch (err) {
      console.error(err);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      fetchRestaurant();
    }
  }, [isOpen, fetchOrders, fetchRestaurant]);

  // Polling for updates
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 6000); // Poll every 6 seconds
    return () => clearInterval(interval);
  }, [isOpen, fetchOrders]);

  // Calculations
  const activeOrders = useMemo(() => orders.filter(o => 
    o.status === OrderStatus.PENDING || 
    o.status === OrderStatus.CONFIRMED || 
    o.status === OrderStatus.SERVED
  ), [orders]);

  const unpaidTotal = useMemo(
    () => activeOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    [activeOrders]
  );

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

  // Bank VietQR Helper
  const getBankCode = (bankName?: string) => {
    if (!bankName) return '';
    const nameUpper = bankName.toUpperCase();
    const map: Record<string, string> = {
      'VIETCOMBANK': 'vcb', 'VCB': 'vcb',
      'BIDV': 'bidv',
      'VIETINBANK': 'vietinbank',
      'AGRIBANK': 'agribank',
      'TECHCOMBANK': 'techcombank',
      'ACB': 'acb',
      'VPBANK': 'vpb', 'VP BANK': 'vpb',
      'MBBANK': 'mb', 'MB BANK': 'mb',
      'TPBANK': 'tpb', 'TP BANK': 'tpb',
      'HDBANK': 'hdb', 'HD BANK': 'hdb',
      'SHB': 'shb', 'VIB': 'vib', 'SACOMBANK': 'sacombank'
    };
    for (const [k, v] of Object.entries(map)) {
      if (nameUpper.includes(k)) return v;
    }
    return 'vcb'; // Fallback
  };

  const bankCode = useMemo(() => getBankCode(restaurant?.bankName), [restaurant?.bankName]);
  const qrUrl = useMemo(() => (
    paymentMethod === PaymentMethod.BANK_TRANSFER && restaurant?.bankAccount && bankCode && unpaidTotal > 0
      ? `https://img.vietqr.io/image/${bankCode}-${restaurant.bankAccount}-compact2.jpg?amount=${unpaidTotal}&addInfo=${encodeURIComponent(`Ban ${tableNumber} Thanh Toan`)}`
      : null
  ), [bankCode, paymentMethod, restaurant?.bankAccount, tableNumber, unpaidTotal]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-[100vw] sm:max-w-md p-0 flex flex-col bg-surface border-none shadow-xl">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
            <SheetTitle className="text-lg font-heading font-bold text-gray-900 flex items-center justify-between">
              <span>Đơn hàng đã gọi (Bàn {tableNumber})</span>
            </SheetTitle>
            <SheetDescription className="text-gray-500 text-xs">
              Theo dõi trạng thái chế biến hoặc yêu cầu thanh toán tại bàn.
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
                <div className="space-y-4 pb-28">
                  {orders.map((order, idx) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    const dateStr = order.timestamp || (order as any).createdAt
                      ? new Date(order.timestamp || (order as any).createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <div key={order.id || (order as any)._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                          <div>
                            <span className="text-xs text-gray-500 block">Mã đơn: #{String(order.id || (order as any)._id).slice(-6)}</span>
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
                              <span className="text-gray-900 font-medium">{item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span></span>
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

              {/* Sticky Bottom Actions */}
              {unpaidTotal > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-100 z-10 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-600">Tổng tiền chưa thanh toán:</span>
                    <span className="text-lg font-bold text-green-700">{formatCurrency(unpaidTotal)}</span>
                  </div>
                  <Button
                    onClick={() => setIsInvoiceOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-bold shadow-md shadow-green-600/10"
                  >
                    <Landmark className="w-4 h-4 mr-2" />
                    Thanh toán tại bàn (VietQR)
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* VietQR Invoice Modal */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 overflow-hidden">
          <DialogHeader className="border-b border-gray-100 pb-3">
            <DialogTitle className="text-lg font-heading font-bold text-gray-900">
              Hóa đơn & Thanh toán VietQR
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Quét mã bằng bất kỳ ứng dụng ngân hàng nào để thanh toán tự động.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Invoice Summary */}
            <div className="space-y-2 border-b border-gray-100 pb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bàn số:</span>
                <span className="font-semibold text-gray-900">{tableNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nhà hàng:</span>
                <span className="font-semibold text-gray-900">{restaurant?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số đơn gộp:</span>
                <span className="font-semibold text-gray-900">{activeOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-100">
                <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                <span className="font-bold text-green-700 text-lg">{formatCurrency(unpaidTotal)}</span>
              </div>
            </div>

            {/* Payment Method Select */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-gray-600 uppercase block">Phương thức thanh toán</span>
              <div className="flex gap-4">
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="custPaymentMethod"
                    value={PaymentMethod.BANK_TRANSFER}
                    checked={paymentMethod === PaymentMethod.BANK_TRANSFER}
                    onChange={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                    className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  Chuyển khoản (VietQR)
                </label>
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="custPaymentMethod"
                    value={PaymentMethod.CASH}
                    checked={paymentMethod === PaymentMethod.CASH}
                    onChange={() => setPaymentMethod(PaymentMethod.CASH)}
                    className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  Tiền mặt tại quầy
                </label>
              </div>
            </div>

            {/* QR display or cash notice */}
            {paymentMethod === PaymentMethod.BANK_TRANSFER && restaurant?.bankAccount ? (
              qrUrl ? (
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white shadow-inner">
                  <span className="text-xs font-bold text-gray-800 mb-2">Quét mã QR để chuyển khoản</span>
                  <img
                    src={qrUrl}
                    alt="VietQR code"
                    className="w-48 h-48 object-contain border border-gray-100 rounded-lg shadow-sm"
                    loading="lazy"
                    decoding="async"
                    width={192}
                    height={192}
                  />
                  <div className="mt-3 space-y-0.5 text-xs text-gray-500">
                    <p className="font-semibold text-gray-800">Ngân hàng: {restaurant.bankName}</p>
                    <p>STK: {restaurant.bankAccount}</p>
                    <p>Chủ TK: {restaurant.ownerName}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-xl text-center text-xs">
                  Không thể tạo VietQR do thông tin ngân hàng của nhà hàng chưa được cấu hình. Vui lòng thanh toán bằng tiền mặt.
                </div>
              )
            ) : paymentMethod === PaymentMethod.CASH ? (
              <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-center text-sm font-medium">
                Vui lòng liên hệ nhân viên phục vụ tại bàn hoặc quầy thu ngân để thanh toán bằng tiền mặt.
              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <Button
              onClick={() => setIsInvoiceOpen(false)}
              className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
