import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Header from './components/Header';
import MenuItemModal from './components/MenuItemModal';
import Cart from './pages/MenuPage/Cart';
import OrderDetailsPanel from './pages/HistoryPage/OrderDetailsPanel';
import OrderEditModal from './pages/HistoryPage/OrderEditModal';
import MenuPage from './pages/MenuPage';
import HistoryPage from './pages/HistoryPage';
import RankPage from './pages/RankPage';
import { MENU_ITEMS } from './data/menuData';
import { getDishes, createOrder, getOrderByNumber, cancelOrder, updateOrderStatus } from './services/menuApi';
import { resolveImageUrl } from './utils/imageMapper';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { HomeIcon, OrderIcon, SettingsIcon } from './utils/iconMapping';
import { useLocalStorage } from './hooks/useLocalStorage';

function AppContent() {
  const { t, language } = useLanguage();
  // Use localStorage for cart persistence
  const [cart, setCart] = useLocalStorage('foodMenuCart', []);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const [activeView, setActiveView] = useState('menu');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // API data states
  const [menuItems, setMenuItems] = useState(MENU_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Order history states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState(false);
  const [restoringOrder, setRestoringOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // Fetch dishes from API on component mount
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDishes({ limit: 100, sort_by: 'order_count', order: 'desc' });
        
        if (response.success && response.data) {
          const transformedData = response.data.map(dish => ({
            id: dish._id,
            name: dish.name,
            nameEn: dish.name_en,
            price: dish.price,
            stock: dish.stock,
            orderCount: dish.order_count,
            category: dish.category,
            image: resolveImageUrl(dish.image_url),
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
        // Don't set error state - silently fall back to local data
        // setError(err.message);
        console.log('📦 Using local menu data as fallback (MENU_ITEMS)');
        // Ensure local data is set (it's already in initial state, but being explicit)
        setMenuItems(MENU_ITEMS);
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
      const orderData = {
        customer_name: 'Customer',
        customer_email: '',
        customer_phone: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_time: '12:00-13:00',
        delivery_address: '',
        notes: '',
        markdown_content: markdown,
        items: cart.map(item => ({
          dish_id: item.id,
          quantity: item.qty,
          is_custom: item.id === 999,
          custom_notes: item.specialInstructions || ''
        }))
      };

      const orderResponse = await createOrder(orderData);
      
      if (orderResponse && orderResponse.success && orderResponse.data) {
        console.log('✅ Order created:', orderResponse.data);
        const orderNumber = orderResponse.data.order?.order_number || 'N/A';
        alert(`Order placed for my love!${deliveryInfo ? '\n' + deliveryInfo : ''}\n\nOrder Number: ${orderNumber}`);
        setCart([]);
        console.log('🛒 Cart cleared after successful order');
      } else {
        const errorMsg = orderResponse?.error || 'Failed to create order';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      console.log('🛒 Cart preserved due to checkout failure');
      alert(`Failed to place order: ${error.message}\n\nYour cart has been preserved. Please try again or contact support.`);
    }
  };

  // Handle order selection from history
  const handleOrderSelect = async (order) => {
    if (!order) {
      setSelectedOrder(null);
      setSelectedOrderDetails(null);
      return;
    }

    setSelectedOrder(order);
    
    try {
      setLoadingOrderDetails(true);
      const response = await getOrderByNumber(order.order_number);
      
      if (response.success && response.data) {
        setSelectedOrderDetails(response.data);
        console.log('✅ Order details loaded:', response.data);
      } else {
        throw new Error(response.error || 'Failed to load order details');
      }
    } catch (err) {
      console.error('❌ Failed to fetch order details:', err);
      setSelectedOrderDetails(null);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderNumber) => {
    try {
      const confirmed = window.confirm(
        t(
          'Are you sure you want to delete this order? This action cannot be undone.',
          '确定要删除此订单吗？此操作无法撤销。'
        )
      );

      if (!confirmed) return;

      setCancelingOrder(true);
      const response = await cancelOrder(orderNumber);

      if (response.success) {
        console.log('✅ Order deleted successfully');
        alert(t('Order deleted successfully', '订单删除成功'));
        setSelectedOrder(null);
        setSelectedOrderDetails(null);
        // Trigger history page refresh
        setHistoryRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(response.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      alert(t('Failed to delete order: ', '删除订单失败：') + error.message);
    } finally {
      setCancelingOrder(false);
    }
  };

  // Handle restore order
  const handleRestoreOrder = async (orderNumber) => {
    try {
      const confirmed = window.confirm(
        t(
          'Are you sure you want to restore this order? It will be set to pending status.',
          '确定要恢复此订单吗？订单将被设置为待处理状态。'
        )
      );

      if (!confirmed) return;

      setRestoringOrder(true);
      const response = await updateOrderStatus(orderNumber, 'pending');

      if (response.success) {
        console.log('✅ Order restored successfully');
        alert(t('Order restored successfully', '订单恢复成功'));
        setSelectedOrder(null);
        setSelectedOrderDetails(null);
        // Trigger history page refresh
        setHistoryRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(response.error || 'Failed to restore order');
      }
    } catch (error) {
      console.error('❌ Failed to restore order:', error);
      alert(t('Failed to restore order: ', '恢复订单失败：') + error.message);
    } finally {
      setRestoringOrder(false);
    }
  };

  // Handle edit order
  const handleEditOrder = async (orderNumber) => {
    try {
      // Load order details if not already loaded
      if (!selectedOrderDetails || selectedOrder?.order_number !== orderNumber) {
        const response = await getOrderByNumber(orderNumber);
        if (response.success && response.data) {
          setSelectedOrder(response.data.order);
          setSelectedOrderDetails(response.data);
        }
      }
      setEditingOrder(selectedOrder);
    } catch (error) {
      console.error('❌ Failed to load order for editing:', error);
      alert(t('Failed to load order details', '加载订单详情失败'));
    }
  };

  // Handle save edited order
  const handleSaveEditedOrder = async () => {
    // Close the edit modal
    setEditingOrder(null);
    
    // Clear the selected order to force refresh when user clicks on it again
    setSelectedOrder(null);
    setSelectedOrderDetails(null);
    
    // Trigger history page refresh
    setHistoryRefreshTrigger(prev => prev + 1);
    
    alert(t('Order updated successfully', '订单更新成功'));
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: { en: 'Pending', zh: '待处理' } },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: { en: 'Confirmed', zh: '已确认' } },
      preparing: { bg: 'bg-purple-100', text: 'text-purple-700', label: { en: 'Preparing', zh: '准备中' } },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: { en: 'Completed', zh: '已完成' } },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: { en: 'Cancelled', zh: '已取消' } }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {language === 'zh' ? config.label.zh : config.label.en}
      </span>
    );
  };

  // Render different content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return (
          <MenuPage
            menuItems={menuItems}
            loading={loading}
            error={error}
            onAddToCart={addToCart}
            onItemClick={handleItemClick}
            searchQuery={searchQuery}
          />
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
        return <HistoryPage onOrderSelect={handleOrderSelect} refreshTrigger={historyRefreshTrigger} />;
      
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
        return <RankPage onItemClick={handleItemClick} menuItems={menuItems} />;
      
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
      {/* Mobile Navigation */}
      <MobileNav
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Left Sidebar Navigation - Desktop only */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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

      {/* Right Sidebar - Cart (only on menu page) */}
      {activeView === 'menu' && (
        <Cart
          cart={cart}
          onUpdateQty={updateQty}
          onCheckout={handleCheckout}
        />
      )}

      {/* Right Sidebar - Order Details (only on history page) */}
      {activeView === 'history' && (
        <OrderDetailsPanel
          selectedOrder={selectedOrder}
          selectedOrderDetails={selectedOrderDetails}
          loadingOrderDetails={loadingOrderDetails}
          cancelingOrder={cancelingOrder}
          restoringOrder={restoringOrder}
          onClose={() => handleOrderSelect(null)}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onRestore={handleRestoreOrder}
          getStatusBadge={getStatusBadge}
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

      {/* Order Edit Modal */}
      {editingOrder && selectedOrderDetails && (
        <OrderEditModal
          order={editingOrder}
          orderDetails={selectedOrderDetails}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEditedOrder}
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
