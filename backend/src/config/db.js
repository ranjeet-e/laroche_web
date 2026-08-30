const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ensureKitchenUser = async () => {
  try {
    const User = require('../models/User');
    const kitchenEmail = (process.env.KITCHEN_EMAIL || 'kitchen@larochecafe.com').toLowerCase();
    const existing = await User.findOne({ email: kitchenEmail });

    if (!existing) {
      const kitchenPassword = process.env.KITCHEN_PASSWORD || 'kitchen123';
      const hashedPassword = await bcrypt.hash(kitchenPassword, 10);
      await User.create({
        name: 'Kitchen Staff',
        email: kitchenEmail,
        password: hashedPassword,
        role: 'kitchen',
      });
      console.log(`✅ Default Kitchen Staff account initialized (${kitchenEmail})`);
    }
  } catch (err) {
    console.error(`Error ensuring kitchen user: ${err.message}`);
  }
};

const DEFAULT_MONGO_URI = 'mongodb+srv://ranjitepili08_db_user:lMTwp3IarUDmmlOP@cluster0.fkngqwf.mongodb.net/laroche_cafe?appName=Cluster0';

let cachedConn = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConn) {
    return cachedConn;
  }

  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
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

