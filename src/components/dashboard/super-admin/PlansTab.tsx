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
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-heading font-bold text-gray-800">Quản lý Gói dịch vụ SaaS</h2>
          <p className="text-xs text-gray-400 mt-0.5">Thêm, sửa, xóa, và điều chỉnh hạn mức tài nguyên cho các gói SaaS.</p>
        </div>
        <Button 
          onClick={onAddClick} 
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10 w-full sm:w-auto h-11 sm:h-10 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tạo gói mới
        </Button>
      </div>

      <Card className="shadow-sm border-gray-100 bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex py-16 justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tên gói / Mã</TableHead>
                      <TableHead className="text-xs">Giá tháng / năm</TableHead>
                      <TableHead className="text-xs">Hạn mức quét</TableHead>
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
                        <TableCell className="text-xs text-gray-750">
                          {plan.scanLimitMonthly === -1 || plan.scanLimitMonthly === undefined ? 'Vô hạn' : `${plan.scanLimitMonthly?.toLocaleString('vi-VN')} scans`}
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
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden p-4 space-y-4 bg-slate-50/30">
                {plans.map((plan) => (
                  <div 
                    key={plan.id || plan._id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-gray-900">{plan.name}</h3>
                          {plan.isPopular && (
                            <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                              HOT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Mã: {plan.code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold">Kích hoạt</span>
                        <Switch 
                          checked={plan.isActive} 
                          onCheckedChange={() => onToggleActive(plan)} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Giá theo tháng:</span>
                        <span className="font-semibold text-gray-800">
                          {plan.priceMonthly === 0 
                            ? 'FREE' 
                            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.priceMonthly)} / tháng
                        </span>
                      </div>
                      {plan.priceYearly > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Giá theo năm:</span>
                          <span className="font-semibold text-gray-800">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.priceYearly)} / năm
                          </span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-gray-100/50 mt-2 text-[11px]">
                        <div className="flex items-center justify-between col-span-2 border-b border-gray-100 pb-1.5 mb-0.5">
                          <span className="text-gray-400">Lượt quét:</span>
                          <span className="font-bold text-gray-800">
                            {plan.scanLimitMonthly === -1 || plan.scanLimitMonthly === undefined ? 'Vô hạn' : `${plan.scanLimitMonthly?.toLocaleString('vi-VN')} scans/tháng`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Chi nhánh:</span>
                          <span className="font-bold text-gray-800">
                            {plan.restaurantLimit === -1 ? 'Không giới hạn' : `${plan.restaurantLimit}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Bàn:</span>
                          <span className="font-bold text-gray-800">
                            {plan.tableLimit === -1 ? 'Không giới hạn' : `${plan.tableLimit}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Món:</span>
                          <span className="font-bold text-gray-800">
                            {plan.menuItemLimit === -1 ? 'Không giới hạn' : `${plan.menuItemLimit}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Nhân viên:</span>
                          <span className="font-bold text-gray-800">
                            {plan.staffLimit === -1 ? 'Không giới hạn' : `${plan.staffLimit}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 border-t border-gray-100 pt-3 mt-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEditClick(plan)} 
                        className="text-gray-600 hover:text-green-600 border-gray-200 h-10 text-xs font-bold rounded-xl flex-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Sửa gói
                      </Button>
                      {plan.code !== 'FREE' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onDeleteClick(plan.id || plan._id)} 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-10 text-xs font-bold rounded-xl flex-1"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Xóa gói
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {plans.length === 0 && (
                  <div className="text-center text-gray-400 py-12 text-sm bg-white rounded-2xl border border-gray-100">
                    Không tìm thấy gói dịch vụ nào
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
