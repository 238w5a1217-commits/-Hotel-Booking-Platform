const mongoose            = require('mongoose');
const { PROPERTY_STATUS } = require('../../config/constants');

const propertySchema = new mongoose.Schema(
  {
    partner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:            { type: String, required: true, trim: true },
    city:            { type: String, required: true, trim: true, lowercase: true, index: true },
    address:         { type: String, required: true },
    description:     { type: String, required: true },
    amenities:       [{ type: String }],
    images:          [{ type: String }],
    starRating:      { type: Number, min: 1, max: 5, default: 3 },
    status:          { type: String, enum: Object.values(PROPERTY_STATUS), default: PROPERTY_STATUS.PENDING, index: true },
    rejectionReason: { type: String },
    policies:        {
      checkIn:  { type: String, default: '14:00' },
      checkOut: { type: String, default: '12:00' },
    },
  },
  { timestamps: true }
);

propertySchema.index({ city: 1, status: 1 });
propertySchema.index({ name: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);

