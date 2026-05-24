import React from 'react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h4>
        <p className="text-green-600 font-semibold text-sm mt-0.5">
          {formatCurrency(item.price)}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-l-lg hover:bg-gray-200 text-gray-600"
            onClick={() => {
              if (item.quantity === 1) {
                onRemove(item.menuItemId);
              } else {
                onUpdateQuantity(item.menuItemId, -1);
              }
            }}
          >
            {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
          </Button>
          
          <span className="w-8 text-center text-sm font-semibold text-gray-900">
            {item.quantity}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-r-lg hover:bg-gray-200 text-gray-600"
            onClick={() => onUpdateQuantity(item.menuItemId, 1)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
