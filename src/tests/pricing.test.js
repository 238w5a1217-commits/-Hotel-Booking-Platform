const { calculatePriceBreakdown, calculateRefund } = require('../utils/pricingUtils');

describe('Pricing Breakdown & Per-Night GST Calculation (A3)', () => {
  const standardRoom = { basePrice: 5000 };
  const invMap = {};

  test('calculates correct number of nights for booking stay', () => {
    const res = calculatePriceBreakdown(standardRoom, invMap, '2026-12-24', '2026-12-26', 1);
    expect(res.numberOfNights).toBe(2);
    expect(res.nights.length).toBe(2);
  });

  test('subtotal equals sum of nightly base prices', () => {
    const res = calculatePriceBreakdown(standardRoom, invMap, '2026-12-24', '2026-12-26', 1);
    expect(res.subtotal).toBe(10000);
  });

  test('applies 5% GST slab when night price is <= 7,500', () => {
    const res = calculatePriceBreakdown(standardRoom, invMap, '2026-12-24', '2026-12-25', 1);
    expect(res.nights[0].gstRate).toBe(0.05);
    expect(res.nights[0].gst).toBe(250);
    expect(res.nights[0].nightTotal).toBe(5250);
  });

  test('applies 18% GST slab when night price is > 7,500', () => {
    const luxuryRoom = { basePrice: 10000 };
    const res = calculatePriceBreakdown(luxuryRoom, invMap, '2026-12-24', '2026-12-25', 1);
    expect(res.nights[0].gstRate).toBe(0.18);
    expect(res.nights[0].gst).toBe(1800);
    expect(res.nights[0].nightTotal).toBe(11800);
  });

  test('correctly uses date-specific inventory price override for pricing & GST', () => {
    const invWithOverride = { '2026-12-24': { price: 9000 } };
    const res = calculatePriceBreakdown(standardRoom, invWithOverride, '2026-12-24', '2026-12-25', 1);
    expect(res.nights[0].basePrice).toBe(9000);
    expect(res.nights[0].gstRate).toBe(0.18); // 9000 is > 7500 -> 18%
    expect(res.nights[0].gst).toBe(1620);
  });

  test('multiplies subtotal and GST by quantity of rooms', () => {
    const res = calculatePriceBreakdown(standardRoom, invMap, '2026-12-24', '2026-12-25', 3);
    expect(res.quantity).toBe(3);
    expect(res.subtotal).toBe(15000);
    expect(res.totalGST).toBe(750);
    expect(res.grandTotal).toBe(15750);
  });
});

describe('Cancellation Policy & Refund Windows in IST (A3 & A5)', () => {
  test('returns 100% full refund when cancelling > 48h before check-in', () => {
    const { refundAmount, refundPercent } = calculateRefund(10000, 72);
    expect(refundPercent).toBe(100);
    expect(refundAmount).toBe(10000);
  });

  test('returns 50% refund when cancelling between 24 and 48h before check-in', () => {
    const { refundAmount, refundPercent } = calculateRefund(10000, 36);
    expect(refundPercent).toBe(50);
    expect(refundAmount).toBe(5000);
  });

  test('returns 0% refund when cancelling < 24h before check-in', () => {
    const { refundAmount, refundPercent } = calculateRefund(10000, 12);
    expect(refundPercent).toBe(0);
    expect(refundAmount).toBe(0);
  });
});

