import React, { useState, useEffect } from 'react';
import { MenuItem, Allergen, DishIngredient } from '@/types';
import { CategoryItem } from '@/services/categoryService';
import { uploadService } from '@/services/uploadService';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Camera, ChefHat, Info, Loader2 as UploadLoader } from 'lucide-react';
import { toast } from 'sonner';
import { RecipeBuilderTab } from './RecipeBuilderTab';

export interface MenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: MenuItem | null;
  categories: CategoryItem[];
  onSave: (payload: Partial<MenuItem>, editingItem: MenuItem | null) => Promise<void>;
}

type TabId = 'info' | 'recipe';

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
  confidenceScore: 0,
  allergens: [] as Allergen[],
  foodAttributes: [] as string[],
});

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  open,
  onOpenChange,
  editingItem,
  categories,
  onSave
}) => {
  const { user } = useAuth();
  const restaurantId =
    localStorage.getItem('selected_restaurant_id') || user?.restaurantId || '';

  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [menuForm, setMenuForm] = useState(getDefaultMenuForm());
  const [isUploadingMenuImage, setIsUploadingMenuImage] = useState(false);

  // Recipe fields
  const [recipeIngredients, setRecipeIngredients] = useState<DishIngredient[]>([]);
  const [servingCount, setServingCount] = useState(1);
  const [cookingMethod, setCookingMethod] = useState('raw');

  useEffect(() => {
    if (!open) return;
    setActiveTab('info');

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
        confidenceScore: editingItem.nutrition?.confidenceScore || editingItem.confidenceScore || 0,
        allergens: (editingItem.allergens as Allergen[]) || [],
        foodAttributes: editingItem.foodAttributes || [],
      });
      setRecipeIngredients(editingItem.ingredients || []);
      setServingCount(editingItem.servingCount ?? 1);
      setCookingMethod(editingItem.cookingMethod ?? 'raw');
    } else {
      setMenuForm({
        ...getDefaultMenuForm(),
        category: categories[0]?.name || '',
        categoryId: categories[0]?._id || '',
      });
      setRecipeIngredients([]);
      setServingCount(1);
      setCookingMethod('raw');
    }
  }, [open, editingItem, categories]);

  const handleUploadMenuImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn đúng file ảnh'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh không được vượt quá 5MB'); return; }
    setIsUploadingMenuImage(true);
    try {
      const uploaded = await uploadService.uploadMenuImage(file);
      setMenuForm((current) => ({ ...current, imageUrl: uploaded.url }));
      toast.success('Đã upload ảnh món ăn');
    } catch (err: any) {
      toast.error(err.message || 'Không thể upload ảnh');
    } finally {
      setIsUploadingMenuImage(false);
    }
  };

  const handleSave = async () => {
    if (!menuForm.name.trim()) { toast.error('Tên món ăn là bắt buộc'); return; }
    if (menuForm.price <= 0) { toast.error('Giá món ăn phải lớn hơn 0'); return; }
    if (!menuForm.category) { toast.error('Danh mục món ăn là bắt buộc'); return; }

    // Build payload — include recipe fields if recipe tab has data
    const payload: Partial<MenuItem> = {
      name: menuForm.name.trim(),
      price: menuForm.price,
      category: menuForm.category,
      categoryId: menuForm.categoryId || undefined,
      description: menuForm.description.trim(),
      imageUrl: menuForm.imageUrl.trim(),
      available: menuForm.available,
      // Nutrition manual override only if no recipe ingredients
      ...(recipeIngredients.length === 0 && {
        nutrition: {
          calories: menuForm.calories,
          protein: menuForm.protein,
          carbs: menuForm.carbs,
          fat: menuForm.fat,
          fiber: menuForm.fiber,
          sugar: menuForm.sugar,
          sodium: menuForm.sodium,
          confidenceScore: menuForm.confidenceScore,
        },
        allergens: menuForm.allergens,
        foodAttributes: menuForm.foodAttributes,
      }),
      // Recipe fields
      ingredients: recipeIngredients,
      servingCount,
      cookingMethod,
    };

    await onSave(payload, editingItem);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Thông tin cơ bản', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'recipe', label: 'Recipe Builder', icon: <ChefHat className="w-3.5 h-3.5" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-hidden bg-white rounded-2xl p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {editingItem ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Cung cấp thông tin món ăn. Dùng <strong>Recipe Builder</strong> để tính dinh dưỡng tự động.
          </DialogDescription>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex px-6 pt-3 pb-0 shrink-0 gap-1 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-green-600 text-green-700 bg-green-50/60'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'recipe' && recipeIngredients.length > 0 && (
                <span className="ml-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {recipeIngredients.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Basic Info tab ──────────────────────────────────────────── */}
          {activeTab === 'info' && (
            <div className="flex gap-5">

              {/* LEFT: 3:4 Image card */}
              <div className="shrink-0 w-36">
                <Label className="text-xs text-gray-600 font-semibold block mb-1.5">Hình ảnh</Label>

                {/* URL input */}
                <Input
                  id="dishImage"
                  value={menuForm.imageUrl}
                  onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
                  className="rounded-lg text-[11px] h-7 mb-2 px-2"
                  placeholder="Dán URL..."
                />
                <input
                  id="dishImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadMenuImage}
                  className="hidden"
                  disabled={isUploadingMenuImage}
                />

                {/* 3:4 card */}
                <div
                  className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 cursor-pointer group transition-colors hover:border-green-400"
                  style={{ aspectRatio: '3/4' }}
                  onClick={() => document.getElementById('dishImageFile')?.click()}
                >
                  {menuForm.imageUrl ? (
                    <>
                      <img
                        src={menuForm.imageUrl}
                        alt="Preview ảnh món"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-white text-[10px] font-semibold">Thay ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400 group-hover:text-green-600 transition-colors">
                      {isUploadingMenuImage ? (
                        <>
                          <UploadLoader className="w-7 h-7 animate-spin text-green-500" />
                          <span className="text-[10px] font-medium text-green-600">Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-7 h-7" />
                          <div className="text-center px-2">
                            <p className="text-[10px] font-semibold leading-tight">Nhấp để tải ảnh</p>
                            <p className="text-[9px] mt-0.5 text-neutral-400">JPG · PNG · WEBP</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 mt-1 text-center">Tỷ lệ 3:4 · Tối đa 5MB</p>
              </div>

              {/* RIGHT: Form fields */}
              <div className="flex-1 min-w-0 space-y-4">

                {/* Tên + Giá */}
                <div className="space-y-1.5">
                  <Label htmlFor="dishName" className="text-xs text-gray-600 font-semibold">Tên món ăn *</Label>
                  <Input id="dishName" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} className="rounded-xl" placeholder="VD: Cơm gà Hải Nam" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dishPrice" className="text-xs text-gray-600 font-semibold">Giá món (VNĐ) *</Label>
                  <Input id="dishPrice" type="number" min={0} value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) || 0 })} className="rounded-xl" />
                </div>

                {/* Danh mục */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600 font-semibold">Danh mục *</Label>
                  {categories.length > 0 ? (
                    <Select
                      value={menuForm.category || undefined}
                      onValueChange={(value) => {
                        const selected = categories.find((cat) => cat.name === value);
                        setMenuForm({ ...menuForm, categoryId: selected?._id || '', category: value });
                      }}
                    >
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map((cat) => <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value, categoryId: '' })} className="rounded-xl" placeholder="Nhập tên danh mục" />
                  )}
                </div>

                {/* Mô tả */}
                <div className="space-y-1.5">
                  <Label htmlFor="dishDesc" className="text-xs text-gray-600 font-semibold">Mô tả món ăn</Label>
                  <Textarea id="dishDesc" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} className="rounded-xl min-h-[72px] text-sm" placeholder="Mô tả nguyên liệu, khẩu vị..." />
                </div>

                {/* Trạng thái */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-neutral-700">Trạng thái bán</p>
                    <p className="text-[10px] text-gray-400">Hiển thị trên menu khách hàng</p>
                  </div>
                  <Switch checked={menuForm.available} onCheckedChange={(checked) => setMenuForm({ ...menuForm, available: checked })} />
                </div>

                {/* Recipe status */}
                {recipeIngredients.length > 0 && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-800 font-medium flex items-center gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Đã có <strong>{recipeIngredients.length}</strong> nguyên liệu — dinh dưỡng tính tự động khi lưu.</span>
                  </div>
                )}

                {recipeIngredients.length === 0 && (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-xs text-neutral-400 text-center">
                    Chuyển sang tab <strong className="text-green-600">Recipe Builder</strong> để tính dinh dưỡng tự động.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Recipe Builder tab ──────────────────────────────────────── */}
          {activeTab === 'recipe' && (
            <RecipeBuilderTab
              restaurantId={restaurantId}
              initialRows={recipeIngredients}
              servingCount={servingCount}
              cookingMethod={cookingMethod}
              onChangeRows={setRecipeIngredients}
              onChangeServingCount={setServingCount}
              onChangeCookingMethod={setCookingMethod}
            />
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">
            {editingItem ? 'Lưu thay đổi' : 'Thêm món ăn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
