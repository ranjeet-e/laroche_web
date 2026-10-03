const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { notifyKitchenNewOrder } = require('../sockets/notificationSocket');

// @route POST /api/payment/create-order
// Student-only — creates a Razorpay order for an existing (unpaid) order
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Valid order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // IDOR Protection: verify student ownership
    if (order.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You cannot initiate payment for this order' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({ message: 'Order is not eligible for payment (already paid or cancelled)' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway configuration error' });
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
      keyId: process.env.RAZORPAY_KEY_ID, // Frontend uses this public key ID to launch Razorpay popup
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payment/verify
// Student-only — verifies Razorpay signature cryptographically and marks order paid
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'All payment verification parameters are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // IDOR Protection: student must own the order
    if (order.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Payment record mismatch' });
    }

    // Find the corresponding payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment || payment.order.toString() !== orderId) {
      return res.status(400).json({ message: 'Payment record does not match the specified order' });
    }

    if (payment.status === 'paid') {
      return res.status(200).json({ message: 'Order is already marked as paid', order });
    }

    // Cryptographic signature verification with timingSafeEqual to prevent timing attacks
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server payment configuration missing' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(razorpay_signature, 'utf8');

    const isMatch =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!isMatch) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      }
    );

    order.status = 'paid';
    await order.save();

    const populatedOrder = await Order.findById(orderId).populate('student', 'name email phone');

    // Push new order to kitchen dashboard in real-time
    notifyKitchenNewOrder(populatedOrder);

    res.status(200).json({ message: 'Payment verified successfully', order: populatedOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
