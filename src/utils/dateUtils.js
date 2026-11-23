const { TIMEZONE } = require('../config/constants');

const toISTMidnight = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// Check-in = 2:00 PM IST = 08:30 UTC
const getCheckinUTC = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 8, 30));
};

// Checkout = 12:00 PM IST = 06:30 UTC
const getCheckoutUTC = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 6, 30));
};

// Array of YYYY-MM-DD for each night (excludes checkout date)
const getNightsBetween = (checkIn, checkOut) => {
  const nights = [];
  const start = toISTMidnight(checkIn);
  const end   = toISTMidnight(checkOut);
  const cur   = new Date(start);
  while (cur < end) {
    nights.push(cur.toISOString().split('T')[0]);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return nights;
};

// Hours from now until check-in time in IST
const hoursUntilCheckin = (checkInDate) => {
  const checkin = getCheckinUTC(checkInDate);
  return (checkin - new Date()) / (1000 * 60 * 60);
};

const formatIST = (date) =>
  new Date(date).toLocaleString('en-IN', { timeZone: TIMEZONE });

module.exports = { toISTMidnight, getCheckinUTC, getCheckoutUTC, getNightsBetween, hoursUntilCheckin, formatIST };

