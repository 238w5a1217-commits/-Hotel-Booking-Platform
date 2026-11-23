const mongoose                           = require('mongoose');
const asyncHandler                       = require('../../utils/asyncHandler');
const ApiResponse                        = require('../../utils/apiResponse');
const Booking                            = require('./booking.model');
const RoomType                           = require('../rooms/room.model');
const Property                           = require('../properties/property.model');
const Inventory                          = require('../inventory/inventory.model');
const { BOOKING_STATUS }                 = require('../../config/constants');
const { getNightsBetween, hoursUntilCheckin } = require('../../utils/dateUtils');
const { calculatePriceBreakdown, calculateRefund } = require('../../utils/pricingUtils');

const getPriceBreakdown = asyncHandler(async (req, res) => {
  const { roomTypeId, checkIn, checkOut, quantity = 1 } = req.query;
  const room = await RoomType.findById(roomTypeId);
  if (!room) return res.status(404).json(ApiResponse.error('Room type not found', 404));
  const nights  = getNightsBetween(checkIn, checkOut);
  const invDocs = await Inventory.find({ roomType: roomTypeId, date: { $in: nights } });
  const invMap  = {};
  invDocs.forEach((inv) => { invMap[inv.date] = inv; });
  const breakdown = calculatePriceBreakdown(room, invMap, checkIn, checkOut, +quantity);
  res.json(ApiResponse.success(breakdown));
});

// Atomic reservation preventing double booking (A4)
const createBooking = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { roomTypeId, checkIn, checkOut, quantity = 1, guestDetails } = req.body;
    const nights = getNightsBetween(checkIn, checkOut);
    if (nights.length === 0) throw Object.assign(new Error('Invalid date range'), { statusCode: 400 });

    const room = await RoomType.findById(roomTypeId).session(session);
    if (!room || !room.isActive) throw Object.assign(new Error('Room type unavailable'), { statusCode: 400 });

    const property = await Property.findById(room.property).session(session);
    if (!property || property.status !== 'approved')
      throw Object.assign(new Error('Property not available'), { statusCode: 400 });

    const existingBookings = await Booking.find({
      roomType: roomTypeId,
      status:   { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
      nights:   { $in: nights },
    }).session(session);

    const bookedPerNight = {};
    existingBookings.forEach((b) => {
      b.nights.forEach((night) => {
        if (nights.includes(night)) {
          bookedPerNight[night] = (bookedPerNight[night] || 0) + b.quantity;
        }
      });
    });

    const invDocs = await Inventory.find({ roomType: roomTypeId, date: { $in: nights } }).session(session);
    const invMap  = {};
    invDocs.forEach((inv) => { invMap[inv.date] = inv; });

    // Validate availability on every single night
    for (const night of nights) {
      const totalRooms = invMap[night]?.availableRooms ?? room.totalRooms;
      const booked     = bookedPerNight[night] || 0;
      if (booked + +quantity > totalRooms) {
        throw Object.assign(
          new Error(`Sold out for ${night}. Only ${totalRooms - booked} rooms remaining.`),
          { statusCode: 409 }
        );
      }
    }

    const breakdown     = calculatePriceBreakdown(room, invMap, checkIn, checkOut, +quantity);
    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10-minute hold (B3)

    const [booking] = await Booking.create(
      [{
        guest:          req.user._id,
        property:       property._id,
        roomType:       roomTypeId,
        checkIn, checkOut, nights,
        quantity:       +quantity,
        guestDetails,
        priceBreakdown: breakdown,
        subtotal:       breakdown.subtotal,
        totalGST:       breakdown.totalGST,
        grandTotal:     breakdown.grandTotal,
        status:         BOOKING_STATUS.PENDING,
        holdExpiresAt,
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(ApiResponse.success(booking, 'Booking initiated. Please complete payment within 10 minutes.', 201));
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { guest: req.user._id };
  if (status) filter.status = status;
  const skip = (+page - 1) * +limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('property', 'name city images')
      .populate('roomType', 'name basePrice')
      .skip(skip).limit(+limit).sort('-createdAt'),
    Booking.countDocuments(filter),
  ]);
  res.json(ApiResponse.paginated(bookings, { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) }));
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property', 'name city address images')
    .populate('roomType', 'name basePrice')
    .populate('guest', 'name email phone');
  if (!booking) return res.status(404).json(ApiResponse.error('Booking not found', 404));
  if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user._id.toString())
    return res.status(403).json(ApiResponse.error('Forbidden', 403));
  res.json(ApiResponse.success(booking));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id });
  if (!booking) return res.status(404).json(ApiResponse.error('Booking not found', 404));
  if (booking.status !== BOOKING_STATUS.CONFIRMED)
    return res.status(400).json(ApiResponse.error('Only confirmed bookings can be cancelled', 400));
  const hours = hoursUntilCheckin(booking.checkIn);
  if (hours < 0) return res.status(400).json(ApiResponse.error('Cannot cancel after check-in time', 400));
  const { refundAmount, refundPercent, policy } = calculateRefund(booking.grandTotal, hours);
  if (req.query.preview === 'true') {
    return res.json(ApiResponse.success({ refundAmount, refundPercent, policy, grandTotal: booking.grandTotal }, 'Refund preview'));
  }
  booking.status        = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt   = new Date();
  booking.refundAmount  = refundAmount;
  booking.refundStatus  = refundAmount > 0 ? 'pending' : 'none';
  await booking.save();
  res.json(ApiResponse.success({ booking, refundAmount, policy }, 'Booking cancelled successfully'));
});

const getPartnerBookings = asyncHandler(async (req, res) => {
  const properties  = await Property.find({ partner: req.user._id }, '_id');
  const propertyIds = properties.map((p) => p._id);
  const { status, page = 1, limit = 20 } = req.query;
  const filter      = { property: { $in: propertyIds } };
  if (status) filter.status = status;
  const skip        = (+page - 1) * +limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('property', 'name city')
      .populate('roomType', 'name')
      .populate('guest', 'name email')
      .skip(skip).limit(+limit).sort('-createdAt'),
    Booking.countDocuments(filter),
  ]);
  res.json(ApiResponse.paginated(bookings, { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) }));
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { status, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (from || to) filter.checkIn = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  const skip = (+page - 1) * +limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('property', 'name city')
      .populate('guest', 'name email')
      .populate('roomType', 'name')
      .skip(skip).limit(+limit).sort('-createdAt'),
    Booking.countDocuments(filter),
  ]);
  res.json(ApiResponse.paginated(bookings, { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) }));
});

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getPartnerBookings, getAllBookings, getPriceBreakdown };

