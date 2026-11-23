const asyncHandler        = require('../../utils/asyncHandler');
const ApiResponse         = require('../../utils/apiResponse');
const Property            = require('./property.model');
const { PROPERTY_STATUS } = require('../../config/constants');

const createProperty = asyncHandler(async (req, res) => {
  const { name, city, address, description, amenities, images, starRating } = req.body;
  const property = await Property.create({
    partner:     req.user._id,
    name, address, description,
    city:        city.toLowerCase(),
    amenities:   amenities || [],
    images:      images    || [],
    starRating,
    status:      PROPERTY_STATUS.PENDING,
  });
  res.status(201).json(ApiResponse.success(property, 'Property submitted for admin review', 201));
});

const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ partner: req.user._id }).sort('-createdAt');
  res.json(ApiResponse.success(properties));
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('partner', 'name email phone');
  if (!property) return res.status(404).json(ApiResponse.error('Property not found', 404));
  res.json(ApiResponse.success(property));
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, partner: req.user._id });
  if (!property) return res.status(404).json(ApiResponse.error('Property not found', 404));
  ['name', 'address', 'description', 'amenities', 'images', 'starRating'].forEach((f) => {
    if (req.body[f] !== undefined) property[f] = req.body[f];
  });
  property.status = PROPERTY_STATUS.PENDING; // Needs re-approval
  await property.save();
  res.json(ApiResponse.success(property, 'Property updated — awaiting re-approval'));
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOneAndDelete({ _id: req.params.id, partner: req.user._id });
  if (!property) return res.status(404).json(ApiResponse.error('Property not found', 404));
  res.json(ApiResponse.success(null, 'Property deleted'));
});

module.exports = { createProperty, getMyProperties, getPropertyById, updateProperty, deleteProperty };

