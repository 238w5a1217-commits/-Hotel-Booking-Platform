const app = require('../src/app');
const connectDB = require('../src/config/db');
require('../src/scripts/seedData'); // Ensure bundled by @vercel/node

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database',
      error: err.message,
    });
  }
  return app(req, res);
};
