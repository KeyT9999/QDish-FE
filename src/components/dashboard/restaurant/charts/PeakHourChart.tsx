import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export interface PeakHourChartProps {
  data: Array<{ hour: number; revenue: number }>;
}

export const PeakHourChart: React.FC<PeakHourChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-neutral-900">Doanh số theo giờ cao điểm</h3>
        <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Biểu đồ cột</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height={288}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="hour" tickFormatter={(hour: number) => `${hour}h`} stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
              formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
