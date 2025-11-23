import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchIcon, GlobeIcon, TimesIcon, HeartIcon } from '../utils/iconMapping';

export default function Header({ searchQuery, onSearchChange, onMenuClick }) {
  const { language, toggleLanguage, t } = useLanguage();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="relative">
      {/* Main Header Content */}
      <div className={`flex justify-between items-center transition-opacity duration-300 md:ml-4 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3">
          {/* Menu Icon Button - Only on mobile/tablet */}
          {/* <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-105"
            title={t('Menu', '菜单')}
          >
            <span className="text-xl">☰</span>
          </button> */}

          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              {t('Welcome, Yuan Bao', '欢迎，元宝')} <HeartIcon className="text-red-500" />
            </h1>
            <p className="text-gray-500 text-sm">
              {t('What would you like to eat today?', '今天想吃什么？')}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-105 group"
            title={t('Search', '搜索')}
          >
            <SearchIcon className="text-gray-600 group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-105 group"
            title={t('Switch to Chinese', '切换到英文')}
          >
            <GlobeIcon className="text-gray-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Search Overlay - Slides down from top and covers entire header */}
      {showSearch && (
        <div className="absolute top-0 left-0 right-0 bg-gray-100 z-50 animate-slideDownOverlay">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => setShowSearch(false)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-105 flex-shrink-0"
              title={t('Close', '关闭')}
            >
              <span className="text-xl">←</span>
            </button>
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('Search category or menu...', '搜索分类或菜品...')}
                className="pl-10 pr-10 py-3 rounded-xl bg-white w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                autoFocus
              />
              <SearchIcon className="absolute left-3 top-3.5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <TimesIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Made with Bob
