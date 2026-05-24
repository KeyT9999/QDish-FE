import React from 'react';
import { Restaurant } from '@/types';
import { MapPin, Phone, Info } from 'lucide-react';

interface RestaurantHeaderProps {
  restaurant: Restaurant | null;
  tableNumber: string | null;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ restaurant, tableNumber }) => {
  if (!restaurant) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] px-4 py-3 -mx-4 sm:mx-0 sm:rounded-b-2xl sticky top-0 z-30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200">
             <span className="text-lg font-heading font-bold text-green-700">
               {restaurant.name.charAt(0)}
             </span>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-base font-heading font-bold text-gray-900 leading-tight">
              {restaurant.name}
            </h1>
            <div className="flex items-center text-[11px] text-gray-500 mt-0.5">
              <MapPin className="w-3 h-3 mr-1 shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-xs">{restaurant.address}</span>
            </div>
          </div>
        </div>
        
        {tableNumber && (
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100/50 shadow-sm shrink-0 flex flex-col items-center leading-none justify-center h-9 min-w-[3.5rem]">
            <span className="text-[9px] uppercase tracking-wider text-green-600/80 mb-0.5">Bàn</span>
            <span>{tableNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
};
