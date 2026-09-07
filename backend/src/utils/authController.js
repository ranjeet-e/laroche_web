const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { isValidStudentEmail } = require('./emailValidator');
const { sendOtpEmail } = require('./emailService');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return secret;
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    getJwtSecret(),
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
    const { phone, mode } = req.body;
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    }

    const existingUser = await User.findOne({ phone: cleanPhone });

    // If user is trying to log in with phone, but has no account -> navigate to signup
    if (mode === 'login' && !existingUser) {
      return res.status(404).json({
        isNewUser: true,
        notFound: true,
        phone: cleanPhone,
        message: 'No account found with this phone number. Please create an account.',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in MongoDB with auto-expiry
    await Otp.findOneAndUpdate(
      { phone: cleanPhone },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log(`\n========================================`);
      console.log(`📲 [SMS OTP] Sent to +91 ${cleanPhone}: ${otp}`);
      console.log(`========================================\n`);
    }

    const responsePayload = {
      message: 'OTP sent successfully to +91 ' + cleanPhone,
      phone: cleanPhone,
      isNewUser: !existingUser,
    };

    if (isDev) {
      responsePayload.otp = otp;
    }

    res.status(200).json(responsePayload);
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
// Public student registration with Name, Phone, Email, Password
const signup = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;
    const cleanPhone = normalizePhone(phone);
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }
    if (!normalizedEmail || !isValidStudentEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(409).json({ message: 'An account with this phone number already exists. Please sign in.' });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: trimmedName,
      phone: cleanPhone,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
    });

    const token = generateToken(newUser);

    res.status(201).json({
      token,
      message: 'Account created successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
      },
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

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your registered email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate 6-digit reset code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Otp collection with auto-expiry
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Real Email via Nodemailer (asynchronously for instant UI response)
    sendOtpEmail({
      to: normalizedEmail,
      otp,
      type: 'reset',
    }).catch((err) => console.error('❌ [EmailService] Reset email error:', err.message));

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log(`\n========================================`);
      console.log(`🔑 [PASSWORD RESET OTP] Dispatched to ${normalizedEmail}: ${otp}`);
      console.log(`========================================\n`);
    }

    const responsePayload = {
      message: `Verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      otp, // Provided for instant testing assistance
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const cleanOtp = otp?.toString().trim();

    if (!normalizedEmail || !cleanOtp || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord || otpRecord.otp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new one.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear used reset OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Auto-login after password reset
    const token = generateToken(user);

    res.status(200).json({
      message: 'Password reset successful! You are now logged in.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-reset-otp
// Step 2 of password reset: verify OTP code before showing new password page
const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const cleanOtp = otp?.toString().trim();

    if (!normalizedEmail || !cleanOtp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord || otpRecord.otp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new one.' });
    }

    res.status(200).json({ message: 'Verification code confirmed', valid: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  signup,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};

