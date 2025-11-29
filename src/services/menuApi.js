// Menu API Service
// Backend API for Food Menu System

const API_BASE_URL = process.env.REACT_APP_MENU_API_BASE_URL || 'https://api.chenmo1212.cn/menu';

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ API request failed [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// Dish API Functions
// ============================================

/**
 * Get all dishes with optional filters
 * @param {object} params - Query parameters
 * @param {string} params.category - Filter by category (Pork, Chicken, Seafood, Vegetables)
 * @param {boolean} params.is_active - Filter by active status
 * @param {string} params.sort_by - Sort field (order_count, price, created_at)
 * @param {string} params.order - Sort direction (asc, desc)
 * @param {number} params.limit - Maximum results
 * @param {number} params.skip - Skip results for pagination
 * @returns {Promise<object>} Dishes list with metadata
 */
export async function getDishes(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/dishes${queryString ? `?${queryString}` : ''}`;
  return apiRequest(endpoint);
}

/**
 * Get a specific dish by ID
 * @param {number} dishId - Dish ID
 * @returns {Promise<object>} Dish details
 */
export async function getDishById(dishId) {
  return apiRequest(`/dishes/${dishId}`);
}

/**
 * Get popular dishes
 * @param {number} limit - Maximum results (default: 10)
 * @returns {Promise<object>} Popular dishes list
 */
export async function getPopularDishes(limit = 10) {
  return apiRequest(`/dishes/popular?limit=${limit}`);
}

/**
 * Search dishes by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<object>} Matching dishes
 */
export async function searchDishes(keyword) {
  return apiRequest(`/dishes/search?q=${encodeURIComponent(keyword)}`);
}

/**
 * Update dish stock
 * @param {number} dishId - Dish ID
 * @param {number} quantity - Quantity to add/subtract (negative to decrease)
 * @returns {Promise<object>} Updated dish
 */
export async function updateDishStock(dishId, quantity) {
  return apiRequest(`/dishes/${dishId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

// ============================================
// Order API Functions
// ============================================

/**
 * Create a new order
 * @param {object} orderData - Order data
 * @param {string} orderData.customer_name - Customer name
 * @param {string} orderData.customer_email - Customer email
 * @param {string} orderData.customer_phone - Customer phone
 * @param {string} orderData.delivery_date - Delivery date (YYYY-MM-DD)
 * @param {string} orderData.delivery_time - Delivery time slot
 * @param {string} orderData.delivery_address - Delivery address
 * @param {string} orderData.notes - Order notes
 * @param {Array} orderData.items - Order items [{dish_id, quantity, is_custom, custom_notes}]
 * @returns {Promise<object>} Created order with details
 */
export async function createOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

/**
 * Get all orders with optional filters
 * @param {object} params - Query parameters
 * @param {string} params.customer_email - Filter by customer email
 * @param {string} params.status - Filter by order status
 * @param {string} params.delivery_date - Filter by delivery date
 * @param {number} params.limit - Maximum results
 * @param {number} params.skip - Skip results for pagination
 * @returns {Promise<object>} Orders list with metadata
 */
export async function getOrders(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
  return apiRequest(endpoint);
}

/**
 * Get a specific order by order number
 * @param {string} orderNumber - Order number
 * @returns {Promise<object>} Order details with items
 */
export async function getOrderByNumber(orderNumber) {
  return apiRequest(`/orders/${orderNumber}`);
}

/**
 * Update order status
 * @param {string} orderNumber - Order number
 * @param {string} status - New status (pending, confirmed, preparing, delivering, completed, cancelled)
 * @returns {Promise<object>} Updated order
 */
export async function updateOrderStatus(orderNumber, status) {
  return apiRequest(`/orders/${orderNumber}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Cancel an order
 * @param {string} orderNumber - Order number
 * @returns {Promise<object>} Cancellation result
 */
export async function cancelOrder(orderNumber) {
  return apiRequest(`/orders/${orderNumber}`, {
    method: 'DELETE',
  });
}

// ============================================
// Statistics API Functions
// ============================================

/**
 * Get dishes statistics
 * @returns {Promise<object>} Dish statistics
 */
export async function getDishesStats() {
  return apiRequest('/stats/dishes');
}

/**
 * Get orders statistics
 * @returns {Promise<object>} Order statistics
 */
export async function getOrdersStats() {
  return apiRequest('/stats/orders');
}

// ============================================
// Health Check
// ============================================

/**
 * Check API health status
 * @returns {Promise<object>} Health status
 */
export async function checkHealth() {
  return apiRequest('/health');
}

// Made with Bob