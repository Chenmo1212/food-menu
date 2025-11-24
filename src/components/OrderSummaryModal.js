import React, { useState, useEffect } from 'react';
import { ClipboardIcon, PizzaIcon, ClockIcon, LockIcon, WarningIcon, LightbulbIcon, HeartIcon } from '../utils/iconMapping';
import { useLanguage } from '../contexts/LanguageContext';

export default function OrderSummaryModal({
  isOpen,
  onClose,
  cart,
  deliveryDate,
  deliveryTime,
  onSubmit
}) {
  const { t, language } = useLanguage();
  const [secretCode, setSecretCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const SECRET_CODE = process.env.REACT_APP_SECRET_CODE;

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger enter animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for exit animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  // Generate Markdown summary
  const generateMarkdownSummary = () => {
    const date = new Date(deliveryDate + 'T' + deliveryTime);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let markdown = `# Order Summary\n\n`;
    markdown += `**Date:** ${formattedDate}\n`;
    markdown += `**Time:** ${formattedTime}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Items\n\n`;
    
    cart.forEach((item, index) => {
      markdown += `${index + 1}. **${item.name}** (x${item.qty})`;
      if (item.isCustom) {
        markdown += ` 🌟 *[Custom Request - Not in Menu]*`;
      }
      markdown += `\n`;
      if (item.specialInstructions) {
        markdown += `   - *Special Instructions:* ${item.specialInstructions}\n`;
      }
      markdown += `\n`;
    });
    
    markdown += `---\n\n`;
    markdown += `**Total Items:** ${cart.length}\n`;
    markdown += `**Total Quantity:** ${cart.reduce((sum, item) => sum + item.qty, 0)}\n`;
    
    return markdown;
  };

  // Handle submission
  const handleSubmit = () => {
    if (secretCode.toLowerCase() !== SECRET_CODE.toLowerCase()) {
      setCodeError(t('Incorrect code. Please try again.', '密码错误，请重试。'));
      return;
    }
    
    const markdown = generateMarkdownSummary();
    onSubmit(markdown);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setSecretCode('');
    setCodeError('');
    setIsAnimating(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => onClose(), 300);
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
        <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col pointer-events-auto transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardIcon className="text-white" size="sm" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{t('Order Summary', '订单摘要')}</h3>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t('Review your order before submitting', '提交前请检查您的订单')}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <span className="text-xl sm:text-2xl">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-6">
            {/* Order Items Preview */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-orange-200 sm:border-2">
              <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                <PizzaIcon className="text-orange-500" size="sm" />
                <span>{t('Your Order', '您的订单')}</span>
              </h4>
              <div className="space-y-1.5 sm:space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className={`rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm ${
                    item.isCustom ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 sm:border-2' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-start gap-2 sm:gap-3">
                      {/* Show image for custom dishes */}
                      {item.isCustom && item.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base text-gray-800">
                            {language === 'zh' ? item.name : (item.nameEn || item.name)}
                          </p>
                          {item.isCustom && (
                            <span className="px-1.5 sm:px-2 py-0.5 bg-blue-500 text-white text-[10px] sm:text-xs rounded-full font-medium whitespace-nowrap">
                              {t('Custom', '自定义')}
                            </span>
                          )}
                        </div>
                        {item.isCustom && (
                          <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1">
                            ⚠️ {t('Not in menu - Custom request', '不在菜单中 - 自定义请求')}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[10px] sm:text-xs text-gray-500 italic mt-0.5 sm:mt-1 line-clamp-2">
                            "{item.specialInstructions}"
                          </p>
                        )}
                      </div>
                      <span className={`ml-2 sm:ml-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-bold flex-shrink-0 ${
                        item.isCustom ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        x{item.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-orange-200 flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">{t('Total Items:', '总项目数：')}</span>
                <span className="font-bold text-gray-800">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200">
              <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                <ClockIcon className="text-gray-600" size="sm" />
                <span>{t('Delivery Time', '配送时间')}</span>
              </h4>
              <p className="text-sm sm:text-base text-gray-700">
                {new Date(deliveryDate + 'T' + deliveryTime).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })} {new Date(deliveryDate + 'T' + deliveryTime).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            {/* Secret Code Input */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-purple-200 sm:border-2">
              <label className="block font-semibold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                <LockIcon className="text-purple-500" size="sm" />
                <span>{t('Secret Code', '密码')}</span>
              </label>
              <input
                type="password"
                value={secretCode}
                onChange={(e) => {
                  setSecretCode(e.target.value);
                  setCodeError('');
                }}
                placeholder={t('Enter the secret word...', '输入密码...')}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${
                  codeError 
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-300 bg-red-50' 
                    : 'border-purple-200 focus:ring-purple-300 focus:border-purple-300 bg-white'
                }`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              {codeError && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-100 border border-red-200 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-red-600 flex items-center gap-2">
                    <WarningIcon size="sm" />
                    <span>{codeError}</span>
                  </p>
                </div>
              )}
              <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-purple-600 flex items-center gap-1">
                <LightbulbIcon size="sm" />
                <span>{t('The full spelling of our safe word.', '我们安全词的完整拼写。')}</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-6 border-t border-gray-100 space-y-2 sm:space-y-3 bg-gray-50 rounded-b-2xl sm:rounded-b-3xl">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>{t('Submit Order', '提交订单')}</span>
              <HeartIcon className="text-red-200" size="sm" />
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors border-2 border-gray-200"
            >
              {t('Cancel', '取消')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Made with Bob