import React from 'react';
import { RestaurantTable } from '@/services/tableService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QrCode } from 'lucide-react';

export interface RestaurantTablesTabProps {
  tables: RestaurantTable[];
  tableCountInput: string;
  restaurantId: string;
  isLoadingTables: boolean;
  onSetTableCountInput: (value: string) => void;
  onSyncTables: () => Promise<void>;
  onSelectTableQR: (code: string) => void;
}

export const RestaurantTablesTab: React.FC<RestaurantTablesTabProps> = ({
  tables,
  tableCountInput,
  restaurantId,
  isLoadingTables,
  onSetTableCountInput,
  onSyncTables,
  onSelectTableQR
}) => {
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
                <TableHead className="text-xs font-bold text-neutral-400">Đường dẫn đặt món tại bàn</TableHead>
                <TableHead className="text-right text-xs font-bold text-neutral-400 w-[160px] pr-6">Mã QR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((tbl) => {
                const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
                return (
                  <TableRow key={tbl._id} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                    <TableCell className="font-bold text-xs text-neutral-900 pl-6">Bàn {tbl.code}</TableCell>
                    <TableCell className="text-xs text-emerald-600 underline font-semibold select-all max-w-xs truncate" title={orderUrl}>
                      {orderUrl}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button size="sm" variant="outline" onClick={() => onSelectTableQR(tbl.code)} className="rounded-lg text-xs font-semibold border-neutral-200 hover:bg-neutral-50 gap-1.5 h-8">
                        <QrCode className="w-3.5 h-3.5 text-neutral-500" /> Xem mã QR
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {tables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16">
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
    </div>
  );
};
