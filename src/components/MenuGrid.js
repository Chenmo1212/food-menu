import React from 'react';
import MenuItem from './MenuItem';
import { SearchIcon } from '../utils/iconMapping';

export default function MenuGrid({ items, activeCategory, onAddToCart, onItemClick }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchIcon className="text-gray-400 mb-4" size="4x" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
        <p className="text-gray-500 max-w-md">
          Try adjusting your search terms or browse different categories to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Product Grid - Responsive with top margin for protruding images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-16 md:gap-x-6 md:gap-y-20 pb-16 mt-12 md:mt-16">
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
