import React, { useState, useEffect } from 'react';
import { CategoryItem } from '@/services/categoryService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: CategoryItem | null;
  onSave: (name: string, editingCategory: CategoryItem | null) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onOpenChange,
  editingCategory,
  onSave
}) => {
  const [categoryNameInput, setCategoryNameInput] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingCategory) {
      setCategoryNameInput(editingCategory.name);
    } else {
      setCategoryNameInput('');
    }
  }, [open, editingCategory]);

  const handleSave = async () => {
    if (!categoryNameInput.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    await onSave(categoryNameInput.trim(), editingCategory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">Tạo tên danh mục duy nhất trong thực đơn.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <div className="space-y-1">
            <Label htmlFor="catName" className="text-xs text-gray-600 font-semibold">Tên danh mục *</Label>
            <Input id="catName" value={categoryNameInput} onChange={(e) => setCategoryNameInput(e.target.value)} className="rounded-xl" placeholder="VD: Khai vị, Healthy Bread" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm">Lưu danh mục</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
