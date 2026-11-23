const asyncHandler                       = require('../../utils/asyncHandler');
const ApiResponse                        = require('../../utils/apiResponse');
const Booking                            = require('../bookings/booking.model');
const Payment                            = require('./payment.model');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../config/constants');

// ── Mock Payment (clearly labeled test payment) ───────────────
const mockPay = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, guest: req.user._id, status: BOOKING_STATUS.PENDING });
  if (!booking) return res.status(404).json(ApiResponse.error('Booking not found or already completed', 404));

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    booking.status = BOOKING_STATUS.CANCELLED;
    await booking.save();
    return res.status(400).json(ApiResponse.error('Hold expired. Please start booking again.', 400));
  }

  const payment = await Payment.create({
    booking: booking._id, user: req.user._id,
    amount: booking.grandTotal, method: 'mock', status: 'completed',
    gatewayPaymentId: `MOCK_${Date.now()}`,
  });

  booking.status        = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.COMPLETED;
  booking.paymentId     = payment._id.toString();
  booking.holdExpiresAt = null;
  await booking.save();

  res.json(ApiResponse.success({ booking, payment }, 'Payment verified. Booking confirmed.'));
});

// ── Razorpay: Create Order ────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, guest: req.user._id, status: BOOKING_STATUS.PENDING });
  if (!booking) return res.status(404).json(ApiResponse.error('Booking not found', 404));

  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_demo') {
    return res.json(ApiResponse.success({ useMock: true, bookingId: booking._id, amount: booking.grandTotal }, 'Demo mode: please use mock payment'));
  }

  let Razorpay;
  try {
    Razorpay = require('razorpay');
  } catch (err) {
    return res.json(ApiResponse.success({ useMock: true, bookingId: booking._id, amount: booking.grandTotal }, 'Razorpay package not installed; use mock payment'));
  }

  const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const order = await rzp.orders.create({
    amount: Math.round(booking.grandTotal * 100),
    currency: 'INR',
    receipt: booking._id.toString(),
  });
  booking.razorpayOrderId = order.id;
  await booking.save();
  res.json(ApiResponse.success({ orderId: order.id, amount: order.amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID }));
});

// ── Razorpay: Verify Signature ────────────────────────────────
const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const crypto   = require('crypto');
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  if (expected !== razorpay_signature)
    return res.status(400).json(ApiResponse.error('Invalid payment signature', 400));

  const booking = await Booking.findOne({ _id: bookingId, guest: req.user._id });
  if (!booking) return res.status(404).json(ApiResponse.error('Booking not found', 404));

  const payment = await Payment.create({
    booking: booking._id, user: req.user._id, amount: booking.grandTotal, method: 'razorpay', status: 'completed',
    gatewayOrderId: razorpay_order_id, gatewayPaymentId: razorpay_payment_id, gatewaySignature: razorpay_signature,
  });

  booking.status        = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.COMPLETED;
  booking.paymentId     = payment._id.toString();
  booking.holdExpiresAt = null;
  await booking.save();

  res.json(ApiResponse.success({ booking, payment }, 'Payment verified and booking confirmed.'));
});

module.exports = { mockPay, createOrder, verifyPayment };
