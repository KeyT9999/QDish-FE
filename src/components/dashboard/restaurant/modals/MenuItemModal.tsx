import React, { useState, useEffect } from 'react';
import { MenuItem, Allergen, HealthLabel } from '@/types';
import { CategoryItem } from '@/services/categoryService';
import { uploadService } from '@/services/uploadService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export interface MenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: MenuItem | null;
  categories: CategoryItem[];
  onSave: (payload: Partial<MenuItem>, editingItem: MenuItem | null) => Promise<void>;
}

const getDefaultMenuForm = () => ({
  name: '',
  price: 0,
  category: '',
  categoryId: '',
  description: '',
  imageUrl: '',
  available: true,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  nutritionScore: 0,
  allergens: [] as Allergen[],
  healthLabels: [] as HealthLabel[]
});

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  open,
  onOpenChange,
  editingItem,
  categories,
  onSave
}) => {
  const [menuForm, setMenuForm] = useState(getDefaultMenuForm());
  const [isUploadingMenuImage, setIsUploadingMenuImage] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setMenuForm({
        name: editingItem.name,
        price: editingItem.price,
        category: editingItem.category,
        categoryId: editingItem.categoryId || '',
        description: editingItem.description,
        imageUrl: editingItem.imageUrl,
        available: editingItem.available,
        calories: editingItem.nutrition?.calories || editingItem.calories || 0,
        protein: editingItem.nutrition?.protein || editingItem.protein || 0,
        carbs: editingItem.nutrition?.carbs || editingItem.carbs || 0,
        fat: editingItem.nutrition?.fat || editingItem.fat || 0,
        fiber: editingItem.nutrition?.fiber || editingItem.fiber || 0,
        sugar: editingItem.nutrition?.sugar || editingItem.sugar || 0,
        sodium: editingItem.nutrition?.sodium || editingItem.sodium || 0,
        nutritionScore: editingItem.nutrition?.nutritionScore || editingItem.nutritionScore || 0,
        allergens: editingItem.allergens || [],
        healthLabels: editingItem.healthLabels || []
      });
    } else {
      setMenuForm({
        ...getDefaultMenuForm(),
        category: categories[0]?.name || '',
        categoryId: categories[0]?._id || ''
      });
    }
  }, [open, editingItem, categories]);

  const handleUploadMenuImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn đúng file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh món ăn không được vượt quá 5MB');
      return;
    }

    setIsUploadingMenuImage(true);
    try {
      const uploaded = await uploadService.uploadMenuImage(file);
      setMenuForm((current) => ({ ...current, imageUrl: uploaded.url }));
      toast.success('Đã upload ảnh món ăn lên Cloudinary');
    } catch (err: any) {
      toast.error(err.message || 'Không thể upload ảnh món ăn');
    } finally {
      setIsUploadingMenuImage(false);
    }
  };

  const handleSave = async () => {
    if (!menuForm.name.trim()) {
      toast.error('Tên món ăn là bắt buộc');
      return;
    }
    if (menuForm.price <= 0) {
      toast.error('Giá món ăn phải lớn hơn 0');
      return;
    }
    if (!menuForm.category) {
      toast.error('Danh mục món ăn là bắt buộc');
      return;
    }
    if (
      menuForm.calories < 0 ||
      menuForm.protein < 0 ||
      menuForm.carbs < 0 ||
      menuForm.fat < 0 ||
      menuForm.fiber < 0 ||
      menuForm.sugar < 0 ||
      menuForm.sodium < 0 ||
      menuForm.nutritionScore < 0 ||
      menuForm.nutritionScore > 100
    ) {
      toast.error('Các chỉ số dinh dưỡng không được nhỏ hơn 0, và Nutrition Score nằm trong khoảng 0-100');
      return;
    }

    const payload: Partial<MenuItem> = {
      name: menuForm.name.trim(),
      price: menuForm.price,
      category: menuForm.category,
      categoryId: menuForm.categoryId || undefined,
      description: menuForm.description.trim(),
      imageUrl: menuForm.imageUrl.trim(),
      available: menuForm.available,
      nutrition: {
        calories: menuForm.calories,
        protein: menuForm.protein,
        carbs: menuForm.carbs,
        fat: menuForm.fat,
        fiber: menuForm.fiber,
        sugar: menuForm.sugar,
        sodium: menuForm.sodium,
        nutritionScore: menuForm.nutritionScore
      },
      allergens: menuForm.allergens,
      healthLabels: menuForm.healthLabels
    };

    await onSave(payload, editingItem);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">{editingItem ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">Cung cấp đầy đủ thông tin dinh dưỡng, dị ứng và trạng thái hiển thị cho món ăn.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dishName" className="text-xs text-gray-600 font-semibold">Tên món ăn *</Label>
              <Input id="dishName" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} className="rounded-xl" placeholder="VD: Cơm gà healthy" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dishPrice" className="text-xs text-gray-600 font-semibold">Giá món (VNĐ) *</Label>
              <Input id="dishPrice" type="number" min={0} value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) || 0 })} className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600 font-semibold">Danh mục *</Label>
              {categories.length > 0 ? (
                <Select
                  value={menuForm.category || undefined}
                  onValueChange={(value) => {
                    const categoryName = value || '';
                    const selected = categories.find((cat) => cat.name === categoryName);
                    setMenuForm({ ...menuForm, categoryId: selected?._id || '', category: categoryName });
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value, categoryId: '' })} className="rounded-xl" placeholder="Nhập tên danh mục" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dishImage" className="text-xs text-gray-600 font-semibold">Đường dẫn ảnh món ăn</Label>
              <div className="flex gap-2">
                <Input id="dishImage" value={menuForm.imageUrl} onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })} className="rounded-xl" placeholder="https://..." />
                <input
                  id="dishImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadMenuImage}
                  className="hidden"
                  disabled={isUploadingMenuImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploadingMenuImage}
                  onClick={() => document.getElementById('dishImageFile')?.click()}
                  className="shrink-0 rounded-xl px-3"
                >
                  <Upload className={`w-4 h-4 ${isUploadingMenuImage ? 'animate-pulse' : ''}`} />
                  <span className="sr-only">Upload ảnh món ăn</span>
                </Button>
              </div>
              <p className="text-[11px] text-gray-400">Chọn file ảnh để upload lên Cloudinary, hoặc dán URL có sẵn.</p>
              {menuForm.imageUrl && (
                <div className="mt-2 h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <img
                    src={menuForm.imageUrl}
                    alt="Preview ảnh món ăn"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={96}
                    height={96}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dishDesc" className="text-xs text-gray-600 font-semibold">Mô tả món ăn</Label>
            <Textarea id="dishDesc" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} className="rounded-xl min-h-[88px]" placeholder="Mô tả nguyên liệu, khẩu vị hoặc lưu ý sức khỏe..." />
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-700 uppercase">Chỉ số dinh dưỡng (QDish)</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Đang bán</span>
                <Switch checked={menuForm.available} onCheckedChange={(checked) => setMenuForm({ ...menuForm, available: checked })} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dishCalories" className="text-[11px] text-gray-500 font-semibold">Calo (kcal)</Label>
                <Input id="dishCalories" type="number" min={0} value={menuForm.calories} onChange={(e) => setMenuForm({ ...menuForm, calories: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishProtein" className="text-[11px] text-gray-500 font-semibold">Đạm (g)</Label>
                <Input id="dishProtein" type="number" min={0} value={menuForm.protein} onChange={(e) => setMenuForm({ ...menuForm, protein: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishCarbs" className="text-[11px] text-gray-500 font-semibold">Carbs (g)</Label>
                <Input id="dishCarbs" type="number" min={0} value={menuForm.carbs} onChange={(e) => setMenuForm({ ...menuForm, carbs: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishFat" className="text-[11px] text-gray-500 font-semibold">Béo (g)</Label>
                <Input id="dishFat" type="number" min={0} value={menuForm.fat} onChange={(e) => setMenuForm({ ...menuForm, fat: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishFiber" className="text-[11px] text-gray-500 font-semibold">Chất xơ (g)</Label>
                <Input id="dishFiber" type="number" min={0} value={menuForm.fiber} onChange={(e) => setMenuForm({ ...menuForm, fiber: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishSugar" className="text-[11px] text-gray-500 font-semibold">Đường (g)</Label>
                <Input id="dishSugar" type="number" min={0} value={menuForm.sugar} onChange={(e) => setMenuForm({ ...menuForm, sugar: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishSodium" className="text-[11px] text-gray-500 font-semibold">Sodium (mg)</Label>
                <Input id="dishSodium" type="number" min={0} value={menuForm.sodium} onChange={(e) => setMenuForm({ ...menuForm, sodium: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dishNutritionScore" className="text-[11px] text-gray-500 font-semibold">Nutrition Score (0-100)</Label>
                <Input id="dishNutritionScore" type="number" min={0} max={100} value={menuForm.nutritionScore} onChange={(e) => setMenuForm({ ...menuForm, nutritionScore: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
              </div>
            </div>
          </div>


        </div>

        <DialogFooter className="border-t border-gray-100 pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
