const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const dns = require('dns');
// Set IPv4 first to avoid ENETUNREACH errors on cloud hosting (Render/AWS) where IPv6 is not routed
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/notificationSocket');
const { initKeepAlive } = require('./src/utils/keepAlive');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB (non-blocking catch so server continues serving static/health if network reconnects)
connectDB().catch((err) => {
  console.error('Initial MongoDB connection error:', err.message);
});

// Detect SSL certificates if available
const sslKeyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'ssl/privkey.pem');
const sslCertPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'ssl/fullchain.pem');

let server;
if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  try {
    const sslOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };
    server = https.createServer(sslOptions, app);
    console.log('🔒 HTTPS (SSL) active on port', PORT);
  } catch (err) {
    console.warn('⚠️ Could not load SSL certificates, starting HTTP:', err.message);
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
}

// Attach Socket.IO to the same server
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initKeepAlive();
});
