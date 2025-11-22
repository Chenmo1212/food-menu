import React from 'react';

export default function CartItem({ item, onUpdateQty }) {
  return (
    <div className="flex gap-3 md:gap-4 items-center">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0">
        <img 
          src={item.image || 'https://via.placeholder.com/150'} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate">{item.name}</h4>
        {item.note && <p className="text-gray-400 text-xs truncate">{item.note}</p>}
        <p className="font-bold text-sm mt-1">
          ${(item.price * item.qty).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3 bg-gray-100 rounded-lg px-2 py-1">
        <button 
          onClick={() => onUpdateQty(item.id, -1)} 
          className="text-gray-500 hover:text-orange-500 w-6 h-6 flex items-center justify-center"
        >
          -
        </button>
        <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
        <button 
          onClick={() => onUpdateQty(item.id, 1)} 
          className="text-gray-500 hover:text-orange-500 w-6 h-6 flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Made with Bob
