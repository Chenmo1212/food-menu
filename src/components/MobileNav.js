import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GlobeIcon } from '../utils/iconMapping';
import soundManager from '../utils/soundManager';

export default function MobileNav({ isMenuOpen, setIsMenuOpen, activeView, onViewChange }) {
  const { language, toggleLanguage, t } = useLanguage();

  const menuItems = [
    { icon: '🏠', label: t('Home', '首页'), labelEn: 'Home', view: 'home' },
    { icon: '🍱', label: t('Menu', '菜单'), labelEn: 'Menu', view: 'menu' },
    { icon: '🕐', label: t('History', '历史'), labelEn: 'History', view: 'history' },
    { icon: '👜', label: t('Order', '订单'), labelEn: 'Order', view: 'order' },
    { icon: '🏆', label: t('Rank', '排行'), labelEn: 'Rank', view: 'rank' },
    { icon: '⚙️', label: t('Settings', '设置'), labelEn: 'Settings', view: 'settings' },
  ];

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Sidebar - Slides in from left */}
      <aside className={`
        lg:hidden fixed
        ${isMenuOpen ? 'left-0' : '-left-full'}
        top-0 h-full
        w-full sm:w-80
        bg-white p-6
        shadow-xl
        flex flex-col
        transition-all duration-300 ease-in-out
        z-50
      `}>
        {/* Close button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        {/* Logo/Title */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 font-bold text-2xl mb-4">
            C
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {t('Navigation', '导航')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('Navigate through the app', '浏览应用')}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                onViewChange(item.view);
                setIsMenuOpen(false);
              }}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                activeView === item.view
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-lg">{item.label}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          {/* Language Toggle Button */}
          <button
            onClick={() => {
              soundManager.playTap();
              toggleLanguage();
            }}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 group"
          >
            <GlobeIcon
              className={`text-2xl transition-transform group-hover:scale-110 ${
                language === 'zh' ? 'text-[#f26b25]' : ''
              }`}
            />
            <div className="flex-1 text-left">
              <p className="font-semibold text-lg">
                {language === 'zh' ? 'English' : '中文'}
              </p>
            </div>
          </button>
          
          <p className="text-xs text-gray-400 text-center">
            {t('Version 1.0.0', '版本 1.0.0')}
          </p>
        </div>
      </aside>
    </>
  );
}

// Made with Bob
