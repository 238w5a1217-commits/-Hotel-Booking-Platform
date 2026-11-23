const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows & ISP DNS querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // In environments where setServers is restricted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 [DNS RESOLUTION NOTICE]: Your local network DNS refused the MongoDB SRV query.');
      console.error('   Fix: Google Public DNS (8.8.8.8) has been configured. If your ISP/firewall blocks custom DNS,');
      console.error('   use the standard (non-srv) connection string from MongoDB Atlas.\n');
    }
    throw err;
  }
};

module.exports = connectDB;
