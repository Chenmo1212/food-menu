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

  // Calculate initial position and size from card for opening animation
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
          isAnimating && !isClosing ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={`fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-3xl shadow-2xl transition-opacity duration-300 ${
          isAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          ref={contentRef}
          className="h-full overflow-y-auto"
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
          <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-orange-50 to-orange-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Modal Content */}
          <div>
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