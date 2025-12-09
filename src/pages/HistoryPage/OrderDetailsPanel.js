import React, { useState } from 'react';
import SidePanel from '../../components/SidePanel';
import { useLanguage } from '../../contexts/LanguageContext';
import { ClockIcon, PizzaIcon } from '../../utils/iconMapping';
import { resolveImageUrl, resolveMealCover } from '../../utils/imageMapper';

export default function OrderDetailsPanel({
  selectedOrder,
  selectedOrderDetails,
  loadingOrderDetails,
  cancelingOrder,
  restoringOrder,
  onClose,
  onEdit,
  onDelete,
  onRestore,
  getStatusBadge
}) {
  const { t } = useLanguage();
  const [showMealCoverModal, setShowMealCoverModal] = useState(false);

  // Get meal cover image for completed orders
  const mealCoverImage = selectedOrder?.status === 'completed' && selectedOrder?.delivery_date
    ? resolveMealCover(selectedOrder.delivery_date)
    : null;

  return (
    <>
      {/* Meal Cover Modal */}
      {showMealCoverModal && mealCoverImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMealCoverModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={mealCoverImage}
              alt="Meal Cover"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowMealCoverModal(false)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    <SidePanel
      isOpen={!!selectedOrder}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>{t('Order Details', '订单详情')}</span>
          {selectedOrder && getStatusBadge(selectedOrder.status)}
        </div>
      }
      description={selectedOrder ? `${t('Order Number', '订单号')}: #${selectedOrder.order_number}` : null}
      width="w-full lg:w-96"
      closeOnClickOutside={false}
      closeOnEscape={false}
      showBackdrop={true}
      footer={selectedOrder ? (
        <div className="p-6 space-y-3">
          {selectedOrder.status === 'cancelled' ? (
            <button
              onClick={() => onRestore(selectedOrder.order_number)}
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
          ) : selectedOrder.status === 'completed' ? (
            <button
              onClick={() => onEdit(selectedOrder?.order_number)}
              className="w-full bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              {t('Edit Order', '编辑订单')}
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(selectedOrder?.order_number)}
                className="w-full bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                {t('Edit Order', '编辑订单')}
              </button>
              <button
                onClick={() => onDelete(selectedOrder?.order_number)}
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
      ) : null}
    >
      {selectedOrder ? (
        <div className="p-6 space-y-4">
          {/* Meal Cover for Completed Orders */}
          {mealCoverImage && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                {t('Meal Cover', '餐品封面')}
              </h4>
              <div
                onClick={() => setShowMealCoverModal(true)}
                className="relative rounded-xl overflow-hidden cursor-pointer group"
              >
                <img
                  src={mealCoverImage}
                  alt="Meal Cover"
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t('Click to enlarge', '点击放大')}
              </p>
            </div>
          )}

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
            {loadingOrderDetails ? (
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
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={resolveImageUrl(item.dish_image)}
                        alt={item.dish_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
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
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center">
            <PizzaIcon className="text-gray-300 mb-4" size="4x" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t('No Order Selected', '未选择订单')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('Select an order from the list to view details', '从列表中选择一个订单以查看详情')}
            </p>
          </div>
        </div>
      )}
    </SidePanel>
    </>
  );
}

// Made with Bob