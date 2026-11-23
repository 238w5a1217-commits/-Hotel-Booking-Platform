module.exports = {
  ROLES: {
    GUEST:   'guest',
    PARTNER: 'partner',
    ADMIN:   'admin',
  },
  PROPERTY_STATUS: {
    PENDING:  'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  BOOKING_STATUS: {
    PENDING:   'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  PAYMENT_STATUS: {
    PENDING:   'pending',
    COMPLETED: 'completed',
    FAILED:    'failed',
    REFUNDED:  'refunded',
  },
  CHECKIN_HOUR:          14,   // 2:00 PM IST
  CHECKOUT_HOUR:         12,   // 12:00 PM IST
  HOLD_DURATION_MINUTES: 10,
  TIMEZONE:              'Asia/Kolkata',
};

