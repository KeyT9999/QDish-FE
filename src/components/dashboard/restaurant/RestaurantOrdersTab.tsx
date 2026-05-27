import React, { useMemo } from 'react';
import { ActiveBill, BillStatus, Order, OrderStatus, Role } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { RefreshCw, Search, ClipboardList, Clock, MoreHorizontal, Receipt, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export interface RestaurantOrdersTabProps {
  activeBills: ActiveBill[];
  orderSearch: string;
  orderStatusFilter: string;
  isLoadingOrders: boolean;
  onSetOrderSearch: (search: string) => void;
  onSetOrderStatusFilter: (filter: string) => void;
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => Promise<void>;
  onPayBill: (billId: string) => Promise<void>;
  userRole?: Role;
  canPayBill?: boolean;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200/60',
  [OrderStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-200/60',
  [OrderStatus.SERVED]: 'bg-violet-50 text-violet-700 border-violet-200/60',
  [OrderStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  [OrderStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200/60'
};

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ duyệt',
  [OrderStatus.CONFIRMED]: 'Bếp nhận',
  [OrderStatus.SERVED]: 'Đã ra món',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELLED]: 'Đã hủy'
};

const billStatusLabel: Record<BillStatus, string> = {
  [BillStatus.UNPAID]: 'Chưa thanh toán',
  [BillStatus.PAYMENT_REQUESTED]: 'Chờ thanh toán',
  [BillStatus.PAID]: 'Đã thanh toán',
  [BillStatus.CANCELLED]: 'Đã hủy'
};

const billStatusClass: Record<BillStatus, string> = {
  [BillStatus.UNPAID]: 'bg-amber-50 text-amber-700 border-amber-200/60',
  [BillStatus.PAYMENT_REQUESTED]: 'bg-rose-50 text-rose-700 border-rose-200/60',
  [BillStatus.PAID]: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  [BillStatus.CANCELLED]: 'bg-neutral-50 text-neutral-600 border-neutral-200/60'
};

const orderFilterTabs = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ duyệt', value: OrderStatus.PENDING },
  { label: 'Bếp nhận', value: OrderStatus.CONFIRMED },
  { label: 'Đã phục vụ', value: OrderStatus.SERVED },
  { label: 'Hoàn thành', value: OrderStatus.COMPLETED },
  { label: 'Đã hủy', value: OrderStatus.CANCELLED }
];

const staffOrderFilterTabs = orderFilterTabs.filter((tab) => tab.value !== OrderStatus.CANCELLED);

const emptyStateCopy: Record<string, { title: string; description: string }> = {
  ALL: {
    title: 'Chưa có đơn hàng nào',
    description: 'Bill và order sẽ xuất hiện sau khi khách đặt món trong phiên bàn.'
  },
  [OrderStatus.PENDING]: {
    title: 'Chưa có đơn chờ duyệt',
    description: 'Các bill có order mới chờ xác nhận sẽ hiển thị tại đây.'
  },
  [OrderStatus.CONFIRMED]: {
    title: 'Chưa có đơn bếp đã nhận',
    description: 'Các bill có order đã được bếp nhận sẽ hiển thị tại đây.'
  },
  [OrderStatus.SERVED]: {
    title: 'Chưa có đơn đã phục vụ',
    description: 'Các bill đã ra món nhưng chưa thanh toán sẽ hiển thị tại đây.'
  },
  [OrderStatus.COMPLETED]: {
    title: 'Chưa có hóa đơn hoàn thành',
    description: 'Bill đã thanh toán sẽ nằm trong lịch sử hoàn thành.'
  },
  [OrderStatus.CANCELLED]: {
    title: 'Chưa có hóa đơn đã hủy',
    description: 'Bill hoặc order đã hủy sẽ hiển thị tại đây khi có phát sinh.'
  }
};

const getOrderId = (order: Order) => String(order.id || (order as any)._id || '');

const getOrderTime = (order: Order) => {
  const raw = order.createdAt || (order.timestamp ? new Date(order.timestamp).toISOString() : '');
  if (!raw) return 'Vừa xong';

  try {
    const date = new Date(raw);
    return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
  } catch {
    return 'Vừa xong';
  }
};

const orderMatchesSearch = (order: Order, searchLower: string) => {
  if (!searchLower) return true;
  const orderId = getOrderId(order).toLowerCase();
  const customer = (order.customerName || '').toLowerCase();
  const note = (order.note || '').toLowerCase();
  const itemsString = order.items.map((item) => item.name).join(' ').toLowerCase();
  return orderId.includes(searchLower) || customer.includes(searchLower) || note.includes(searchLower) || itemsString.includes(searchLower);
};

export const RestaurantOrdersTab: React.FC<RestaurantOrdersTabProps> = ({
  activeBills,
  orderSearch,
  orderStatusFilter,
  isLoadingOrders,
  onSetOrderSearch,
  onSetOrderStatusFilter,
  onRefreshOrders,
  onUpdateOrderStatus,
  onPayBill,
  userRole,
  canPayBill = true
}) => {
  const availableFilterTabs = userRole === Role.STAFF ? staffOrderFilterTabs : orderFilterTabs;
  const emptyCopy = emptyStateCopy[orderStatusFilter] || emptyStateCopy.ALL;

  const filteredBills = useMemo(() => {
    const searchLower = orderSearch.trim().toLowerCase();

    return activeBills.filter((bill) => {
      const billMatchesSearch = !searchLower || (
        bill.billCode.toLowerCase().includes(searchLower) ||
        String(bill.tableNumber).toLowerCase().includes(searchLower) ||
        (bill.sessionCode || '').toLowerCase().includes(searchLower)
      );

      return billMatchesSearch || bill.orders.some((order) => orderMatchesSearch(order, searchLower));
    });
  }, [activeBills, orderSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Đơn hàng theo bill</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Mỗi bill gom nhiều order trong cùng phiên bàn. Thanh toán chỉ thực hiện ở cấp bill.</p>
        </div>
        <Button size="sm" onClick={onRefreshOrders} disabled={isLoadingOrders} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} /> Làm mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Tìm bill, bàn, mã đơn, món..."
            value={orderSearch}
            onChange={(e) => onSetOrderSearch(e.target.value)}
            className="pl-10 rounded-xl border-neutral-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {availableFilterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onSetOrderStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors duration-200 ${
                orderStatusFilter === tab.value
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200/60 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-800">{emptyCopy.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{emptyCopy.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => {
            const isBillPayable = bill.status === BillStatus.UNPAID || bill.status === BillStatus.PAYMENT_REQUESTED;

            return (
              <Card key={bill.billId} className="overflow-hidden rounded-2xl border-neutral-200/50 bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 border-b border-neutral-100 bg-neutral-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Receipt className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-neutral-950">Bàn {bill.tableNumber}</h3>
                        <span className="font-mono text-xs font-bold text-neutral-500">{bill.billCode}</span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${billStatusClass[bill.status]}`}>
                          {billStatusLabel[bill.status]}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-neutral-500">
                        <span>Session: <span className="font-mono">{bill.sessionCode || '-'}</span></span>
                        <span>{bill.orderCount} orders</span>
                        <span>{bill.totalItems} món</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="text-left sm:text-right">
                        <span className="block text-[11px] font-semibold text-neutral-500">Tổng bill</span>
                        <span className="text-lg font-bold text-emerald-700">{formatCurrency(bill.totalAmount)}</span>
                      </div>
                      {canPayBill && isBillPayable && (
                        <Button
                          size="sm"
                          onClick={() => onPayBill(bill.billId)}
                          className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Thanh toán bill
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {bill.orders.map((order) => {
                      const orderId = getOrderId(order);
                      const orderIdShort = orderId.slice(-6).toUpperCase();
                      const orderItemsText = order.items.map((item) => `${item.name} x${item.quantity}`).join(', ');
                      const canUpdateOrder = bill.status !== BillStatus.PAID && bill.status !== BillStatus.CANCELLED;

                      return (
                        <div key={orderId} className="grid gap-3 px-4 py-3 md:grid-cols-[120px_1fr_120px_150px] md:items-center">
                          <div>
                            <span className="block font-mono text-xs font-bold text-neutral-500">#{orderIdShort}</span>
                            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                              <Clock className="h-3.5 w-3.5" />
                              {getOrderTime(order)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-neutral-700" title={orderItemsText}>
                              {orderItemsText}
                            </p>
                            {order.note && (
                              <p className="mt-1 inline-flex rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                                Ghi chú: {order.note}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusColors[order.status]}`}>
                              {statusLabel[order.status]}
                            </span>
                            <span className="text-xs font-bold text-neutral-900">{formatCurrency(order.totalAmount)}</span>
                          </div>

                          <div className="flex items-center justify-start gap-1.5 md:justify-end">
                            {canUpdateOrder && order.status === OrderStatus.PENDING && (
                              <Button
                                size="sm"
                                onClick={() => onUpdateOrderStatus(orderId, OrderStatus.CONFIRMED)}
                                className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                              >
                                Xác nhận
                              </Button>
                            )}
                            {canUpdateOrder && order.status === OrderStatus.CONFIRMED && (
                              <Button
                                size="sm"
                                onClick={() => onUpdateOrderStatus(orderId, OrderStatus.SERVED)}
                                className="h-8 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
                              >
                                Ra món
                              </Button>
                            )}
                            {canUpdateOrder && order.status === OrderStatus.SERVED && (
                              <span className="rounded-lg bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-500">
                                Chờ thanh toán bill
                              </span>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                                  <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-44">
                                {canUpdateOrder && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => onUpdateOrderStatus(orderId, OrderStatus.CANCELLED)}
                                      className="text-rose-600 hover:bg-rose-50/50 focus:text-rose-700 focus:bg-rose-50 font-semibold text-xs rounded-lg cursor-pointer"
                                    >
                                      Hủy đơn hàng
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(orderId);
                                    toast.success('Đã copy mã đơn hàng');
                                  }}
                                  className="text-neutral-700 font-medium text-xs rounded-lg cursor-pointer"
                                >
                                  Sao chép mã đơn
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
