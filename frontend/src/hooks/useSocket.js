import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  }
  return undefined; // automatically connects to window.location.origin
};

export const useSocket = ({ onNewOrder, onOrderReady, onOrderStatusUpdated, orderId } = {}) => {
  const socketRef = useRef(null);
  const { user, isStudent, isKitchen } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const studentId = user.id || user._id;
      if (isKitchen) {
        socket.emit('join_kitchen');
      } else if (isStudent && studentId) {
        socket.emit('join_student', studentId);
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

    return () => {
      socket.disconnect();
    };
  }, [user, isStudent, isKitchen, orderId]);

  return socketRef.current;
};
