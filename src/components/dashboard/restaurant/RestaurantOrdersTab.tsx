import React from 'react';
import { Order, OrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { RefreshCw, Search, ClipboardList, Clock, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export interface RestaurantOrdersTabProps {
  filteredOrders: Order[];
  orderSearch: string;
  orderStatusFilter: string;
  isLoadingOrders: boolean;
  onSetOrderSearch: (search: string) => void;
  onSetOrderStatusFilter: (filter: string) => void;
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => Promise<void>;
  onOpenCompletePaymentModal: (order: Order) => void;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200/30',
  [OrderStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-200/30',
  [OrderStatus.SERVED]: 'bg-violet-50 text-violet-700 border-violet-200/30',
  [OrderStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-250/20',
  [OrderStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200/30'
};

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ duyệt',
  [OrderStatus.CONFIRMED]: 'Bếp nhận',
  [OrderStatus.SERVED]: 'Đã ra món',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELLED]: 'Đã hủy'
};

export const RestaurantOrdersTab: React.FC<RestaurantOrdersTabProps> = ({
  filteredOrders,
  orderSearch,
  orderStatusFilter,
  isLoadingOrders,
  onSetOrderSearch,
  onSetOrderStatusFilter,
  onRefreshOrders,
  onUpdateOrderStatus,
  onOpenCompletePaymentModal
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Danh sách đơn hàng hiện tại</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Theo dõi và cập nhật trạng thái đơn hàng của thực khách theo thời gian thực.</p>
        </div>
        <Button size="sm" onClick={onRefreshOrders} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </Button>
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Tìm mã đơn, số bàn, khách..."
            value={orderSearch}
            onChange={(e) => onSetOrderSearch(e.target.value)}
            className="pl-10 rounded-xl border-neutral-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm"
          />
        </div>
        
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { label: 'Tất cả', value: 'ALL' },
            { label: 'Chờ duyệt', value: OrderStatus.PENDING },
            { label: 'Bếp nhận', value: OrderStatus.CONFIRMED },
            { label: 'Đã phục vụ', value: OrderStatus.SERVED },
            { label: 'Hoàn thành', value: OrderStatus.COMPLETED },
            { label: 'Đã hủy', value: OrderStatus.CANCELLED },
          ].map((tab) => (
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

      <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[120px]">Mã đơn</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[100px]">Bàn</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[140px]">Khách hàng</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Chi tiết món</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[130px]">Thời gian</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[120px]">Tổng tiền</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[130px]">Trạng thái</TableHead>
                <TableHead className="text-right text-xs font-bold text-neutral-400 w-[150px] pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const orderId = order.id || (order as any)._id;
                const orderIdShort = String(orderId).slice(-6).toUpperCase();
                const orderItemsText = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');

                // Format order time
                let timeStr = 'Vừa xong';
                if (order.createdAt) {
                  try {
                    const date = new Date(order.createdAt);
                    timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                  } catch {
                    timeStr = 'Vừa xong';
                  }
                } else if (order.timestamp) {
                  try {
                    const date = new Date(order.timestamp);
                    timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  } catch {
                    timeStr = 'Vừa xong';
                  }
                }

                return (
                  <TableRow key={orderId} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-neutral-500 pl-6">#{orderIdShort}</TableCell>
                    <TableCell className="font-bold text-xs text-neutral-900">Bàn {order.tableNumber}</TableCell>
                    <TableCell className="text-xs text-neutral-700 font-semibold">{order.customerName || 'Khách vãng lai'}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate text-neutral-600" title={orderItemsText}>
                      <span className="font-medium">{orderItemsText}</span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-350" />
                        {timeStr}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-neutral-900 text-xs">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColors[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Primary action based on current state */}
                        {order.status === OrderStatus.PENDING && (
                          <Button 
                            size="sm" 
                            onClick={() => onUpdateOrderStatus(orderId, OrderStatus.CONFIRMED)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 h-8 rounded-lg shadow-sm"
                          >
                            Xác nhận
                          </Button>
                        )}
                        {order.status === OrderStatus.CONFIRMED && (
                          <Button 
                            size="sm" 
                            onClick={() => onUpdateOrderStatus(orderId, OrderStatus.SERVED)} 
                            className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold px-3 py-1 h-8 rounded-lg shadow-sm"
                          >
                            Ra món
                          </Button>
                        )}
                        {order.status === OrderStatus.SERVED && (
                          <Button 
                            size="sm" 
                            onClick={() => onOpenCompletePaymentModal(order)} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 h-8 rounded-lg shadow-sm"
                          >
                            Thanh toán
                          </Button>
                        )}

                        {/* Row actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                              <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-44">
                            {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => onUpdateOrderStatus(orderId, OrderStatus.CANCELLED)}
                                  className="text-rose-600 hover:bg-rose-50/50 focus:text-rose-700 focus:bg-rose-55 font-semibold text-xs rounded-lg cursor-pointer"
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
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-800">Chưa có đơn hàng nào</h3>
                        <p className="text-xs text-neutral-400 mt-1">Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
