import React, { useState, useEffect } from 'react';
import { Ingredient, IngredientUnit } from '@/services/ingredientService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, Info } from 'lucide-react';

export interface IngredientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingIngredient: Ingredient | null;
  onSave: (payload: any, editingItem: Ingredient | null) => Promise<void>;
  isSuperAdmin?: boolean;
  isReadOnly?: boolean;
}

const CATEGORIES = [
  { value: 'protein', label: '🥩 Đạm (Protein)' },
  { value: 'tinh_bot', label: '🌾 Tinh bột (Carbohydrates)' },
  { value: 'chat_beo', label: '🫒 Chất béo (Fat)' },
  { value: 'rau_cu', label: '🥦 Rau củ (Vegetables)' },
  { value: 'gia_vi', label: '🧂 Gia vị (Spices & Sauces)' },
  { value: 'sua', label: '🥛 Sữa & Dairy' },
];

const UNITS = [
  { value: 'g', label: 'g (Gram)' },
  { value: 'ml', label: 'ml (Milliliter)' },
  { value: 'piece', label: 'Cái (Piece)' },
];

const ALLERGEN_OPTIONS = [
  { value: 'gluten', label: 'Gluten', emoji: '🌾' },
  { value: 'dairy', label: 'Sữa (Dairy)', emoji: '🥛' },
  { value: 'eggs', label: 'Trứng (Eggs)', emoji: '🥚' },
  { value: 'soy', label: 'Đậu nành (Soy)', emoji: '🫘' },
  { value: 'nuts', label: 'Hạt (Nuts)', emoji: '🥜' },
  { value: 'fish', label: 'Cá (Fish)', emoji: '🐟' },
  { value: 'shellfish', label: 'Hải sản (Shellfish)', emoji: '🦐' },
];

export const IngredientModal: React.FC<IngredientModalProps> = ({
  open,
  onOpenChange,
  editingIngredient,
  onSave,
  isSuperAdmin = false,
  isReadOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'nutrition' | 'allergens'>('basic');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('protein');
  const [defaultUnit, setDefaultUnit] = useState<IngredientUnit>('g');
  const [gramsPerUnit, setGramsPerUnit] = useState(1);
  const [caloriesPer100g, setCaloriesPer100g] = useState(0);
  const [proteinPer100g, setProteinPer100g] = useState(0);
  const [carbPer100g, setCarbPer100g] = useState(0);
  const [fatPer100g, setFatPer100g] = useState(0);
  const [fiberPer100g, setFiberPer100g] = useState(0);
  const [sugarPer100g, setSugarPer100g] = useState(0);
  const [sodiumPer100g, setSodiumPer100g] = useState(0);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveTab('basic'); // default to first tab when opening
    if (editingIngredient) {
      setName(editingIngredient.name);
      setCategory(editingIngredient.category);
      setDefaultUnit(editingIngredient.defaultUnit);
      setGramsPerUnit(editingIngredient.gramsPerUnit || 1);
      setCaloriesPer100g(editingIngredient.caloriesPer100g || 0);
      setProteinPer100g(editingIngredient.proteinPer100g || 0);
      setCarbPer100g(editingIngredient.carbPer100g || 0);
      setFatPer100g(editingIngredient.fatPer100g || 0);
      setFiberPer100g(editingIngredient.fiberPer100g || 0);
      setSugarPer100g(editingIngredient.sugarPer100g || 0);
      setSodiumPer100g(editingIngredient.sodiumPer100g || 0);
      setSelectedAllergens(editingIngredient.allergens || []);
    } else {
      setName('');
      setCategory('protein');
      setDefaultUnit('g');
      setGramsPerUnit(1);
      setCaloriesPer100g(0);
      setProteinPer100g(0);
      setCarbPer100g(0);
      setFatPer100g(0);
      setFiberPer100g(0);
      setSugarPer100g(0);
      setSodiumPer100g(0);
      setSelectedAllergens([]);
    }
  }, [open, editingIngredient]);

  const toggleAllergen = (val: string) => {
    if (isReadOnly) return;
    setSelectedAllergens((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nguyên liệu');
      return;
    }
    if (defaultUnit === 'piece' && gramsPerUnit <= 0) {
      toast.error('Vui lòng nhập khối lượng quy đổi cho 1 cái');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        defaultUnit,
        gramsPerUnit: defaultUnit === 'piece' ? gramsPerUnit : 1,
        caloriesPer100g,
        proteinPer100g,
        carbPer100g,
        fatPer100g,
        fiberPer100g,
        sugarPer100g,
        sodiumPer100g,
        allergens: selectedAllergens,
      };
      await onSave(payload, editingIngredient);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu nguyên liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full md:max-w-4xl h-full md:h-auto md:max-h-[85vh] bg-white rounded-none md:rounded-[24px] p-4 md:p-6 overflow-y-auto border-0 md:border border-neutral-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06),0_0_80px_rgba(0,0,0,0.02),0_4px_20px_rgba(0,0,0,0.03)] focus-visible:outline-none">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900">
            {isReadOnly ? (
              <span>👁️ Chi tiết nguyên liệu</span>
            ) : editingIngredient ? (
              isSuperAdmin ? '✏️ Sửa nguyên liệu hệ thống' : '✏️ Sửa nguyên liệu tùy chỉnh'
            ) : (
              isSuperAdmin ? '✨ Thêm nguyên liệu hệ thống' : '✨ Thêm nguyên liệu tùy chỉnh'
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 mt-1">
            {isReadOnly ? (
              'Xem chi tiết thông tin cơ bản, hàm lượng dinh dưỡng và chất gây dị ứng của nguyên liệu.'
            ) : isSuperAdmin ? (
              'Dữ liệu này sẽ xuất hiện làm mặc định cho tất cả các nhà hàng để so khớp dinh dưỡng.'
            ) : (
              'Dữ liệu nguyên liệu custom chỉ có hiệu lực và hiển thị riêng cho nhà hàng này.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Headers */}
        <div className="flex border-b border-neutral-100 mb-6 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'basic' ? 'text-green-600' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Thông tin cơ bản
            {activeTab === 'basic' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full animate-fade-in" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`pb-2.5 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'nutrition' ? 'text-green-600' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Giá trị dinh dưỡng
            {activeTab === 'nutrition' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full animate-fade-in" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('allergens')}
            className={`pb-2.5 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'allergens' ? 'text-green-600' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Chất gây dị ứng
            {activeTab === 'allergens' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {/* Tab Content panels */}
        <div className="py-2 min-h-[220px]">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-600 font-bold">Tên nguyên liệu *</Label>
                  <Input
                    disabled={isReadOnly}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Ức gà áp chảo, Bơ lạt Anchor..."
                    className="rounded-xl h-10 border-neutral-200/80 focus:border-green-400 text-xs font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-600 font-bold">Phân loại *</Label>
                  <Select disabled={isReadOnly} value={category} onValueChange={(v) => setCategory(v || 'protein')}>
                    <SelectTrigger className="h-10 rounded-xl border-neutral-200/80 text-xs font-semibold focus:border-green-400 focus:ring-0 focus:ring-offset-0 focus:shadow-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl shadow-md border-neutral-100">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-xs font-semibold text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900 rounded-lg">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-600 font-bold">Đơn vị mặc định *</Label>
                  <Select disabled={isReadOnly} value={defaultUnit} onValueChange={(v) => setDefaultUnit(v as IngredientUnit)}>
                    <SelectTrigger className="h-10 rounded-xl border-neutral-200/80 text-xs font-semibold focus:border-green-400 focus:ring-0 focus:ring-offset-0 focus:shadow-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl shadow-md border-neutral-100">
                      {UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value} className="text-xs font-semibold text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900 rounded-lg">
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {defaultUnit === 'piece' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-600 font-bold">Khối lượng quy đổi (g / cái) *</Label>
                    <Input
                      disabled={isReadOnly}
                      type="number"
                      min={0.1}
                      value={gramsPerUnit}
                      onChange={(e) => setGramsPerUnit(Number(e.target.value) || 0)}
                      className="rounded-xl h-10 border-neutral-200/80 focus:border-green-400 text-xs font-bold text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION CARDS GRID */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/40">
                <Info className="w-3.5 h-3.5 text-neutral-400" />
                Nhập hàm lượng giá trị dinh dưỡng dựa trên <strong>100g</strong> hoặc <strong>100ml</strong> nguyên liệu.
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Calories Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-amber-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Calo (kcal)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">🔥</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    value={caloriesPer100g}
                    onChange={(e) => setCaloriesPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>

                {/* Protein Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-emerald-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Đạm (g)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">💪</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    step={0.1}
                    value={proteinPer100g}
                    onChange={(e) => setProteinPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>

                {/* Carb Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-sky-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Carbs (g)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">🍚</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    step={0.1}
                    value={carbPer100g}
                    onChange={(e) => setCarbPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>

                {/* Fat Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-lime-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Béo (g)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">🥑</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    step={0.1}
                    value={fatPer100g}
                    onChange={(e) => setFatPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>

                {/* Fiber Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-green-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Chất xơ (g)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">🌿</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    step={0.1}
                    value={fiberPer100g}
                    onChange={(e) => setFiberPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>

                {/* Sugar Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-purple-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Đường (g)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">🍬</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    step={0.1}
                    value={sugarPer100g}
                    onChange={(e) => setSugarPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>

                {/* Sodium Card */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-rose-300 hover:shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Muối/Natri (mg)</span>
                    <span className="text-base group-hover:scale-110 transition-transform">🧂</span>
                  </div>
                  <Input
                    disabled={isReadOnly}
                    type="number"
                    min={0}
                    value={sodiumPer100g}
                    onChange={(e) => setSodiumPer100g(Number(e.target.value) || 0)}
                    className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0 text-neutral-800 text-center h-8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALLERGEN CHIPS */}
          {activeTab === 'allergens' && (
            <div className="space-y-4">
              <Label className="text-xs text-neutral-500 font-bold block mb-1">
                Chọn các chất gây dị ứng có trong nguyên liệu này:
              </Label>
              <div className="flex flex-wrap gap-3">
                {ALLERGEN_OPTIONS.map((a) => {
                  const selected = selectedAllergens.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => toggleAllergen(a.value)}
                      className={`text-xs px-4 py-2.5 rounded-full border font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        selected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/60'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200/60 hover:bg-neutral-100 hover:border-neutral-300'
                      } ${isReadOnly ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                    >
                      {selected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{a.emoji} {a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-8 gap-2 border-t border-neutral-100 pt-4 flex flex-col-reverse sm:flex-row justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-neutral-200/80 font-bold text-xs h-9 cursor-pointer">
            {isReadOnly ? 'Đóng' : 'Hủy'}
          </Button>
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm px-6 text-xs h-9 cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu nguyên liệu'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
