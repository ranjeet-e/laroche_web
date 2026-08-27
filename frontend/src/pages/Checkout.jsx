import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../services/orderService';
import {
  createRazorpayOrder,
  verifyPayment,
  loadRazorpayScript,
} from '../services/paymentService';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('idle'); // idle | placing | processing | success | failed
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayment = async () => {
    setStatus('placing');
    setErrorMsg('');

    try {
      // Step 1: create the order in our DB (status: 'placed')
      const order = await placeOrder(cartItems);

      // Step 2: load Razorpay's checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Could not load payment gateway. Check your connection.');
        setStatus('failed');
        return;
      }

      // Step 3: create a Razorpay order tied to our order
      const razorpayData = await createRazorpayOrder(order._id);

      setStatus('processing');

      // Step 4: open Razorpay checkout popup
      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'La Roche Cafe',
        description: 'Order Payment',
        order_id: razorpayData.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#E85D04',
        },
        handler: async (response) => {
          // Step 5: verify payment on our backend
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            clearCart();
            setStatus('success');

            setTimeout(() => {
              navigate(`/orders/${order._id}`);
            }, 1500);
          } catch (err) {
            setErrorMsg('Payment verification failed. Contact support if amount was deducted.');
            setStatus('failed');
          }
        },
        modal: {
          ondismiss: () => {
            setStatus('idle');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('failed');
    }
  };

  if (cartItems.length === 0 && status === 'idle') {
    return (
      <div className="checkout-empty">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/menu')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="bill-summary">
        {cartItems.map((item) => (
          <div className="bill-row" key={`${item.menuItem}-${item.name}`}>
            <span>{item.name} x {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="bill-row bill-total">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      {errorMsg && <p className="checkout-error">{errorMsg}</p>}

      <button
        className="pay-btn"
        onClick={handlePayment}
        disabled={status === 'placing' || status === 'processing' || status === 'success'}
      >
        {status === 'placing' && 'Placing order...'}
        {status === 'processing' && 'Waiting for payment...'}
        {status === 'success' && 'Payment successful ✓'}
        {(status === 'idle' || status === 'failed') && `Pay ₹${totalAmount} via UPI / Cards`}
      </button>

      {status === 'success' && (
        <div className="payment-success-overlay">
          <div className="success-check">✓</div>
          <p>Payment Successful</p>
        </div>
      )}
    </div>
  );
};

export default Checkout;
