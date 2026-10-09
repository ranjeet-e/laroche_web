import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
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

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user) {
        const studentId = user.id || user._id;
        if (isKitchen) {
          socket.emit('join_kitchen');
        } else if (isStudent && studentId) {
          socket.emit('join_student', studentId);
        }
      }
      if (orderId) {
        socket.emit('join_order', orderId);
      }
    });

    if (onNewOrder) {
      socket.on('new_order', onNewOrder);
    }

    if (onOrderReady) {
      socket.on('order_ready', onOrderReady);
    }

    if (onOrderStatusUpdated) {
      socket.on('order_status_updated', onOrderStatusUpdated);
    }

    if (onStoreStatusChanged) {
      socket.on('store_status_changed', onStoreStatusChanged);
    }

    return () => {
      socket.disconnect();
    };
  }, [user, isStudent, isKitchen, orderId, onStoreStatusChanged]);

  return socketRef.current;
};

