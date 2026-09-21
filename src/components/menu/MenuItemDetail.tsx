import React, { useMemo } from 'react';
import { MenuItem, Allergen, FoodAttribute, FOOD_ATTRIBUTE_LABELS, FOOD_ATTRIBUTE_COLORS } from '@/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { FitScorePanel } from './FitScorePanel';
import {
  ShoppingBag,
  ArrowLeft,
  X,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Zap,
  Leaf,
  Sparkles,
  ShieldCheck,
  Clock,
  Info,
  Activity,
} from 'lucide-react';
import type { FitScoreSummary } from '@/services/fitScorePresentation';
import { hasAllergenConflict } from '@/services/allergenSafety';

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

// ─── Allergen clean label map (No raw emoji) ──────────────────────────────────
const ALLERGEN_CLEAN_LABELS: Record<string, string> = {
  GLUTEN: 'Gluten ngũ cốc',
  DAIRY: 'Sữa & Chế phẩm sữa',
  NUTS: 'Đậu phộng / Các loại hạt',
  SHELLFISH: 'Hải sản có vỏ',
  SOY: 'Đậu nành',
  EGGS: 'Trứng gà',
  FISH: 'Cá biển',
};

// ─── Food attribute helper (SVG icons, no emojis) ─────────────────────────────
function getAttributeIcon(attr: string) {
  switch (attr) {
    case 'HIGH_PROTEIN':
    case 'VERY_HIGH_PROTEIN':
      return <Dumbbell className="w-3.5 h-3.5 shrink-0" />;
    case 'ENERGY_DENSE':
    case 'POST_WORKOUT':
      return <Zap className="w-3.5 h-3.5 shrink-0" />;
    case 'LIGHT_MEAL':
    case 'VEGETARIAN':
    case 'VEGAN':
      return <Leaf className="w-3.5 h-3.5 shrink-0" />;
    case 'LOW_SUGAR':
      return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    case 'LOW_CALORIE':
      return <Flame className="w-3.5 h-3.5 shrink-0" />;
    case 'HIGH_FIBER':
    case 'GLUTEN_FREE':
      return <Wheat className="w-3.5 h-3.5 shrink-0" />;
    case 'LOW_FAT':
      return <Droplet className="w-3.5 h-3.5 shrink-0" />;
    case 'DAIRY_FREE':
      return <ShieldCheck className="w-3.5 h-3.5 shrink-0" />;
    case 'QUICK_BITE':
      return <Clock className="w-3.5 h-3.5 shrink-0" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
  }
}

function cleanAttributeLabel(label: string): string {
  return label.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, '').trim();
}

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

  const hasUserAllergen = hasAllergenConflict(item?.allergens, userAllergies);

  const foodAttributes: string[] = item.foodAttributes?.length
    ? item.foodAttributes
    : [];

  const allergenList = item.allergens || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        style={{ height: '90vh', maxHeight: '90dvh' }}
        className="data-[side=bottom]:h-[90vh] data-[side=bottom]:max-h-[90dvh] sm:data-[side=bottom]:h-[88vh] sm:data-[side=bottom]:max-h-[88vh] max-w-2xl mx-auto rounded-t-3xl sm:rounded-3xl sm:bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 p-0 flex flex-col bg-white border border-slate-200/80 shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* ─── Top Navigation Header (Always Visible & Prominent) ───── */}
        <header className="shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-30 shadow-2xs">
          {/* Back Button with Icon & Label */}
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-semibold text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs select-none"
            aria-label="Quay lại danh sách món ăn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-slate-700" />
            <span>Quay lại</span>
          </button>

          {/* Dish Title Breadcrumb */}
          <span className="text-xs sm:text-sm font-bold text-slate-600 truncate max-w-[170px] sm:max-w-[260px] text-center">
            {item.name}
          </span>

          {/* Quick Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs select-none"
            aria-label="Đóng chi tiết món"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </header>

        {/* ─── Scrollable Content Area ───────────────────────────────────── */}
        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <div className="py-4 space-y-6">

            {/* ── Hero Food Image (Vibrant & Appetizing) ─────────────────── */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-72 sm:max-h-80 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/60">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80'}
                alt={item.name}
                className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105"
              />

              {/* Floating Badges */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white/95 text-xs font-semibold border border-white/15 shadow-xs">
                  {item.category || 'Món chính'}
                </span>
                {!item.available && (
                  <span className="px-3 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold shadow-xs">
                    Tạm hết món
                  </span>
                )}
              </div>
            </div>

            {/* ── Dish Name & Price Header ──────────────────────────────── */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {item.name}
                </h1>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                    {formatCurrency(item.price)}
                  </span>
                  {item.available && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Đang phục vụ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Description ───────────────────────────────────────────── */}
            <section className="space-y-2">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Mô tả món ăn
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {item.description || 'Món ăn được chuẩn bị tươi mới mỗi ngày từ nguồn nguyên liệu chọn lọc cao cấp, đảm bảo hương vị và giá trị dinh dưỡng tối ưu.'}
              </p>
            </section>

            {/* ── Food Attributes (clean UI/UX Pro Max SVG chips) ───────── */}
            {foodAttributes.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Đặc tính món ăn
                </h2>
                <div className="flex flex-wrap gap-2">
                  {foodAttributes.map((attr) => {
                    const rawLabel = FOOD_ATTRIBUTE_LABELS[attr as FoodAttribute] || attr;
                    const label = cleanAttributeLabel(rawLabel);
                    const colorClass = FOOD_ATTRIBUTE_COLORS[attr as FoodAttribute] || 'bg-slate-100 text-slate-700 border-slate-200';
                    const icon = getAttributeIcon(attr);

                    return (
                      <span
                        key={attr}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border shadow-2xs transition-all duration-150 ${colorClass}`}
                      >
                        {icon}
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Nutrition Fit Score Panel ─────────────────────────────── */}
            {fitScore && onEditProfile && (
              <FitScorePanel summary={fitScore} onEditProfile={onEditProfile} />
            )}

            {/* ── Nutrition Bento Dashboard ─────────────────────────────── */}
            {hasNutrition && item.nutrition && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Giá trị dinh dưỡng / khẩu phần
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">Chuẩn khẩu phần</span>
                </div>

                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-4 sm:p-5 space-y-4">
                  {/* Primary Macro Bento Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {/* Calo */}
                    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-orange-200/70 rounded-2xl p-3 text-center shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                        <Flame className="w-4 h-4 fill-orange-500/20 text-orange-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Calo</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 tracking-tight">
                        {Math.round(item.nutrition.calories)}
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">kcal</span>
                      </div>
                      <div className="text-[10px] text-orange-600/80 font-medium mt-0.5">Năng lượng</div>
                    </div>

                    {/* Protein */}
                    <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200/70 rounded-2xl p-3 text-center shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Dumbbell className="w-4 h-4 text-purple-600" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Đạm</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 tracking-tight">
                        {item.nutrition.protein.toFixed(1)}
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">g</span>
                      </div>
                      <div className="text-[10px] text-purple-600/80 font-medium mt-0.5">Protein</div>
                    </div>

                    {/* Carbs */}
                    <div className="bg-gradient-to-br from-amber-400/10 via-yellow-500/10 to-transparent border border-amber-200/70 rounded-2xl p-3 text-center shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-center gap-1 text-amber-700 mb-1">
                        <Wheat className="w-4 h-4 text-amber-600" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Carbs</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 tracking-tight">
                        {item.nutrition.carbs.toFixed(1)}
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">g</span>
                      </div>
                      <div className="text-[10px] text-amber-700/80 font-medium mt-0.5">Tinh bột</div>
                    </div>

                    {/* Fat */}
                    <div className="bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-transparent border border-sky-200/70 rounded-2xl p-3 text-center shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-center gap-1 text-sky-600 mb-1">
                        <Droplet className="w-4 h-4 fill-sky-500/20 text-sky-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Béo</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 tracking-tight">
                        {item.nutrition.fat.toFixed(1)}
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">g</span>
                      </div>
                      <div className="text-[10px] text-sky-600/80 font-medium mt-0.5">Chất béo</div>
                    </div>
                  </div>

                  {/* Macro ratio progress bar */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/60 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Tỉ lệ Macros (theo calo)</span>
                      <span className="text-[11px] font-bold text-slate-500">
                        P <strong className="text-purple-600">{macroWidths.protein}%</strong> · C <strong className="text-amber-600">{macroWidths.carbs}%</strong> · F <strong className="text-sky-600">{macroWidths.fat}%</strong>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                      <div
                        className="bg-purple-500 h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${macroWidths.protein}%` }}
                        title={`Protein: ${macroWidths.protein}%`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${macroWidths.carbs}%` }}
                        title={`Carbs: ${macroWidths.carbs}%`}
                      />
                      <div
                        className="bg-sky-500 h-full rounded-r-full transition-all duration-500"
                        style={{ width: `${macroWidths.fat}%` }}
                        title={`Fat: ${macroWidths.fat}%`}
                      />
                    </div>
                    <div className="flex gap-4 pt-1 justify-center">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-2xs" />
                        <span>Protein</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
                        <span>Carbs</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-2xs" />
                        <span>Fat</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro grid for secondary nutrients */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {[
                      { label: 'Chất xơ', value: `${(item.nutrition.fiber ?? 0).toFixed(1)}g` },
                      { label: 'Đường', value: `${(item.nutrition.sugar ?? 0).toFixed(1)}g` },
                      { label: 'Natri', value: `${Math.round(item.nutrition.sodium ?? 0)}mg` },
                    ].map((m) => (
                      <div key={m.label} className="bg-white border border-slate-200/60 rounded-xl p-2.5 text-center shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</div>
                        <div className="text-sm font-black text-slate-800 mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Nutrition Confidence Badge */}
                  {(item.nutrition.confidenceScore ?? 0) > 0 && (
                    <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold">Độ tin cậy dữ liệu dinh dưỡng</span>
                      </div>
                      <span className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                        {item.nutrition.confidenceScore}%
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Food Allergens Safety Notice ───────────────────────────── */}
            {allergenList.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Cảnh báo dị ứng thực phẩm
                </h2>
                <div className={`rounded-2xl p-4 border transition-colors ${
                  hasUserAllergen ? 'bg-rose-50 border-rose-200' : 'bg-amber-50/70 border-amber-200/70'
                }`}>
                  <p className={`text-xs font-bold mb-2.5 flex items-center gap-1.5 ${
                    hasUserAllergen ? 'text-rose-800' : 'text-amber-900'
                  }`}>
                    {hasUserAllergen ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                    <span>{hasUserAllergen ? 'Cảnh báo: Chứa thành phần dị ứng theo hồ sơ của bạn!' : 'Món này chứa các thành phần sau:'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allergenList.map((a) => {
                      const isConflicted = userAllergies.includes(a as Allergen);
                      const cleanLabel = ALLERGEN_CLEAN_LABELS[String(a)] || String(a);

                      return (
                        <span
                          key={String(a)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border shadow-2xs ${
                            isConflicted
                              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                              : 'bg-white text-amber-900 border-amber-200'
                          }`}
                        >
                          {isConflicted && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          <span>{cleanLabel}</span>
                        </span>
                      );
                    })}
                  </div>
                  {hasUserAllergen && (
                    <p className="text-xs text-rose-700 font-semibold mt-2.5 flex items-center gap-1">
                      <span>⚠️ Vì sự an toàn của bạn, món ăn này bị hạn chế thêm vào giỏ hàng.</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Extra bottom spacing */}
            <div className="h-4" />
          </div>
        </ScrollArea>

        {/* ─── Sticky CTA Dock ───────────────────────────────────────────── */}
        <footer className="shrink-0 p-4 sm:p-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl z-20">
          <div className="max-w-2xl mx-auto space-y-2">
            {hasUserAllergen && (
              <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl flex items-center gap-2 border border-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Món này chứa chất gây dị ứng theo hồ sơ của bạn!
              </div>
            )}

            <button
              type="button"
              disabled={!item.available || Boolean(hasUserAllergen)}
              onClick={() => {
                onAdd(item);
                onClose();
              }}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-base sm:text-lg shadow-lg shadow-emerald-600/25 disabled:shadow-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer select-none"
            >
              {!item.available ? (
                'Tạm hết món'
              ) : hasUserAllergen ? (
                'Bị khóa do dị ứng'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <span>Thêm vào giỏ hàng • {formatCurrency(item.price)}</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
};
