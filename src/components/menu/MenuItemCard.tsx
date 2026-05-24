import React from 'react';
import { MenuItem, Allergen, CartItem } from '@/types';
import { Minus, Plus, ShieldAlert, Award } from 'lucide-react';
import { NutritionBadge } from './NutritionBadge';
import { HealthLabelBadge } from '../shared/HealthLabelBadge';
import { formatCurrency } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  cartItem?: CartItem;
  onAdd: (item: MenuItem) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemove?: (id: string) => void;
  onClick?: (item: MenuItem) => void;
  userAllergies?: Allergen[];
  isRecommended?: boolean;
}

const MenuItemCardComponent: React.FC<MenuItemCardProps> = ({ 
  item, 
  cartItem,
  onAdd, 
  onUpdateQuantity,
  onRemove,
  onClick,
  userAllergies = [],
  isRecommended = false
}) => {
  const hasUserAllergen = item.allergens && item.allergens.some(a => userAllergies.includes(a as Allergen));
  const quantity = cartItem?.quantity || 0;

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
      className={`bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex h-[120px] transition-transform duration-200 active:scale-[0.98] cursor-pointer border ${
        hasUserAllergen 
          ? 'border-red-200 bg-red-50/50 opacity-75' 
          : isRecommended
            ? 'border-green-200 bg-green-50/10'
            : 'border-transparent'
      }`}
      onClick={() => onClick && onClick(item)}
    >
      {/* Image Left */}
      <div className="w-[120px] h-full bg-gray-100 relative shrink-0">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'} 
          alt={item.name} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
        
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-white text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              Hết
            </span>
          </div>
        )}

        {isRecommended && item.available && (
          <div className="absolute top-2 left-2 bg-green-600 text-white p-1 rounded-full shadow-sm">
            <Award className="w-3 h-3" />
          </div>
        )}
      </div>
      
      {/* Content Right */}
      <div className="p-3 flex flex-col flex-1 min-w-0 relative">
        <div className="pr-2">
          <h3 className="font-heading font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
            {item.name}
          </h3>
          <p className="font-bold text-green-700 text-sm mb-1.5">
            {formatCurrency(item.price)}
          </p>
        </div>

        <div className="mt-auto">
          {hasUserAllergen ? (
            <div className="flex items-center text-[10px] text-red-600 font-bold bg-red-50 w-max px-1.5 py-0.5 rounded">
              <ShieldAlert className="w-3 h-3 mr-1" />
              Chứa dị ứng
            </div>
          ) : item.nutrition ? (
            <NutritionBadge nutrition={item.nutrition} />
          ) : (
            <div className="flex gap-1">
              {item.healthLabels?.slice(0, 2).map((label, idx) => (
                <HealthLabelBadge key={idx} type={label} className="scale-90 origin-left" />
              ))}
            </div>
          )}
        </div>
        
        {/* Stepper / Add */}
        {!hasUserAllergen && item.available && (
          <div className="absolute bottom-2 right-2 flex items-center">
            {quantity > 0 ? (
              <div className="flex items-center bg-white border border-green-200 rounded-full shadow-sm h-8 overflow-hidden">
                <button 
                  onClick={handleMinus}
                  className="w-8 h-full flex items-center justify-center text-green-700 hover:bg-green-50 active:bg-green-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-green-800">
                  {quantity}
                </span>
                <button 
                  onClick={handlePlus}
                  className="w-8 h-full flex items-center justify-center bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handlePlus}
                className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md shadow-green-600/20 active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const MenuItemCard = React.memo(MenuItemCardComponent);
