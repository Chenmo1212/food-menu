import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon, WarningIcon, SearchIcon } from '../utils/iconMapping';
import MenuItem from '../components/MenuItem';
import CustomDishModal from '../components/CustomDishModal';
import { CATEGORIES } from '../data/menuData';
import { AllIcon, PorkIcon, ChickenIcon, SeafoodIcon, VegetablesIcon } from '../assets/icons';
import soundManager from '../utils/soundManager';

// Icon mapping for categories
const iconComponents = {
  all: AllIcon,
  pork: PorkIcon,
  chicken: ChickenIcon,
  seafood: SeafoodIcon,
  vegetables: VegetablesIcon,
};

export default function MenuPage({
  menuItems,
  loading,
  error,
  onAddToCart,
  onItemClick
}) {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomDishModal, setShowCustomDishModal] = useState(false);

  // Filter items based on search query and active category
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.descriptionEn && item.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.ingredientsEn && item.ingredientsEn.some(ingredient =>
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => b.orderCount - a.orderCount);

  return (
    <>
      {/* Category Filter */}
      <div className="flex gap-3 md:gap-4 mb-4 mt-2 overflow-x-auto pb-2 pl-4 pr-4 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const IconComponent = iconComponents[cat.iconName];
          return (
            <button
              key={cat.name}
              onClick={() => {
                soundManager.playTap();
                setActiveCategory(cat.name);
              }}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl flex items-center gap-2 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${
                activeCategory === cat.name
                ? 'bg-orange-500 text-white shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {IconComponent && (
                <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
              )}
              <span className="font-medium text-sm md:text-base">
                {language === 'zh' ? cat.nameZh : cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Title */}
      <div className="flex justify-between items-center mb-2 px-4 lg:px-4">
        <h2 className="text-lg md:text-xl font-bold">
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : error ? (
            <span className="text-red-500">Error loading dishes</span>
          ) : (
            <>
              {searchQuery ? t('Search Results', '搜索结果') : `${t('Choose', '选择')} ${activeCategory}`}
              <span className="text-gray-400 text-sm font-normal ml-2">
                ({filteredItems.length})
              </span>
            </>
          )}
        </h2>
        <button
          onClick={() => {
            soundManager.playTap();
            setShowCustomDishModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md text-sm font-medium"
        >
          <PlusIcon className="text-white" />
          <span>{t('Add', '添加')}</span>
        </button>
      </div>

      {/* Scrollable Menu Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-0 md:p-6 md:pt-6 lg:p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading dishes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <WarningIcon className="text-red-400 mb-4" size="4x" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Failed to load dishes</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <p className="text-sm text-gray-400">Using local menu data</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchIcon className="text-gray-400 mb-4" size="4x" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-500 max-w-md">
              Try adjusting your search terms or browse different categories to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-16 md:gap-x-6 md:gap-y-20 pb-16 mt-12 md:mt-16">
            {filteredItems.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Dish Modal */}
      <CustomDishModal
        isOpen={showCustomDishModal}
        onClose={() => setShowCustomDishModal(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}

// Made with Bob