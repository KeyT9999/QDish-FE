import React from 'react';
import { Restaurant } from '@/types';
import { MapPin } from 'lucide-react';

interface RestaurantHeaderProps {
  restaurant: Restaurant | null;
  tableNumber: string | null;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ restaurant, tableNumber }) => {
  if (!restaurant) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] px-4 py-3 -mx-4 sm:mx-0 sm:rounded-b-3xl sticky top-0 z-30 transition-all select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Restaurant Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 border border-white/50 ring-1 ring-emerald-500/20">
            <span className="text-base font-heading font-extrabold text-white">
              {restaurant.name.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[15px] font-heading font-extrabold text-slate-900 leading-snug truncate tracking-tight">
                {restaurant.name}
              </h1>
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium mt-0.5">
              <MapPin className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-xs">{restaurant.address}</span>
            </div>
          </div>
        </div>
        
        {/* Right: Live Table Badge */}
        {tableNumber && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-black text-emerald-800 tracking-wider uppercase">
              Bàn {tableNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
