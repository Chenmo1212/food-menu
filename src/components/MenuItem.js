import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FireIcon } from '../utils/iconMapping';
import soundManager from '../utils/soundManager';

export default function MenuItem({ item, onAddToCart, onItemClick }) {
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const { language, t } = useLanguage();
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleClick = () => {
    soundManager.playTap();
    if (cardRef.current && onItemClick) {
      const rect = cardRef.current.getBoundingClientRect();
      onItemClick(item, rect);
    }
  };

  useEffect(() => {
    if (textRef.current) {
      const isTextOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsOverflowing(isTextOverflowing);
    }
  }, [item, language]);

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="bg-white p-4 pt-20 md:pt-24 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col items-center relative group hover:scale-105 md:min-h-[220px]"
    >
      {/* Image protruding above the card */}
      <div className="absolute -top-12 md:-top-14 left-1/2 transform -translate-x-1/2 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
        <img
          src={item.image}
          alt={language === 'zh' ? item.name : item.nameEn}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full overflow-hidden mb-1 mt-2 relative">
        <h3
          ref={textRef}
          className={`font-bold text-base md:text-lg text-center whitespace-nowrap ${
            isOverflowing ? 'group-hover:animate-scroll-text' : ''
          }`}
        >
          {language === 'zh' ? item.name : item.nameEn}
          {isOverflowing && (
            <span className="ml-8">
              {language === 'zh' ? item.name : item.nameEn}
            </span>
          )}
        </h3>
      </div>
      <p className="text-gray-400 text-xs mb-4 flex items-center justify-center gap-1">
        {(item.orderCount || 0) >= 3 && <FireIcon className="text-orange-500" />}
        {item.orderCount || 0} {(item.orderCount || 0) === 1 ? t('order', '单') : t('orders', '单')}
      </p>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          soundManager.playAddToCart();
          onAddToCart(item);
        }}
        className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-500 hover:text-white transition-colors w-full"
      >
        {t('Add to Order', '加入订单')}
      </button>
    </div>
  );
}

// Made with Bob
