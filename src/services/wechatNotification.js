// Backend API Service for WeChat Notifications

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.chenmo1212.cn/message/';

/**
 * Send order notification via backend API
 * @param {string} markdown - Markdown formatted order summary
 * @param {string} deliveryInfo - Delivery date and time
 */
export async function sendOrderToBackend(markdown, deliveryInfo) {
  try {
    const messageData = {
      name: 'Food Order System',
      email: 'order@foodmenu.app',
      content: `🍕 New Order!\n\n📅 Delivery: ${deliveryInfo}\n\n${markdown}`,
      website: window.location.origin,
      agent: navigator.userAgent,
      create_time: new Date().toISOString(),
      is_show: true,
      is_delete: false
    };

    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    if (result.status === 200) {
      console.log('✅ Order sent to backend successfully!');
      console.log('📋 Message ID:', result.data?.id);
      return { success: true, message: 'Order sent successfully!', data: result.data };
    } else {
      throw new Error(result.error || 'Failed to send order');
    }
  } catch (error) {
    console.error('❌ Failed to send order to backend:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send markdown content to WeChat (alias for sendOrderToBackend)
 * @param {string} markdown - Full markdown content
 * @param {string} deliveryInfo - Delivery information
 */
export async function sendMarkdownToWeChat(markdown, deliveryInfo = '') {
  return sendOrderToBackend(markdown, deliveryInfo);
}

// Made with Bob