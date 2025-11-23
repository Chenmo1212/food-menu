import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import MenuGrid from './components/MenuGrid';
import Cart from './components/Cart';
import MenuItemModal from './components/MenuItemModal';
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

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Left Sidebar Navigation - Hidden on mobile */}
      <Sidebar />

      {/* Main Content Area - Responsive */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header Section - Fixed on mobile, normal on desktop */}
        <div className="lg:relative lg:p-6 lg:pt-8 sticky top-0 z-20 bg-gray-100 p-4">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          {/* <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          /> */}

          {/* Section Title - Also sticky */}
          <div className="flex justify-between items-center mt-4 md:mt-6">
            <h2 className="text-lg md:text-xl font-bold">
              {searchQuery ? t('Search Results', '搜索结果') : `${t('Choose', '选择')} ${activeCategory}`}
            </h2>
            <span className="text-gray-400 text-xs md:text-sm">
              {filteredItems.length} {t('items result', '个结果')}
            </span>
          </div>
        </div>

        {/* Scrollable Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 md:p-6 md:pt-6 lg:p-8 lg:pt-6">
          <MenuGrid
            items={filteredItems}
            activeCategory={activeCategory}
            onAddToCart={addToCart}
            onItemClick={handleItemClick}
          />
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
