const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows, ISP DNS, & Serverless querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // In environments where custom DNS setServers is restricted
}

let cachedPromise = null;

const connectDB = async () => {
  // Reuse existing connection in warm serverless containers (Vercel / AWS Lambda)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing. Please define it in your .env file or hosting environment variables.');
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri, {
      dbName: 'ajintara',
      serverSelectionTimeoutMS: 15000,
    });
  }

  try {
    const conn = await cachedPromise;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host} [database: ${conn.connection.name}]`);
    return conn;
  } catch (err) {
    cachedPromise = null;
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 [DNS RESOLUTION NOTICE]: The network DNS refused the MongoDB SRV query.');
      console.error('   Fix: Google Public DNS (8.8.8.8) has been configured.\n');
    }
    throw err;
  }
};

module.exports = connectDB;
