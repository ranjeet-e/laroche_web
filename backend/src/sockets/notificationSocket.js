let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*', // tighten this to your frontend URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Kitchen staff joins the shared "kitchen" room to receive new order alerts
    socket.on('join_kitchen', () => {
      socket.join('kitchen');
    });

    // Each student joins their own private room to receive personal updates
    socket.on('join_student', (studentId) => {
      socket.join(`student:${studentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Called from paymentController.js after successful payment
const notifyKitchenNewOrder = (order) => {
  if (io) {
    io.to('kitchen').emit('new_order', order);
  }
};

// Called from kitchenController.js when status changes to "ready"
const notifyStudentOrderReady = (studentId, order) => {
  if (io) {
    io.to(`student:${studentId}`).emit('order_ready', order);
  }
};

module.exports = { initSocket, notifyKitchenNewOrder, notifyStudentOrderReady };
