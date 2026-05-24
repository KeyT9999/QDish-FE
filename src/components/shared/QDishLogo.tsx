import React from 'react';

interface QDishLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const QDishLogo: React.FC<QDishLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconClass = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${iconClass} rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20 shrink-0`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-3/5 h-3/5"
        >
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      {size !== 'sm' && (
        <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
          Q<span className="text-green-600">Dish</span>
        </span>
      )}
    </div>
  );
};
