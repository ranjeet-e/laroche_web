const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { isValidStudentEmail } = require('../utils/emailValidator');
const { sendOtpEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

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

    if (isDev && process.env.EXPOSE_DEV_OTP === 'true') {
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

    const otp = crypto.randomInt(100000, 1000000).toString();

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

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

// @route POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('Google token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired Google authentication token' });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Google account does not have a verified email address' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const picture = payload.picture || '';

    // Find or create student user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Strict Security: All Google OAuth registrations default strictly to role: 'student'
      user = await User.create({
        name,
        email,
        role: 'student',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      isNewUser,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        picture,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  signup,
  login,
  googleLogin,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
