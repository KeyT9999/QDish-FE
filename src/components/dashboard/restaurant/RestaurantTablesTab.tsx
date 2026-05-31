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
import { CheckCircle2, Eye, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

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
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState<Bill | null>(null);
  const [loadingBillTable, setLoadingBillTable] = useState<string | null>(null);

  const getStatusBadge = (status?: TableStatus) => {
    switch (status) {
      case TableStatus.OCCUPIED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Đang ngồi</span>;
      case TableStatus.PAYMENT_PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">Chờ thanh toán</span>;
      case TableStatus.AVAILABLE:
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Bàn trống</span>;
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
          <Button onClick={onSyncTables} className="bg-neutral-900 hover:bg-black text-white font-bold px-6 h-10 shadow-sm rounded-xl w-full sm:w-auto">
            Đồng bộ số bàn
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-neutral-100/60 pb-4">
          <CardTitle className="text-sm font-bold text-neutral-800">Danh sách bàn & Preview mã QR dẫn bàn</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[120px]">Mã bàn</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Trạng thái</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Phiên hiện tại</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Đường dẫn đặt món tại bàn</TableHead>
                <TableHead className="text-right text-xs font-bold text-neutral-400 w-[240px] pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((tbl) => {
                const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
                const hasSession = tbl.status === TableStatus.OCCUPIED || tbl.status === TableStatus.PAYMENT_PENDING;
                return (
                  <TableRow key={tbl._id} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                    <TableCell className="font-bold text-xs text-neutral-900 pl-6">Bàn {tbl.code}</TableCell>
                    <TableCell>{getStatusBadge(tbl.status)}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">
                      {tbl.currentSessionCode || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-emerald-600 underline font-semibold select-all max-w-xs truncate" title={orderUrl}>
                      {orderUrl}
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onSelectTableQR(tbl.code)} className="rounded-lg text-xs font-semibold border-neutral-200 hover:bg-neutral-50 gap-1.5 h-8">
                        <QrCode className="w-3.5 h-3.5 text-neutral-500" /> QR Code
                      </Button>
                      {hasSession && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBill(tbl)}
                            disabled={loadingBillTable === tbl.code}
                            className="rounded-lg text-xs font-semibold border-neutral-200 hover:bg-neutral-50 gap-1.5 h-8"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-500" /> Xem bill
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePayBill(tbl)}
                            disabled={loadingBillTable === tbl.code}
                            className="rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Thanh toán bill
                          </Button>
                        </>
                      )}
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
