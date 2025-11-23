import React, { useState, useEffect } from 'react';
import { ClipboardIcon, PizzaIcon, ClockIcon, LockIcon, WarningIcon, LightbulbIcon, HeartIcon } from '../utils/iconMapping';

export default function OrderSummaryModal({ 
  isOpen, 
  onClose, 
  cart, 
  deliveryDate, 
  deliveryTime, 
  onSubmit 
}) {
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
      markdown += `${index + 1}. **${item.name}** (x${item.qty})\n`;
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
      setCodeError('Incorrect code. Please try again.');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col pointer-events-auto transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardIcon className="text-white" size="lg" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Order Summary</h3>
                <p className="text-sm text-gray-500">Review your order before submitting</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Order Items Preview */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border-2 border-orange-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <PizzaIcon className="text-orange-500" />
                <span>Your Order</span>
              </h4>
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            "{item.specialInstructions}"
                          </p>
                        )}
                      </div>
                      <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm font-bold">
                        x{item.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-orange-200 flex justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-bold text-gray-800">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ClockIcon className="text-gray-600" />
                <span>Delivery Time</span>
              </h4>
              <p className="text-gray-700">
                {new Date(deliveryDate + 'T' + deliveryTime).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })} at {new Date(deliveryDate + 'T' + deliveryTime).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            {/* Secret Code Input */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
              <label className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <LockIcon className="text-purple-500" />
                <span>Secret Code</span>
              </label>
              <input
                type="password"
                value={secretCode}
                onChange={(e) => {
                  setSecretCode(e.target.value);
                  setCodeError('');
                }}
                placeholder="Enter the secret word..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
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
                <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <WarningIcon />
                    <span>{codeError}</span>
                  </p>
                </div>
              )}
              <p className="mt-3 text-xs text-purple-600 flex items-center gap-1">
                <LightbulbIcon />
                <span>The full spelling of our safe word.</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50 rounded-b-3xl">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Submit Order</span>
              <HeartIcon className="text-red-200" />
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold transition-colors border-2 border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Made with Bob