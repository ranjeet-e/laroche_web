require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const CMS_NAME = process.env.CMS_NAME || 'CMS Administrator';
const CMS_EMAIL = process.env.CMS_EMAIL || 'cms@larochecafe.com';
const CMS_PASSWORD = process.env.CMS_PASSWORD || 'cms123';

const createCmsUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected...');

    const hashedPassword = await bcrypt.hash(CMS_PASSWORD, 10);

    const user = await User.findOneAndUpdate(
      { email: CMS_EMAIL.toLowerCase() },
      {
        name: CMS_NAME,
        email: CMS_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'cms',
      },
      { upsert: true, new: true }
    );

    console.log('==============================================');
    console.log('✅ CMS Administrator Account Ready!');
    console.log(`👤 Name:           ${user.name}`);
    console.log(`📧 Login Email:    ${user.email}`);
    console.log(`🔑 Login Password: ${CMS_PASSWORD}`);
    console.log(`🛡️ Role:           ${user.role}`);
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Failed to create CMS user:', error.message);
    process.exit(1);
  }
};

createCmsUser();
