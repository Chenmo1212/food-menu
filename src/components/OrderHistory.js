import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getOrders } from '../services/menuApi';
import { ClockIcon, WarningIcon, PizzaIcon } from '../utils/iconMapping';

export default function OrderHistory({ selectedOrder, onOrderSelect }) {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Close details when switching tabs
  useEffect(() => {
    if (selectedOrder && onOrderSelect) {
      onOrderSelect(null);
    }
  }, [activeTab]);

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
    <>
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
                  onClick={() => onOrderSelect && onOrderSelect(order)}
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
    </>
  );
}

// Made with Bob