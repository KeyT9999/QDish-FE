import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Ingredient, DishIngredientInput, NutritionPreviewResult, resolveGrams, IngredientUnit } from '@/services/ingredientService';
import { DishIngredient, FoodAttribute, FOOD_ATTRIBUTE_LABELS, FOOD_ATTRIBUTE_COLORS } from '@/types';
import { ingredientService } from '@/services/ingredientService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Flame, Dumbbell, Wheat, Droplet, Search, Plus, Trash2,
  RefreshCw, Loader2, ChevronDown, ChevronUp, FlaskConical, Utensils, Check
} from 'lucide-react';
import { toast } from 'sonner';

const UNITS: IngredientUnit[] = ['g', 'ml', 'piece', 'tbsp', 'tsp', 'cup', 'bowl'];
const UNIT_LABELS: Record<IngredientUnit, string> = {
  g: 'g',
  ml: 'ml',
  piece: 'cái',
  tbsp: 'muỗng',
  tsp: 'cà phê',
  cup: 'cup',
  bowl: 'chén',
};

const COOKING_METHODS = [
  { value: 'raw',       emoji: '🥗', label: 'Sống' },
  { value: 'boil',      emoji: '♨️', label: 'Luộc' },
  { value: 'steam',     emoji: '💨', label: 'Hấp' },
  { value: 'stir_fry',  emoji: '🍳', label: 'Xào' },
  { value: 'deep_fry',  emoji: '🛢️', label: 'Chiên' },
  { value: 'grill',     emoji: '🔥', label: 'Nướng' },
  { value: 'bake',      emoji: '🫓', label: 'Lò nướng' },
  { value: 'braise',    emoji: '🍲', label: 'Kho' },
];

// Vietnamese category display labels
const CATEGORY_VI: Record<string, string> = {
  protein: '🥩 Đạm',
  tinh_bot: '🌾 Tinh bột',
  chat_beo: '🫒 Chất béo',
  rau_cu: '🥦 Rau củ',
  gia_vi: '🧂 Gia vị',
  sua: '🥛 Sữa',
  carb: '🌾 Tinh bột',
  fat: '🫒 Chất béo',
  vegetable: '🥦 Rau củ',
  sauce: '🧂 Gia vị',
  dairy: '🥛 Sữa',
};

interface RecipeRow {
  id: string;
  ingredient: Ingredient | null;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: IngredientUnit;
  gramsResolved: number;
}

interface RecipeBuilderTabProps {
  restaurantId: string;
  initialRows?: DishIngredient[];
  servingCount: number;
  cookingMethod: string;
  onChangeRows: (rows: DishIngredient[]) => void;
  onChangeServingCount: (v: number) => void;
  onChangeCookingMethod: (v: string) => void;
}

function makeEmptyRow(): RecipeRow {
  return {
    id: Math.random().toString(36).slice(2),
    ingredient: null,
    ingredientId: '',
    ingredientName: '',
    quantity: 100,
    unit: 'g',
    gramsResolved: 100,
  };
}

function getMacroWidths(preview: NutritionPreviewResult | null) {
  if (!preview) return { protein: 33, carbs: 34, fat: 33 };
  const { protein, carbs, fat } = preview.perServing;
  const total = protein * 4 + carbs * 4 + fat * 9;
  if (total === 0) return { protein: 33, carbs: 34, fat: 33 };
  return {
    protein: Math.round((protein * 4 / total) * 100),
    carbs: Math.round((carbs * 4 / total) * 100),
    fat: Math.round((fat * 9 / total) * 100),
  };
}

// ─── IngredientSearchRow ─────────────────────────────────────────────────────
// Isolated component so each row manages its own search state cleanly
interface SearchRowProps {
  row: RecipeRow;
  idx: number;
  showDelete: boolean;
  restaurantId: string;
  onSelect: (ing: Ingredient) => void;
  onClear: () => void;
  onQuantityChange: (qty: number) => void;
  onUnitChange: (unit: IngredientUnit) => void;
  onRemove: () => void;
}

const IngredientSearchRow: React.FC<SearchRowProps> = ({
  row, idx, showDelete, restaurantId,
  onSelect, onClear, onQuantityChange, onUnitChange, onRemove,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await ingredientService.search(value, restaurantId);
        setResults(res);
      } catch {
        toast.error('Không thể tìm kiếm nguyên liệu');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (ing: Ingredient) => {
    onSelect(ing);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleClear = () => {
    onClear();
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* ── Main row: ingredient name + qty + unit ── */}
      <div className="flex items-center gap-2 p-2.5">
        {/* Index */}
        <span className="text-[11px] text-gray-400 font-bold w-5 shrink-0 text-center">{idx + 1}</span>

        {/* Ingredient display / search trigger */}
        <div ref={containerRef} className="flex-1 min-w-0">
          {row.ingredientId ? (
            /* Selected state */
            <div className="flex items-center gap-1.5 h-8 bg-green-50 border border-green-200 rounded-lg px-2.5">
              <Check className="w-3 h-3 text-green-600 shrink-0" />
              <span className="text-xs font-semibold text-green-800 flex-1 truncate">{row.ingredientName}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none shrink-0 w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            /* Search state */
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <Input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => { if (results.length > 0) setShowResults(true); }}
                  placeholder="Tìm nguyên liệu (VD: gà, cơm, dầu...)"
                  className="pl-8 h-8 text-xs rounded-lg bg-white border-neutral-200 focus:border-green-400 focus:ring-green-100"
                />
                {loading && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-green-500" />
                )}
              </div>

              {/* ── Inline search results (NOT absolute → no clipping) ── */}
              {showResults && results.length > 0 && (
                <div className="mt-1 rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
                  {results.map((ing, i) => (
                    <button
                      key={ing._id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // keep focus on input
                      onClick={() => handleSelect(ing)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors hover:bg-green-50 ${
                        i !== results.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold text-gray-800 block">{ing.name}</span>
                        <span className="text-[10px] text-gray-400">{CATEGORY_VI[ing.category] || ing.category}</span>
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 shrink-0 ml-2">
                        {ing.caloriesPer100g} kcal/100g
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {showResults && !loading && query.trim() && results.length === 0 && (
                <div className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500 text-center">
                  Không tìm thấy "<span className="font-semibold">{query}</span>" — thử từ khác
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quantity */}
        <Input
          type="number"
          min={0.1}
          step={1}
          value={row.quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value) || 0)}
          className="w-[68px] h-8 text-xs rounded-lg text-center bg-white shrink-0"
        />

        {/* Unit */}
        <Select value={row.unit} onValueChange={(v) => onUnitChange(v as IngredientUnit)}>
          <SelectTrigger className="w-20 h-8 text-xs rounded-lg bg-white shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {UNITS.map((u) => (
              <SelectItem key={u} value={u} className="text-xs">
                {UNIT_LABELS[u]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grams badge */}
        <span className="text-[10px] text-gray-400 w-10 text-right shrink-0">
          ≈{row.gramsResolved.toFixed(0)}g
        </span>

        {/* Remove */}
        {showDelete && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const RecipeBuilderTab: React.FC<RecipeBuilderTabProps> = ({
  restaurantId,
  initialRows = [],
  servingCount,
  cookingMethod,
  onChangeRows,
  onChangeServingCount,
  onChangeCookingMethod,
}) => {
  const [rows, setRows] = useState<RecipeRow[]>(() => {
    if (initialRows.length > 0) {
      return initialRows.map((r) => ({
        id: Math.random().toString(36).slice(2),
        ingredient: null,
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName || '',
        quantity: r.quantity,
        unit: r.unit as IngredientUnit,
        gramsResolved: r.gramsResolved,
      }));
    }
    return [makeEmptyRow()];
  });

  const [preview, setPreview] = useState<NutritionPreviewResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const syncToParent = useCallback((newRows: RecipeRow[]) => {
    const mapped: DishIngredient[] = newRows
      .filter((r) => r.ingredientId)
      .map((r) => ({
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName,
        quantity: r.quantity,
        unit: r.unit,
        gramsResolved: r.gramsResolved,
      }));
    onChangeRows(mapped);
  }, [onChangeRows]);

  const updateRow = useCallback((id: string, patch: Partial<RecipeRow>) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      syncToParent(next);
      return next;
    });
  }, [syncToParent]);

  const handleSelect = useCallback((rowId: string, ing: Ingredient) => {
    setRows((prev) => {
      const next = prev.map((r) => {
        if (r.id !== rowId) return r;
        const gramsResolved = resolveGrams(r.quantity, r.unit, ing);
        return { ...r, ingredient: ing, ingredientId: ing._id, ingredientName: ing.name, unit: ing.defaultUnit as IngredientUnit, gramsResolved };
      });
      syncToParent(next);
      return next;
    });
  }, [syncToParent]);

  const handleQuantityChange = useCallback((rowId: string, qty: number) => {
    setRows((prev) => {
      const next = prev.map((r) => {
        if (r.id !== rowId) return r;
        const gramsResolved = r.ingredient ? resolveGrams(qty, r.unit, r.ingredient) : qty;
        return { ...r, quantity: qty, gramsResolved };
      });
      syncToParent(next);
      return next;
    });
  }, [syncToParent]);

  const handleUnitChange = useCallback((rowId: string, unit: IngredientUnit) => {
    setRows((prev) => {
      const next = prev.map((r) => {
        if (r.id !== rowId) return r;
        const gramsResolved = r.ingredient ? resolveGrams(r.quantity, unit, r.ingredient) : r.gramsResolved;
        return { ...r, unit, gramsResolved };
      });
      syncToParent(next);
      return next;
    });
  }, [syncToParent]);

  const addRow = () => setRows((prev) => [...prev, makeEmptyRow()]);

  const removeRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      syncToParent(next);
      return next;
    });
  };

  const handlePreview = async () => {
    const validRows = rows.filter((r) => r.ingredientId);
    if (validRows.length === 0) {
      toast.warning('Thêm ít nhất 1 nguyên liệu để xem dữ liệu dinh dưỡng');
      return;
    }
    const ingredients: DishIngredientInput[] = validRows.map((r) => ({
      ingredientId: r.ingredientId,
      quantity: r.quantity,
      unit: r.unit,
      gramsResolved: r.gramsResolved,
    }));
    setIsPreviewing(true);
    try {
      const result = await ingredientService.previewNutrition(ingredients, servingCount);
      setPreview(result);
      setShowPreview(true);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tính toán dinh dưỡng');
    } finally {
      setIsPreviewing(false);
    }
  };

  const macroWidths = getMacroWidths(preview);
  const validCount = rows.filter((r) => r.ingredientId).length;

  return (
    <div className="space-y-4">

      {/* ── Serving count + Cooking method ───────────────────────────── */}
      <div className="space-y-4">
        {/* Số khẩu phần */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">
            <Utensils className="w-3 h-3" /> Số khẩu phần
          </Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeServingCount(Math.max(1, servingCount - 1))}
              className="w-8 h-9 rounded-lg border border-neutral-200 bg-white text-gray-600 hover:bg-neutral-50 flex items-center justify-center font-bold text-lg transition-colors"
            >
              −
            </button>
            <Input
              type="number"
              min={1}
              value={servingCount}
              onChange={(e) => onChangeServingCount(Math.max(1, Number(e.target.value) || 1))}
              className="flex-1 rounded-xl bg-white text-sm h-9 text-center font-semibold"
            />
            <button
              type="button"
              onClick={() => onChangeServingCount(servingCount + 1)}
              className="w-8 h-9 rounded-lg border border-neutral-200 bg-white text-gray-600 hover:bg-neutral-50 flex items-center justify-center font-bold text-lg transition-colors"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-gray-400">Dinh dưỡng sẽ chia theo số khẩu phần này</p>
        </div>

        {/* Phương pháp nấu — pill grid */}
        <div className="space-y-2">
          <Label className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">
            <FlaskConical className="w-3 h-3" /> Phương pháp chế biến
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {COOKING_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => onChangeCookingMethod(m.value)}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                  cookingMethod === m.value
                    ? 'border-green-500 bg-green-50 text-green-800 shadow-sm shadow-green-500/10'
                    : 'border-neutral-200 bg-white text-gray-500 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <span className="text-base leading-none">{m.emoji}</span>
                <span className="text-[10px] font-semibold leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Nguyên liệu
          {validCount > 0 && (
            <span className="ml-2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {validCount}
            </span>
          )}
        </Label>
        <span className="text-[10px] text-gray-400">Tìm kiếm từ cơ sở dữ liệu QDish</span>
      </div>

      {/* ── Ingredient rows ───────────────────────────────────────────── */}
      {/* 
        NOTE: We do NOT use overflow-y-auto here to avoid clipping the search dropdown.
        The dialog body (parent) is overflow-y-auto and handles scrolling.
      */}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <IngredientSearchRow
            key={row.id}
            row={row}
            idx={idx}
            showDelete={rows.length > 1}
            restaurantId={restaurantId}
            onSelect={(ing) => handleSelect(row.id, ing)}
            onClear={() => updateRow(row.id, { ingredient: null, ingredientId: '', ingredientName: '' })}
            onQuantityChange={(qty) => handleQuantityChange(row.id, qty)}
            onUnitChange={(unit) => handleUnitChange(row.id, unit)}
            onRemove={() => removeRow(row.id)}
          />
        ))}
      </div>

      {/* ── Add row button ────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full rounded-xl border-dashed border-neutral-300 text-neutral-500 hover:text-green-700 hover:border-green-400 text-xs h-9"
      >
        <Plus className="w-3.5 h-3.5 mr-1.5" />
        Thêm nguyên liệu
      </Button>

      {/* ── Preview button ────────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={handlePreview}
        disabled={isPreviewing || validCount === 0}
        className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm h-10 font-semibold shadow-sm shadow-green-600/20 disabled:opacity-50"
      >
        {isPreviewing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang tính toán...</>
        ) : (
          <><RefreshCw className="w-4 h-4 mr-2" />Xem dinh dưỡng dự kiến</>
        )}
      </Button>

      {/* ── Preview panel ─────────────────────────────────────────────── */}
      {preview && (
        <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/40 overflow-hidden">
          {/* Collapsible header */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-800">✨ Dinh dưỡng / khẩu phần</span>
              <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                {Math.round(preview.perServing.calories)} kcal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">
                Confidence {Math.round(preview.confidence * 100)}%
              </span>
              {showPreview
                ? <ChevronUp className="w-3.5 h-3.5 text-green-600" />
                : <ChevronDown className="w-3.5 h-3.5 text-green-600" />
              }
            </div>
          </button>

          {showPreview && (
            <div className="px-4 pb-4 space-y-3">

              {/* 4 macro tiles */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calo', value: Math.round(preview.perServing.calories), unit: 'kcal', icon: <Flame className="w-3.5 h-3.5 text-orange-500" />, bg: 'bg-orange-50 border-orange-200' },
                  { label: 'Đạm', value: preview.perServing.protein.toFixed(1), unit: 'g', icon: <Dumbbell className="w-3.5 h-3.5 text-purple-500" />, bg: 'bg-purple-50 border-purple-200' },
                  { label: 'Carbs', value: preview.perServing.carbs.toFixed(1), unit: 'g', icon: <Wheat className="w-3.5 h-3.5 text-amber-500" />, bg: 'bg-amber-50 border-amber-200' },
                  { label: 'Béo', value: preview.perServing.fat.toFixed(1), unit: 'g', icon: <Droplet className="w-3.5 h-3.5 text-blue-500" />, bg: 'bg-blue-50 border-blue-200' },
                ].map((m) => (
                  <div key={m.label} className={`${m.bg} border rounded-xl p-2 text-center`}>
                    <div className="flex justify-center mb-1">{m.icon}</div>
                    <div className="text-sm font-bold text-neutral-800 leading-none">
                      {m.value}
                      <span className="text-[9px] text-gray-400 ml-0.5">{m.unit}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Macro ratio bar */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Tỉ lệ calo theo macros</span>
                  <span>P {macroWidths.protein}% · C {macroWidths.carbs}% · F {macroWidths.fat}%</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden flex">
                  <div className="bg-purple-400 h-full" style={{ width: `${macroWidths.protein}%` }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${macroWidths.carbs}%` }} />
                  <div className="bg-blue-400 h-full" style={{ width: `${macroWidths.fat}%` }} />
                </div>
              </div>

              {/* Micro nutrients */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Chất xơ', value: `${preview.perServing.fiber.toFixed(1)}g` },
                  { label: 'Đường', value: `${preview.perServing.sugar.toFixed(1)}g` },
                  { label: 'Sodium', value: `${Math.round(preview.perServing.sodium)}mg` },
                ].map((m) => (
                  <div key={m.label} className="bg-white border border-gray-100 rounded-lg p-1.5 text-center">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">{m.label}</div>
                    <div className="text-xs font-bold text-neutral-700 mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Food attributes */}
              {preview.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {preview.attributes.map((attr) => {
                    const label = FOOD_ATTRIBUTE_LABELS[attr as FoodAttribute] || attr;
                    const colorClass = FOOD_ATTRIBUTE_COLORS[attr as FoodAttribute] || 'bg-gray-100 text-gray-700 border-gray-200';
                    return (
                      <span key={attr} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${colorClass}`}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Allergens */}
              {preview.allergens.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1.5">⚠️ Chứa chất gây dị ứng</p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.allergens.map((a) => (
                      <span key={a} className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-200">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-400 italic">
                * Tính tự động theo công thức QDish. Giá trị thực có thể dao động ±10%.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
