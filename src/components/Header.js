import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Header({ searchQuery, onSearchChange }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          {t('Welcome, Yuan Bao ❤️', '欢迎，元宝 ❤️')}
        </h1>
        <p className="text-gray-500 text-sm">
          {t('What would you like to eat today?', '今天想吃什么？')}
        </p>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-initial">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('Search category or menu...', '搜索分类或菜品...')}
            className="pl-10 pr-4 py-3 rounded-xl bg-white w-full md:w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-105 group"
          title={t('Switch to Chinese', '切换到英文')}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">
            {language === 'en' ? '🇨🇳' : '🇬🇧'}
          </span>
        </button>
      </div>
    </header>
  );
}

// Made with Bob
