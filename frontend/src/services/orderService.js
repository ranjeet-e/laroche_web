import api from './api';

export const placeOrder = async (items) => {
  const response = await api.post('/orders', { items });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Kitchen-only
export const getActiveKitchenOrders = async () => {
  const response = await api.get('/kitchen/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/kitchen/orders/${orderId}/status`, { status });
  return response.data;
};
