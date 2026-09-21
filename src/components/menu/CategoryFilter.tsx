import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
    <div className="w-full bg-surface/90 backdrop-blur-xl sticky top-[118px] z-20 border-b border-slate-200/40 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 py-2.5">
          <button
            onClick={() => onSelect('ALL')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 border cursor-pointer ${
              selectedCategory === 'ALL' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20' 
                : 'bg-white/90 border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs'
            }`}
          >
            Tất cả
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 border cursor-pointer ${
                selectedCategory === category
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white/90 border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs'
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
