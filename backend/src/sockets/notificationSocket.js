let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*', // allow frontend connections from any device on local network
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    // Kitchen staff joins the shared "kitchen" room to receive new order alerts
    socket.on('join_kitchen', () => {
      socket.join('kitchen');
    });

    // Each student joins their own private room to receive personal updates
    socket.on('join_student', (studentId) => {
      if (studentId) {
        socket.join(`student:${studentId}`);
      }
    });

    // Join specific order room for order tracking
    socket.on('join_order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      // disconnected
    });
  });

  return io;
};

// Called after successful payment / order placement
const notifyKitchenNewOrder = (order) => {
  if (io) {
    io.to('kitchen').emit('new_order', order);
    io.emit('order_status_updated', order);
  }
};

// Called when order status changes (preparing, ready, collected)
const notifyOrderStatusUpdated = (order) => {
  if (io) {
    const studentId = order.student?._id ? order.student._id.toString() : (order.student ? order.student.toString() : null);
    if (studentId) {
      io.to(`student:${studentId}`).emit('order_status_updated', order);
      if (order.status === 'ready') {
        io.to(`student:${studentId}`).emit('order_ready', order);
      }
    }
    io.to(`order:${order._id}`).emit('order_status_updated', order);
    io.to('kitchen').emit('order_status_updated', order);
  }
};

// Backward-compatibility alias
const notifyStudentOrderReady = (studentId, order) => {
  notifyOrderStatusUpdated(order);
};

module.exports = { initSocket, notifyKitchenNewOrder, notifyOrderStatusUpdated, notifyStudentOrderReady };

