import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FireIcon } from '../utils/iconMapping';
import soundManager from '../utils/soundManager';

export default function MenuItemModal({ item, isOpen, onClose, onAddToCart, cardRect }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const contentRef = useRef(null);
  const { language, t } = useLanguage();

  // Function to get nutrition level color based on EU standards
  const getNutritionColor = (type, value) => {
    // Remove 'g' or 'kcal' and convert to number
    const numValue = parseFloat(value);
    
    switch(type) {
      case 'calories':
        // Per 100g: Low <100, Medium 100-400, High >400
        if (numValue < 100) return 'bg-green-100 border-green-300 text-green-800';
        if (numValue <= 400) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        return 'bg-red-100 border-red-300 text-red-800';
      
      case 'fat':
        // Per 100g: Low <3g, Medium 3-17.5g, High >1.5g
        if (numValue < 3) return 'bg-green-100 border-green-300 text-green-800';
        if (numValue <= 17.5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        return 'bg-red-100 border-red-300 text-red-800';
      
      case 'protein':
        // Protein: High is good (green), but low is neutral (not bad for vegetables)
        // Per 100g: High >15g (green), Medium 5-15g (yellow), Low <5g (neutral gray)
        if (numValue >= 15) return 'bg-green-100 border-green-300 text-green-800';
        if (numValue >= 5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        return 'bg-gray-100 border-gray-300 text-gray-800';
      
      case 'carbs':
        // Per 100g: Low <10g, Medium 10-45g, High >45g
        if (numValue < 10) return 'bg-green-100 border-green-300 text-green-800';
        if (numValue <= 45) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        return 'bg-red-100 border-red-300 text-red-800';
      
      default:
        return 'bg-gray-50';
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Trigger animation after a brief delay
      setTimeout(() => setIsAnimating(true), 10);
      // Reset special instructions when modal opens
      setSpecialInstructions('');
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
    soundManager.playAddToCart();
    onAddToCart(item, specialInstructions);
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
        className={`fixed inset-4 md:inset-8 z-50 bg-white rounded-3xl shadow-2xl transition-opacity duration-300 ${
          isAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: window.innerWidth >= 1024 ? '30%' : undefined,
          right: window.innerWidth >= 1024 ? '30%' : undefined,
          top: window.innerWidth >= 1024 ? '5%' : undefined,
          bottom: window.innerWidth >= 1024 ? '5%' : undefined,
        }}
      >
        <div
          ref={contentRef}
          className="h-full overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              soundManager.playTap();
              handleClose();
            }}
            className={`absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-2xl text-gray-600">×</span>
          </button>

          {/* Hero Image */}
          <div className="relative w-full h-48 md:h-96 bg-gradient-to-br from-orange-50 to-orange-100">
            <img
              src={item.image}
              alt={language === 'zh' ? item.name : item.nameEn}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Modal Content */}
          <div>
            <div className="p-4 md:p-8">
            {/* Title */}
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div className="flex-1">
                <h2 className="text-lg md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
                  {language === 'zh' ? item.name : item.nameEn}
                </h2>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-gray-500 text-xs md:text-sm flex items-center gap-1">
                    {(item.orderCount || 0) > 3 && <FireIcon className="text-orange-500" />}
                    {item.orderCount || 0} {(item.orderCount || 0) === 1 ? t('order', '单') : t('orders', '单')}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {(item.description || item.descriptionEn) && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                  {t('Description', '描述')}
                </h3>
                <p className="text-xs md:text-base text-gray-600 leading-relaxed">
                  {language === 'zh' ? item.description : item.descriptionEn}
                </p>
              </div>
            )}

            {/* Ingredients */}
            {((language === 'zh' && item.ingredients) || (language === 'en' && item.ingredientsEn)) && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                  {t('Ingredients', '食材')}
                </h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {(language === 'zh' ? item.ingredients : item.ingredientsEn)?.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Info */}
            {item.nutrition && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                  {t('Nutritional Information', '营养信息')}
                  <span className="text-xs md:text-sm font-normal text-gray-500 ml-1">
                    ({t('per 100g', '每100克')})
                  </span>
                </h3>
                <div className="grid grid-cols-4 gap-1.5 md:gap-4">
                  <div className={`${getNutritionColor('calories', item.nutrition.calories)} p-1.5 md:p-3 rounded-lg md:rounded-xl text-center border-2 transition-colors`}>
                    <p className="text-sm md:text-2xl font-bold">{item.nutrition.calories}</p>
                    <p className="text-[9px] md:text-xs opacity-80">{t('Calories', '卡路里')}</p>
                  </div>
                  <div className={`${getNutritionColor('protein', item.nutrition.protein)} p-1.5 md:p-3 rounded-lg md:rounded-xl text-center border-2 transition-colors`}>
                    <p className="text-sm md:text-2xl font-bold">{item.nutrition.protein}</p>
                    <p className="text-[9px] md:text-xs opacity-80">{t('Protein', '蛋白质')}</p>
                  </div>
                  <div className={`${getNutritionColor('fat', item.nutrition.fat)} p-1.5 md:p-3 rounded-lg md:rounded-xl text-center border-2 transition-colors`}>
                    <p className="text-sm md:text-2xl font-bold">{item.nutrition.fat}</p>
                    <p className="text-[9px] md:text-xs opacity-80">{t('Fat', '脂肪')}</p>
                  </div>
                  <div className={`${getNutritionColor('carbs', item.nutrition.carbs)} p-1.5 md:p-3 rounded-lg md:rounded-xl text-center border-2 transition-colors`}>
                    <p className="text-sm md:text-2xl font-bold">{item.nutrition.carbs}</p>
                    <p className="text-[9px] md:text-xs opacity-80">{t('Carbs', '碳水')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Special Notes */}
            <div className="mb-4 md:mb-8">
              <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                {t('Special Instructions', '特殊要求')}
              </h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t('Add any special requests or dietary requirements...', '添加任何特殊要求或饮食需求...')}
                className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none text-xs md:text-base"
                rows="3"
              />
            </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
              >
                {t('Add to Order', '加入订单')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Made with Bob