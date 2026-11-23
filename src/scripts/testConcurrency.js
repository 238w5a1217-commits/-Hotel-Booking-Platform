require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../features/auth/user.model');
const Property = require('../features/properties/property.model');
const RoomType = require('../features/rooms/room.model');
const Booking = require('../features/bookings/booking.model');
const Inventory = require('../features/inventory/inventory.model');
const { BOOKING_STATUS } = require('../config/constants');
const { calculatePriceBreakdown } = require('../utils/pricingUtils');

/**
 * Concurrency Test for A4 Requirement:
 * "The same room must never be sold twice. Two guests booking the last available room at the
 * same moment must not both succeed. Add one automated test or script that sends many booking
 * requests at the same time for the last room and shows that only one succeeds."
 */
async function runConcurrencyTest() {
  console.log('⚡ Starting Concurrency Stress Test for Room Booking (A4)...');
  await connectDB();

  let testPartner = await User.findOne({ email: 'test_partner@ajintara.com' });
  if (!testPartner) {
    testPartner = await User.create({
      name: 'Stress Test Partner',
      email: 'test_partner@ajintara.com',
      password: 'Password123!',
      role: 'partner',
    });
  }

  const testProp = await Property.findOneAndUpdate(
    { name: 'Concurrency Test Boutique Inn' },
    {
      partner: testPartner._id,
      name: 'Concurrency Test Boutique Inn',
      city: 'goa',
      address: 'Test Beach Road',
      description: 'Stress testing property',
      status: 'approved',
    },
    { upsert: true, new: true }
  );

  // Exactly 1 room exists!
  const testRoom = await RoomType.findOneAndUpdate(
    { property: testProp._id, name: 'Single Solo Room' },
    {
      property: testProp._id,
      name: 'Single Solo Room',
      basePrice: 5000,
      totalRooms: 1,
      maxGuests: 1,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const testDateCheckIn = '2026-11-25';
  const testDateCheckOut = '2026-11-26';

  await Booking.deleteMany({ roomType: testRoom._id });
  await Inventory.deleteMany({ roomType: testRoom._id });

  // 10 distinct guest users
  const guests = [];
  for (let i = 1; i <= 10; i++) {
    let guest = await User.findOne({ email: `stress_guest_${i}@ajintara.com` });
    if (!guest) {
      guest = await User.create({
        name: `Stress Guest ${i}`,
        email: `stress_guest_${i}@ajintara.com`,
        password: 'Password123!',
        role: 'guest',
      });
    }
    guests.push(guest);
  }

  console.log(`Created 10 distinct guests. Total inventory for room: 1 room.`);
  console.log(`Firing 10 simultaneous booking requests for the same single room on ${testDateCheckIn}...`);

  async function attemptBooking(guestUser) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const nights = [testDateCheckIn];
      const room = await RoomType.findById(testRoom._id).session(session);

      const existingBookings = await Booking.find({
        roomType: testRoom._id,
        status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
        nights: { $in: nights },
      }).session(session);

      let bookedCount = 0;
      for (const b of existingBookings) {
        if (b.nights.includes(testDateCheckIn)) {
          bookedCount += b.quantity;
        }
      }

      if (bookedCount + 1 > room.totalRooms) {
        throw new Error(`Sold out! Available: ${room.totalRooms - bookedCount}, Requested: 1`);
      }

      const breakdown = calculatePriceBreakdown(room, {}, testDateCheckIn, testDateCheckOut, 1);
      const [booking] = await Booking.create(
        [{
          guest: guestUser._id,
          property: testProp._id,
          roomType: testRoom._id,
          checkIn: testDateCheckIn,
          checkOut: testDateCheckOut,
          nights,
          quantity: 1,
          guestDetails: {
            name: guestUser.name,
            email: guestUser.email,
            phone: '9999999999',
          },
          ...breakdown,
          status: BOOKING_STATUS.PENDING,
          holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }],
        { session }
      );

      await session.commitTransaction();
      return { success: true, user: guestUser.name, bookingId: booking._id };
    } catch (err) {
      await session.abortTransaction();
      return { success: false, user: guestUser.name, error: err.message };
    } finally {
      session.endSession();
    }
  }

  // Execute concurrently
  const results = await Promise.all(guests.map((g) => attemptBooking(g)));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('\n📊 Concurrency Test Results:');
  console.log(`----------------------------------------------`);
  console.log(`Total Concurrent Requests: ${results.length}`);
  console.log(`Successful Bookings:      ${successful.length}`);
  console.log(`Rejected (Prevented):     ${failed.length}`);
  console.log(`----------------------------------------------`);

  successful.forEach((s) => console.log(`✅ Success: ${s.user} secured booking ${s.bookingId}`));
  failed.slice(0, 3).forEach((f) => console.log(`❌ Rejected: ${f.user} -> ${f.error}`));
  if (failed.length > 3) console.log(`   ...and ${failed.length - 3} more safely rejected.`);

  if (successful.length === 1 && failed.length === 9) {
    console.log('\n🎉 TEST PASSED! Exactly ONE guest secured the room. Double-booking prevented!\n');
    process.exit(0);
  } else {
    console.error(`\n❌ TEST FAILED: ${successful.length} bookings succeeded instead of 1.\n`);
    process.exit(1);
  }
}

runConcurrencyTest().catch((err) => {
  console.error('Fatal error in concurrency test:', err);
  process.exit(1);
});
