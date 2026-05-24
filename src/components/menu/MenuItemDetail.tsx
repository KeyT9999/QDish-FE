import React from 'react';
import { MenuItem, Allergen } from '@/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { NutritionBadge } from './NutritionBadge';
import { AllergenWarning } from './AllergenWarning';

import { HealthLabelBadge } from '../shared/HealthLabelBadge';
import { ShoppingBag, ChevronLeft, ShieldAlert } from 'lucide-react';

interface MenuItemDetailProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  userAllergies?: Allergen[];
}

export const MenuItemDetail: React.FC<MenuItemDetailProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  onAdd,
  userAllergies = []
}) => {
  if (!item) return null;

  const hasUserAllergen = item.allergens && item.allergens.some(a => userAllergies.includes(a as Allergen));

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-3xl p-0 flex flex-col bg-surface border-none overflow-hidden">
        
        {/* Sticky Header Image */}
        <div className="relative w-full h-64 shrink-0 bg-gray-100">
          {/* Drag Handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-12 h-1.5 bg-white/50 backdrop-blur-md rounded-full shadow-sm" />
          </div>
          
          <img 
            src={item.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          <Button 
            variant="secondary" 
            size="icon"
            onClick={onClose}
            className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur hover:bg-white border-0 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-heading font-bold text-white leading-tight mb-1 drop-shadow-md">
              {item.name}
            </h2>
            <p className="text-xl font-bold text-green-300 drop-shadow-md">
              {formatCurrency(item.price)}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-5 pt-6 pb-24">
          <div className="space-y-8">
            
            {/* Description */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Mô tả</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description || 'Chưa có mô tả chi tiết cho món ăn này.'}
              </p>
            </section>

            {/* Health Labels */}
            {item.healthLabels && item.healthLabels.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Phù hợp chế độ ăn</h3>
                <div className="flex flex-wrap gap-2">
                  {item.healthLabels.map((label, idx) => (
                    <HealthLabelBadge key={idx} type={label} />
                  ))}
                </div>
              </section>
            )}

            {/* Nutrition Full Details */}
            {item.nutrition && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Giá trị dinh dưỡng</h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <NutritionBadge nutrition={item.nutrition} className="mb-4" />
                  
                  {/* Visual Macros Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                      <span>Tỉ lệ Macros</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden flex">
                      <div className="bg-purple-500 h-full" style={{ width: '30%' }} title="Protein" />
                      <div className="bg-amber-500 h-full" style={{ width: '45%' }} title="Carbs" />
                      <div className="bg-blue-500 h-full" style={{ width: '25%' }} title="Fat" />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1"/>Protein</div>
                      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"/>Carbs</div>
                      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"/>Fat</div>
                    </div>
                  </div>

                  {/* Visual micro-nutrition grids */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center bg-neutral-50/30 p-2 rounded-xl">
                    <div className="bg-white rounded-lg p-1.5 border border-neutral-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Chất xơ</div>
                      <div className="text-xs font-bold text-neutral-800">{item.nutrition.fiber ?? 0}g</div>
                    </div>
                    <div className="bg-white rounded-lg p-1.5 border border-neutral-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Đường</div>
                      <div className="text-xs font-bold text-neutral-800">{item.nutrition.sugar ?? 0}g</div>
                    </div>
                    <div className="bg-white rounded-lg p-1.5 border border-neutral-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Sodium</div>
                      <div className="text-xs font-bold text-neutral-800">{item.nutrition.sodium ?? 0}mg</div>
                    </div>
                  </div>

                  {item.nutrition.nutritionScore !== undefined && item.nutrition.nutritionScore > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-green-800">Điểm số dinh dưỡng (Nutrition Score)</span>
                      <span className="bg-green-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm">
                        {item.nutrition.nutritionScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <section>
                <AllergenWarning allergens={item.allergens} />
              </section>
            )}
            
          </div>
        </ScrollArea>

        {/* Sticky Bottom Action */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-10">
          {hasUserAllergen ? (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl flex items-center gap-2 border border-red-200 mb-2 font-medium text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              Món này chứa chất gây dị ứng của bạn! Không thể đặt món.
            </div>
          ) : null}

          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-green-600/20"
            disabled={!item.available || hasUserAllergen}
            onClick={() => {
              onAdd(item);
              onClose();
            }}
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
