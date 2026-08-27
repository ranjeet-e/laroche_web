import { useState, useEffect } from 'react';
import { getActiveKitchenOrders, updateOrderStatus } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import './KitchenDashboard.css';

const columns = [
  { key: 'paid', label: 'New', actionLabel: 'Start Prep', nextStatus: 'preparing' },
  { key: 'preparing', label: 'Preparing', actionLabel: 'Mark Ready', nextStatus: 'ready' },
  { key: 'ready', label: 'Ready', actionLabel: 'Mark Collected', nextStatus: 'collected' },
];

const KitchenDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // orders | stock
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getActiveKitchenOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (err) {
      console.error('Failed to fetch menu', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  // Real-time: new paid orders drop into the "New" column instantly
  useSocket({
    onNewOrder: (newOrder) => {
      setOrders((prev) => [...prev, newOrder]);
    },
  });

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, nextStatus);
      if (nextStatus === 'collected') {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleStockToggle = async (itemId, currentAvailability) => {
    try {
      await api.put(`/menu/${itemId}`, { isAvailable: !currentAvailability });
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable: !currentAvailability } : item
        )
      );
    } catch (err) {
      console.error('Failed to toggle stock', err);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="kitchen-dashboard">
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab ${activeTab === 'stock' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Menu Stock
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="kanban-board">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.key);
            return (
              <div className="kanban-column" key={col.key}>
                <h3>{col.label} ({colOrders.length})</h3>
                {colOrders.length === 0 ? (
                  <p className="kanban-empty">No orders yet</p>
                ) : (
                  colOrders.map((order) => (
                    <div className="order-card-kanban" key={order._id}>
                      <div className="order-card-kanban-top">
                        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className="order-time">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="order-card-kanban-student">{order.student?.name}</p>
                      <ul className="order-card-kanban-items">
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.name} x {item.quantity}</li>
                        ))}
                      </ul>
                      <button
                        className="kanban-action-btn"
                        onClick={() => handleStatusUpdate(order._id, col.nextStatus)}
                      >
                        {col.actionLabel}
                      </button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="stock-list">
          {menuItems.map((item) => (
            <div className="stock-row" key={item._id}>
              <span>{item.name}</span>
              <button
                className={`stock-toggle ${item.isAvailable ? 'stock-in' : 'stock-out'}`}
                onClick={() => handleStockToggle(item._id, item.isAvailable)}
              >
                {item.isAvailable ? 'In Stock' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;
