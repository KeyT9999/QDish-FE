import React from 'react';
import { MenuItem, Allergen, CartItem, FoodAttribute, FOOD_ATTRIBUTE_LABELS, FOOD_ATTRIBUTE_COLORS } from '@/types';
import { Minus, Plus, ShieldAlert, Award } from 'lucide-react';
import { NutritionBadge } from './NutritionBadge';
import { FitScoreBadge } from './FitScoreBadge';
import { hasAllergenConflict } from '@/services/allergenSafety';
import { formatCurrency } from '@/lib/utils';
import type { FitScoreSummary } from '@/services/fitScorePresentation';

interface MenuItemCardProps {
  item: MenuItem;
  cartItem?: CartItem;
  onAdd: (item: MenuItem) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemove?: (id: string) => void;
  onClick?: (item: MenuItem) => void;
  userAllergies?: Allergen[];
  isRecommended?: boolean;
  fitScore?: FitScoreSummary;
  isFitScoreLoading?: boolean;
}

const MenuItemCardComponent: React.FC<MenuItemCardProps> = ({ 
  item, 
  cartItem,
  onAdd, 
  onUpdateQuantity,
  onRemove,
  onClick,
  userAllergies = [],
  isRecommended = false,
  fitScore,
  isFitScoreLoading = false,
}) => {
  const hasUserAllergen = hasAllergenConflict(item.allergens, userAllergies);
  const quantity = cartItem?.quantity || 0;

  // Clean redundant descriptions that simply repeat the dish name
  const isDuplicateDescription = Boolean(
    item.description &&
    (item.description.trim().toLowerCase() === item.name.trim().toLowerCase() ||
     item.name.trim().toLowerCase().startsWith(item.description.trim().toLowerCase()))
  );
  const displayDescription = isDuplicateDescription ? null : item.description;

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 1 && onRemove) {
      onRemove(item.id || (item as any)._id);
    } else if (onUpdateQuantity) {
      onUpdateQuantity(item.id || (item as any)._id, -1);
    }
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 0) {
      onAdd(item);
    } else if (onUpdateQuantity) {
      onUpdateQuantity(item.id || (item as any)._id, 1);
    }
  };

  return (
    <div 
      className={`group bg-white rounded-3xl p-3 border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex gap-3.5 items-center relative overflow-hidden cursor-pointer active:scale-[0.99] select-none ${
        hasUserAllergen 
          ? 'border-rose-200 bg-rose-50/30 opacity-80' 
          : isRecommended
            ? 'border-emerald-300/80 bg-gradient-to-r from-emerald-50/25 via-white to-white'
            : 'border-slate-100 hover:border-slate-200/80'
      }`}
      onClick={() => onClick && onClick(item)}
    >
      {/* Image Left */}
      <div className="w-[108px] h-[108px] rounded-2xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200/50 shadow-xs">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        
        {!item.available && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs">
              Hết món
            </span>
          </div>
        )}

        {isRecommended && item.available && (
          <div className="absolute top-2 left-2 bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-1 rounded-xl shadow-md shadow-emerald-600/30">
            <Award className="w-3.5 h-3.5" />
          </div>
        )}

        {(isFitScoreLoading || fitScore) && (
          <div className="absolute top-2 right-2 drop-shadow-md">
            <FitScoreBadge summary={fitScore} loading={isFitScoreLoading} />
          </div>
        )}
      </div>
      
      {/* Content Right */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5 self-stretch">
        <div className="space-y-1">
          <h3 className="font-heading font-extrabold text-slate-900 text-[15px] line-clamp-1 leading-snug group-hover:text-emerald-700 transition-colors">
            {item.name}
          </h3>
          
          {displayDescription && (
            <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">
              {displayDescription}
            </p>
          )}

          {/* Nutrition Badges (Full width, no overlap) */}
          <div className="pt-0.5">
            {hasUserAllergen ? (
              <div className="inline-flex items-center text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                <ShieldAlert className="w-3 h-3 mr-1 text-rose-600 shrink-0" />
                Chứa dị ứng của bạn
              </div>
            ) : item.nutrition ? (
              <NutritionBadge nutrition={item.nutrition} />
            ) : item.foodAttributes && item.foodAttributes.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {item.foodAttributes.slice(0, 2).map((attr, idx) => {
                  const rawLabel = FOOD_ATTRIBUTE_LABELS[attr as FoodAttribute] || attr;
                  const label = rawLabel.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, '').trim();
                  const colorClass = FOOD_ATTRIBUTE_COLORS[attr as FoodAttribute] || 'bg-slate-100 text-slate-700 border-slate-200';
                  return (
                    <span key={idx} className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${colorClass}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Row: Price on left, Stepper on right */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100/80">
          <span className="font-heading font-black text-emerald-600 text-[16px] tracking-tight">
            {formatCurrency(item.price)}
          </span>

          {!hasUserAllergen && item.available && (
            <div className="shrink-0">
              {quantity > 0 ? (
                <div className="flex items-center bg-slate-100/90 rounded-2xl p-0.5 border border-slate-200/80 shadow-inner">
                  <button 
                    onClick={handleMinus}
                    className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center shadow-2xs transition-transform active:scale-90 cursor-pointer"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-900 select-none">
                    {quantity}
                  </span>
                  <button 
                    onClick={handlePlus}
                    className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center shadow-2xs transition-transform active:scale-90 cursor-pointer"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handlePlus}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-90 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
                  aria-label="Thêm món"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MenuItemCard = React.memo(MenuItemCardComponent);
