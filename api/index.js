const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB in serverless function:', err.message);
  }
  return app(req, res);
};
