import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon, TimesIcon } from '../utils/iconMapping';
import customSvg from '../assets/svgs/custom.svg';
import soundManager from '../utils/soundManager';

export default function CustomDishModal({ isOpen, onClose, onAddToCart }) {
  const { t } = useLanguage();
  const [dishName, setDishName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!dishName.trim()) {
      alert(t('Please enter a dish name', '请输入菜品名称'));
      return;
    }

    // Create a custom dish item with the custom.svg as the image
    const customDish = {
      id: `custom-${Date.now()}`,
      name: dishName.trim(),
      nameEn: dishName.trim(),
      price: 0,
      category: 'Custom',
      isCustom: true, // Flag to identify custom dishes
      image: customSvg,
      orderCount: 0
    };

    soundManager.playAddToCart();
    onAddToCart(customDish, '');
    setDishName('');
    handleClose();
  };

  const handleClose = () => {
    soundManager.playTap();
    setDishName('');
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <PlusIcon className="text-white" size="lg" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {t('Add Custom Dish', '添加自定义菜品')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('Request a dish not in the menu', '请求菜单中没有的菜品')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <TimesIcon />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('Dish Name', '菜品名称')}
              </label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder={t('Enter the dish you want...', '输入您想要的菜品...')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                autoFocus
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">{t('Note:', '注意：')}</span>{' '}
                {t(
                  'This dish will be marked as a custom request in your order summary.',
                  '此菜品将在订单摘要中标记为自定义请求。'
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50 rounded-b-3xl">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <PlusIcon className="text-white" />
              <span>{t('Add to Cart', '加入购物车')}</span>
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold transition-colors border-2 border-gray-200"
            >
              {t('Cancel', '取消')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Made with Bob
