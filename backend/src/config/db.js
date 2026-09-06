const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ensureKitchenUser = async () => {
  try {
    const kitchenEmail = process.env.KITCHEN_EMAIL;
    const kitchenPassword = process.env.KITCHEN_PASSWORD;

    if (!kitchenEmail || !kitchenPassword) {
      return;
    }

    const User = require('../models/User');
    const existing = await User.findOne({ email: kitchenEmail.toLowerCase() });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(kitchenPassword, 10);
      await User.create({
        name: 'Kitchen Staff',
        email: kitchenEmail.toLowerCase(),
        password: hashedPassword,
        role: 'kitchen',
      });
      console.log(`✅ Default Kitchen Staff account initialized (${kitchenEmail.toLowerCase()})`);
    }
  } catch (err) {
    console.error(`Error ensuring kitchen user: ${err.message}`);
  }
};

let cachedConn = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConn) {
    return cachedConn;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined.');
  }

  try {
    cachedConn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected: ${cachedConn.connection.host}`);
    
    // Automatically reconcile & fix any outdated database indexes
    try {
      const User = require('../models/User');
      await User.syncIndexes();
      console.log('✅ User database indexes synchronized');
    } catch (indexErr) {
      console.warn('Index sync notice:', indexErr.message);
    }

    await ensureKitchenUser();
    return cachedConn;
  } catch (error) {
    cachedConn = null;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

