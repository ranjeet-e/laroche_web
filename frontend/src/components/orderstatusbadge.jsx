import './OrderStatusBadge.css';

const statusConfig = {
  placed: { label: 'Placed', className: 'badge-placed' },
  paid: { label: 'Paid', className: 'badge-paid' },
  preparing: { label: 'Preparing', className: 'badge-preparing' },
  ready: { label: 'Ready', className: 'badge-ready' },
  collected: { label: 'Collected', className: 'badge-collected' },
  cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'badge-default' };

  return <span className={`order-status-badge ${config.className}`}>{config.label}</span>;
};

export default OrderStatusBadge;
