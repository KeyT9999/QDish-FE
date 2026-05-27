import React, { useCallback, useEffect, useState } from 'react';
import { Bill, BillStatus, Order } from '@/types';
import { billService } from '@/services/billService';
import { BillPaymentModal } from '@/components/dashboard/restaurant/modals/BillPaymentModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Eye, Receipt, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface RestaurantBillsTabProps {
  restaurantId: string;
}

const statusLabel: Record<BillStatus, string> = {
  [BillStatus.UNPAID]: 'Chưa thanh toán',
  [BillStatus.PAYMENT_REQUESTED]: 'Chờ thanh toán',
  [BillStatus.PAID]: 'Đã thanh toán',
  [BillStatus.CANCELLED]: 'Đã hủy'
};

const statusClass: Record<BillStatus, string> = {
  [BillStatus.UNPAID]: 'bg-amber-50 text-amber-700 border-amber-200/60',
  [BillStatus.PAYMENT_REQUESTED]: 'bg-rose-50 text-rose-700 border-rose-200/60',
  [BillStatus.PAID]: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  [BillStatus.CANCELLED]: 'bg-neutral-50 text-neutral-600 border-neutral-200/60'
};

const getBillId = (bill: Bill) => bill.id || (bill as any)._id || '';

const formatDate = (value?: string) => {
  if (!value) return '-';
  try {
    const date = new Date(value);
    return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString('vi-VN')}`;
  } catch {
    return '-';
  }
};

export const RestaurantBillsTab: React.FC<RestaurantBillsTabProps> = ({ restaurantId }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [status, setStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState<Bill | null>(null);

  const loadBills = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const result = await billService.getBills(restaurantId, {
        tableNumber: tableNumber.trim() || undefined,
        status,
        page: 1,
        limit: 30
      });
      setBills(result.bills);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải lịch sử hóa đơn');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, status, tableNumber]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleViewDetail = async (bill: Bill) => {
    const billId = getBillId(bill);
    if (!billId) return;
    setIsDetailLoading(true);
    try {
      const detail = await billService.getBillDetail(billId, restaurantId);
      setSelectedBill(detail.bill);
      setSelectedOrders(detail.orders);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải chi tiết hóa đơn');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handlePayBill = async (bill: Bill) => {
    const billId = getBillId(bill);
    if (!billId) return;
    setSelectedPaymentBill({ ...bill, id: billId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Hóa đơn / Bill</h2>
          <p className="mt-0.5 text-xs text-neutral-500">Theo dõi bill gom nhiều lần đặt món trong cùng một phiên bàn.</p>
        </div>
        <Button size="sm" onClick={loadBills} disabled={isLoading} className="h-9 rounded-xl bg-neutral-900 text-xs font-semibold text-white hover:bg-black">
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <Input
          placeholder="Lọc theo bàn"
          value={tableNumber}
          onChange={(event) => setTableNumber(event.target.value)}
          className="h-10 rounded-xl border-neutral-200 text-sm md:w-48"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 md:w-52"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value={BillStatus.UNPAID}>Chưa thanh toán</option>
          <option value={BillStatus.PAYMENT_REQUESTED}>Chờ thanh toán</option>
          <option value={BillStatus.PAID}>Đã thanh toán</option>
          <option value={BillStatus.CANCELLED}>Đã hủy</option>
        </select>
      </div>

      <Card className="overflow-hidden rounded-2xl border-neutral-200/50 bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="w-[140px] pl-6 text-xs font-bold text-neutral-400">Mã bill</TableHead>
                <TableHead className="w-[90px] text-xs font-bold text-neutral-400">Bàn</TableHead>
                <TableHead className="w-[140px] text-xs font-bold text-neutral-400">Session</TableHead>
                <TableHead className="w-[100px] text-xs font-bold text-neutral-400">Tổng món</TableHead>
                <TableHead className="w-[130px] text-xs font-bold text-neutral-400">Tổng tiền</TableHead>
                <TableHead className="w-[140px] text-xs font-bold text-neutral-400">Trạng thái</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Thanh toán lúc</TableHead>
                <TableHead className="w-[210px] pr-6 text-right text-xs font-bold text-neutral-400">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => {
                const billId = getBillId(bill);
                const canPay = bill.status === BillStatus.UNPAID || bill.status === BillStatus.PAYMENT_REQUESTED;

                return (
                  <TableRow key={billId} className="border-neutral-100 hover:bg-neutral-50/40">
                    <TableCell className="pl-6 font-mono text-xs font-bold text-neutral-700">{bill.billCode}</TableCell>
                    <TableCell className="text-xs font-bold text-neutral-900">Bàn {bill.tableNumber}</TableCell>
                    <TableCell className="font-mono text-[11px] text-neutral-500">{bill.sessionCode || '-'}</TableCell>
                    <TableCell className="text-xs font-semibold text-neutral-700">{bill.totalItems}</TableCell>
                    <TableCell className="text-xs font-bold text-neutral-900">{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusClass[bill.status]}`}>
                        {statusLabel[bill.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-neutral-500">{formatDate(bill.paidAt)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetail(bill)} className="h-8 rounded-lg text-xs font-semibold">
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Chi tiết
                        </Button>
                        {canPay && (
                          <Button
                            size="sm"
                            onClick={() => handlePayBill(bill)}
                            className="h-8 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Thanh toán
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {bills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200/50 bg-neutral-50">
                        <Receipt className="h-6 w-6 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-800">Chưa có bill phù hợp</h3>
                        <p className="mt-1 text-xs text-neutral-400">Bill sẽ xuất hiện sau khi khách bắt đầu đặt món trong phiên bàn.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedBill && (
        <Card className="rounded-2xl border-neutral-200/50 bg-white shadow-sm">
          <CardHeader className="border-b border-neutral-100">
            <CardTitle className="text-sm font-bold text-neutral-900">
              Chi tiết bill {selectedBill.billCode}
              {isDetailLoading && <span className="ml-2 text-xs font-medium text-neutral-400">Đang tải...</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-400">Món đã gom</h3>
              <div className="space-y-2">
                {selectedBill.itemsSnapshot.map((item, index) => (
                  <div key={`${item.menuItemId || item.name}-${index}`} className="flex justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 px-3 py-2 text-sm">
                    <span className="font-semibold text-neutral-800">{item.name} <span className="text-neutral-400">x{item.quantity}</span></span>
                    <span className="font-bold text-neutral-900">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-400">Các order trong bill</h3>
              <div className="space-y-2">
                {selectedOrders.map((order) => (
                  <div key={order.id || (order as any)._id} className="rounded-xl border border-neutral-100 px-3 py-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono text-xs font-bold text-neutral-500">#{String(order.id || (order as any)._id).slice(-6)}</span>
                      <span className="font-bold text-neutral-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-neutral-500" title={order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}>
                      {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 border-t border-neutral-100 pt-4 text-right">
              <span className="text-sm font-semibold text-neutral-500">Tổng thanh toán: </span>
              <span className="text-xl font-bold text-emerald-700">{formatCurrency(selectedBill.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <BillPaymentModal
        open={Boolean(selectedPaymentBill)}
        bill={selectedPaymentBill}
        restaurantId={restaurantId}
        onOpenChange={(open) => {
          if (!open) setSelectedPaymentBill(null);
        }}
        onPaid={async () => {
          await loadBills();
          if (selectedBill && selectedPaymentBill && getBillId(selectedBill) === getBillId(selectedPaymentBill)) {
            await handleViewDetail(selectedPaymentBill);
          }
        }}
      />
    </div>
  );
};
