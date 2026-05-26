import React from 'react';
import { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, ClipboardList, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface RestaurantMenuTabProps {
  menuItems: MenuItem[];
  isLoadingMenu: boolean;
  onOpenMenuModal: (item?: MenuItem) => void;
  onDeleteMenuItem: (id: string) => Promise<void>;
  onToggleAvailable: (id: string, currentAvailable: boolean) => Promise<void>;
}

export const RestaurantMenuTab: React.FC<RestaurantMenuTabProps> = ({
  menuItems,
  isLoadingMenu,
  onOpenMenuModal,
  onDeleteMenuItem,
  onToggleAvailable
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quản lý Món ăn (Menu)</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Quản lý danh sách món ăn, giá bán và thông tin dinh dưỡng.</p>
        </div>
        <Button onClick={() => onOpenMenuModal()} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Thêm món mới
        </Button>
      </div>

      <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[80px]">Món</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Tên món</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[120px]">Giá</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[120px]">Danh mục</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Chỉ số QDish</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400 w-[110px]">Trạng thái</TableHead>
                <TableHead className="text-right text-xs font-bold text-neutral-400 w-[100px] pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => {
                const itemId = item.id || (item as any)._id;
                
                return (
                  <TableRow key={itemId} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60'} 
                        alt={item.name} 
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 object-cover rounded-xl border border-neutral-200 shadow-sm" 
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <div className="font-bold text-xs text-neutral-900">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-neutral-400 line-clamp-1 max-w-sm mt-0.5" title={item.description}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-neutral-955 text-xs py-4">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200/50">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1.5">
                        {item.nutrition && (
                          <div className="text-[11px] text-neutral-500 font-medium flex flex-wrap gap-x-2 items-center">
                            <span className="font-bold text-neutral-750">{item.nutrition.calories} kcal</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span>P: {item.nutrition.protein}g</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span>C: {item.nutrition.carbs}g</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span>F: {item.nutrition.fat}g</span>
                            {item.nutrition.fiber !== undefined && item.nutrition.fiber > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span>Fi: {item.nutrition.fiber}g</span>
                              </>
                            )}
                            {item.nutrition.sugar !== undefined && item.nutrition.sugar > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span>Su: {item.nutrition.sugar}g</span>
                              </>
                            )}
                            {item.nutrition.sodium !== undefined && item.nutrition.sodium > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span>Na: {item.nutrition.sodium}mg</span>
                              </>
                            )}
                            {item.nutrition.nutritionScore !== undefined && item.nutrition.nutritionScore > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span className="text-emerald-600 font-bold">Score: {item.nutrition.nutritionScore}</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {/* Health & Allergen tags */}
                          {item.healthLabels?.slice(0, 3).map((lbl) => (
                            <span key={lbl} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50/70 text-blue-700 border border-blue-200/20">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => onToggleAvailable(itemId, item.available)}
                        />
                        <span className={`text-[10px] font-bold ${item.available ? 'text-emerald-700' : 'text-neutral-400'}`}>
                          {item.available ? 'Bán' : 'Ngưng'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-36">
                          <DropdownMenuItem 
                            onClick={() => onOpenMenuModal(item)}
                            className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                          <DropdownMenuItem 
                            onClick={() => onDeleteMenuItem(itemId)}
                            className="text-rose-600 font-bold text-xs rounded-lg cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-450" />
                            Xóa món ăn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {menuItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-800">Chưa có món ăn nào</h3>
                        <p className="text-xs text-neutral-400 mt-1">Bấm nút "Thêm món mới" để bắt đầu thiết lập menu.</p>
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
