import React from 'react';
import { MenuItem } from '@/types';
import { CategoryItem } from '@/services/categoryService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, Tag, MoreHorizontal } from 'lucide-react';

export interface RestaurantCategoriesTabProps {
  categories: CategoryItem[];
  menuItems: MenuItem[];
  isLoadingCategories: boolean;
  onOpenCategoryModal: (cat?: CategoryItem) => void;
  onDeleteCategory: (id: string, name: string) => Promise<void>;
}

export const RestaurantCategoriesTab: React.FC<RestaurantCategoriesTabProps> = ({
  categories,
  menuItems,
  isLoadingCategories,
  onOpenCategoryModal,
  onDeleteCategory
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quản lý Danh mục món ăn</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Phân loại món ăn theo các nhóm chính để khách hàng dễ dàng tìm kiếm.</p>
        </div>
        <Button onClick={() => onOpenCategoryModal()} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </Button>
      </div>

      <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[240px]">ID Danh mục</TableHead>
                <TableHead className="text-xs font-bold text-neutral-400">Tên danh mục</TableHead>
                <TableHead className="text-right text-xs font-bold text-neutral-400 w-[100px] pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                  <TableCell className="font-mono text-xs text-neutral-400 pl-6">{cat._id}</TableCell>
                  <TableCell className="font-bold text-xs text-neutral-900">{cat.name}</TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                          <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-36">
                        <DropdownMenuItem 
                          onClick={() => onOpenCategoryModal(cat)}
                          className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                        <DropdownMenuItem 
                          onClick={() => onDeleteCategory(cat._id, cat.name)}
                          className="text-rose-600 font-bold text-xs rounded-lg cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-450" />
                          Xóa danh mục
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-55 border border-neutral-200/40 flex items-center justify-center">
                        <Tag className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-800">Chưa có danh mục nào</h3>
                        <p className="text-xs text-neutral-400 mt-1">Bấm nút "Thêm danh mục" để bắt đầu thiết lập menu.</p>
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
