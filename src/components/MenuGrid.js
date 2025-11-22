import React from 'react';
import MenuItem from './MenuItem';

export default function MenuGrid({ items, activeCategory, onAddToCart, onItemClick }) {
  return (
    <div>
      {/* Product Grid - Responsive with top margin for protruding images */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-16 md:gap-x-6 md:gap-y-20 pb-16 mt-12 md:mt-16">
        {items.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}

// Made with Bob
