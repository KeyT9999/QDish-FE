import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit2, X } from 'lucide-react';

export interface PlansTabProps {
  plans: any[];
  isLoading: boolean;
  onAddClick: () => void;
  onEditClick: (plan: any) => void;
  onDeleteClick: (id: string) => Promise<void>;
  onToggleActive: (plan: any) => Promise<void>;
}

export const PlansTab: React.FC<PlansTabProps> = ({
  plans,
  isLoading,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onToggleActive
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-gray-800">Quản lý Gói dịch vụ SaaS</h2>
          <p className="text-xs text-gray-400 mt-0.5">Thêm, sửa, xóa, và điều chỉnh hạn mức tài nguyên cho các gói SaaS.</p>
        </div>
        <Button 
          onClick={onAddClick} 
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tạo gói mới
        </Button>
      </div>

      <Card className="shadow-sm border-gray-100 bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex py-16 justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Tên gói / Mã</TableHead>
                  <TableHead className="text-xs">Giá tháng / năm</TableHead>
                  <TableHead className="text-xs">Hạn mức chi nhánh</TableHead>
                  <TableHead className="text-xs">Hạn mức bàn</TableHead>
                  <TableHead className="text-xs">Hạn mức món</TableHead>
                  <TableHead className="text-xs">Hạn mức nhân viên</TableHead>
                  <TableHead className="text-xs">Trạng thái</TableHead>
                  <TableHead className="text-right text-xs">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id || plan._id}>
                    <TableCell>
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">{plan.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{plan.code}</span>
                        {plan.isPopular && (
                          <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ml-1">
                            HOT
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 font-semibold space-y-0.5">
                      <span className="block">
                        {plan.priceMonthly === 0 
                          ? 'FREE' 
                          : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.priceMonthly)} / tháng
                      </span>
                      {plan.priceYearly > 0 && (
                        <span className="block text-[10px] text-slate-500">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.priceYearly)} / năm
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {plan.restaurantLimit === -1 ? 'Không giới hạn' : `${plan.restaurantLimit} chi nhánh`}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {plan.tableLimit === -1 ? 'Không giới hạn' : `${plan.tableLimit} bàn`}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {plan.menuItemLimit === -1 ? 'Không giới hạn' : `${plan.menuItemLimit} món`}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {plan.staffLimit === -1 ? 'Không giới hạn' : `${plan.staffLimit} nhân viên`}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={plan.isActive} 
                        onCheckedChange={() => onToggleActive(plan)} 
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => onEditClick(plan)} 
                        className="text-gray-600 hover:text-green-600 h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {plan.code !== 'FREE' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => onDeleteClick(plan.id || plan._id)} 
                          className="text-gray-600 hover:text-red-600 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {plans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8 text-sm">
                      Không tìm thấy gói dịch vụ nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
