const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { isValidStudentEmail } = require('../utils/emailValidator');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Normalize 10-digit phone number
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
};

// @route POST /api/auth/send-otp
const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in MongoDB with auto-expiry
    await Otp.findOneAndUpdate(
      { phone: cleanPhone },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`\n========================================`);
    console.log(`📲 [SMS OTP] Sent to +91 ${cleanPhone}: ${otp}`);
    console.log(`========================================\n`);

    res.status(200).json({
      message: 'OTP sent successfully to +91 ' + cleanPhone,
      phone: cleanPhone,
      otp, // included for easy testing and instant auto-fill
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;
    const cleanPhone = normalizePhone(phone);
    const cleanOtp = otp?.toString().trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    if (!cleanOtp || cleanOtp.length < 4) {
      return res.status(400).json({ message: 'Please enter the verification code' });
    }

    const otpRecord = await Otp.findOne({ phone: cleanPhone });
    if (!otpRecord || otpRecord.otp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Clear used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Find or create student user
    let user = await User.findOne({ phone: cleanPhone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const userName = name?.trim() || `Student ${cleanPhone.slice(-4)}`;
      user = await User.create({
        name: userName,
        phone: cleanPhone,
        role: 'student',
      });
    } else if (name && name.trim() && user.name.startsWith('Student ')) {
      user.name = name.trim();
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      isNewUser,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/signup
// Public student signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedName = name?.trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidStudentEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a valid email address' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
    });

    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
// Shared by both student and kitchen — role is determined by what's stored in DB
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp, signup, login };
