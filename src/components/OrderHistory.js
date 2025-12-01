import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getOrders, getOrderByNumber, cancelOrder, updateOrderStatus } from '../services/menuApi';
import { resolveImageUrl } from '../utils/imageMapper';
import { ClockIcon, CheckIcon, WarningIcon, PizzaIcon, CalendarIcon, TimesIcon } from '../utils/iconMapping';

export default function OrderHistory() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState(false);
  const [restoringOrder, setRestoringOrder] = useState(false);
  const [activeTab, setActiveTab] = useState('on-process'); // 'on-process' or 'completed'
  const asideRef = useRef(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-switch to completed tab if on-process is empty
  useEffect(() => {
    if (!loading && orders.length > 0) {
      const onProcessOrders = orders.filter(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      );
      if (onProcessOrders.length === 0 && activeTab === 'on-process') {
        setActiveTab('completed');
      }
    }
  }, [orders, loading, activeTab]);

  // Close aside when switching tabs
  useEffect(() => {
    if (selectedOrder) {
      handleCloseDetails();
    }
  }, [activeTab]);

  // Handle click outside to close aside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (asideRef.current && !asideRef.current.contains(event.target)) {
        handleCloseDetails();
      }
    };

    if (selectedOrder) {
      // Add event listener when aside is open
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      // Cleanup event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders({ limit: 50 });
      
      if (response.success && response.data) {
        setOrders(response.data);
        console.log('✅ Orders loaded:', response.data.length);
      } else {
        throw new Error(response.error || 'Failed to load orders');
      }
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details when an order is selected
  const fetchOrderDetails = async (orderNumber) => {
    try {
      setLoadingDetails(true);
      const response = await getOrderByNumber(orderNumber);
      
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
      setLoadingDetails(false);
    }
  };

  // Handle order selection
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.order_number);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setSelectedOrderDetails(null);
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

      // Call cancel order API
      const response = await cancelOrder(orderNumber);

      if (response.success) {
        console.log('✅ Order deleted successfully');
        alert(t('Order deleted successfully', '订单删除成功'));
        
        // Close details panel
        handleCloseDetails();
        
        // Refresh orders list
        fetchOrders();
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

      // Call update order status API to change from cancelled to pending
      const response = await updateOrderStatus(orderNumber, 'pending');

      if (response.success) {
        console.log('✅ Order restored successfully');
        alert(t('Order restored successfully', '订单恢复成功'));
        
        // Close details panel
        handleCloseDetails();
        
        // Refresh orders list
        fetchOrders();
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

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: { en: 'Pending', zh: '待处理' }
      },
      confirmed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: { en: 'Confirmed', zh: '已确认' }
      },
      preparing: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        label: { en: 'Preparing', zh: '准备中' }
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: { en: 'Completed', zh: '已完成' }
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: { en: 'Cancelled', zh: '已取消' }
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {language === 'zh' ? config.label.zh : config.label.en}
      </span>
    );
  };

  // Format date for title
  const formatDateTitle = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders by tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'on-process') {
      return ['pending', 'confirmed', 'preparing'].includes(order.status);
    } else {
      return ['completed', 'cancelled'].includes(order.status);
    }
  });

  // Get first dish image from order items
  const getOrderImage = (order) => {
    if (order.items && order.items.length > 0 && order.items[0].dish_image) {
      return order.items[0].dish_image;
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('Loading orders...', '加载订单中...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <WarningIcon className="text-red-400 mb-4" size="4x" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('Failed to load orders', '加载订单失败')}</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            {t('Retry', '重试')}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content - Orders List */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        selectedOrder ? 'lg:mr-96' : ''
      }`}>
        {/* Header with Tabs */}
        <div className="flex items-center justify-between gap-4 p-4 lg:px-4 lg:py-4">
          {/* Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('on-process')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'on-process'
                  ? 'bg-[#fff0df] text-orange-600 shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t('On-Process', '进行中')}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#fff0df] text-orange-600 shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t('Completed', '已完成')}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <ClockIcon size="sm" />
            <span>{t('Refresh', '刷新')}</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-4 lg:py-4">
          {filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ClockIcon className="text-gray-400 mb-4" size="4x" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {t('No Orders', '暂无订单')}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'on-process'
                    ? t('No orders in process', '没有进行中的订单')
                    : t('No completed orders', '没有已完成的订单')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderImage = getOrderImage(order);
                return (
                  <div
                    key={order._id}
                    onClick={() => handleOrderClick(order)}
                    className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 overflow-hidden ${
                      selectedOrder?._id === order._id
                        ? 'border-orange-300 shadow-md'
                        : 'border-gray-100 hover:border-orange-200'
                    }`}
                  >
                    <div className="p-5 flex items-center gap-4">
                      {/* Left: Date and Status */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {formatDateTitle(order.delivery_date || order.created_at)}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          {getStatusBadge(order.status)}
                          <span className="text-sm text-gray-500">
                            {formatTime(order.created_at)}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <PizzaIcon size="sm" />
                            {order.total_items} {t('items', '项')}
                          </span>
                        </div>
                      </div>

                      {/* Right: Image if available */}
                      {orderImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={orderImage}
                            alt="Order"
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Order Details */}
      {selectedOrder && (
        <aside ref={asideRef} className="fixed right-0 top-0 h-full w-full lg:w-96 bg-white shadow-2xl flex flex-col z-40 animate-slide-in-right lg:rounded-l-3xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {t('Order Details', '订单详情')}
            </h3>
            <button
              onClick={handleCloseDetails}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TimesIcon />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Order Number and Status */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('Order Number', '订单号')}</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <p className="font-bold text-lg text-gray-800">#{selectedOrder.order_number}</p>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ClockIcon className="text-orange-500" size="sm" />
                <span>{t('Delivery Time', '配送时间')}</span>
              </h4>
              <p className="text-sm text-gray-700">
                {selectedOrder.delivery_date} {selectedOrder.delivery_time}
              </p>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <PizzaIcon className="text-orange-500" size="sm" />
                <span>{t('Items', '商品')}</span>
              </h4>
              {loadingDetails ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : selectedOrderDetails?.items && selectedOrderDetails.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3 items-center"
                    >
                      {/* Dish Image */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={resolveImageUrl(item.dish_image)}
                          alt={item.dish_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Dish Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {item.dish_name || `${t('Item', '商品')} #${item.dish_id}`}
                        </p>
                        {item.custom_notes && (
                          <p className="text-xs text-gray-500 italic mt-1 truncate">
                            "{item.custom_notes}"
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Badge */}
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm font-bold shrink-0">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {t('No item details available', '无商品详情')}
                </p>
              )}
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {t('Notes:', '备注：')}
                </p>
                <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Delivery Address */}
            {selectedOrder.delivery_address && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {t('Delivery Address:', '配送地址：')}
                </p>
                <p className="text-sm text-gray-700">{selectedOrder.delivery_address}</p>
              </div>
            )}

            {/* Total */}
            {/* <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">{t('Total Amount', '总金额')}</span>
                <span className="text-2xl font-bold">
                  ${selectedOrder.total_amount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div> */}
          </div>

          {/* Footer - Action Buttons */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
            {/* Show different buttons based on tab and order status */}
            {activeTab === 'completed' && selectedOrder.status === 'cancelled' ? (
              // For cancelled orders in Completed tab: only show Restore Order button
              <button
                onClick={() => handleRestoreOrder(selectedOrder.order_number)}
                disabled={restoringOrder}
                className={`w-full bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  restoringOrder ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {restoringOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('Restoring...', '恢复中...')}</span>
                  </>
                ) : (
                  <span>{t('Restore Order', '恢复订单')}</span>
                )}
              </button>
            ) : (
              // For all other cases: show Edit Order and Cancel Order buttons
              <>
                <button
                  onClick={() => {
                    // TODO: Implement edit functionality
                    console.log('Edit order:', selectedOrder.order_number);
                    alert(t('Edit functionality coming soon', '编辑功能即将推出'));
                  }}
                  className="w-full bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  {t('Edit Order', '编辑订单')}
                </button>
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.order_number)}
                  disabled={cancelingOrder}
                  className={`w-full bg-white hover:bg-red-50 text-red-600 py-3 rounded-xl font-semibold transition-colors border-2 border-red-200 hover:border-red-300 flex items-center justify-center gap-2 ${
                    cancelingOrder ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {cancelingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      <span>{t('Canceling...', '取消中...')}</span>
                    </>
                  ) : (
                    <span>{t('Cancel Order', '取消订单')}</span>
                  )}
                </button>
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

// Made with Bob