import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface SubscriptionTransactionsTableProps {
  transactions: any[];
}

export const SubscriptionTransactionsTable: React.FC<SubscriptionTransactionsTableProps> = ({
  transactions
}) => {
  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Giao dịch thanh toán gói gần đây</CardTitle>
        <CardDescription className="text-xs">Nguồn doanh thu chỉ tính PaymentTransaction có trạng thái PAID.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">OrderCode</TableHead>
              <TableHead className="text-xs">Owner</TableHead>
              <TableHead className="text-xs">Gói</TableHead>
              <TableHead className="text-xs">Số tiền</TableHead>
              <TableHead className="text-xs">Trạng thái</TableHead>
              <TableHead className="text-xs">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 8).map((transaction: any) => (
              <TableRow key={transaction.id || transaction.orderCode}>
                <TableCell className="text-xs font-mono">{transaction.orderCode}</TableCell>
                <TableCell className="text-xs">
                  {transaction.owner?.fullName || transaction.owner?.username || '---'}
                </TableCell>
                <TableCell className="text-xs font-bold">{transaction.plan?.code || '---'}</TableCell>
                <TableCell className="text-xs font-semibold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount || 0)}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    transaction.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : transaction.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('vi-VN') : '---'}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8 text-sm">
                  Chưa có giao dịch subscription
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
