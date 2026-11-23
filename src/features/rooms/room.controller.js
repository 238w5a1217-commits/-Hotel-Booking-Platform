const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse  = require('../../utils/apiResponse');
const RoomType     = require('./room.model');
const Property     = require('../properties/property.model');

const addRoomType = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.propertyId, partner: req.user._id });
  if (!property) return res.status(404).json(ApiResponse.error('Property not found', 404));
  const { name, description, basePrice, totalRooms, maxGuests, amenities, images } = req.body;
  const room = await RoomType.create({
    property: property._id, name, description, basePrice, totalRooms, maxGuests,
    amenities: amenities || [], images: images || [],
  });
  res.status(201).json(ApiResponse.success(room, 'Room type added', 201));
});

const getRoomTypes = asyncHandler(async (req, res) => {
  const rooms = await RoomType.find({ property: req.params.propertyId, isActive: true });
  res.json(ApiResponse.success(rooms));
});

const updateRoomType = asyncHandler(async (req, res) => {
  const room = await RoomType.findById(req.params.roomId).populate('property');
  if (!room) return res.status(404).json(ApiResponse.error('Room not found', 404));
  if (room.property.partner.toString() !== req.user._id.toString())
    return res.status(403).json(ApiResponse.error('Forbidden', 403));
  ['name', 'description', 'basePrice', 'totalRooms', 'maxGuests', 'amenities', 'images', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) room[f] = req.body[f];
  });
  await room.save();
  res.json(ApiResponse.success(room, 'Room type updated'));
});

const deleteRoomType = asyncHandler(async (req, res) => {
  const room = await RoomType.findById(req.params.roomId).populate('property');
  if (!room) return res.status(404).json(ApiResponse.error('Room not found', 404));
  if (room.property.partner.toString() !== req.user._id.toString())
    return res.status(403).json(ApiResponse.error('Forbidden', 403));
  room.isActive = false;
  await room.save();
  res.json(ApiResponse.success(null, 'Room type removed'));
});

module.exports = { addRoomType, getRoomTypes, updateRoomType, deleteRoomType };

