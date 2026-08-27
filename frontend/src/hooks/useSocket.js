import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  : 'http://localhost:5000';

export const useSocket = ({ onNewOrder, onOrderReady } = {}) => {
  const socketRef = useRef(null);
  const { user, isStudent, isKitchen } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      if (isKitchen) {
        socket.emit('join_kitchen');
      } else if (isStudent) {
        socket.emit('join_student', user.id);
      }
    });

    if (onNewOrder) {
      socket.on('new_order', onNewOrder);
    }

    if (onOrderReady) {
      socket.on('order_ready', onOrderReady);
    }

    return () => {
      socket.disconnect();
    };
  }, [user, isStudent, isKitchen]);

  return socketRef.current;
};
