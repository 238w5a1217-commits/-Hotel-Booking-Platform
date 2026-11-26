require('dotenv').config();
const dns = require('dns');
if (process.platform === 'win32') {
  try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
}

const connectDB = require('../config/db');
const { seedDatabase } = require('./seedData');

const run = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');
  const result = await seedDatabase(true);
  console.log('\n======================================================');
  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('------------------------------------------------------');
  console.log('👤 Admin:   admin@ajintara.com   / Admin@123');
  console.log('👤 Partner: partner@ajintara.com / Partner@123');
  console.log('👤 Guest:   guest@ajintara.com   / Guest@123');
  console.log(`🏨 Seeded ${result.propertiesCount} properties with ${result.roomsCount} custom-priced rooms`);
  console.log('======================================================\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
