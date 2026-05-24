import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, OrderStatus, Role } from '@/types';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';
import {
  enableRealtimeOrderAudio,
  REALTIME_ORDER_ALERT_DURATION_MS,
  startRealtimeOrderAlert,
  stopRealtimeOrderAlert,
  useRealtimeOrders,
  upsertRealtimeOrder
} from '@/hooks/useRealtimeOrders';
import { NewOrderAlertOverlay } from '@/components/shared/NewOrderAlertOverlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ChefHat, Play, CheckCircle2, Clock, BellRing } from 'lucide-react';
import { toast } from 'sonner';

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

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRealtimeOrder, setLastRealtimeOrder] = useState<Order | null>(null);
  const [activeRealtimeOrder, setActiveRealtimeOrder] = useState<Order | null>(null);
  const [realtimeAlertStartedAt, setRealtimeAlertStartedAt] = useState<number | null>(null);
  const [isConfirmingRealtimeOrder, setIsConfirmingRealtimeOrder] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const fetchedOrders = await orderService.getStaffOrders();
      setOrders((current) => areOrdersEquivalent(current, fetchedOrders) ? current : fetchedOrders);
    } catch (err) {
      if (!silent) toast.error('Không thể tải danh sách đơn hàng của bếp');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000); // Realtime is primary; polling is only a safety fallback.
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const canCompleteOrders = user?.role === Role.RESTAURANT_ADMIN;

  const handleRealtimeNewOrder = useCallback((order: Order) => {
    setOrders((current) => upsertRealtimeOrder(current, order));
    setLastRealtimeOrder(order);
    setActiveRealtimeOrder(order);
    setRealtimeAlertStartedAt(Date.now());
  }, []);

  const handleRealtimeOrderUpdated = useCallback((order: Order) => {
    setOrders((current) => upsertRealtimeOrder(current, order));
  }, []);

  useRealtimeOrders({
    enabled: Boolean(user?.restaurantId),
    onNewOrder: handleRealtimeNewOrder,
    onOrderUpdated: handleRealtimeOrderUpdated,
  });

  const handleEnableAudio = useCallback(async () => {
    const enabled = await enableRealtimeOrderAudio();
    setIsAudioReady(enabled);
    if (enabled && activeRealtimeOrder) {
      startRealtimeOrderAlert(activeRealtimeOrder);
    }
    toast[enabled ? 'success' : 'error'](
      enabled ? 'Đã bật âm báo đơn mới' : 'Trình duyệt chưa cho phép bật âm báo'
    );
  }, [activeRealtimeOrder]);

  const clearRealtimeAlert = useCallback((orderId?: string) => {
    stopRealtimeOrderAlert(orderId);
    setActiveRealtimeOrder((current) => {
      if (!current) return current;
      if (orderId && getOrderId(current) !== orderId) return current;
      return null;
    });
    setRealtimeAlertStartedAt(null);
    setIsConfirmingRealtimeOrder(false);
  }, []);

  useEffect(() => {
    if (!activeRealtimeOrder) return;

    const timeout = window.setTimeout(() => {
      clearRealtimeAlert(getOrderId(activeRealtimeOrder));
    }, REALTIME_ORDER_ALERT_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [activeRealtimeOrder, clearRealtimeAlert]);

  useEffect(() => {
    if (!activeRealtimeOrder) return;

    const activeOrderId = getOrderId(activeRealtimeOrder);
    const latestOrder = orders.find((order) => getOrderId(order) === activeOrderId);
    if (latestOrder && latestOrder.status !== OrderStatus.PENDING) {
      clearRealtimeAlert(activeOrderId);
    }
  }, [activeRealtimeOrder, clearRealtimeAlert, orders]);

  const handleConfirmRealtimeOrder = useCallback(async () => {
    if (!activeRealtimeOrder) return;

    const orderId = getOrderId(activeRealtimeOrder);
    if (!orderId) {
      clearRealtimeAlert();
      return;
    }

    if (activeRealtimeOrder.status !== OrderStatus.PENDING) {
      clearRealtimeAlert(orderId);
      return;
    }

    setIsConfirmingRealtimeOrder(true);
    try {
      const updatedOrder = await orderService.updateStaffOrderStatus(orderId, OrderStatus.CONFIRMED);
      setOrders((current) => upsertRealtimeOrder(current, updatedOrder));
      clearRealtimeAlert(orderId);
      toast.success('Đã nhận đơn mới');
    } catch (err: any) {
      setIsConfirmingRealtimeOrder(false);
      toast.error(err.message || 'Không thể xác nhận đơn mới');
    }
  }, [activeRealtimeOrder, clearRealtimeAlert]);

  const handleUpdateStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateStaffOrderStatus(orderId, newStatus);
      setOrders((current) => upsertRealtimeOrder(current, updatedOrder));
      if (newStatus === OrderStatus.CONFIRMED) {
        clearRealtimeAlert(orderId);
      }
      toast.success(`Đã cập nhật trạng thái đơn hàng sang ${newStatus}`);
      fetchOrders(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật đơn hàng');
    }
  }, [clearRealtimeAlert, fetchOrders]);

  // Group active orders
  const pendingOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.PENDING), [orders]);
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.CONFIRMED), [orders]);
  const servedOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.SERVED), [orders]);

  const renderOrderCard = useCallback((order: Order) => {
    const timeStr = (order as any).createdAt
      ? new Date((order as any).createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <Card key={order.id || (order as any)._id} className="shadow-sm border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="p-3 bg-gray-50 border-b border-gray-100 flex flex-row justify-between items-center space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900">Bàn {order.tableNumber}</CardTitle>
            <CardDescription className="text-[10px] font-mono">#{String(order.id || (order as any)._id).slice(-6)} • {timeStr}</CardDescription>
          </div>
          {order.customerName && (
            <Badge variant="outline" className="text-[10px] font-semibold bg-white text-gray-700 max-w-[120px] truncate">
              {order.customerName}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <ul className="text-xs text-gray-600 space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-bold text-gray-900">x{item.quantity}</span>
              </li>
            ))}
          </ul>

          {order.note && (
            <div className="text-[10px] bg-red-50 text-red-700 p-2 rounded-lg border border-red-100/50 font-medium">
              Ghi chú: {order.note}
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-green-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
            <div className="flex gap-1.5">
              {order.status === OrderStatus.PENDING && (
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateStatus(order.id || (order as any)._id, OrderStatus.CONFIRMED)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] py-1 h-7"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Nhận đơn
                </Button>
              )}
              {order.status === OrderStatus.CONFIRMED && (
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateStatus(order.id || (order as any)._id, OrderStatus.SERVED)}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] py-1 h-7"
                >
                  <ChefHat className="w-3.5 h-3.5 mr-1" /> Ra món
                </Button>
              )}
              {order.status === OrderStatus.SERVED && canCompleteOrders && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(order.id || (order as any)._id, OrderStatus.COMPLETED)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] py-1 h-7"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Hoàn thành
                </Button>
              )}
              {order.status === OrderStatus.SERVED && !canCompleteOrders && (
                <span className="text-[10px] text-gray-400 italic">Chờ thanh toán</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [canCompleteOrders, handleUpdateStatus]);

  return (
    <div className="space-y-6 px-4">
      <NewOrderAlertOverlay
        order={activeRealtimeOrder}
        startedAt={realtimeAlertStartedAt}
        isAudioReady={isAudioReady}
        isConfirming={isConfirmingRealtimeOrder}
        confirmLabel="Nhận đơn ngay"
        onConfirm={handleConfirmRealtimeOrder}
        onEnableAudio={handleEnableAudio}
      />

      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center">
            <ChefHat className="w-6 h-6 text-green-600 mr-2" />
            Khu vực chế biến của bếp
          </h1>
          <p className="text-gray-500 text-sm">Hiển thị đơn hàng đang phục vụ theo trạng thái thời gian thực.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isAudioReady ? 'default' : 'outline'}
            size="sm"
            onClick={handleEnableAudio}
            className="rounded-lg text-xs font-semibold"
          >
            <BellRing className="w-4 h-4 mr-1.5" />
            {isAudioReady ? 'Chuông đã bật' : 'Bật chuông'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            disabled={isRefreshing}
            className="rounded-lg text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {lastRealtimeOrder && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <div className="font-bold">Đơn mới vừa vào bếp</div>
          <div className="mt-1 text-xs font-medium">
            Bàn {lastRealtimeOrder.tableNumber} • {lastRealtimeOrder.items.length} dòng món • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lastRealtimeOrder.totalAmount)}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex py-20 justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: PENDING */}
          <div className="space-y-3">
            <div className="bg-yellow-500 text-white p-3 rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Chờ xử lý (Pending)
              </span>
              <Badge className="bg-white text-yellow-600 font-bold">{pendingOrders.length}</Badge>
            </div>
            <ScrollArea className="h-[70vh] bg-white border border-gray-100 rounded-2xl p-3 shadow-inner">
              <div className="space-y-3">
                {pendingOrders.map(renderOrderCard)}
                {pendingOrders.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-10">Không có đơn hàng chờ</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Column 2: CONFIRMED */}
          <div className="space-y-3">
            <div className="bg-blue-500 text-white p-3 rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" />
                Đang nấu (Confirmed)
              </span>
              <Badge className="bg-white text-blue-600 font-bold">{confirmedOrders.length}</Badge>
            </div>
            <ScrollArea className="h-[70vh] bg-white border border-gray-100 rounded-2xl p-3 shadow-inner">
              <div className="space-y-3">
                {confirmedOrders.map(renderOrderCard)}
                {confirmedOrders.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-10">Không có món đang nấu</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Column 3: SERVED */}
          <div className="space-y-3">
            <div className="bg-purple-500 text-white p-3 rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Đã phục vụ (Served)
              </span>
              <Badge className="bg-white text-purple-600 font-bold">{servedOrders.length}</Badge>
            </div>
            <ScrollArea className="h-[70vh] bg-white border border-gray-100 rounded-2xl p-3 shadow-inner">
              <div className="space-y-3">
                {servedOrders.map(renderOrderCard)}
                {servedOrders.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-10">Không có đơn đang chờ thanh toán</p>
                )}
              </div>
            </ScrollArea>
          </div>

        </div>
      )}
    </div>
  );
};
