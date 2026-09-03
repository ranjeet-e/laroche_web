import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Smartphone, Mail, Lock, User, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import {
  sendOtp as sendOtpService,
  verifyOtp as verifyOtpService,
  login as loginService,
  signup as signupService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from '../services/authService';
import { useAuth } from '../context/AuthContext';
import {
  isValidPhoneNumber,
  isValidOtp,
  validateLoginForm,
  validateSignupForm,
} from '../utils/validators';
import './Auth.css';

const Auth = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [signupMethod, setSignupMethod] = useState('phone'); // 'phone' | 'email'

  // Phone OTP States (Passwordless)
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneStep, setPhoneStep] = useState('enter_phone'); // 'enter_phone' | 'enter_otp'
  const [receivedOtp, setReceivedOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Email States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState('enter_email'); // 'enter_email' | 'enter_otp'
  const [forgotReceivedOtp, setForgotReceivedOtp] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);

  // Status & Errors
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const otpInputRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  }, [initialMode, location.pathname]);

  // Countdown timer for Phone OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Countdown timer for Forgot Password OTP
  useEffect(() => {
    let timer;
    if (forgotCountdown > 0) {
      timer = setTimeout(() => setForgotCountdown(forgotCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotCountdown]);

  useEffect(() => {
    if (phoneStep === 'enter_otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [phoneStep]);

  const switchTo = (next) => {
    setMode(next);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setPhoneStep('enter_phone');
    setOtp('');
    setForgotStep('enter_email');
    setForgotOtp('');
    setForgotNewPassword('');
    if (next === 'signup') navigate('/signup');
    else if (next === 'login') navigate('/login');
  };

  const handlePostAuthRedirect = (data) => {
    login(data);
    if (from) {
      navigate(from);
    } else if (data.user?.role === 'kitchen') {
      navigate('/kitchen/dashboard');
    } else {
      navigate('/menu');
    }
  };

  // ---------------- PHONE OTP FLOW (PASSWORDLESS) ----------------
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!isValidPhoneNumber(cleanPhone)) {
      setErrors({ phone: 'Enter a valid 10-digit mobile number' });
      return;
    }

    if (mode === 'signup' && !userName.trim()) {
      setErrors({ userName: 'Please enter your name' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await sendOtpService({ phone: cleanPhone });
      setPhoneStep('enter_otp');
      setCountdown(30);
      if (res.otp) {
        setReceivedOtp(res.otp);
      }
      setSuccessMessage(`Verification code sent to +91 ${cleanPhone}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setServerError('');

    const cleanOtp = otp.trim();
    if (!isValidOtp(cleanOtp)) {
      setErrors({ otp: 'Please enter a valid 6-digit code' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await verifyOtpService({
        phone: phone.replace(/\D/g, ''),
        otp: cleanOtp,
        name: userName.trim(),
      });
      handlePostAuthRedirect(res);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EMAIL PASSWORD FLOW ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const submissionData = {
      email: loginData.email.trim(),
      password: loginData.password,
    };

    const validationErrors = validateLoginForm(submissionData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await loginService(submissionData);
      handlePostAuthRedirect(data);
    } catch (err) {
      if (!err.response && (err.message === 'Network Error' || !err.status)) {
        setServerError('Cannot connect to backend server. Please verify network connection.');
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
        setServerError('API endpoint not found. Ensure backend is running.');
      } else {
        setServerError(err.response?.data?.message || 'Invalid credentials. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const submissionData = {
      name: signupData.name.trim(),
      email: signupData.email.trim(),
      password: signupData.password,
      role: 'student',
    };

    const validationErrors = validateSignupForm(submissionData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await signupService(submissionData);
      handlePostAuthRedirect(data);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD FLOW ----------------
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrors({ forgotEmail: 'Please enter a valid email address' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await forgotPasswordService({ email: cleanEmail });
      setForgotStep('enter_otp');
      setForgotCountdown(45);
      if (res.otp) {
        setForgotReceivedOtp(res.otp);
      }
      setSuccessMessage(`Reset code sent to ${cleanEmail}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to send reset code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const cleanOtp = forgotOtp.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setErrors({ forgotOtp: 'Enter the 6-digit verification code' });
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrors({ forgotNewPassword: 'Password must be at least 6 characters' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await resetPasswordService({
        email: cleanEmail,
        otp: cleanOtp,
        newPassword: forgotNewPassword,
      });
      handlePostAuthRedirect(data);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to reset password. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-oat">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 shadow-warm-xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Subtle Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <img
              src="/logo2.png"
              alt="La Roche Cafe"
              className="h-12 w-auto mx-auto object-contain mix-blend-multiply"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso tracking-tight">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-taupe mt-1">
            {mode === 'signup'
              ? 'Join La Roche to preorder meals & skip the queue'
              : 'Sign in to track orders and preorder your favorite dishes'}
          </p>
        </div>

        {/* Mode Toggle (Sign In vs Sign Up) */}
        <div className="flex bg-stone-100 p-1 rounded-full mb-6 border border-stone-200/60">
          <button
            type="button"
            onClick={() => switchTo('login')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-espresso shadow-warm-sm'
                : 'text-taupe hover:text-espresso'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTo('signup')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-espresso shadow-warm-sm'
                : 'text-taupe hover:text-espresso'
            }`}
          >
            Register
          </button>
        </div>

        {/* Method Sub-Toggle: Mobile OTP vs Email */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              if (mode === 'login') setLoginMethod('phone');
              else setSignupMethod('phone');
              setServerError('');
              setErrors({});
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              (mode === 'login' ? loginMethod === 'phone' : signupMethod === 'phone')
                ? 'bg-espresso text-white border-espresso shadow-sm'
                : 'bg-white text-taupe border-stone-200 hover:border-stone-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode === 'login') setLoginMethod('email');
              else setSignupMethod('email');
              setServerError('');
              setErrors({});
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              (mode === 'login' ? loginMethod === 'email' : signupMethod === 'email')
                ? 'bg-espresso text-white border-espresso shadow-sm'
                : 'bg-white text-taupe border-stone-200 hover:border-stone-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Password</span>
          </button>
        </div>

        {/* Server Feedback Alerts */}
        {serverError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-5">
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium mb-5">
            {successMessage}
          </div>
        )}

        {/* ---------------- LOGIN FORM ---------------- */}
        {mode === 'login' && (
          loginMethod === 'phone' ? (
            phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-taupe mb-1.5">Mobile Number</label>
                  <div className="flex items-center rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden focus-within:border-terracotta focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/10 transition-all">
                    <span className="px-3.5 py-3 bg-stone-100 text-espresso text-xs font-bold border-r border-stone-200">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      className="w-full px-3.5 py-3 bg-transparent text-espresso placeholder:text-stone-400 text-sm font-semibold focus:outline-none"
                      placeholder="10-digit number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (errors.phone) setErrors({});
                      }}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.phone}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Sending code...' : 'Get OTP Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-taupe mb-1">
                  <span>Sent to <strong>+91 {phone}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('enter_phone');
                      setOtp('');
                    }}
                    className="text-terracotta font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                {receivedOtp && (
                  <div
                    onClick={() => {
                      setOtp(receivedOtp);
                      if (errors.otp) setErrors({});
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium cursor-pointer hover:bg-amber-100 transition-colors flex items-center justify-between"
                  >
                    <span>💡 OTP: <strong>{receivedOtp}</strong></span>
                    <span className="font-bold underline text-[11px]">Click to fill</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-taupe mb-1.5">Verification Code</label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso text-center tracking-[8px] font-extrabold text-xl focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    placeholder="••••••"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                  />
                  {errors.otp && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.otp}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <span className="text-xs text-taupe">Resend code in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs font-bold text-terracotta hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="your.name@example.com"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-taupe">Password</label>
                  <button
                    type="button"
                    onClick={() => switchTo('forgot')}
                    className="text-xs font-bold text-terracotta hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                {errors.password && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )
        )}

        {/* ---------------- REGISTER FORM ---------------- */}
        {mode === 'signup' && (
          signupMethod === 'phone' ? (
            phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-taupe mb-1.5">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                      placeholder="Your full name"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (errors.userName) setErrors({});
                      }}
                    />
                  </div>
                  {errors.userName && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.userName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-taupe mb-1.5">Mobile Number</label>
                  <div className="flex items-center rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden focus-within:border-terracotta focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/10 transition-all">
                    <span className="px-3.5 py-3 bg-stone-100 text-espresso text-xs font-bold border-r border-stone-200">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      className="w-full px-3.5 py-3 bg-transparent text-espresso placeholder:text-stone-400 text-sm font-semibold focus:outline-none"
                      placeholder="10-digit number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (errors.phone) setErrors({});
                      }}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.phone}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Sending code...' : 'Register with OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-taupe mb-1">
                  <span>Sent to <strong>+91 {phone}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('enter_phone');
                      setOtp('');
                    }}
                    className="text-terracotta font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-taupe mb-1.5">Verification Code</label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso text-center tracking-[8px] font-extrabold text-xl focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    placeholder="••••••"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                  />
                  {errors.otp && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.otp}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Verify & Register'}
                </button>

                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <span className="text-xs text-taupe">Resend code in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs font-bold text-terracotta hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="w-full h-11 px-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="w-full h-11 px-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="your.name@example.com"
                />
                {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Create Password</label>
                <input
                  type="password"
                  className="w-full h-11 px-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="Min 6 characters"
                />
                {errors.password && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )
        )}

        {/* ---------------- FORGOT PASSWORD FORM ---------------- */}
        {mode === 'forgot' && (
          forgotStep === 'enter_email' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Registered Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (errors.forgotEmail) setErrors({});
                    }}
                    placeholder="Enter your registered email"
                  />
                </div>
                {errors.forgotEmail && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.forgotEmail}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !forgotEmail}
                className="w-full py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending code...' : 'Send Reset Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTo('login')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-taupe hover:text-espresso transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs text-taupe mb-1">
                <span>Reset code sent to <strong>{forgotEmail}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('enter_email');
                    setForgotOtp('');
                  }}
                  className="text-terracotta font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso text-center tracking-[8px] font-extrabold text-xl focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                  placeholder="••••••"
                  value={forgotOtp}
                  maxLength={6}
                  onChange={(e) => {
                    setForgotOtp(e.target.value.replace(/\D/g, ''));
                    if (errors.forgotOtp) setErrors({});
                  }}
                />
                {errors.forgotOtp && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.forgotOtp}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      if (errors.forgotNewPassword) setErrors({});
                    }}
                    placeholder="Enter at least 6 characters"
                  />
                </div>
                {errors.forgotNewPassword && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.forgotNewPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || forgotOtp.length !== 6 || forgotNewPassword.length < 6}
                className="w-full py-3.5 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting password...' : 'Update Password & Sign In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTo('login')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-taupe hover:text-espresso transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )
        )}

      </div>
    </div>
  );
};

export default Auth;
