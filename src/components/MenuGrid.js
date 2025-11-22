import React from 'react';
import MenuItem from './MenuItem';

export default function MenuGrid({ items, activeCategory, onAddToCart }) {
  return (
    <div>
      {/* Product Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-16">
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
