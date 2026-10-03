/**
 * Web Notification Utilities for La Roche Cafe
 * Handles Service Worker notifications (mobile Chrome/Android/PWA) and standard browser notifications.
 */

import { playOrderBellSound } from './audioAlerts';

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && ('Notification' in window || 'serviceWorker' in navigator);
};

export const getNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Send a welcome test alert
      await sendBrowserNotification('🔔 Order Alerts Enabled!', {
        body: 'You will receive real-time updates when your meal is preparing and ready for counter pickup.',
        tag: 'laroche-welcome',
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
};

export const sendBrowserNotification = async (title, options = {}) => {
  // Always trigger sound alert
  try {
    playOrderBellSound();
  } catch (e) {}

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions = {
    icon: '/logo2.png',
    badge: '/logo2.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options,
  };

  try {
    // 1. Prefer Service Worker Registration (Required on Android Chrome / Mobile)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    }

    // 2. Fallback to standard Desktop Notification constructor
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.warn('Failed to trigger native browser notification:', err);
    return false;
  }
};

export const notifyOrderPreparing = (order) => {
  const shortId = order?.orderNumber ? `#${order.orderNumber}` : (order?._id ? `#${order._id.slice(-4).toUpperCase()}` : '');
  return sendBrowserNotification('🍳 Order is Being Prepared!', {
    body: `Chefs at La Roche Cafe are now freshly preparing your order ${shortId}. It will be ready shortly!`,
    tag: `order-prep-${order?._id || Date.now()}`,
    icon: '/logo2.png',
  });
};

export const notifyOrderReady = (order) => {
  const shortId = order?.orderNumber ? `#${order.orderNumber}` : (order?._id ? `#${order._id.slice(-4).toUpperCase()}` : '');
  return sendBrowserNotification('🎉 Order Ready for Pickup!', {
    body: `Your delicious meal for Order ${shortId} is hot & fresh at the counter. Grab it now!`,
    tag: `order-ready-${order?._id || Date.now()}`,
    icon: '/logo2.png',
    requireInteraction: true,
  });
};
