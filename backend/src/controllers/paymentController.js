const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @route POST /api/payment/create-order
// Student-only — creates a Razorpay order for an existing (unpaid) order
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({ message: 'Order is not eligible for payment' });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${order._id}`,
    });

    const payment = await Payment.create({
      order: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: 'created',
    });

    order.paymentId = payment._id;
    await order.save();

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payment/verify
// Student-only — verifies Razorpay's signature after payment completes
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      }
    );

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'paid' },
      { new: true }
    );

    res.status(200).json({ message: 'Payment verified successfully', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
