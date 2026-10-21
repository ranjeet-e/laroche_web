import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && !envUrl.startsWith('/')) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://laroche-web.onrender.com';
  }
  return undefined;
};

export const useSocket = ({ onNewOrder, onOrderReady, onOrderStatusUpdated, onStoreStatusChanged, orderId } = {}) => {
  const socketRef = useRef(null);
  const { user, isStudent, isKitchen } = useAuth();

  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  const onOrderReadyRef = useRef(onOrderReady);
  onOrderReadyRef.current = onOrderReady;

  const onOrderStatusUpdatedRef = useRef(onOrderStatusUpdated);
  onOrderStatusUpdatedRef.current = onOrderStatusUpdated;

  const onStoreStatusChangedRef = useRef(onStoreStatusChanged);
  onStoreStatusChangedRef.current = onStoreStatusChanged;

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const studentId = user?.id || user?._id;
      // Join kitchen room if kitchen, admin, cms, or if component handles new orders
      if (isKitchen || user?.role === 'admin' || user?.role === 'cms' || Boolean(onNewOrderRef.current)) {
        socket.emit('join_kitchen');
      }
      if (isStudent && studentId) {
        socket.emit('join_student', studentId);
      }
      if (orderId) {
        socket.emit('join_order', orderId);
      }
    });

    socket.on('new_order', (order) => {
      if (onNewOrderRef.current) {
        onNewOrderRef.current(order);
      }
    });

    socket.on('order_ready', (order) => {
      if (onOrderReadyRef.current) {
        onOrderReadyRef.current(order);
      }
    });

    socket.on('order_status_updated', (order) => {
      if (onOrderStatusUpdatedRef.current) {
        onOrderStatusUpdatedRef.current(order);
      }
    });

    socket.on('store_status_changed', (status) => {
      if (onStoreStatusChangedRef.current) {
        onStoreStatusChangedRef.current(status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, isStudent, isKitchen, orderId]);

  return socketRef.current;
};

