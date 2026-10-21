const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const dns = require('dns');
// Set IPv4 first to avoid ENETUNREACH errors on cloud hosting (Render/AWS) where IPv6 is not routed
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/notificationSocket');
const { initKeepAlive } = require('./src/utils/keepAlive');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB (non-blocking catch so server continues serving static/health if network reconnects)
connectDB().catch((err) => {
  console.error('Initial MongoDB connection error:', err.message);
});

// Create HTTP server from Express app (needed so Socket.IO can attach to it)
const server = http.createServer(app);

// Attach Socket.IO to the same server
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initKeepAlive();
});
