import React from 'react';
import { NutritionInfo } from '@/types';
import { Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

interface NutritionBadgeProps {
  nutrition: NutritionInfo;
  className?: string;
}

export const NutritionBadge: React.FC<NutritionBadgeProps> = ({ nutrition, className = '' }) => {
  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      <div className="flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100/50">
        <Flame className="w-3 h-3 mr-0.5" />
        {nutrition.calories} kcal
      </div>
      <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
        <span><b className="text-gray-700">{nutrition.protein}g</b> P</span>
        <span className="w-0.5 h-2.5 bg-gray-200 rounded-full" />
        <span><b className="text-gray-700">{nutrition.carbs}g</b> C</span>
        <span className="w-0.5 h-2.5 bg-gray-200 rounded-full" />
        <span><b className="text-gray-700">{nutrition.fat}g</b> F</span>
      </div>
    </div>
  );
};
