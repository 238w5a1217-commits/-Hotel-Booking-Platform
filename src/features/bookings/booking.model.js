const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    guest:          { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
    property:       { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    roomType:       { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
    checkIn:        { type: String, required: true },
    checkOut:       { type: String, required: true },
    nights:         [{ type: String }],
    quantity:       { type: Number, default: 1, min: 1 },
    guestDetails: {
      name:            { type: String, required: true },
      email:           { type: String, required: true },
      phone:           { type: String, required: true },
      specialRequests: { type: String },
    },
    priceBreakdown: { type: mongoose.Schema.Types.Mixed },
    subtotal:       { type: Number, required: true },
    totalGST:       { type: Number, required: true },
    grandTotal:     { type: Number, required: true },
    status:         { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING, index: true },
    paymentStatus:  { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    paymentId:      { type: String },
    razorpayOrderId:{ type: String },
    holdExpiresAt:  { type: Date },
    cancelledAt:    { type: Date },
    refundAmount:   { type: Number, default: 0 },
    refundStatus:   { type: String, enum: ['none', 'pending', 'processed'], default: 'none' },
  },
  { timestamps: true }
);

bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ roomType: 1, nights: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

