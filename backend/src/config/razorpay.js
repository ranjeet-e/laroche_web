require('dotenv').config();
const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (key_id && key_secret) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  } catch (err) {
    console.warn('Razorpay initialization warning:', err.message);
  }
} else {
  console.warn('Razorpay keys not configured. Payment gateway will remain inactive until keys are provided in .env');
}

module.exports = razorpayInstance;
