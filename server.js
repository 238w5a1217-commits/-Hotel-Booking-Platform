require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startCronJobs } = require('./src/jobs/cronJobs');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Ajintara backend running on port ${PORT} [${process.env.NODE_ENV}]`);
      startCronJobs();
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });

