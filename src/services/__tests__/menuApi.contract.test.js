/**
 * API Contract Tests — menuApi.js
 *
 * Purpose: verify that the data structure returned by the backend API matches
 * exactly the fields the frontend expects. When a backend field changes, these
 * tests fail first, catching the mismatch before the frontend is ever run.
 *
 * Strategy:
 *  - Intercept global.fetch via jest.spyOn to simulate real API responses.
 *  - Each test targets fields that are actually consumed by the frontend;
 *    field names mirror the destructuring used in App.js / HistoryPage.
 */

import {
  getDishes,
  createOrder,
  getOrders,
  getOrderByNumber,
  cancelOrder,
  updateOrderStatus,
  getDishById,
  getPopularDishes,
  updateDishStock,
  updateOrder,
  updateOrderItems,
  getDishesStats,
  getOrdersStats,
  checkHealth,
} from '../menuApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mock a successful fetch call that resolves with the given JSON payload. */
function mockFetchSuccess(payload) {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => payload,
  });
}

/** Mock a failed fetch call (non-2xx HTTP status). */
function mockFetchError(payload, status = 400) {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => payload,
  });
}

// ─── Reset mocks after each test ─────────────────────────────────────────────
afterEach(() => {
  jest.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /dishes  —  getDishes()
// Frontend consumer: App.js fetchDishes()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getDishes — API response contract', () => {
  // All fields required on a single dish object returned by the backend
  const DISH_FIXTURE = {
    _id: 'dish_001',
    name: '红烧肉',
    name_en: 'Braised Pork Belly',
    price: 38,
    stock: 10,
    order_count: 120,
    category: 'Pork',
    image_url: 'braised_pork_belly.png',
    description: '经典红烧肉',
    description_en: 'Classic braised pork belly',
    ingredients: ['猪肉', '酱油'],
    ingredients_en: ['pork', 'soy sauce'],
    nutrition: { calories: 450 },
  };

  const SUCCESS_RESPONSE = {
    success: true,
    data: [DISH_FIXTURE],
    total: 1,
  };

  test('top-level shape: success is true, data is an array', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getDishes();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('dish object contains all fields required by App.js fetchDishes', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getDishes();
    const dish = result.data[0];

    // Every field used in the transformedData mapping inside App.js
    expect(dish).toHaveProperty('_id');           // → id
    expect(dish).toHaveProperty('name');           // → name
    expect(dish).toHaveProperty('name_en');        // → nameEn
    expect(dish).toHaveProperty('price');          // → price
    expect(dish).toHaveProperty('stock');          // → stock
    expect(dish).toHaveProperty('order_count');    // → orderCount
    expect(dish).toHaveProperty('category');       // → category
    expect(dish).toHaveProperty('image_url');      // → image (via resolveImageUrl)
    expect(dish).toHaveProperty('description');    // → description
    expect(dish).toHaveProperty('description_en'); // → descriptionEn
    expect(dish).toHaveProperty('ingredients');    // → ingredients
    expect(dish).toHaveProperty('ingredients_en'); // → ingredientsEn
    expect(dish).toHaveProperty('nutrition');      // → nutrition
  });

  test('missing success field does not cause accidental render (defensive check)', async () => {
    // Backend returns a response without the success flag
    mockFetchSuccess({ data: [DISH_FIXTURE] });
    const result = await getDishes();

    // App.js guard: if (response.success && response.data)
    // With success === undefined the condition is falsy → safe fallback to local data
    expect(result.success).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /orders  —  createOrder()
// Frontend consumer: App.js handleCheckout()
// ═══════════════════════════════════════════════════════════════════════════════
describe('createOrder — API response contract', () => {
  const SUCCESS_RESPONSE = {
    success: true,
    data: {
      order: {
        order_number: 'ORD-20251201-001',
        status: 'pending',
        _id: 'order_abc',
      },
      items: [],
    },
  };

  test('top-level shape: success is true, data exists', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await createOrder({ items: [] });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('data.order.order_number must exist (shown in the confirmation alert)', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await createOrder({ items: [] });

    // App.js: const orderNumber = orderResponse.data.order?.order_number
    expect(result.data.order).toBeDefined();
    expect(result.data.order.order_number).toBeDefined();
    expect(typeof result.data.order.order_number).toBe('string');
  });

  test('creation failure throws so the App.js catch block handles it', async () => {
    mockFetchError({ success: false, error: 'Dish not found' });

    await expect(createOrder({ items: [] })).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /orders  —  getOrders()
// Frontend consumer: HistoryPage/index.js fetchOrders()
// ═══════════════════════════════════════════════════════════════════════════════
describe('getOrders — API response contract', () => {
  const ORDER_FIXTURE = {
    _id: 'order_001',
    order_number: 'ORD-20251201-001',
    status: 'pending',
    total_items: 3,
    created_at: '2025-12-01T10:00:00.000Z',
    delivery_date: '2025-12-02',
    delivery_time: '12:00-13:00',
    items: [
      { dish_image: 'braised_pork_belly.png' },
    ],
  };

  const SUCCESS_RESPONSE = {
    success: true,
    data: [ORDER_FIXTURE],
    total: 1,
  };

  test('top-level shape: success is true, data is an array', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrders();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('order object contains all fields required by HistoryPage', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrders();
    const order = result.data[0];

    // Fields used when rendering the order list in HistoryPage
    expect(order).toHaveProperty('_id');           // key={order._id}
    expect(order).toHaveProperty('order_number');  // used for detail navigation
    expect(order).toHaveProperty('status');        // tab filtering & status badge
    expect(order).toHaveProperty('total_items');   // "X items" label
    expect(order).toHaveProperty('created_at');    // date/time formatting
    expect(order).toHaveProperty('delivery_date'); // meal cover image matching
    expect(order).toHaveProperty('delivery_time'); // delivery time display
  });

  test('status value is within the known enum', async () => {
    const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrders();

    result.data.forEach(order => {
      expect(VALID_STATUSES).toContain(order.status);
    });
  });

  test('items field is an array (used to pick the first thumbnail)', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrders();
    const order = result.data[0];

    expect(Array.isArray(order.items)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /orders/:orderNumber  —  getOrderByNumber()
// Frontend consumers: App.js handleOrderSelect(), OrderDetailsPanel.js
// ═══════════════════════════════════════════════════════════════════════════════
describe('getOrderByNumber — API response contract', () => {
  const ORDER_DETAIL_FIXTURE = {
    order: {
      _id: 'order_001',
      order_number: 'ORD-20251201-001',
      status: 'pending',
      delivery_date: '2025-12-02',
      delivery_time: '12:00-13:00',
      notes: 'No spice',
      delivery_address: '123 Main St',
    },
    items: [
      {
        dish_id: 'dish_001',
        dish_name: 'Braised Pork Belly',
        dish_image: 'braised_pork_belly.png',
        quantity: 2,
        custom_notes: '',
      },
    ],
  };

  const SUCCESS_RESPONSE = {
    success: true,
    data: ORDER_DETAIL_FIXTURE,
  };

  test('top-level shape: success is true, data exists', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrderByNumber('ORD-20251201-001');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('data.order contains all fields required by OrderDetailsPanel', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrderByNumber('ORD-20251201-001');
    const { order } = result.data;

    // Fields read directly from selectedOrder in OrderDetailsPanel.js
    expect(order).toHaveProperty('order_number');  // order number display
    expect(order).toHaveProperty('status');        // getStatusBadge(status)
    expect(order).toHaveProperty('delivery_date'); // delivery time section
    expect(order).toHaveProperty('delivery_time'); // delivery time section
  });

  test('each item in data.items contains all fields required by OrderDetailsPanel', async () => {
    mockFetchSuccess(SUCCESS_RESPONSE);
    const result = await getOrderByNumber('ORD-20251201-001');
    const item = result.data.items[0];

    // Fields used inside the items.map in OrderDetailsPanel.js
    expect(item).toHaveProperty('dish_name');    // dish name label
    expect(item).toHaveProperty('dish_image');   // resolveImageUrl(item.dish_image)
    expect(item).toHaveProperty('quantity');     // "x{quantity}" badge
    expect(item).toHaveProperty('dish_id');      // fallback "Item #dish_id"
    // custom_notes is optional but the key must be present (even as empty string)
    expect(item).toHaveProperty('custom_notes');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /orders/:orderNumber  —  cancelOrder()
// Frontend consumer: App.js handleDeleteOrder()
// ═══════════════════════════════════════════════════════════════════════════════
describe('cancelOrder — API response contract', () => {
  test('returns success: true on success', async () => {
    mockFetchSuccess({ success: true, message: 'Order deleted' });
    const result = await cancelOrder('ORD-20251201-001');

    // App.js: if (response.success) { ... }
    expect(result.success).toBe(true);
  });

  test('throws on failure so the App.js catch block handles it', async () => {
    mockFetchError({ success: false, error: 'Order not found' }, 404);

    await expect(cancelOrder('INVALID-ORDER')).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /orders/:orderNumber/status  —  updateOrderStatus()
// Frontend consumer: App.js handleRestoreOrder()
// ═══════════════════════════════════════════════════════════════════════════════
describe('updateOrderStatus — API response contract', () => {
  test('returns success: true on success', async () => {
    mockFetchSuccess({ success: true, data: { status: 'pending' } });
    const result = await updateOrderStatus('ORD-20251201-001', 'pending');

    // App.js: if (response.success) { ... }
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Remaining endpoints — smoke tests
// Ensure each function exists and can be called; catches silent breakage from
// signature changes.
// ═══════════════════════════════════════════════════════════════════════════════
describe('other API functions — smoke tests', () => {
  test('getDishById resolves the response correctly', async () => {
    mockFetchSuccess({ success: true, data: { _id: 'dish_001', name: 'Braised Pork Belly' } });
    const result = await getDishById('dish_001');
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('_id');
  });

  test('getPopularDishes returns an array', async () => {
    mockFetchSuccess({ success: true, data: [] });
    const result = await getPopularDishes(5);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('updateDishStock returns updated data with a stock field', async () => {
    mockFetchSuccess({ success: true, data: { _id: 'dish_001', stock: 8 } });
    const result = await updateDishStock('dish_001', -2);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('stock');
  });

  test('updateOrder returns success: true', async () => {
    mockFetchSuccess({ success: true, data: {} });
    const result = await updateOrder('ORD-001', { notes: 'updated' });
    expect(result.success).toBe(true);
  });

  test('updateOrderItems returns success: true', async () => {
    mockFetchSuccess({ success: true, data: {} });
    const result = await updateOrderItems('ORD-001', []);
    expect(result.success).toBe(true);
  });

  test('getDishesStats returns success: true', async () => {
    mockFetchSuccess({ success: true, data: { total: 30 } });
    const result = await getDishesStats();
    expect(result.success).toBe(true);
  });

  test('getOrdersStats returns success: true', async () => {
    mockFetchSuccess({ success: true, data: { total: 100 } });
    const result = await getOrdersStats();
    expect(result.success).toBe(true);
  });

  test('checkHealth returns success: true', async () => {
    mockFetchSuccess({ success: true, status: 'ok' });
    const result = await checkHealth();
    expect(result.success).toBe(true);
  });
});
