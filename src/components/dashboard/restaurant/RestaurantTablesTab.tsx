import React, { useState } from 'react';
import { RestaurantTable, TableStatus } from '@/services/tableService';
import { billService } from '@/services/billService';
import { Bill, BillStatus } from '@/types';
import { BillPaymentModal } from '@/components/dashboard/restaurant/modals/BillPaymentModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle2,
  Clock3,
  Eye,
  MoreHorizontal,
  QrCode,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface RestaurantTablesTabProps {
  tables: RestaurantTable[];
  tableCountInput: string;
  restaurantId: string;
  isLoadingTables: boolean;
  onSetTableCountInput: (value: string) => void;
  onSyncTables: () => Promise<void>;
  onSelectTableQR: (code: string) => void;
  onRefreshTables?: () => Promise<void> | void;
}

export const RestaurantTablesTab: React.FC<RestaurantTablesTabProps> = ({
  tables,
  tableCountInput,
  restaurantId,
  isLoadingTables,
  onSetTableCountInput,
  onSyncTables,
  onSelectTableQR,
  onRefreshTables
}) => {
  const isCompact = useIsMobile(1024);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState<Bill | null>(null);
  const [loadingBillTable, setLoadingBillTable] = useState<string | null>(null);

  const tableSummary = tables.reduce(
    (summary, table) => {
      if (table.status === TableStatus.OCCUPIED) summary.occupied += 1;
      else if (table.status === TableStatus.PAYMENT_PENDING) summary.paymentPending += 1;
      else summary.available += 1;
      return summary;
    },
    { available: 0, occupied: 0, paymentPending: 0 }
  );

  const getStatusBadge = (status?: TableStatus) => {
    switch (status) {
      case TableStatus.OCCUPIED:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Đang sử dụng
          </span>
        );
      case TableStatus.PAYMENT_PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Chờ thanh toán
          </span>
        );
      case TableStatus.AVAILABLE:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Bàn trống
          </span>
        );
    }
  };

  const getCurrentBill = async (table: RestaurantTable) => {
    if (!table.activeSessionId) {
      toast.error('Bàn này chưa có phiên hoạt động');
      return null;
    }
    const result = await billService.getCurrentBill(restaurantId, table.code, table.activeSessionId);
    if (!result.bill) {
      toast.info('Bàn này chưa có bill active');
      return null;
    }
    return result.bill;
  };

  const handleViewBill = async (table: RestaurantTable) => {
    setLoadingBillTable(table.code);
    try {
      const bill = await getCurrentBill(table);
      if (bill) setSelectedBill(bill);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải bill hiện tại');
    } finally {
      setLoadingBillTable(null);
    }
  };

  const handlePayBill = async (table: RestaurantTable) => {
    setLoadingBillTable(table.code);
    try {
      const bill = await getCurrentBill(table);
      if (!bill) return;
      if (bill.status === BillStatus.PAID || bill.status === BillStatus.CANCELLED) {
        toast.info('Bill này không còn cần thanh toán');
        return;
      }
      setSelectedPaymentBill(bill);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải bill thanh toán');
    } finally {
      setLoadingBillTable(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Đồng bộ bàn ăn & Sinh mã QR</h2>
        <p className="text-neutral-500 text-xs mt-0.5">Sinh mã QR code dán bàn. Khách quét QR để xem thực đơn & đặt món tại chỗ mà không cần gọi nhân viên.</p>
      </div>

      <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-end bg-neutral-50/50 border-b border-neutral-100">
          <div className="space-y-2 flex-1 w-full">
            <Label htmlFor="tableCount" className="text-xs font-bold text-neutral-600">Số lượng bàn hoạt động tại nhà hàng</Label>
            <Input
              id="tableCount"
              type="number"
              placeholder="Nhập tổng số bàn (VD: 15)"
              value={tableCountInput}
              onChange={(e) => onSetTableCountInput(e.target.value)}
              className="rounded-xl border-neutral-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm bg-white"
            />
          </div>
          <Button
            onClick={onSyncTables}
            disabled={isLoadingTables}
            aria-busy={isLoadingTables}
            className="h-10 w-full rounded-xl bg-neutral-900 px-6 font-bold text-white shadow-sm hover:bg-black sm:w-auto"
          >
            {isLoadingTables ? 'Đang đồng bộ...' : 'Đồng bộ số bàn'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Tổng quan trạng thái bàn">
        <div className="min-w-0 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:h-9 sm:w-9">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-xs">Bàn trống</p>
              <p className="mt-0.5 text-lg font-extrabold leading-none text-emerald-900 sm:text-xl">{tableSummary.available}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 sm:h-9 sm:w-9">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-amber-700 sm:text-xs">Đang dùng</p>
              <p className="mt-0.5 text-lg font-extrabold leading-none text-amber-900 sm:text-xl">{tableSummary.occupied}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 sm:h-9 sm:w-9">
              <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-rose-700 sm:text-xs">Chờ thanh toán</p>
              <p className="mt-0.5 text-lg font-extrabold leading-none text-rose-900 sm:text-xl">{tableSummary.paymentPending}</p>
            </div>
          </div>
        </div>
      </div>

      {isCompact ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          {tables.map((tbl) => {
            const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
            const hasSession = tbl.status === TableStatus.OCCUPIED || tbl.status === TableStatus.PAYMENT_PENDING;

            return (
              <div key={tbl._id} className="min-w-0 space-y-4 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:p-5">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="shrink-0 text-base font-extrabold text-neutral-900">Bàn {tbl.code}</span>
                  <div className="min-w-0">{getStatusBadge(tbl.status)}</div>
                </div>

                <div className="border-t border-neutral-100 pt-3 text-xs space-y-2">
                  <div>
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Phiên hiện tại</span>
                    <span className="block truncate font-mono text-xs font-bold text-neutral-700" title={tbl.currentSessionCode || '-'}>{tbl.currentSessionCode || '-'}</span>
                  </div>
                  <div>
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Đường dẫn đặt món</span>
                    <span className="block break-all text-[11px] font-semibold leading-relaxed text-emerald-600 underline" title={orderUrl}>
                      {orderUrl}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectTableQR(tbl.code)}
                    aria-label={`Hiển thị mã QR bàn ${tbl.code}`}
                    className="col-span-2 h-11 rounded-xl border-neutral-200 text-xs font-bold hover:bg-neutral-50"
                  >
                    <QrCode className="h-4 w-4 text-neutral-500" aria-hidden="true" /> Mã QR dẫn bàn
                  </Button>
                  
                  {hasSession && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBill(tbl)}
                        disabled={loadingBillTable === tbl.code}
                        className="h-11 rounded-xl border-neutral-200 text-xs font-bold hover:bg-neutral-50"
                      >
                        <Eye className="h-4 w-4 text-neutral-500" aria-hidden="true" /> Xem bill
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePayBill(tbl)}
                        disabled={loadingBillTable === tbl.code}
                        className="h-11 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Thanh toán
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          
          {tables.length === 0 && (
            <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-2xl shadow-sm col-span-full">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">Chưa có bàn ăn nào được lưu</h3>
                  <p className="text-xs text-neutral-400 mt-1">Đồng bộ số lượng bàn hoạt động phía trên để tạo mã QR tự động.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-neutral-200/50 bg-white shadow-sm">
          <CardHeader className="border-b border-neutral-100/60 pb-4">
            <CardTitle className="text-sm font-bold text-neutral-800">Danh sách bàn & mã QR dẫn bàn</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 p-0">
            <Table className="w-full max-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="w-[84px] pl-6 text-xs font-bold text-neutral-400">Mã bàn</TableHead>
                  <TableHead className="w-[150px] text-xs font-bold text-neutral-400">Trạng thái</TableHead>
                  <TableHead className="w-[170px] text-xs font-bold text-neutral-400">Phiên hiện tại</TableHead>
                  <TableHead className="min-w-0 text-xs font-bold text-neutral-400">Đường dẫn đặt món tại bàn</TableHead>
                  <TableHead className="w-[116px] pl-4 text-xs font-bold text-neutral-400">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((tbl) => {
                  const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
                  const hasSession = tbl.status === TableStatus.OCCUPIED || tbl.status === TableStatus.PAYMENT_PENDING;
                  return (
                    <TableRow key={tbl._id} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                      <TableCell className="pl-6 text-xs font-bold text-neutral-900">Bàn {tbl.code}</TableCell>
                      <TableCell>{getStatusBadge(tbl.status)}</TableCell>
                      <TableCell className="max-w-0 font-mono text-xs text-neutral-500">
                        <span className="block truncate" title={tbl.currentSessionCode || '-'}>{tbl.currentSessionCode || '-'}</span>
                      </TableCell>
                      <TableCell className="max-w-0 overflow-hidden text-xs font-semibold text-emerald-600 underline" title={orderUrl}>
                        <span className="block truncate">Trang đặt món / bàn {tbl.code}</span>
                      </TableCell>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectTableQR(tbl.code)}
                            aria-label={`Hiển thị mã QR bàn ${tbl.code}`}
                            title="Hiển thị mã QR"
                            className="h-9 rounded-lg border-neutral-200 px-2.5 text-xs font-semibold hover:bg-neutral-50"
                          >
                            <QrCode className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
                            QR
                          </Button>
                          {hasSession && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  aria-label={`Mở thao tác bàn ${tbl.code}`}
                                  title="Thao tác khác"
                                  className="h-9 w-9 rounded-lg border-neutral-200 hover:bg-neutral-50"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => handleViewBill(tbl)} disabled={loadingBillTable === tbl.code} className="min-h-10 cursor-pointer gap-2">
                                  <Eye className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                                  Xem bill
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePayBill(tbl)} disabled={loadingBillTable === tbl.code} className="min-h-10 cursor-pointer gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                  Thanh toán bill
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {tables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-55 border border-neutral-200/40 flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-neutral-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-800">Chưa có bàn ăn nào được lưu</h3>
                          <p className="text-xs text-neutral-400 mt-1">Đồng bộ số lượng bàn hoạt động phía trên để tạo mã QR tự động.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedBill && (
        <Card className="shadow-sm border-emerald-200/60 rounded-2xl bg-emerald-50/60 overflow-hidden">
          <CardHeader className="border-b border-emerald-100/70 pb-4">
            <CardTitle className="text-sm font-bold text-emerald-900">Bill hiện tại: {selectedBill.billCode}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="block text-xs font-semibold text-emerald-700">Bàn</span>
              <span className="font-bold text-neutral-900">Bàn {selectedBill.tableNumber}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-emerald-700">Trạng thái</span>
              <span className="font-bold text-neutral-900">{selectedBill.status}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-emerald-700">Số order</span>
              <span className="font-bold text-neutral-900">{selectedBill.orderIds.length}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-emerald-700">Tổng món</span>
              <span className="font-bold text-neutral-900">{selectedBill.totalItems}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-emerald-700">Tổng tiền</span>
              <span className="font-bold text-emerald-800">{formatCurrency(selectedBill.totalAmount)}</span>
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
          setSelectedBill(null);
          await onRefreshTables?.();
        }}
      />
    </div>
  );
};
