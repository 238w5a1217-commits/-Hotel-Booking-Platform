const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking:          { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    amount:           { type: Number, required: true },
    currency:         { type: String, default: 'INR' },
    method:           { type: String, enum: ['razorpay', 'mock'], default: 'mock' },
    status:           { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    gatewayOrderId:   { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

