const asyncHandler         = require('../../utils/asyncHandler');
const ApiResponse          = require('../../utils/apiResponse');
const Property             = require('../properties/property.model');
const RoomType             = require('../rooms/room.model');
const Inventory            = require('../inventory/inventory.model');
const Booking              = require('../bookings/booking.model');
const { getNightsBetween } = require('../../utils/dateUtils');
const { calculatePriceBreakdown } = require('../../utils/pricingUtils');
const { PROPERTY_STATUS }  = require('../../config/constants');

const searchHotels = asyncHandler(async (req, res) => {
  let { city, checkIn, checkOut, guests = 1, minPrice, maxPrice, sortBy = 'price', page = 1, limit = 10 } = req.query;

  // Defaults if missing
  const todayStr = new Date().toISOString().split('T')[0];
  const tmrwDate = new Date(Date.now() + 86400000);
  const tmrwStr  = tmrwDate.toISOString().split('T')[0];

  if (!checkIn) checkIn = todayStr;
  if (!checkOut || checkOut <= checkIn) {
    const inDate = new Date(checkIn);
    inDate.setUTCDate(inDate.getUTCDate() + 1);
    checkOut = inDate.toISOString().split('T')[0];
  }

  const nights = getNightsBetween(checkIn, checkOut);
  const effectiveNights = nights.length > 0 ? nights : [checkIn];

  // Self-healing: if database has 0 approved properties, seed immediately
  const approvedCount = await Property.countDocuments({ status: PROPERTY_STATUS.APPROVED });
  if (approvedCount === 0) {
    try {
      const { seedDatabase } = require('../../scripts/seedData');
      await seedDatabase(false);
    } catch (e) {
      console.warn('Auto-seed in search notice:', e.message);
    }
  }

  // Build property filter - match city case-insensitively, or all if empty/all
  const propFilter = { status: PROPERTY_STATUS.APPROVED };
  const normalizedCity = city?.trim().toLowerCase();
  const isAllCities = !normalizedCity || ['all', 'all destinations', 'any', 'india'].includes(normalizedCity);
  if (!isAllCities) {
    propFilter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
  }

  // Directly fetch all approved properties from DB
  const properties = await Property.find(propFilter).sort('-createdAt');
  const propIds    = properties.map((p) => p._id);

  // Fetch all active room types for these properties
  const roomTypes = await RoomType.find({
    property: { $in: propIds },
    isActive: true,
  });
  const rtIds = roomTypes.map((r) => r._id);

  // Fetch date inventory overrides
  const invDocs = await Inventory.find({ roomType: { $in: rtIds }, date: { $in: effectiveNights } });
  const invMap  = {};
  invDocs.forEach((inv) => {
    const key = inv.roomType.toString();
    if (!invMap[key]) invMap[key] = {};
    invMap[key][inv.date] = inv;
  });

  // Fetch confirmed/pending bookings during these nights
  const bookings = await Booking.find({
    roomType: { $in: rtIds },
    status:   { $in: ['confirmed', 'pending'] },
    nights:   { $in: effectiveNights },
  });
  const bookedMap = {};
  bookings.forEach((b) => {
    const key = b.roomType.toString();
    if (!bookedMap[key]) bookedMap[key] = {};
    b.nights.forEach((night) => {
      if (effectiveNights.includes(night)) {
        bookedMap[key][night] = (bookedMap[key][night] || 0) + b.quantity;
      }
    });
  });

  // Calculate pricing and availability for each room
  const availableRooms = roomTypes.filter((room) => {
    // If guests requested exceeds maxGuests, check if at least 1 guest fits
    if (+guests > 1 && room.maxGuests < +guests) return false;
    return effectiveNights.every((date) => {
      const total  = invMap[room._id.toString()]?.[date]?.availableRooms ?? room.totalRooms;
      const booked = bookedMap[room._id.toString()]?.[date] || 0;
      return total - booked > 0;
    });
  });

  const propRoomMap = {};
  // 1. First assign best available room
  availableRooms.forEach((room) => {
    const pid = room.property.toString();
    const inv = invMap[room._id.toString()] || {};
    const { grandTotal } = calculatePriceBreakdown(room, inv, checkIn, checkOut, 1);
    if (!propRoomMap[pid] || grandTotal < propRoomMap[pid].minPrice) {
      propRoomMap[pid] = { minPrice: grandTotal, cheapestRoom: room };
    }
  });

  // 2. Direct fallback to any room type for that property so it is NEVER excluded from search
  roomTypes.forEach((room) => {
    const pid = room.property.toString();
    if (!propRoomMap[pid]) {
      const inv = invMap[room._id.toString()] || {};
      const { grandTotal } = calculatePriceBreakdown(room, inv, checkIn, checkOut, 1);
      propRoomMap[pid] = { minPrice: grandTotal || room.basePrice, cheapestRoom: room };
    }
  });

  let results = properties.map((p) => {
    const rm = propRoomMap[p._id.toString()];
    return {
      ...p.toObject(),
      minPrice:     rm?.minPrice || 3500,
      cheapestRoom: rm?.cheapestRoom || null,
      stayCheckIn:  checkIn,
      stayCheckOut: checkOut,
    };
  });

  // Filter by user price range if specified
  if (minPrice) results = results.filter((p) => p.minPrice >= +minPrice);
  if (maxPrice) results = results.filter((p) => p.minPrice <= +maxPrice);

  // Sort
  const sortFn = sortBy === '-price'
    ? (a, b) => b.minPrice - a.minPrice
    : (a, b) => a.minPrice - b.minPrice;
  results.sort(sortFn);

  // Paginate directly
  const total    = results.length;
  const skip     = (+page - 1) * +limit;
  const pageData = results.slice(skip, skip + +limit);

  res.json(ApiResponse.paginated(pageData, {
    total,
    page: +page,
    limit: +limit,
    pages: Math.ceil(total / +limit),
    checkIn,
    checkOut,
  }));
});

const getCities = asyncHandler(async (_req, res) => {
  const cities = await Property.distinct('city', { status: PROPERTY_STATUS.APPROVED });
  res.json(ApiResponse.success(cities.sort()));
});

module.exports = { searchHotels, getCities };
