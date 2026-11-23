const asyncHandler         = require('../../utils/asyncHandler');
const ApiResponse          = require('../../utils/apiResponse');
const Property             = require('../properties/property.model');
const Booking              = require('../bookings/booking.model');
const User                 = require('../auth/user.model');
const { PROPERTY_STATUS, BOOKING_STATUS } = require('../../config/constants');

const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalBookings,
    revenueAgg,
    totalCancellations,
    totalUsers,
    totalProperties,
    topCities,
    recentBookings,
  ] = await Promise.all([
    Booking.countDocuments({ status: BOOKING_STATUS.CONFIRMED }),
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Booking.countDocuments({ status: BOOKING_STATUS.CANCELLED }),
    User.countDocuments(),
    Property.countDocuments({ status: PROPERTY_STATUS.APPROVED }),
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      { $lookup: { from: 'properties', localField: 'property', foreignField: '_id', as: 'prop' } },
      { $unwind: '$prop' },
      { $group: { _id: '$prop.city', count: { $sum: 1 }, revenue: { $sum: '$grandTotal' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Booking.find().populate('property', 'name city').populate('guest', 'name email').sort('-createdAt').limit(10),
  ]);

  res.json(ApiResponse.success({
    totalBookings,
    totalRevenue:       revenueAgg[0]?.total || 0,
    totalCancellations,
    totalUsers,
    totalProperties,
    topCities,
    recentBookings,
  }));
});

const getProperties = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const skip = (+page - 1) * +limit;
  const [properties, total] = await Promise.all([
    Property.find({ status }).populate('partner', 'name email').skip(skip).limit(+limit).sort('-createdAt'),
    Property.countDocuments({ status }),
  ]);
  res.json(ApiResponse.paginated(properties, { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) }));
});

const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: PROPERTY_STATUS.APPROVED, $unset: { rejectionReason: '' } },
    { new: true }
  );
  if (!property) return res.status(404).json(ApiResponse.error('Property not found', 404));
  res.json(ApiResponse.success(property, 'Property approved'));
});

const rejectProperty = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json(ApiResponse.error('Rejection reason is required', 400));
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: PROPERTY_STATUS.REJECTED, rejectionReason: reason },
    { new: true }
  );
  if (!property) return res.status(404).json(ApiResponse.error('Property not found', 404));
  res.json(ApiResponse.success(property, 'Property rejected'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const skip = (+page - 1) * +limit;
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(+limit).sort('-createdAt'),
    User.countDocuments(filter),
  ]);
  res.json(ApiResponse.paginated(users, { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) }));
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json(ApiResponse.error('User not found', 404));
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json(ApiResponse.success({ isBlocked: user.isBlocked }, `User ${user.isBlocked ? 'blocked' : 'unblocked'}`));
});

module.exports = { getDashboard, getProperties, approveProperty, rejectProperty, getAllUsers, blockUser };

