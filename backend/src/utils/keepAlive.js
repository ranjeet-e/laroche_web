const https = require('https');
const http = require('http');

/**
 * Initializes a background keep-alive self-ping mechanism.
 * Render automatically exposes the RENDER_EXTERNAL_URL environment variable.
 * Pings every 13 minutes (Render sleeps after 15 minutes of inactivity).
 */
const initKeepAlive = () => {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;

  if (!targetUrl) {
    console.log('[Keep-Alive] No RENDER_EXTERNAL_URL or KEEP_ALIVE_URL found. Skipping self-ping.');
    return;
  }

  const pingUrl = `${targetUrl.replace(/\/$/, '')}/health`;
  const INTERVAL_MS = 13 * 60 * 1000; // 13 minutes

  console.log(`[Keep-Alive] Configured to ping ${pingUrl} every 13 minutes.`);

  setInterval(() => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      client
        .get(pingUrl, (res) => {
          console.log(`[Keep-Alive] Pinged ${pingUrl} - Status: ${res.statusCode}`);
        })
        .on('error', (err) => {
          console.warn(`[Keep-Alive] Ping error: ${err.message}`);
        });
    } catch (error) {
      console.warn(`[Keep-Alive] Failed to execute ping: ${error.message}`);
    }
  }, INTERVAL_MS);
};

module.exports = { initKeepAlive };
