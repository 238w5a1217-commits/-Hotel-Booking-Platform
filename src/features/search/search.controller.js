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
  let { city, checkIn, checkOut, guests = 1, minPrice, maxPrice, sortBy = 'price', page = 1, limit = 9 } = req.query;

  // Defaults if missing
  const todayStr = new Date().toISOString().split('T')[0];
  const tmrwDate = new Date(Date.now() + 86400000);
  const tmrwStr  = tmrwDate.toISOString().split('T')[0];

  if (!checkIn) checkIn = todayStr;
  if (!checkOut || checkOut <= checkIn) {
    // If checkOut is same as or before checkIn, auto-adjust to next day (1 night stay)
    const inDate = new Date(checkIn);
    inDate.setUTCDate(inDate.getUTCDate() + 1);
    checkOut = inDate.toISOString().split('T')[0];
  }

  const nights = getNightsBetween(checkIn, checkOut);
  const effectiveNights = nights.length > 0 ? nights : [checkIn];

  // Build property filter
  const propFilter = { status: PROPERTY_STATUS.APPROVED };
  if (city && city.trim()) {
    propFilter.city = city.trim().toLowerCase();
  }

  const properties = await Property.find(propFilter);
  const propIds    = properties.map((p) => p._id);

  const roomTypes = await RoomType.find({
    property: { $in: propIds },
    isActive: true,
    maxGuests: { $gte: +guests || 1 },
  });
  const rtIds = roomTypes.map((r) => r._id);

  const invDocs = await Inventory.find({ roomType: { $in: rtIds }, date: { $in: effectiveNights } });
  const invMap  = {};
  invDocs.forEach((inv) => {
    if (!invMap[inv.roomType.toString()]) invMap[inv.roomType.toString()] = {};
    invMap[inv.roomType.toString()][inv.date] = inv;
  });

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

  // Filter room types available on all requested nights
  const availableRooms = roomTypes.filter((room) =>
    effectiveNights.every((date) => {
      const total  = invMap[room._id.toString()]?.[date]?.availableRooms ?? room.totalRooms;
      const booked = bookedMap[room._id.toString()]?.[date] || 0;
      return total - booked > 0;
    })
  );

  const propRoomMap = {};
  availableRooms.forEach((room) => {
    const pid = room.property.toString();
    const inv = invMap[room._id.toString()] || {};
    const { grandTotal } = calculatePriceBreakdown(room, inv, checkIn, checkOut, 1);
    if (!propRoomMap[pid] || grandTotal < propRoomMap[pid].minPrice) {
      propRoomMap[pid] = { minPrice: grandTotal, cheapestRoom: room };
    }
  });

  let results = properties.filter((p) => propRoomMap[p._id.toString()]);

  if (minPrice) results = results.filter((p) => propRoomMap[p._id.toString()].minPrice >= +minPrice);
  if (maxPrice) results = results.filter((p) => propRoomMap[p._id.toString()].minPrice <= +maxPrice);

  const sortFn = sortBy === '-price'
    ? (a, b) => propRoomMap[b._id.toString()].minPrice - propRoomMap[a._id.toString()].minPrice
    : (a, b) => propRoomMap[a._id.toString()].minPrice - propRoomMap[b._id.toString()].minPrice;
  results.sort(sortFn);

  const total    = results.length;
  const skip     = (+page - 1) * +limit;
  const pageData = results.slice(skip, skip + +limit).map((p) => ({
    ...p.toObject(),
    minPrice:     propRoomMap[p._id.toString()].minPrice,
    cheapestRoom: propRoomMap[p._id.toString()].cheapestRoom,
    stayCheckIn:  checkIn,
    stayCheckOut: checkOut,
  }));

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
