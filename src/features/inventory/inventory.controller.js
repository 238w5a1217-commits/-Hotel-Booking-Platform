const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse  = require('../../utils/apiResponse');
const Inventory    = require('./inventory.model');
const RoomType     = require('../rooms/room.model');

const upsertInventory = asyncHandler(async (req, res) => {
  const { roomTypeId, date, price, availableRooms } = req.body;
  const room = await RoomType.findById(roomTypeId).populate('property');
  if (!room) return res.status(404).json(ApiResponse.error('Room type not found', 404));
  if (room.property.partner.toString() !== req.user._id.toString())
    return res.status(403).json(ApiResponse.error('Forbidden', 403));

  const update = { roomType: roomTypeId, property: room.property._id, date };
  if (price          !== undefined) update.price          = price;
  if (availableRooms !== undefined) update.availableRooms = availableRooms;

  const inv = await Inventory.findOneAndUpdate(
    { roomType: roomTypeId, date },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(ApiResponse.success(inv, 'Inventory updated successfully'));
});

const getInventory = asyncHandler(async (req, res) => {
  const filter = { roomType: req.params.roomTypeId };
  const { from, to } = req.query;
  if (from && to) filter.date = { $gte: from, $lte: to };
  const inventory = await Inventory.find(filter).sort('date');
  res.json(ApiResponse.success(inventory));
});

module.exports = { upsertInventory, getInventory };

