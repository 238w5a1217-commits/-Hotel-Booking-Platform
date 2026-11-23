const { getGSTRate, getGSTLabel } = require('../config/taxConfig');
const { getNightsBetween } = require('./dateUtils');

/**
 * Calculate per-night GST and total breakdown:
 * GST: 5% when night base price <= 7500, 18% when > 7500.
 */
const calculatePriceBreakdown = (roomType, inventoryMap, checkIn, checkOut, quantity = 1) => {
  const nights = getNightsBetween(checkIn, checkOut);

  const nightBreakdown = nights.map((date) => {
    const basePrice = inventoryMap[date]?.price != null
      ? inventoryMap[date].price
      : roomType.basePrice;

    const gstRate = getGSTRate(basePrice);
    const gst     = +(basePrice * gstRate).toFixed(2);

    return {
      date,
      basePrice,
      gstRate,
      gstLabel:   getGSTLabel(basePrice),
      gst,
      nightTotal: +(basePrice + gst).toFixed(2),
    };
  });

  const subtotal   = +nightBreakdown.reduce((s, n) => s + n.basePrice, 0).toFixed(2);
  const totalGST   = +nightBreakdown.reduce((s, n) => s + n.gst,       0).toFixed(2);
  const grandTotal = +(subtotal + totalGST).toFixed(2);

  return {
    nights:         nightBreakdown,
    subtotal:       +(subtotal   * quantity).toFixed(2),
    totalGST:       +(totalGST   * quantity).toFixed(2),
    grandTotal:     +(grandTotal * quantity).toFixed(2),
    quantity,
    numberOfNights: nights.length,
  };
};

/**
 * Refund rules:
 * > 48h before check-in: 100% refund
 * 24 - 48h before check-in: 50% refund
 * < 24h before check-in: 0% refund
 */
const calculateRefund = (grandTotal, hoursUntilCheckin) => {
  if (hoursUntilCheckin > 48) {
    return { refundAmount: grandTotal, refundPercent: 100, policy: 'Full refund (>48h before check-in)' };
  }
  if (hoursUntilCheckin >= 24) {
    return { refundAmount: +(grandTotal * 0.5).toFixed(2), refundPercent: 50, policy: '50% refund (24–48h before check-in)' };
  }
  return { refundAmount: 0, refundPercent: 0, policy: 'No refund (<24h before check-in)' };
};

module.exports = { calculatePriceBreakdown, calculateRefund };

