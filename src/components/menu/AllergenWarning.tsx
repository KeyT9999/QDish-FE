import React from 'react';
import { Allergen } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface AllergenWarningProps {
  allergens: Allergen[];
  className?: string;
  compact?: boolean;
}

export const AllergenWarning: React.FC<AllergenWarningProps> = ({ 
  allergens, 
  className = '',
  compact = false
}) => {
  if (!allergens || allergens.length === 0) return null;

  const getAllergenName = (allergen: Allergen) => {
    switch (allergen) {
      case Allergen.GLUTEN: return 'Gluten';
      case Allergen.DAIRY: return 'Sữa (Dairy)';
      case Allergen.NUTS: return 'Các loại hạt (Nuts)';
      case Allergen.SHELLFISH: return 'Hải sản có vỏ';
      case Allergen.SOY: return 'Đậu nành';
      case Allergen.EGGS: return 'Trứng';
      case Allergen.FISH: return 'Cá';
      default: return allergen;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center text-xs text-orange-600 font-medium ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
        Chứa: {allergens.map(getAllergenName).join(', ')}
      </div>
    );
  }

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-orange-500 mr-2 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-orange-800 mb-1">Cảnh báo dị ứng</h4>
          <p className="text-sm text-orange-700">
            Món ăn này có chứa: <span className="font-semibold">{allergens.map(getAllergenName).join(', ')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
