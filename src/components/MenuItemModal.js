import React, { useEffect, useState, useRef } from 'react';

export default function MenuItemModal({ item, isOpen, onClose, onAddToCart, cardRect }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Trigger animation after a brief delay
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setIsAnimating(false);
    // Scroll to top before closing animation for smooth transition
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleAddToCart = () => {
    onAddToCart(item);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  // Calculate initial position and size from card
  const initialStyle = cardRect ? {
    position: 'fixed',
    top: `${cardRect.top}px`,
    left: `${cardRect.left}px`,
    width: `${cardRect.width}px`,
    height: `${cardRect.height}px`,
    borderRadius: '24px',
  } : {};

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={`fixed z-50 bg-white transition-all duration-300 ease-out ${
          isAnimating
            ? 'inset-4 md:inset-8 lg:inset-16 rounded-3xl shadow-2xl'
            : 'rounded-3xl shadow-lg'
        }`}
        style={!isAnimating ? initialStyle : {}}
      >
        <div
          ref={contentRef}
          className={`h-full transition-opacity duration-200 ${
            isAnimating ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-2xl text-gray-600">×</span>
          </button>

          {/* Hero Image */}
          <div className={`relative w-full transition-all duration-300 ${
            isAnimating
              ? 'h-64 md:h-96 bg-gradient-to-br from-orange-50 to-orange-100'
              : 'h-0 bg-transparent'
          }`}>
            <div className={`w-full h-full ${isAnimating ? '' : 'hidden'}`}>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card Content - Visible when closing with protruding image */}
          <div className={`transition-opacity duration-200 relative ${
            isAnimating ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 p-4 pt-20 md:pt-24 pb-6 min-h-[200px] md:min-h-[220px]'
          }`}>
            {/* Protruding Image */}
            <div className={`absolute -top-12 md:-top-14 left-1/2 transform -translate-x-1/2 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg border-4 border-white ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className="font-bold text-base md:text-lg text-center mb-1 line-clamp-2 mt-2">
              {item.name}
            </h3>
            <p className="text-gray-400 text-xs mb-4 text-center">
              {item.stock} Pan Available
            </p>
            <button
              className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-medium text-sm w-full"
            >
              Add to Order
            </button>
          </div>

          {/* Modal Content - Only visible when fully expanded */}
          <div className={`transition-opacity duration-200 ${
            isAnimating ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
          }`}>
            <div className="p-6 md:p-8">
            {/* Title and Price */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {item.stock} Pan Available
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-500">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                Indulge in our delicious {item.name}, crafted with the finest ingredients and 
                prepared fresh to order. Perfect for any occasion, this {item.category.toLowerCase()} 
                is sure to satisfy your cravings and leave you wanting more.
              </p>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {['Fresh Dough', 'Tomato Sauce', 'Mozzarella', 'Basil', 'Olive Oil'].map((ingredient, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Nutritional Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Nutritional Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-800">320</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-800">15g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-800">12g</p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-800">35g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Special Instructions</h3>
              <textarea
                placeholder="Add any special requests or dietary requirements..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                rows="3"
              />
            </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Add to Order - ${item.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Made with Bob