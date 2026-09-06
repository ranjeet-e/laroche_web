/**
 * Web Notification Utilities for La Roche Cafe
 */

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Send a welcome alert
      sendBrowserNotification('🔔 Order Alerts Enabled!', {
        body: 'You will receive real-time updates when your meal is preparing and ready for counter pickup.',
        tag: 'laroche-welcome',
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
};

export const sendBrowserNotification = (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const defaultOptions = {
      icon: '/logo2.png',
      badge: '/logo2.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, defaultOptions);
      }).catch(() => {
        new Notification(title, defaultOptions);
      });
    } else {
      new Notification(title, defaultOptions);
    }
    return true;
  } catch (err) {
    console.error('Failed to trigger browser notification:', err);
    return false;
  }
};

export const notifyOrderPreparing = (order) => {
  const shortId = order?._id ? order._id.slice(-6).toUpperCase() : '';
  return sendBrowserNotification('🍳 Order is Being Prepared!', {
    body: `Chefs at La Roche Cafe are now freshly preparing your order #${shortId}. It will be ready shortly!`,
    tag: `order-prep-${order?._id || Date.now()}`,
    icon: '/logo2.png',
  });
};

export const notifyOrderReady = (order) => {
  const shortId = order?._id ? order._id.slice(-6).toUpperCase() : '';
  return sendBrowserNotification('🎉 Order Ready for Pickup!', {
    body: `Your delicious meal for Order #${shortId} is hot & fresh at the counter. Grab it now!`,
    tag: `order-ready-${order?._id || Date.now()}`,
    icon: '/logo2.png',
    requireInteraction: true,
  });
};
