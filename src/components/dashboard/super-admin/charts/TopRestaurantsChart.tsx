import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface TopRestaurantsChartProps {
  data: { name: string; revenue: number }[];
}

export const TopRestaurantsChart: React.FC<TopRestaurantsChartProps> = ({ data }) => {
  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Top 5 Chi nhánh có doanh số cao nhất (Toàn bộ thời gian)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-xs">Chưa có dữ liệu giao dịch</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
