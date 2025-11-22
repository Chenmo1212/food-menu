import React, { useState } from 'react';
import CartItem from './CartItem';

export default function Cart({ cart, onUpdateQty, onCheckout }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <>
      {/* Mobile Cart Button - Fixed at bottom */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
      >
        <span>🛒</span>
        <span className="font-bold">({cart.length})</span>
      </button>

      {/* Mobile Cart Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Sidebar - Responsive */}
      <aside className={`
        fixed lg:relative
        ${isOpen ? 'right-0' : '-right-full lg:right-0'}
        top-0 h-full
        w-full sm:w-96
        bg-white p-4 md:p-6
        shadow-xl rounded-l-3xl
        flex flex-col
        transition-all duration-300 ease-in-out
        z-50 lg:z-auto
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-bold text-xl">Current Order</h2>
            <p className="text-gray-400 text-sm">#907653</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold shadow-sm">
            Dine In
          </button>
          <button className="flex-1 py-2 rounded-lg text-gray-500 text-sm font-medium">
            Take Away
          </button>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 md:space-y-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Cart is empty 🛒</div>
          ) : (
            cart.map(item => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQty={onUpdateQty}
              />
            ))
          )}
        </div>

        {/* Special Instructions Section */}
        {cart.some(item => item.specialInstructions) && (
          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>📝</span>
              <span>Special Instructions</span>
            </h3>
            <div className="space-y-2">
              {cart.filter(item => item.specialInstructions).map((item, index) => (
                <div key={`${item.id}-${index}`} className="text-sm">
                  <p className="font-medium text-gray-700">{item.name}:</p>
                  <p className="text-gray-600 italic pl-2">{item.specialInstructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Totals */}
        <div className="mt-6 border-t pt-6 space-y-3">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Items ({cart.length})</span>
            <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Tax (10%)</span>
            <span className="font-bold text-gray-800">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t border-dashed pt-4 mt-2">
            <span>Total</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div>

          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all mt-4"
            onClick={() => {
              onCheckout(total);
              setIsOpen(false);
            }}
          >
            Print Bills
          </button>
        </div>
      </aside>
    </>
  );
}

// Made with Bob
