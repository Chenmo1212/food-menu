import React, { useRef } from 'react';

export default function MenuItem({ item, onAddToCart, onItemClick }) {
  const cardRef = useRef(null);

  const handleClick = () => {
    if (cardRef.current && onItemClick) {
      const rect = cardRef.current.getBoundingClientRect();
      onItemClick(item, rect);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="bg-white p-4 pt-16 md:pt-24 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col items-center relative group hover:scale-105 md:min-h-[220px]"
    >
      {/* Image protruding above the card */}
      <div className="absolute -top-12 md:-top-14 left-1/2 transform -translate-x-1/2 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-bold text-base md:text-lg text-center mb-1 line-clamp-2 mt-2">
        {item.name}
      </h3>
      <p className="text-gray-400 text-xs mb-4">
        {(item.orderCount || 0) > 3 ? '🔥 ' : ''}{item.orderCount || 0} orders
      </p>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(item);
        }}
        className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-500 hover:text-white transition-colors w-full"
      >
        Add to Order
      </button>
    </div>
  );
}

// Made with Bob
