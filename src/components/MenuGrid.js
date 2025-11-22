import React from 'react';
import MenuItem from './MenuItem';

export default function MenuGrid({ items, activeCategory, onAddToCart }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Section Title */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold">Choose {activeCategory}</h2>
        <span className="text-gray-400 text-xs md:text-sm">
          {items.length} items result
        </span>
      </div>

      {/* Product Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map(item => (
          <MenuItem 
            key={item.id} 
            item={item} 
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

// Made with Bob
