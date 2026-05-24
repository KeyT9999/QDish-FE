import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onSelect 
}) => {
  return (
    <div className="w-full bg-surface/95 backdrop-blur-md sticky top-[120px] z-20 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.02)] border-b border-gray-100/50 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 py-2.5">
          <button
            onClick={() => onSelect('ALL')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 border ${
              selectedCategory === 'ALL' 
                ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 border ${
                selectedCategory === category
                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};
