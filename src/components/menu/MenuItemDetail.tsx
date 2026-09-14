import React, { useMemo } from 'react';
import { MenuItem, Allergen, FoodAttribute, FOOD_ATTRIBUTE_LABELS, FOOD_ATTRIBUTE_COLORS } from '@/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { AllergenWarning } from './AllergenWarning';
import { FitScorePanel } from './FitScorePanel';
import { ShoppingBag, ChevronLeft, ShieldAlert, Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';
import type { FitScoreSummary } from '@/services/fitScorePresentation';

interface MenuItemDetailProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  userAllergies?: Allergen[];
  fitScore?: FitScoreSummary;
  onEditProfile?: () => void;
}

// ─── Macro Calorie Ratio ─────────────────────────────────────────────────────
function useMacroWidths(item: MenuItem | null) {
  return useMemo(() => {
    if (!item?.nutrition) return { protein: 33, carbs: 34, fat: 33 };
    const { protein = 0, carbs = 0, fat = 0 } = item.nutrition;
    const total = protein * 4 + carbs * 4 + fat * 9;
    if (total === 0) return { protein: 33, carbs: 34, fat: 33 };
    return {
      protein: Math.round((protein * 4 / total) * 100),
      carbs: Math.round((carbs * 4 / total) * 100),
      fat: Math.round((fat * 9 / total) * 100),
    };
  }, [item]);
}

// ─── Allergen label map ───────────────────────────────────────────────────────
const ALLERGEN_LABELS: Record<string, string> = {
  GLUTEN: '🌾 Gluten',
  DAIRY: '🥛 Sữa',
  NUTS: '🥜 Đậu/Hạt',
  SHELLFISH: '🦐 Hải sản có vỏ',
  SOY: '🫘 Đậu nành',
  EGGS: '🥚 Trứng',
  FISH: '🐟 Cá',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  item,
  isOpen,
  onClose,
  onAdd,
  userAllergies = [],
  fitScore,
  onEditProfile,
}) => {
  const macroWidths = useMacroWidths(item);

  if (!item) return null;

  const hasNutrition = Boolean(
    item.nutrition && (
      item.nutrition.calories > 0 ||
      item.nutrition.protein > 0 ||
      item.nutrition.carbs > 0
    )
  );

  const hasUserAllergen =
    item.allergens &&
    item.allergens.some((a) => userAllergies.includes(a as Allergen));

  // Resolve food attributes from the new context-based system
  const foodAttributes: string[] = item.foodAttributes?.length
    ? item.foodAttributes
    : [];

  const allergenList = item.allergens || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[85vh] rounded-t-3xl p-0 flex flex-col bg-white border-none overflow-hidden"
      >
        {/* ─── Hero image ────────────────────────────────────────────────── */}
        <div className="relative w-full h-64 shrink-0 bg-gray-100">
          {/* Drag handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-12 h-1.5 bg-white/50 backdrop-blur-md rounded-full shadow-sm" />
          </div>

          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/25" />

          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur hover:bg-white border-0 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-md">
              {item.name}
            </h2>
            <p className="text-xl font-bold text-green-300 drop-shadow-md">
              {formatCurrency(item.price)}
            </p>
          </div>
        </div>

        {/* ─── Scrollable Content ────────────────────────────────────────── */}
        <ScrollArea className="flex-1 px-5 pt-6 pb-28">
          <div className="space-y-7">

            {/* Description */}
            <section>
              <h3 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Mô tả</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.description || 'Chưa có mô tả chi tiết cho món ăn này.'}
              </p>
            </section>

            {/* ── Food Attributes (non-judgmental QDish badges) ─────────── */}
            {foodAttributes.length > 0 && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Phù hợp với</h3>
                <div className="flex flex-wrap gap-2">
                  {foodAttributes.map((attr) => {
                    const label = FOOD_ATTRIBUTE_LABELS[attr as FoodAttribute] || attr;
                    const colorClass = FOOD_ATTRIBUTE_COLORS[attr as FoodAttribute] || 'bg-gray-100 text-gray-700 border-gray-200';
                    return (
                      <span
                        key={attr}
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${colorClass}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Nutrition panel ───────────────────────────────────────── */}
            {fitScore && onEditProfile && (
              <FitScorePanel summary={fitScore} onEditProfile={onEditProfile} />
            )}

            {hasNutrition && item.nutrition && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Giá trị dinh dưỡng / khẩu phần</h3>
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-4 space-y-4">

                  {/* Primary macro tiles */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Calo', value: `${Math.round(item.nutrition.calories)}`, unit: 'kcal', icon: <Flame className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-50 border-orange-100' },
                      { label: 'Đạm', value: `${item.nutrition.protein.toFixed(1)}`, unit: 'g', icon: <Dumbbell className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50 border-purple-100' },
                      { label: 'Carbs', value: `${item.nutrition.carbs.toFixed(1)}`, unit: 'g', icon: <Wheat className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50 border-amber-100' },
                      { label: 'Béo', value: `${item.nutrition.fat.toFixed(1)}`, unit: 'g', icon: <Droplet className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50 border-blue-100' },
                    ].map((m) => (
                      <div key={m.label} className={`${m.bg} border rounded-xl p-2.5 text-center`}>
                        <div className="flex justify-center mb-1">{m.icon}</div>
                        <div className="text-sm font-bold text-neutral-800">
                          {m.value}
                          <span className="text-[10px] text-gray-400 ml-0.5">{m.unit}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Macro ratio bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-medium">
                      <span>Tỉ lệ Macros (theo calo)</span>
                      <span>P {macroWidths.protein}% · C {macroWidths.carbs}% · F {macroWidths.fat}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full overflow-hidden flex gap-0.5">
                      <div className="bg-purple-400 h-full rounded-l-full transition-all" style={{ width: `${macroWidths.protein}%` }} title="Protein" />
                      <div className="bg-amber-400 h-full transition-all" style={{ width: `${macroWidths.carbs}%` }} title="Carbs" />
                      <div className="bg-blue-400 h-full rounded-r-full transition-all" style={{ width: `${macroWidths.fat}%` }} title="Fat" />
                    </div>
                    <div className="flex gap-4 mt-1.5 justify-center">
                      {[
                        { label: 'Protein', color: 'bg-purple-400' },
                        { label: 'Carbs', color: 'bg-amber-400' },
                        { label: 'Fat', color: 'bg-blue-400' },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${m.color}`} />
                          <span className="text-[10px] text-gray-400">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micro grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { label: 'Chất xơ', value: `${(item.nutrition.fiber ?? 0).toFixed(1)}g` },
                      { label: 'Đường', value: `${(item.nutrition.sugar ?? 0).toFixed(1)}g` },
                      { label: 'Sodium', value: `${Math.round(item.nutrition.sodium ?? 0)}mg` },
                    ].map((m) => (
                      <div key={m.label} className="bg-white border border-neutral-100 rounded-xl p-2 text-center">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{m.label}</div>
                        <div className="text-xs font-bold text-neutral-800 mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Nutrition score */}
                  {(item.nutrition.confidenceScore ?? 0) > 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-green-800">Độ tin cậy dữ liệu</span>
                      <span className="bg-green-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">
                        {item.nutrition.confidenceScore}%
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Allergens ─────────────────────────────────────────────── */}
            {allergenList.length > 0 && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Thông tin dị ứng</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-amber-800 mb-2.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Món này chứa các chất sau
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allergenList.map((a) => (
                      <span
                        key={String(a)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          userAllergies.includes(a as Allergen)
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-white text-amber-800 border-amber-200'
                        }`}
                      >
                        {ALLERGEN_LABELS[String(a)] || String(a)}
                        {userAllergies.includes(a as Allergen) && ' ⚠️'}
                      </span>
                    ))}
                  </div>
                  {hasUserAllergen && (
                    <p className="text-[11px] text-red-700 font-semibold mt-2.5">
                      * Món này chứa chất bạn đã đánh dấu dị ứng.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Extra bottom spacing for the fixed action bar */}
            <div className="h-4" />
          </div>
        </ScrollArea>

        {/* ─── Sticky CTA ────────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10">
          {hasUserAllergen && (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl flex items-center gap-2 border border-red-200 mb-2 font-medium text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              Món này chứa chất gây dị ứng của bạn!
            </div>
          )}

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-green-600/20"
            disabled={!item.available || Boolean(hasUserAllergen)}
            onClick={() => { onAdd(item); onClose(); }}
          >
            {!item.available ? (
              'Hết món'
            ) : hasUserAllergen ? (
              'Bị khóa do dị ứng'
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng • {formatCurrency(item.price)}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
