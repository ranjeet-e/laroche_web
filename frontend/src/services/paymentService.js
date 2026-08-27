import api from './api';

export const createRazorpayOrder = async (orderId) => {
  const response = await api.post('/payment/create-order', { orderId });
  return response.data;
};

export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  orderId,
}) => {
  const response = await api.post('/payment/verify', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  });
  return response.data;
};

// Loads the Razorpay checkout script dynamically (only once)
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
