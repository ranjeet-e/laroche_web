require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const KITCHEN_EMAIL = process.env.KITCHEN_EMAIL;
const KITCHEN_PASSWORD = process.env.KITCHEN_PASSWORD;

const createKitchenUser = async () => {
  try {
    if (!KITCHEN_EMAIL || !KITCHEN_PASSWORD) {
      console.error('Error: KITCHEN_EMAIL and KITCHEN_PASSWORD must be defined in your .env file.');
      process.exit(1);
    }
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI must be defined in your .env file.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    const hashedPassword = await bcrypt.hash(KITCHEN_PASSWORD, 10);

    const user = await User.findOneAndUpdate(
      { email: KITCHEN_EMAIL.toLowerCase() },
      {
        name: 'Kitchen Staff',
        email: KITCHEN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'kitchen',
      },
      { upsert: true, new: true }
    );

    console.log('==============================================');
    console.log('✅ Kitchen Staff Account Ready!');
    console.log(`📧 Login Email:    ${user.email}`);
    console.log(`🔑 Login Password: ${KITCHEN_PASSWORD}`);
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
};

createKitchenUser();
