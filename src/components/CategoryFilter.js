import React from 'react';
import { CATEGORIES } from '../data/menuData';

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex gap-3 md:gap-4 mb-4 mt-2 overflow-x-auto pb-2 pl-4 scrollbar-hide">
      {CATEGORIES.map(cat => (
        <button 
          key={cat.name}
          onClick={() => onCategoryChange(cat.name)}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl flex items-center gap-2 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${
            activeCategory === cat.name 
            ? 'bg-orange-500 text-white shadow-orange-200' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg md:text-xl">{cat.icon}</span>
          <span className="font-medium text-sm md:text-base">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

// Made with Bob
