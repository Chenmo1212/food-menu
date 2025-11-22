import React from 'react';

export default function MenuItem({ item, onAddToCart }) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-lg transition-shadow flex flex-col items-center relative group">
      <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 shadow-md border-4 border-gray-50">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <h3 className="font-bold text-base md:text-lg text-center mb-1 line-clamp-2">
        {item.name}
      </h3>
      <p className="text-gray-400 text-xs mb-4">
        {item.stock} Pan Available
      </p>
      
      <button 
        onClick={() => onAddToCart(item)}
        className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-500 hover:text-white transition-colors w-full"
      >
        Add to Order
      </button>
    </div>
  );
}

// Made with Bob
