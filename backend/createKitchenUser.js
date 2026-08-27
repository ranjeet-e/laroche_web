require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const KITCHEN_EMAIL = 'kitchen@larochecafe.com';
const KITCHEN_PASSWORD = 'kitchen123'; // change this to whatever you want

const createKitchenUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    const existing = await User.findOne({ email: KITCHEN_EMAIL });
    if (existing) {
      console.log('Kitchen user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(KITCHEN_PASSWORD, 10);

    await User.create({
      name: 'Kitchen Staff',
      email: KITCHEN_EMAIL,
      password: hashedPassword,
      role: 'kitchen',
    });

    console.log('Kitchen user created!');
    console.log(`Email: ${KITCHEN_EMAIL}`);
    console.log(`Password: ${KITCHEN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
};

createKitchenUser();
