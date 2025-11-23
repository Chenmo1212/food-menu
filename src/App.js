import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import MenuGrid from './components/MenuGrid';
import Cart from './components/Cart';
import MenuItemModal from './components/MenuItemModal';
import MobileNav from './components/MobileNav';
import { MENU_ITEMS } from './data/menuData';
import { sendMarkdownToWeChat } from './services/wechatNotification';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t } = useLanguage();
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Rice');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('menu');

  // Handle item click to open modal
  const handleItemClick = (item, rect) => {
    setSelectedItem(item);
    setCardRect(rect);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      setCardRect(null);
    }, 300);
  };

  // Add to cart logic
  const addToCart = (item, specialInstructions = '') => {
    const cartItemId = `${item.id}-${specialInstructions}`;
    const existing = cart.find((c) => c.cartItemId === cartItemId);
    if (existing) {
      setCart(cart.map((c) => (c.cartItemId === cartItemId ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1, specialInstructions, cartItemId }]);
    }
  };

  // Update quantity
  const updateQty = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  // Handle checkout
  const handleCheckout = async (total, deliveryInfo = '', markdown = '') => {
    console.log('Order Summary (Markdown):\n', markdown);
    
    // Send to WeChat via backend
    const result = await sendMarkdownToWeChat(markdown, deliveryInfo);
    
    if (result.success) {
      alert(`Order placed for my love!${deliveryInfo ? '\n' + deliveryInfo : ''}\n\n✅ Notification sent successfully!`);
    } else {
      alert(`Order placed for my love!${deliveryInfo ? '\n' + deliveryInfo : ''}\n\n⚠️ Failed to send notification: ${result.message}\n\nPlease check console for details.`);
    }
  };

  // Filter items based on search query and active category
  const filteredItems = MENU_ITEMS.filter(item => {
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
  });

  // Render different content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return (
          <>
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {/* Section Title */}
            <div className="flex justify-between items-center mb-2 px-4 lg:px-4">
              <h2 className="text-lg md:text-xl font-bold">
                {searchQuery ? t('Search Results', '搜索结果') : `${t('Choose', '选择')} ${activeCategory}`}
              </h2>
              <span className="text-gray-400 text-xs md:text-sm">
                {filteredItems.length} {t('items result', '个结果')}
              </span>
            </div>

            {/* Scrollable Menu Grid */}
            <div className="flex-1 overflow-y-auto p-4 pt-0 md:p-6 md:pt-6 lg:p-4">
              <MenuGrid
                items={filteredItems}
                activeCategory={activeCategory}
                onAddToCart={addToCart}
                onItemClick={handleItemClick}
              />
            </div>
          </>
        );
      
      case 'home':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🏠</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Welcome Home', '欢迎回家')}</h2>
              <p className="text-gray-500">{t('Home page coming soon', '主页即将推出')}</p>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🕐</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Order History', '订单历史')}</h2>
              <p className="text-gray-500">{t('Your order history will appear here', '您的订单历史将显示在这里')}</p>
            </div>
          </div>
        );
      
      case 'order':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">👜</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('My Orders', '我的订单')}</h2>
              <p className="text-gray-500">{t('Track your orders here', '在这里跟踪您的订单')}</p>
            </div>
          </div>
        );
      
      case 'alert':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🔔</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Notifications', '通知')}</h2>
              <p className="text-gray-500">{t('No new notifications', '暂无新通知')}</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">⚙️</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Settings', '设置')}</h2>
              <p className="text-gray-500">{t('Manage your preferences', '管理您的偏好设置')}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Left Sidebar Navigation - Hidden on mobile */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area - Responsive */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Always visible on all pages */}
        <div className="lg:relative lg:p-6 lg:pt-8 sticky top-0 z-20 bg-gray-100 p-4">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMenuClick={() => setIsMenuOpen(true)}
          />
        </div>

        {/* Page Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:px-6">
          {renderContent()}
        </div>
      </main>

      {/* Right Sidebar (Order Summary) - Responsive */}
      <Cart
        cart={cart}
        onUpdateQty={updateQty}
        onCheckout={handleCheckout}
      />

      {/* Menu Item Detail Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
          cardRect={cardRect}
        />
      )}

      {/* Mobile Navigation Menu */}
      <MobileNav
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

// Made with Bob
