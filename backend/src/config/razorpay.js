require('dotenv').config();
const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TLcPKP2TMp6rsX';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'QP7Qr3FS4AGAhyjgQAaf6MgD';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('Razorpay initialization warning:', err.message);
}

module.exports = razorpayInstance;
