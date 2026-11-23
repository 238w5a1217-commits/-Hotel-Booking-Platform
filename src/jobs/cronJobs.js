const cron    = require('node-cron');
const Booking = require('../features/bookings/booking.model');
const { BOOKING_STATUS } = require('../config/constants');

// Release expired 10-minute holds (Part B3)
const releaseExpiredHolds = async () => {
  try {
    const result = await Booking.updateMany(
      { status: BOOKING_STATUS.PENDING, holdExpiresAt: { $lt: new Date() } },
      { $set: { status: BOOKING_STATUS.CANCELLED, cancelledAt: new Date() } }
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ [cron] Released ${result.modifiedCount} expired booking hold(s)`);
    }
  } catch (err) {
    console.error('❌ [cron] releaseExpiredHolds error:', err.message);
  }
};

const startCronJobs = () => {
  cron.schedule('* * * * *', releaseExpiredHolds);
  console.log('🕐 Background cron jobs started');
};

module.exports = { startCronJobs };

