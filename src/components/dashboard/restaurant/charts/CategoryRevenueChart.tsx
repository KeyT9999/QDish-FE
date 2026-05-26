import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

export interface CategoryRevenueChartProps {
  data: Array<{ category: string; revenue: number }>;
}

export const CategoryRevenueChart: React.FC<CategoryRevenueChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-neutral-900">Phần bổ Doanh thu danh mục</h3>
        <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Biểu đồ tròn</span>
      </div>
      <div className="h-72 flex items-center justify-center">
        {data.length === 0 ? (
          <span className="text-neutral-400 text-xs font-semibold">Chưa có dữ liệu</span>
        ) : (
          <ResponsiveContainer width="100%" height={288}>
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry: any) => entry.category}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
