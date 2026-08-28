import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { useSocket } from '../hooks/useSocket';
import './OrderHistory.css';

const STATUS_STEPS = [
  { key: 'paid', label: 'Order Received', desc: 'Sent to the kitchen' },
  { key: 'preparing', label: 'Preparing', desc: 'Chefs are making your meal' },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Collect at the canteen counter' },
  { key: 'collected', label: 'Completed', desc: 'Order collected' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError('Could not load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Real-time live status updates
  useSocket({
    orderId: id,
    onOrderStatusUpdated: (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
      }
    },
    onOrderReady: (readyOrder) => {
      if (readyOrder._id === id) {
        setOrder(readyOrder);
      }
    },
  });

  if (loading) {
    return <div className="orders-loading">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="orders-error">
        <p>{error || 'Order not found'}</p>
        <button onClick={() => navigate('/orders')}>Back to My Orders</button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="orders-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/orders" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Orders
        </Link>
      </div>

      <div className="order-card" style={{ cursor: 'default', padding: '24px' }}>
        <div className="order-card-top" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div>
            <span className="order-id" style={{ fontSize: '1.25rem' }}>
              Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <div style={{ color: 'var(--on-surface-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Placed on {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <span className="order-status" style={{ textTransform: 'capitalize', fontWeight: 700 }}>
            {order.status}
          </span>
        </div>

        {/* Live Progress Tracker */}
        <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    backgroundColor: isCompleted ? 'var(--brand-primary)' : 'var(--border)',
                    color: isCompleted ? '#ffffff' : 'var(--on-surface-tertiary)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCompleted ? 'var(--on-surface)' : 'var(--on-surface-tertiary)',
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-tertiary)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Items list */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Ordered Items</h4>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}
            >
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginTop: '12px',
              borderTop: '1px solid var(--border)',
              paddingTop: '12px',
            }}
          >
            <span>Total Paid</span>
            <span style={{ color: 'var(--brand-primary)' }}>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
