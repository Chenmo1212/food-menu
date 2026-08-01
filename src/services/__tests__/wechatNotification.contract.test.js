/**
 * API Contract Tests — wechatNotification.js
 *
 * Purpose: verify that the notification backend API response structure matches
 * exactly the fields the frontend expects.
 * Frontend consumer: sendOrderToBackend() internally + callers.
 *
 * Backend response contract:
 *   success: { status: 200, data: { id: <string|number> } }
 *   failure: { status: <non-200>, error: <string> }
 */

import { sendOrderToBackend, sendMarkdownToWeChat } from '../wechatNotification';

// ─── Reset mocks after each test ─────────────────────────────────────────────
afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mockFetchSuccess(payload) {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => payload,
  });
}

function mockFetchNetworkError() {
  jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// sendOrderToBackend()
// ═══════════════════════════════════════════════════════════════════════════════
describe('sendOrderToBackend — API response contract', () => {
  test('returns success: true when backend responds with status 200', async () => {
    mockFetchSuccess({ status: 200, data: { id: 42 } });
    const result = await sendOrderToBackend('## Order\n- Braised Pork Belly x2', '2025-12-02 12:00');

    // wechatNotification.js: if (result.status === 200) { return { success: true, ... } }
    expect(result.success).toBe(true);
  });

  test('successful response includes a message field', async () => {
    mockFetchSuccess({ status: 200, data: { id: 42 } });
    const result = await sendOrderToBackend('## Order', '');

    expect(result).toHaveProperty('message');
    expect(typeof result.message).toBe('string');
  });

  test('successful response includes a data field', async () => {
    mockFetchSuccess({ status: 200, data: { id: 99 } });
    const result = await sendOrderToBackend('## Order', '');

    expect(result).toHaveProperty('data');
  });

  test('data.id must exist (printed as Message ID in the log)', async () => {
    mockFetchSuccess({ status: 200, data: { id: 'msg_abc' } });
    const result = await sendOrderToBackend('## Order', 'Delivery: 12:00');

    // wechatNotification.js: console.log('📋 Message ID:', result.data?.id)
    expect(result.data).toHaveProperty('id');
  });

  test('returns success: false when backend responds with a non-200 status', async () => {
    mockFetchSuccess({ status: 500, error: 'Internal Server Error' });
    const result = await sendOrderToBackend('## Order', '');

    // wechatNotification.js: throw new Error(result.error || 'Failed to send order')
    // → catch → return { success: false, message: error.message }
    expect(result.success).toBe(false);
    expect(result).toHaveProperty('message');
  });

  test('returns success: false with a message on network error', async () => {
    mockFetchNetworkError();
    const result = await sendOrderToBackend('## Order', '');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error');
  });

  test('request is sent as POST with Content-Type: application/json', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 200, data: { id: 1 } }),
    });

    await sendOrderToBackend('## Order', '2025-12-02');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [_url, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  test('request body contains the content field (primary field consumed by the server)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 200, data: { id: 1 } }),
    });

    const markdown = '## Order\n- Braised Pork Belly x2';
    const deliveryInfo = '2025-12-02 12:00';
    await sendOrderToBackend(markdown, deliveryInfo);

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    // wechatNotification.js builds: `🍕 New Order!\n\n📅 Delivery: ${deliveryInfo}\n\n${markdown}`
    expect(body.content).toContain(markdown);
    expect(body.content).toContain(deliveryInfo);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// sendMarkdownToWeChat() — alias function
// ═══════════════════════════════════════════════════════════════════════════════
describe('sendMarkdownToWeChat — alias contract', () => {
  test('behaves identically to sendOrderToBackend (success case)', async () => {
    mockFetchSuccess({ status: 200, data: { id: 5 } });
    const result = await sendMarkdownToWeChat('## Menu', '2025-12-02');

    expect(result.success).toBe(true);
    expect(result.data.id).toBe(5);
  });

  test('does not throw when deliveryInfo defaults to an empty string', async () => {
    mockFetchSuccess({ status: 200, data: { id: 6 } });
    // no second argument — uses the default value of ''
    const result = await sendMarkdownToWeChat('## Menu');

    expect(result.success).toBe(true);
  });
});
