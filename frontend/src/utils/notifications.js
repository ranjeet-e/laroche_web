/**
 * Web Notification Utilities for La Roche Cafe
 * Handles Service Worker notifications (mobile Chrome/Android/PWA) and standard browser notifications.
 */

import { playOrderBellSound } from './audioAlerts';

export const isIOSDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
};

export const isStandalonePWA = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isNotificationSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return isIOSDevice() ? 'ios_unsupported' : 'unsupported';
  }
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') {
    return { success: false, permission: 'unsupported' };
  }

  // iOS Safari requires PWA installation for Web Push
  if (isIOSDevice() && !isStandalonePWA()) {
    return {
      success: false,
      permission: 'ios_requires_install',
      message: 'On iPhone, notifications require adding the app to your Home Screen first.',
    };
  }

  if (!isNotificationSupported()) {
    return {
      success: false,
      permission: 'unsupported',
      message: 'Your current browser does not support web notifications.',
    };
  }

  try {
    // Cross-browser compatibility for Promise-based and Callback-based requestPermission
    let permission;
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      permission = await new Promise((resolve) => {
        Notification.requestPermission(resolve);
      });
    }

    if (permission === 'granted') {
      try {
        playOrderBellSound();
      } catch (e) {}

      // Send a welcome alert
      await sendBrowserNotification('🔔 Order Alerts Active!', {
        body: 'You will receive real-time notifications when your meal is preparing and ready at the counter.',
        tag: 'laroche-welcome',
      });

      return { success: true, permission: 'granted' };
    }

    if (permission === 'denied') {
      return {
        success: false,
        permission: 'denied',
        message: 'Notifications are blocked in your browser settings. Please click the 🔒 icon in your browser address bar to enable notifications.',
      };
    }

    return { success: false, permission: permission || 'default' };
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return { success: false, permission: 'error', error: err.message };
  }
};

export const sendBrowserNotification = async (title, options = {}) => {
  // Always trigger acoustic audio alert
  try {
    playOrderBellSound();
  } catch (e) {}

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
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
