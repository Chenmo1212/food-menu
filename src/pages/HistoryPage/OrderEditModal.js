import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDishes, updateOrder, updateOrderItems } from '../../services/menuApi';
import { resolveImageUrl } from '../../utils/imageMapper';
import soundManager from '../../utils/soundManager';
import { ClipboardIcon,ClockIcon, TimesIcon, PizzaIcon, LockIcon } from '../../utils/iconMapping';

export default function OrderEditModal({ order, orderDetails, onClose, onSave }) {
  const { t, language } = useLanguage();
  
  // Form state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showAddDish, setShowAddDish] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [availableDishes, setAvailableDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const SECRET_CODE = process.env.REACT_APP_SECRET_CODE;

  // Get next Monday helper
  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  };

  // Format delivery display
  const formatDeliveryDisplay = () => {
    if (!deliveryDate || !deliveryTime) return t('Select delivery time', '选择送达时间');
    
    const date = new Date(deliveryDate + 'T' + deliveryTime);
    
    if (language === 'zh') {
      const daysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const dayName = daysZh[date.getDay()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${dayName}, ${hours}:${minutes}`;
    } else {
      const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysEn[date.getDay()];
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${dayName}, ${displayHours}:${displayMinutes} ${period}`;
    }
  };

  // Initialize form with order data
  useEffect(() => {
    if (order && orderDetails) {
      setDeliveryDate(order.delivery_date || '');
      
      // Convert delivery_time from "12:00-13:00" format to "12:00" format
      const timeStr = order.delivery_time || '';
      if (timeStr.includes('-')) {
        // Extract the start time from "12:00-13:00"
        setDeliveryTime(timeStr.split('-')[0]);
      } else {
        setDeliveryTime(timeStr);
      }
      
      setStatus(order.status || 'pending');
      setNotes(order.notes || '');
      
      // Initialize items from orderDetails
      const initialItems = orderDetails.items.map(item => ({
        dish_id: item._id,
        dish_name: item.dish_name,
        dish_image: item.dish_image,
        quantity: item.quantity,
        custom_notes: item.custom_notes || '',
        price: item.price
      }));
      setItems(initialItems);
    }
  }, [order, orderDetails]);

  // Load available dishes when add dish panel is opened
  useEffect(() => {
    if (showAddDish && availableDishes.length === 0) {
      loadDishes();
    }
  }, [showAddDish]);

  const loadDishes = async () => {
    try {
      setLoadingDishes(true);
      const response = await getDishes({ is_active: true, limit: 100 });
      if (response.success) {
        setAvailableDishes(response.data);
      }
    } catch (err) {
      console.error('Failed to load dishes:', err);
    } finally {
      setLoadingDishes(false);
    }
  };

  const handleAddDish = (dish) => {
    soundManager.playTap();
    
    // Check if dish already exists (using _id instead of dish_id)
    const existingIndex = items.findIndex(item => item.dish_id === dish._id);
    
    if (existingIndex >= 0) {
      // Increase quantity
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      // Add new dish (store _id as dish_id)
      setItems([...items, {
        dish_id: dish._id,  // Store MongoDB _id
        dish_name: dish.name,
        dish_image: dish.image_url,
        quantity: 1,
        custom_notes: '',
        price: dish.price
      }]);
    }
    
    setShowAddDish(false);
    setSearchTerm('');
  };

  const handleUpdateQuantity = (index, delta) => {
    soundManager.playTap();
    const newItems = [...items];
    newItems[index].quantity = Math.max(0, newItems[index].quantity + delta);
    if (newItems[index].quantity === 0) newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleUpdateNotes = (index, notes) => {
    const newItems = [...items];
    newItems[index].custom_notes = notes;
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate secret code
      if (secretCode.toLowerCase() !== SECRET_CODE.toLowerCase()) {
        setError(t('Invalid secret code', '密码错误'));
        setSaving(false);
        return;
      }

      // Validate
      if (!deliveryDate || !deliveryTime) {
        setError(t('Please fill in delivery date and time', '请填写配送日期和时间'));
        setSaving(false);
        return;
      }

      if (items.length === 0) {
        setError(t('Order must have at least one item', '订单至少需要一个商品'));
        setSaving(false);
        return;
      }

      // Update order basic info
      await updateOrder(order.order_number, {
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        status: status,
        notes: notes
      });

      console.log("====== items", items);

      // Update order items
      const itemsData = items.map(item => ({
        dish_id: item.dish_id,
        quantity: item.quantity,
        custom_notes: item.custom_notes
      }));

      await updateOrderItems(order.order_number, itemsData);

      soundManager.playAddToCart();
      onSave();
    } catch (err) {
      console.error('Failed to save order:', err);
      setError(err.message || t('Failed to save order', '保存订单失败'));
    } finally {
      setSaving(false);
    }
  };

  const filteredDishes = availableDishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.name_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: 'pending', label: t('Pending', '待处理') },
    { value: 'confirmed', label: t('Confirmed', '已确认') },
    { value: 'preparing', label: t('Preparing', '准备中') },
    { value: 'completed', label: t('Completed', '已完成') }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardIcon className="text-white" size="sm" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{t('Edit Order', '编辑订单')}</h3>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t('Order Number', '订单号')}: #{order?.order_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <PizzaIcon className="text-orange-500" size="sm" />
                <span>{t('Items', '商品')} ({items.length})</span>
              </h4>
              <button
                onClick={() => {
                  soundManager.playTap();
                  setShowAddDish(true);
                }}
                className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                + {t('Add Dish', '添加菜品')}
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="bg-white pb-3 flex gap-3 items-center">
                  <img
                    src={resolveImageUrl(item.dish_image)}
                    alt={item.dish_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.dish_name}</p>
                    <input
                      type="text"
                      value={item.custom_notes}
                      onChange={(e) => handleUpdateNotes(index, e.target.value)}
                      placeholder={t('Add notes...', '添加备注...')}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-300 "
                    />
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 bg-gray-100 rounded-lg px-2 py-1">
                    <button
                      onClick={() => {
                        soundManager.playTap();
                        handleUpdateQuantity(index, -1);
                      }}
                      className="text-gray-500 hover:text-orange-500 w-6 h-6 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => {
                        soundManager.playTap();
                        handleUpdateQuantity(index, 1);
                      }}
                      className="text-gray-500 hover:text-orange-500 w-6 h-6 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Time Section */}
          <button
            onClick={() => {
              soundManager.playTap();
              setShowDeliveryPicker(true);
            }}
            className="w-full p-3 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <ClockIcon className="text-orange-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium">
                  {t('Delivery Time', '送达时间')}
                </p>
                <p className="text-sm font-bold text-gray-800">{formatDeliveryDisplay()}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Status */}
          <div className="rounded-xl">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t('Status', '状态')} *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              {t('Notes', '备注')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('Add order notes...', '添加订单备注...')}
              className="w-full px-4 py-3 border-2 rounded-xl resize-none bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-300"
            />
          </div>

          {/* Secret Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <LockIcon className="text-purple-500" size="sm" />
              <span>{t('Secret Code', '密码')} *</span>
            </label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder={t('Enter secret code to save', '输入密码以保存')}
              className="w-full px-4 py-3 border-2 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-300 "
            />
          </div>
        </div>

        {/* Delivery Time Picker Modal */}
        {showDeliveryPicker && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowDeliveryPicker(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ClockIcon className="text-orange-500" />
                    <span>{t('Select Delivery Time', '选择送达时间')}</span>
                  </h3>
                  <button
                    onClick={() => {
                      soundManager.playTap();
                      setShowDeliveryPicker(false);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <TimesIcon />
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">{t('Quick Select', '快速选择')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { labelEn: 'Today 7:30 PM', labelZh: '今天 19:30', offset: 0, time: '19:30' },
                      { labelEn: 'Tomorrow 7:30 PM', labelZh: '明天 19:30', offset: 1, time: '19:30' },
                      { labelEn: 'Next Monday 7:30 PM', labelZh: '下周一 19:30', offset: null, time: '19:30' },
                      { labelEn: 'Next Week', labelZh: '下周', offset: 7, time: '19:30' }
                    ].map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          soundManager.playTap();
                          if (option.offset !== null) {
                            const date = new Date();
                            date.setDate(date.getDate() + option.offset);
                            setDeliveryDate(date.toISOString().split('T')[0]);
                            setDeliveryTime(option.time);
                          } else {
                            setDeliveryDate(getNextMonday());
                            setDeliveryTime(option.time);
                          }
                        }}
                        className="px-4 py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 rounded-xl text-sm font-medium text-gray-700 transition-all hover:shadow-md"
                      >
                        {language === 'zh' ? option.labelZh : option.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">{t('Custom Time', '自定义时间')}</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">{t('Date', '日期')}</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">{t('Time', '时间')}</label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 bg-white text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playTap();
                    setShowDeliveryPicker(false);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  {t('Confirm', '确认')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t('Saving...', '保存中...')}</span>
              </>
            ) : (
              <span>{t('Save Changes', '保存更改')}</span>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('Cancel', '取消')}
          </button>
        </div>
      </div>

      {/* Add Dish Modal */}
      {showAddDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {t('Add Dish', '添加菜品')}
                </h3>
                <button
                  onClick={() => {
                    soundManager.playTap();
                    setShowAddDish(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Search dishes...', '搜索菜品...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingDishes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredDishes.map(dish => (
                    <button
                      key={dish._id}
                      onClick={() => handleAddDish(dish)}
                      className="bg-white border-2 border-gray-200 hover:border-orange-300 rounded-xl p-3 text-left transition-all hover:shadow-md"
                    >
                      <div className="aspect-square w-full mb-2 overflow-hidden rounded-lg">
                        <img
                          src={resolveImageUrl(dish.image_url)}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium text-gray-800 text-sm truncate">{dish.name}</p>
                      <p className="text-orange-600 font-bold text-sm">€{dish.price}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
