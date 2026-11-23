// Configurable GST tax slabs - kept here rather than hardcoded
const TAX_SLABS = [
  { maxPrice: 7500,     rate: 0.05, label: '5% GST'  },
  { maxPrice: Infinity, rate: 0.18, label: '18% GST' },
];

const getGSTRate = (pricePerNight) => {
  const slab = TAX_SLABS.find((s) => pricePerNight <= s.maxPrice);
  return slab ? slab.rate : 0.18;
};

const getGSTLabel = (pricePerNight) => {
  const slab = TAX_SLABS.find((s) => pricePerNight <= s.maxPrice);
  return slab ? slab.label : '18% GST';
};

module.exports = { TAX_SLABS, getGSTRate, getGSTLabel };

