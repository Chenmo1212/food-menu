import React, { useState } from 'react';
import CartItem from './CartItem';
import OrderSummaryModal from './OrderSummaryModal';
import { useLanguage } from '../contexts/LanguageContext';
import { CartIcon, ClockIcon, PenIcon, NoteIcon, TimesIcon } from '../utils/iconMapping';

export default function Cart({ cart, onUpdateQty, onCheckout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const { t } = useLanguage();
  
  // Generate order number based on current date and time
  const getOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };
  
  // Get next Monday
  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  };
  
  const [deliveryDate, setDeliveryDate] = useState(getNextMonday());
  const [deliveryTime, setDeliveryTime] = useState('19:30');
  
  // Format display text
  const formatDeliveryDisplay = () => {
    const date = new Date(deliveryDate + 'T' + deliveryTime);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${dayName}, ${displayHours}:${displayMinutes} ${period}`;
  };
  
  // Handle order submission
  const handleSubmitOrder = (markdown) => {
    const deliveryInfo = `${deliveryDate} at ${deliveryTime}`;
    onCheckout(0, deliveryInfo, markdown);
    setIsOpen(false);
  };
  
  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <>
      {/* Mobile Cart Button - Fixed at bottom */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
      >
        <CartIcon />
        <span className="font-bold">({cart.length})</span>
      </button>

      {/* Mobile Cart Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Sidebar - Responsive */}
      <aside className={`
        fixed lg:relative
        ${isOpen ? 'right-0' : '-right-full lg:right-0'}
        top-0 h-full
        w-full sm:w-96
        bg-white p-4 md:p-6
        shadow-xl rounded-l-3xl
        flex flex-col
        transition-all duration-300 ease-in-out
        z-50 lg:z-auto
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-bold text-xl">{t('Current Order', '当前订单')}</h2>
            <p className="text-gray-400 text-sm">#{getOrderNumber()}</p>
          </div>
        </div>

        {/* Toggle */}
        {/* <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold shadow-sm">
            Dine In
          </button>
          <button className="flex-1 py-2 rounded-lg text-gray-500 text-sm font-medium">
            Take Away
          </button>
        </div> */}

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 md:space-y-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-2">
              <CartIcon size="2x" />
              <span>{t('Cart is empty', '购物车是空的')}</span>
            </div>
          ) : (
            cart.map(item => (
              <CartItem
                key={item.cartItemId || item.id}
                item={item}
                onUpdateQty={onUpdateQty}
              />
            ))
          )}
        </div>

        {/* Delivery Time Section */}
        <div className="mt-4 mb-4">
          <button
            onClick={() => setShowDeliveryPicker(true)}
            className="w-full p-4 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group"
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
            <PenIcon className="text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        {/* Delivery Time Modal */}
        {showDeliveryPicker && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowDeliveryPicker(false)}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ClockIcon className="text-orange-500" />
                    <span>Select Delivery Time</span>
                  </h3>
                  <button
                    onClick={() => setShowDeliveryPicker(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <TimesIcon />
                  </button>
                </div>

                {/* Quick Select Buttons */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Quick Select</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Today 7:30 PM', offset: 0, time: '19:30' },
                      { label: 'Tomorrow 7:30 PM', offset: 1, time: '19:30' },
                      { label: 'Next Monday 7:30 PM', offset: null, time: '19:30' },
                      { label: 'Next Week', offset: 7, time: '19:30' }
                    ].map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (option.offset !== null) {
                            const date = new Date();
                            date.setDate(date.getDate() + option.offset);
                            setDeliveryDate(date.toISOString().split('T')[0]);
                            setDeliveryTime(option.time);
                          } else if (option.label === 'Next Monday 7:30 PM') {
                            setDeliveryDate(getNextMonday());
                            setDeliveryTime(option.time);
                          }
                        }}
                        className="px-4 py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 rounded-xl text-sm font-medium text-gray-700 transition-all hover:shadow-md"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date/Time Inputs */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">Custom Time</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Time</label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => setShowDeliveryPicker(false)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  Confirm
                </button>
              </div>
            </div>
          </>
        )}

        {/* Special Instructions Section */}
        {cart.some(item => item.specialInstructions) && (
          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <NoteIcon className="text-orange-500" />
              <span>Special Instructions</span>
            </h3>
            <div className="space-y-2">
              {cart.filter(item => item.specialInstructions).map((item, index) => (
                <div key={`${item.id}-${index}`} className="text-sm">
                  <p className="font-medium text-gray-700">{item.name}:</p>
                  <p className="text-gray-600 italic pl-2">{item.specialInstructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Totals */}
        <div className="mt-6 border-t pt-6 space-y-3">
          {/* <div className="flex justify-between text-gray-500 text-sm">
            <span>Items ({cart.length})</span>
            <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Tax (10%)</span>
            <span className="font-bold text-gray-800">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t border-dashed pt-4 mt-2">
            <span>Total</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div> */}

          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all mt-4"
            onClick={() => setShowOrderSummary(true)}
          >
            {t('Get Summary', '获取摘要')}
          </button>
        </div>
      </aside>

      {/* Order Summary Modal */}
      <OrderSummaryModal
        isOpen={showOrderSummary}
        onClose={() => setShowOrderSummary(false)}
        cart={cart}
        deliveryDate={deliveryDate}
        deliveryTime={deliveryTime}
        onSubmit={handleSubmitOrder}
      />
    </>
  );
}

// Made with Bob
