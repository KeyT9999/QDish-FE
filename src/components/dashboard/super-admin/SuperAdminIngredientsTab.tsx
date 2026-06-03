import React, { useState, useEffect, useCallback } from 'react';
import { Ingredient, ingredientService } from '@/services/ingredientService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { IngredientModal } from '../restaurant/modals/IngredientModal';

const CATEGORY_LABELS: Record<string, string> = {
  protein: '🥩 Đạm',
  tinh_bot: '🌾 Tinh bột',
  chat_beo: '🫒 Chất béo',
  rau_cu: '🥦 Rau củ',
  gia_vi: '🧂 Gia vị',
  sua: '🥛 Sữa & Dairy',
};

const CATEGORIES = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'protein', label: '🥩 Đạm (Protein)' },
  { value: 'tinh_bot', label: '🌾 Tinh bột' },
  { value: 'chat_beo', label: '🫒 Chất béo' },
  { value: 'rau_cu', label: '🥦 Rau củ' },
  { value: 'gia_vi', label: '🧂 Gia vị' },
  { value: 'sua', label: '🥛 Sữa & Dairy' },
];

const SOURCE_TYPES = [
  { value: 'all', label: 'Tất cả nguồn' },
  { value: 'global', label: '🌐 Hệ thống' },
  { value: 'custom', label: '🏪 Tùy chỉnh' },
];

export const SuperAdminIngredientsTab: React.FC = () => {
  const getCategoryLabel = (val: string) => {
    const found = CATEGORIES.find((c) => c.value === val);
    return found ? found.label : 'Tất cả loại';
  };
  const getSourceLabel = (val: string) => {
    const found = SOURCE_TYPES.find((s) => s.value === val);
    return found ? found.label : 'Tất cả nguồn';
  };
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sourceType, setSourceType] = useState<'all' | 'global' | 'custom'>('global'); // default to global system list

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const loadIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ingredientService.getAll({
        page,
        limit: 10,
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        type: sourceType,
      });
      setIngredients(res.ingredients);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, sourceType]);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sourceType]);

  const handleSave = async (payload: any, editing: Ingredient | null) => {
    if (editing) {
      await ingredientService.update(editing._id, payload);
      toast.success('Đã cập nhật nguyên liệu hệ thống thành công');
    } else {
      await ingredientService.create(payload);
      toast.success('Đã tạo nguyên liệu hệ thống thành công');
    }
    loadIngredients();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa nguyên liệu này? (Hành động này có thể ảnh hưởng đến thực đơn các nhà hàng đang sử dụng nó)')) return;
    try {
      await ingredientService.delete(id);
      toast.success('Đã xóa nguyên liệu thành công');
      loadIngredients();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa nguyên liệu');
    }
  };

  const handleView = (item: Ingredient) => {
    setEditingItem(item);
    setIsReadOnly(true);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Ingredient) => {
    setEditingItem(item);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Cơ sở dữ liệu Nguyên liệu hệ thống</h2>
          <p className="text-neutral-500 text-xs mt-0.5 font-medium">
            Quản trị cơ sở dữ liệu dinh dưỡng mặc định cho toàn bộ ứng dụng QDish.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/10 gap-1.5 h-11 sm:h-9.5 text-xs px-4 cursor-pointer w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm nguyên liệu hệ thống
        </Button>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white p-3.5 rounded-[20px] border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nguyên liệu..."
            className="pl-10 h-10 rounded-xl bg-neutral-50/50 border-neutral-200/60 focus:bg-white text-xs font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-green-400 focus:shadow-sm"
          />
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="w-full sm:w-[195px]">
            <Select value={category} onValueChange={(v) => setCategory(v || 'all')}>
              <SelectTrigger className="h-10 rounded-xl bg-white border-neutral-200/60 text-xs font-bold text-neutral-750 focus:border-green-400 focus:ring-0 focus:ring-offset-0 focus:shadow-sm flex items-center gap-1.5 w-full justify-between pr-2.5 cursor-pointer">
                <span className="flex items-center gap-1 text-neutral-600 truncate">
                  <span className="shrink-0 text-sm">🏷️</span>
                  <span className="text-neutral-450 font-bold text-[10px] uppercase tracking-wider shrink-0 mr-0.5">Loại:</span>
                  <span className="truncate font-semibold">{getCategoryLabel(category)}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-md border-neutral-100">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs font-semibold text-neutral-700 rounded-lg">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[195px]">
            <Select value={sourceType} onValueChange={(v) => setSourceType((v || 'all') as any)}>
              <SelectTrigger className="h-10 rounded-xl bg-white border-neutral-200/60 text-xs font-bold text-neutral-750 focus:border-green-400 focus:ring-0 focus:ring-offset-0 focus:shadow-sm flex items-center gap-1.5 w-full justify-between pr-2.5 cursor-pointer">
                <span className="flex items-center gap-1 text-neutral-600 truncate">
                  <span className="shrink-0 text-sm">🗄️</span>
                  <span className="text-neutral-450 font-bold text-[10px] uppercase tracking-wider shrink-0 mr-0.5">Nguồn:</span>
                  <span className="truncate font-semibold">{getSourceLabel(sourceType)}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-md border-neutral-100">
                {SOURCE_TYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs font-semibold text-neutral-700 rounded-lg">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={loadIngredients}
            variant="outline"
            size="icon"
            className="h-10 w-full sm:w-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 shrink-0 cursor-pointer flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block">
        <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.02)] border-neutral-200/60 rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent bg-neutral-50/40">
                  <TableHead className="text-xs font-bold text-neutral-450 pl-6 h-11">Nguyên liệu</TableHead>
                  <TableHead className="text-xs font-bold text-neutral-450 h-11">Loại</TableHead>
                  <TableHead className="text-xs font-bold text-neutral-450 h-11">Dinh dưỡng</TableHead>
                  <TableHead className="text-xs font-bold text-neutral-450 h-11">Nguồn</TableHead>
                  <TableHead className="text-right text-xs font-bold text-neutral-450 w-[140px] pr-6 h-11">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing._id} className="border-neutral-100 hover:bg-neutral-50/20 transition-colors">
                    {/* Name column */}
                    <TableCell className="font-semibold text-xs text-neutral-900 pl-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-neutral-850 font-bold">{ing.name}</span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          Mặc định: {ing.defaultUnit} {ing.defaultUnit === 'piece' && `(≈${ing.gramsPerUnit}g)`}
                        </span>
                        {ing.allergens && ing.allergens.length > 0 && (
                          <div className="flex items-center gap-1 text-[9px] text-rose-500 font-bold mt-1">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span>Dị ứng: {ing.allergens.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Category column */}
                    <TableCell className="text-xs text-neutral-600 font-bold py-4">
                      {CATEGORY_LABELS[ing.category] || ing.category}
                    </TableCell>

                    {/* Nutrition column */}
                    <TableCell className="text-xs py-4">
                      <div className="flex flex-col">
                        <span className="text-neutral-850 font-bold text-xs">{ing.caloriesPer100g} kcal</span>
                        <span className="text-[10px] text-neutral-500 font-bold mt-0.5 tracking-wide">
                          P: <span className="text-neutral-700">{ing.proteinPer100g}</span> • 
                          C: <span className="text-neutral-700">{ing.carbPer100g}</span> • 
                          F: <span className="text-neutral-700">{ing.fatPer100g}</span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Source column */}
                    <TableCell className="text-xs py-4">
                      {ing.isVerified ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200/50 font-bold text-[9px]">
                          <span className="w-1 h-1 rounded-full bg-green-500" /> Hệ thống
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/50 font-bold text-[9px]">
                          <span className="w-1 h-1 rounded-full bg-blue-500" /> Nhà hàng
                        </span>
                      )}
                    </TableCell>

                    {/* Actions column */}
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleView(ing)}
                          className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 shrink-0 cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(ing)}
                          className="w-8 h-8 rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 shrink-0 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-neutral-500 hover:text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(ing._id)}
                          className="w-8 h-8 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 cursor-pointer"
                          title="Xóa nguyên liệu"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile view: Card list */}
      <div className="block md:hidden space-y-4">
        {ingredients.map((ing) => (
          <div 
            key={ing._id} 
            className="bg-white border border-neutral-150 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <span className="block text-sm font-bold text-neutral-855 truncate">{ing.name}</span>
                <span className="text-[10px] text-neutral-450 font-bold mt-0.5">
                  Đơn vị: {ing.defaultUnit} {ing.defaultUnit === 'piece' && `(≈${ing.gramsPerUnit}g)`}
                </span>
              </div>
              <div className="shrink-0 flex gap-1">
                {/* Category Badge */}
                <span className="inline-flex items-center bg-neutral-50 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200/50 font-bold text-[9px]">
                  {CATEGORY_LABELS[ing.category] || ing.category}
                </span>
                {/* Source Badge */}
                {ing.isVerified ? (
                  <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200/50 font-bold text-[9px]">
                    Hệ thống
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/50 font-bold text-[9px]">
                    Nhà hàng
                  </span>
                )}
              </div>
            </div>

            {ing.allergens && ing.allergens.length > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-rose-500 font-bold">
                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                <span>Dị ứng: {ing.allergens.join(', ')}</span>
              </div>
            )}

            {/* Mobile Nutrition Grid */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-450 font-bold">Calo:</span>
                <span className="text-xs text-neutral-800 font-bold">{ing.caloriesPer100g} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-450 font-bold">Đạm:</span>
                <span className="text-xs text-neutral-800 font-bold">{ing.proteinPer100g}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-450 font-bold">Carbs:</span>
                <span className="text-xs text-neutral-800 font-bold">{ing.carbPer100g}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-450 font-bold">Béo:</span>
                <span className="text-xs text-neutral-800 font-bold">{ing.fatPer100g}g</span>
              </div>
            </div>

            <div className="flex justify-end gap-1.5 border-t border-neutral-100 pt-3 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(ing)}
                className="h-10 text-xs font-bold rounded-xl border-neutral-200 gap-1 cursor-pointer flex-1"
              >
                <Eye className="w-3.5 h-3.5" /> Chi tiết
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(ing)}
                className="h-10 text-xs font-bold rounded-xl border-neutral-200 hover:border-green-200 hover:bg-green-50 text-neutral-600 hover:text-green-700 gap-1 cursor-pointer flex-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(ing._id)}
                className="h-10 text-xs font-bold rounded-xl border-neutral-200 hover:border-rose-200 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 gap-1 cursor-pointer flex-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Xóa
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {ingredients.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-neutral-150 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
          <div className="w-16 h-16 rounded-[20px] bg-green-50/50 border border-green-150/40 flex items-center justify-center text-3xl">
            🥦
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-neutral-800">Chưa có nguyên liệu nào</h3>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
              Tạo nguyên liệu hệ thống đầu tiên để so khớp dinh dưỡng món ăn của toàn ứng dụng.
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/10 gap-1.5 h-9 text-xs px-5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm nguyên liệu đầu tiên
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4 bg-white rounded-b-3xl">
          <div className="text-xs text-neutral-500 font-bold">
            Hiển thị bản ghi {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} trên tổng số {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl h-8.5 text-xs font-bold gap-1 border-neutral-200 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trước
            </Button>
            <span className="text-xs font-bold text-neutral-800 px-2">Trang {page} / {pages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl h-8.5 text-xs font-bold gap-1 border-neutral-200 cursor-pointer"
            >
              Sau <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Ingredient Modal Form */}
      <IngredientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingIngredient={editingItem}
        onSave={handleSave}
        isSuperAdmin={true}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};
