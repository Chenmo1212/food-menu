import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MENU_ITEMS } from '../data/menuData';

export default function Rank({ onItemClick }) {
  const { t, language } = useLanguage();

  // Sort items by orderCount (sales) in descending order and get top 10
  const topItems = [...MENU_ITEMS]
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 10);

  const top3 = topItems.slice(0, 3);
  const rest = topItems.slice(3);

  // Podium order: 2nd, 1st, 3rd (left to right)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = ['h-32', 'h-40', 'h-24'];
  const podiumRanks = [2, 1, 3];
  const medalEmojis = ['🥈', '🥇', '🥉'];
  const podiumColors = [
    'bg-gradient-to-br from-gray-300 to-gray-400',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'bg-gradient-to-br from-orange-300 to-orange-500'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {t('Best Sellers Ranking', '销量排行榜')}
          </h1>
          <p className="text-gray-500">
            {t('Top 10 most popular dishes', '最受欢迎的前10道菜')}
          </p>
        </div>

        {/* Podium for Top 3 */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">
            {t('Top 3 Champions', '前三名冠军')} 🏆
          </h2>
          
          <div className="flex items-end justify-center gap-4 md:gap-8 mb-4">
            {podiumOrder.map((item, index) => {
              if (!item) return null;
              const rank = podiumRanks[index];
              const height = podiumHeights[index];
              const color = podiumColors[index];
              const medal = medalEmojis[index];

              return (
                <div key={item.id} className="flex flex-col items-center" style={{ width: '140px' }}>
                  {/* Dish Image */}
                  <div
                    className="relative mb-3 cursor-pointer transform hover:scale-105 transition-transform"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onItemClick(item, rect);
                    }}
                  >
                    <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 ${
                      rank === 1 ? 'border-yellow-400 shadow-xl shadow-yellow-200' :
                      rank === 2 ? 'border-gray-400 shadow-lg shadow-gray-200' :
                      'border-orange-400 shadow-lg shadow-orange-200'
                    }`}>
                      <img
                        src={item.image}
                        alt={language === 'zh' ? item.name : item.nameEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Medal Badge */}
                    <div className="absolute -top-2 -right-2 text-4xl">
                      {medal}
                    </div>
                  </div>

                  {/* Dish Name */}
                  <h3 className="text-sm font-bold text-gray-800 text-center mb-1 line-clamp-2">
                    {language === 'zh' ? item.name : item.nameEn}
                  </h3>

                  {/* Sales Count */}
                  <p className="text-xs text-gray-500 mb-2">
                    {t('Sales', '销量')}: {item.orderCount}
                  </p>

                  {/* Podium */}
                  <div className={`w-full ${height} ${color} rounded-t-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-4xl font-bold">
                      {rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* List for Ranks 4-10 */}
        {rest.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              {t('Ranks 4-10', '第4-10名')}
            </h2>
            
            <div className="space-y-3">
              {rest.map((item, index) => {
                const rank = index + 4;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-4"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onItemClick(item, rect);
                    }}
                  >
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        {rank}
                      </span>
                    </div>

                    {/* Dish Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={item.image}
                        alt={language === 'zh' ? item.name : item.nameEn}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">
                        {language === 'zh' ? item.name : item.nameEn}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.category}
                      </p>
                    </div>

                    {/* Sales Count */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500">
                        {t('Sales', '销量')}
                      </p>
                      <p className="text-lg font-bold text-orange-500">
                        {item.orderCount}
                      </p>
                    </div>

                    {/* Price */}
                    {/* <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500">
                        {t('Price', '价格')}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        €{item.price}
                      </p>
                    </div> */}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob