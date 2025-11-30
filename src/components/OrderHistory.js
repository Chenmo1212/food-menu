import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getOrders } from '../services/menuApi';
import { ClockIcon, CheckIcon, WarningIcon, PizzaIcon, CalendarIcon, TimesIcon } from '../utils/iconMapping';

export default function OrderHistory() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('on-process'); // 'on-process' or 'completed'

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
        selectedOrder ? 'mr-96' : ''
      }`}>
        {/* Header with Tabs */}
        <div className="flex items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('on-process')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'on-process'
                  ? 'bg-[#fff0df] text-orange-600 shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t('On-Process', '进行中')}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
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
        <div className="flex-1 overflow-y-auto px-1 py-6">
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
                    onClick={() => setSelectedOrder(order)}
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
        <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl flex flex-col z-40 animate-slide-in-right rounded-l-3xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {t('Order Details', '订单详情')}
            </h3>
            <button
              onClick={() => setSelectedOrder(null)}
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
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.dish_name || `${t('Item', '商品')} #${item.dish_id}`}
                        </p>
                        {item.custom_notes && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            "{item.custom_notes}"
                          </p>
                        )}
                      </div>
                      <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm font-bold">
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
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">{t('Total Amount', '总金额')}</span>
                <span className="text-2xl font-bold">
                  ${selectedOrder.total_amount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Action Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold transition-colors border-2 border-gray-200"
            >
              {t('Close', '关闭')}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

// Made with Bob