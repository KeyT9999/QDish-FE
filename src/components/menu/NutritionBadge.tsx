import React from 'react';
import { NutritionInfo } from '@/types';
import { Flame } from 'lucide-react';

interface NutritionBadgeProps {
  nutrition: NutritionInfo;
  className?: string;
}

export const NutritionBadge: React.FC<NutritionBadgeProps> = ({ nutrition, className = '' }) => {
  return (
    <div className={`flex items-center flex-wrap gap-1.5 ${className}`}>
      {/* Calories Pill */}
      {nutrition.calories > 0 && (
        <div className="inline-flex items-center text-[10px] font-extrabold text-amber-900 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 shadow-2xs shrink-0">
          <Flame className="w-3 h-3 mr-0.5 text-orange-500 fill-orange-500/30" />
          <span>{Math.round(nutrition.calories)} kcal</span>
        </div>
      )}

      {/* Macros Micro-chips */}
      <div className="inline-flex items-center gap-1 text-[9.5px] font-semibold">
        <span 
          title="Đạm (Protein)" 
          className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.5 rounded-md shadow-2xs"
        >
          <strong className="font-extrabold">{nutrition.protein.toFixed(1)}g</strong> P
        </span>
        <span 
          title="Tinh bột (Carbs)" 
          className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded-md shadow-2xs"
        >
          <strong className="font-extrabold">{nutrition.carbs.toFixed(1)}g</strong> C
        </span>
        <span 
          title="Chất béo (Fat)" 
          className="inline-flex items-center gap-0.5 bg-sky-50 text-sky-700 border border-sky-200/60 px-1.5 py-0.5 rounded-md shadow-2xs"
        >
          <strong className="font-extrabold">{nutrition.fat.toFixed(1)}g</strong> F
        </span>
      </div>
    </div>
  );
};
