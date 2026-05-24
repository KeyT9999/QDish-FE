import React from 'react';
import { HealthLabel as HealthLabelType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Leaf, Dumbbell, Droplet, Flame, WheatOff, CandyOff } from 'lucide-react';

interface HealthLabelBadgeProps {
  type: HealthLabelType;
  className?: string;
  showIcon?: boolean;
}

export const HealthLabelBadge: React.FC<HealthLabelBadgeProps> = ({ 
  type, 
  className = '',
  showIcon = true
}) => {
  const getConfig = () => {
    switch (type) {
      case HealthLabelType.VEGAN:
        return { 
          label: 'Vegan', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Leaf className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.VEGETARIAN:
        return { 
          label: 'Vegetarian', 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <Leaf className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.HIGH_PROTEIN:
        return { 
          label: 'High Protein', 
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <Dumbbell className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.LOW_CARB:
        return { 
          label: 'Low Carb', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Droplet className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.KETO:
        return { 
          label: 'Keto', 
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Flame className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.GLUTEN_FREE:
        return { 
          label: 'Gluten Free', 
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <WheatOff className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.LOW_FAT:
        return { 
          label: 'Low Fat', 
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          icon: <Droplet className="w-3 h-3 mr-1" />
        };
      case HealthLabelType.SUGAR_FREE:
        return { 
          label: 'Sugar Free', 
          color: 'bg-pink-100 text-pink-800 border-pink-200',
          icon: <CandyOff className="w-3 h-3 mr-1" />
        };
      default:
        return { 
          label: type, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null
        };
    }
  };

  const config = getConfig();

  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${config.color} ${className} flex items-center px-1.5 py-0 text-[10px] sm:text-xs leading-4 sm:leading-5`}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};
