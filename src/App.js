import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import MenuGrid from './components/MenuGrid';
import Cart from './components/Cart';
import MenuItemModal from './components/MenuItemModal';
import CustomDishModal from './components/CustomDishModal';
import MobileNav from './components/MobileNav';
import Rank from './components/Rank';
import { MENU_ITEMS } from './data/menuData';
import { getDishes, createOrder } from './services/menuApi';
import { sendMarkdownToWeChat } from './services/wechatNotification';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { HomeIcon, ClockIcon, OrderIcon, SettingsIcon, CheckIcon, WarningIcon, PlusIcon } from './utils/iconMapping';
import { useLocalStorage } from './hooks/useLocalStorage';

function AppContent() {
  const { t } = useLanguage();
  // Use localStorage for cart persistence
  const [cart, setCart] = useLocalStorage('foodMenuCart', []);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('menu');
  const [showCustomDishModal, setShowCustomDishModal] = useState(false);
  
  // API data states
  const [menuItems, setMenuItems] = useState(MENU_ITEMS); // Fallback to local data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dishes from API on component mount
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDishes({ limit: 100, sort_by: 'order_count', order: 'desc' });
        
        if (response.success && response.data) {
          // Transform API data to match local data structure
          const transformedData = response.data.map(dish => ({
            id: dish.dish_id,
            name: dish.name,
            nameEn: dish.name_en,
            price: dish.price,
            stock: dish.stock,
            orderCount: dish.order_count,
            category: dish.category,
            image: dish.image_url ? dish.image_url : require(`./assets/dishCovers/${dish.image_url || 'default.png'}`),
            description: dish.description || '',
            descriptionEn: dish.description_en || '',
            ingredients: dish.ingredients || [],
            ingredientsEn: dish.ingredients_en || [],
            nutrition: dish.nutrition || {}
          }));
          setMenuItems(transformedData);
          console.log('✅ Dishes loaded from API:', transformedData.length);
        }
      } catch (err) {
        console.error('❌ Failed to fetch dishes from API:', err);
        setError(err.message);
        // Keep using local MENU_ITEMS as fallback
        console.log('📦 Using local menu data as fallback');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

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
    
    try {
      // Prepare order data for API
      const orderData = {
        customer_name: 'Customer', // You can add a form to collect this
        customer_email: '',
        customer_phone: '',
        delivery_date: new Date().toISOString().split('T')[0], // Today's date
        delivery_time: '12:00-13:00', // Default time slot
        delivery_address: '',
        notes: '',
        markdown_content: markdown,
        items: cart.map(item => ({
          dish_id: item.id,
          quantity: item.qty,
          is_custom: item.id === 999, // Custom dish has id 999
          custom_notes: item.specialInstructions || ''
        }))
      };

      // Create order via API
      const orderResponse = await createOrder(orderData);
      
      if (orderResponse.success) {
        console.log('✅ Order created:', orderResponse.data);
        
        // Send to WeChat via backend
        const wechatResult = await sendMarkdownToWeChat(markdown, deliveryInfo);
        
        if (wechatResult.success) {
          alert(`Order placed for my love!${deliveryInfo ? '\n' + deliveryInfo : ''}\n\nOrder Number: ${orderResponse.data.order.order_number}\nNotification sent successfully!`);
        } else {
          alert(`Order placed for my love!${deliveryInfo ? '\n' + deliveryInfo : ''}\n\nOrder Number: ${orderResponse.data.order.order_number}\nFailed to send notification: ${wechatResult.message}`);
        }
        
        // Clear cart after successful order
        setCart([]);
      } else {
        throw new Error(orderResponse.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      alert(`Failed to place order: ${error.message}\n\nPlease try again or contact support.`);
    }
  };

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
  }).sort((a, b) => b.orderCount - a.orderCount); // Sort by sales (orderCount) in descending order

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
                onClick={() => setShowCustomDishModal(true)}
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
              ) : (
                <MenuGrid
                  items={filteredItems}
                  activeCategory={activeCategory}
                  onAddToCart={addToCart}
                  onItemClick={handleItemClick}
                />
              )}
            </div>
          </>
        );
      
      case 'home':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <HomeIcon className="text-6xl mb-4 text-gray-400" size="4x" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Welcome Home', '欢迎回家')}</h2>
              <p className="text-gray-500">{t('Home page coming soon', '主页即将推出')}</p>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <ClockIcon className="text-6xl mb-4 text-gray-400" size="4x" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Order History', '订单历史')}</h2>
              <p className="text-gray-500">{t('Your order history will appear here', '您的订单历史将显示在这里')}</p>
            </div>
          </div>
        );
      
      case 'order':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <OrderIcon className="text-6xl mb-4 text-gray-400" size="4x" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('My Orders', '我的订单')}</h2>
              <p className="text-gray-500">{t('Track your orders here', '在这里跟踪您的订单')}</p>
            </div>
          </div>
        );
      
      case 'rank':
        return <Rank onItemClick={handleItemClick} />;
      
      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <SettingsIcon className="text-6xl mb-4 text-gray-400" size="4x" />
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

      {/* Right Sidebar (Order Summary) - Only show on Menu page */}
      {activeView === 'menu' && (
        <Cart
          cart={cart}
          onUpdateQty={updateQty}
          onCheckout={handleCheckout}
        />
      )}

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

      {/* Custom Dish Modal */}
      <CustomDishModal
        isOpen={showCustomDishModal}
        onClose={() => setShowCustomDishModal(false)}
        onAddToCart={addToCart}
      />

      {/* Mobile Navigation Menu */}
      {/* <MobileNav
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      /> */}
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
