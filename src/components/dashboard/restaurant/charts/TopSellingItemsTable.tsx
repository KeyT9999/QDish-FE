import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export interface TopSellingItemsTableProps {
  data: Array<{ name: string; quantity: number; revenue: number }>;
}

export const TopSellingItemsTable: React.FC<TopSellingItemsTableProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-neutral-900">Top 10 Món bán chạy nhất</h3>
        <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Xếp hạng</span>
      </div>
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-100 hover:bg-transparent">
              <TableHead className="text-xs font-bold text-neutral-400">Món ăn</TableHead>
              <TableHead className="text-center text-xs font-bold text-neutral-400">Số lượng</TableHead>
              <TableHead className="text-right text-xs font-bold text-neutral-400">Doanh thu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={idx} className="border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                <TableCell className="font-semibold text-xs text-gray-800">{item.name}</TableCell>
                <TableCell className="text-center text-xs text-gray-600 font-semibold">{item.quantity}</TableCell>
                <TableCell className="text-right text-xs font-bold text-green-700">{formatCurrency(item.revenue)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-400 text-xs py-6">Không có dữ liệu</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
