const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    roomType:       { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    property:       { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    date:           { type: String, required: true }, // YYYY-MM-DD
    price:          { type: Number, default: null },
    availableRooms: { type: Number, default: null },
  },
  { timestamps: true }
);

inventorySchema.index({ roomType: 1, date: 1 }, { unique: true });
inventorySchema.index({ property: 1, date: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);

