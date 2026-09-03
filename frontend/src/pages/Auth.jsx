import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { Smartphone, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Mode: 'login' | 'signup' | 'forgot'
  const isSignupRoute = location.pathname === '/signup' || initialMode === 'signup';
  const [mode, setMode] = useState(isSignupRoute ? 'signup' : 'login');
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'

  // Phone OTP States (Sign In)
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState('enter_phone'); // 'enter_phone' | 'enter_otp'
  const [countdown, setCountdown] = useState(0);

  // Email Sign In States
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Dedicated Create Account States (Name, Phone, Email, Password)
  const [signupData, setSignupData] = useState({
    name: '',
    phone: searchParams.get('phone') || '',
    email: '',
    password: '',
  });

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState('enter_email'); // 'enter_email' | 'enter_otp'
  const [forgotCountdown, setForgotCountdown] = useState(0);

  // Status & Feedback
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef(null);

  // Sync route changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
    setErrors({});
    setServerError('');
    const queryPhone = searchParams.get('phone');
    if (queryPhone) {
      setPhone(queryPhone);
      setSignupData((prev) => ({ ...prev, phone: queryPhone }));
      if (searchParams.get('notice') === 'not_found') {
        setServerError(`No account found for +91 ${queryPhone}. Please complete registration below.`);
      }
    }
  }, [location.pathname, searchParams]);

  // Countdown timers
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const handlePostAuthRedirect = (data) => {
    login(data);
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      navigate(redirectParam);
    } else if (data.user?.role === 'kitchen') {
      navigate('/kitchen/dashboard');
    } else {
      navigate('/checkout');
    }
  };

  // ---------------- PHONE SIGN IN FLOW ----------------
  const handleSendLoginOtp = async (e) => {
    if (e) e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!isValidPhoneNumber(cleanPhone)) {
      setErrors({ phone: 'Enter a valid 10-digit mobile number' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await sendOtpService({ phone: cleanPhone, mode: 'login' });
      setPhoneStep('enter_otp');
      setCountdown(30);
      setSuccessMessage(`Verification code sent to +91 ${cleanPhone}`);
    } catch (err) {
      // 1st time customer detection -> redirect to create account page!
      if (err.response?.status === 404 || err.response?.data?.notFound) {
        const redirectParam = searchParams.get('redirect') ? `&redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';
        navigate(`/signup?phone=${cleanPhone}&notice=not_found${redirectParam}`);
        return;
      }
      setServerError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
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
      });
      handlePostAuthRedirect(res);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EMAIL SIGN IN FLOW ----------------
  const handleEmailLoginSubmit = async (e) => {
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
      if (err.response?.status === 401 || err.response?.status === 404) {
        setServerError('Invalid credentials. If you are a new customer, please create an account.');
      } else {
        setServerError(err.response?.data?.message || 'Login failed. Please verify email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DEDICATED CREATE ACCOUNT FLOW ----------------
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const cleanPhone = signupData.phone.replace(/\D/g, '');
    const cleanName = signupData.name.trim();
    const cleanEmail = signupData.email.trim().toLowerCase();
    const password = signupData.password;

    const newErrors = {};
    if (!cleanName) newErrors.name = 'Full name is required';
    if (!isValidPhoneNumber(cleanPhone)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!cleanEmail || !cleanEmail.includes('@')) newErrors.email = 'Valid email address is required';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await signupService({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password,
      });
      handlePostAuthRedirect(data);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Account creation failed. Please try again.');
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
      setErrors({ forgotEmail: 'Please enter a valid registered email' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await forgotPasswordService({ email: cleanEmail });
      setForgotStep('enter_otp');
      setForgotCountdown(45);
      setSuccessMessage(`Reset code sent to ${cleanEmail}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to send reset code. Please check your email.');
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
      setServerError(err.response?.data?.message || 'Password reset failed. Code may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const searchParamStr = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-oat">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 shadow-warm-xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <img
              src="/logo2.png"
              alt="La Roche Cafe"
              className="h-12 w-auto mx-auto object-contain mix-blend-multiply dark:mix-blend-screen"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-espresso tracking-tight">
            {mode === 'signup'
              ? 'Create Customer Account'
              : mode === 'forgot'
              ? 'Reset Password'
              : 'Sign In to La Roche'}
          </h2>
          <p className="text-xs sm:text-sm text-taupe mt-1">
            {mode === 'signup'
              ? 'Join La Roche Cafe for quick ordering & instant counter pickup'
              : mode === 'forgot'
              ? 'Enter your email to receive a password reset code'
              : 'Preorder your favorites & skip the counter queue'}
          </p>
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

        {/* =========================================================================
            1. SIGN IN VIEW (/login)
           ========================================================================= */}
        {mode === 'login' && (
          <div>
            {/* 2 Sign In Methods Sub-Toggle */}
            <div className="flex bg-stone-100 dark:bg-stone-800/60 p-1 rounded-full mb-6 border border-stone-200/60 dark:border-stone-700">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone');
                  setServerError('');
                  setErrors({});
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'phone'
                    ? 'bg-white dark:bg-stone-700 text-espresso dark:text-white shadow-warm-sm'
                    : 'text-taupe hover:text-espresso dark:text-stone-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone No. & OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setServerError('');
                  setErrors({});
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'bg-white dark:bg-stone-700 text-espresso dark:text-white shadow-warm-sm'
                    : 'text-taupe hover:text-espresso dark:text-stone-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>
            </div>

            {/* Method 1: Phone OTP Sign In */}
            {loginMethod === 'phone' && (
              phoneStep === 'enter_phone' ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-taupe mb-1.5">Mobile Number</label>
                    <div className="flex items-center rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden focus-within:border-terracotta focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/10 transition-all">
                      <span className="px-3.5 py-3 bg-stone-100 text-espresso text-xs font-bold border-r border-stone-200">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        className="w-full px-3.5 py-3 bg-transparent text-espresso placeholder:text-stone-400 text-sm font-semibold focus:outline-none"
                        placeholder="Enter 10-digit mobile"
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
                    <span>{loading ? 'Sending code...' : 'Sign In via OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
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
                    className="w-full py-3.5 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify & Proceed'}
                  </button>
                </form>
              )
            )}

            {/* Method 2: Email & Password Sign In */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
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
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-taupe">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setServerError('');
                        setSuccessMessage('');
                        setForgotStep('enter_email');
                      }}
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
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Prominent Link to Create Account */}
            <div className="mt-8 pt-5 border-t border-stone-100 text-center">
              <p className="text-xs text-taupe mb-2">First time at La Roche?</p>
              <Link
                to={`/signup${searchParamStr}`}
                className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-full border-2 border-terracotta/30 text-terracotta hover:bg-terracotta/5 font-bold text-xs sm:text-sm transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>Create an Account</span>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. DEDICATED CREATE ACCOUNT VIEW (/signup)
           ========================================================================= */}
        {mode === 'signup' && (
          <div>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Full Name</label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Phone Number</label>
                <div className="flex items-center rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden focus-within:border-terracotta focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/10 transition-all">
                  <span className="px-3.5 py-3 bg-stone-100 text-espresso text-xs font-bold border-r border-stone-200">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    className="w-full px-3.5 py-3 bg-transparent text-espresso placeholder:text-stone-400 text-sm font-semibold focus:outline-none"
                    placeholder="10-digit mobile"
                    value={signupData.phone}
                    maxLength={10}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="yourname@gmail.com"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Create Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="At least 6 characters"
                  />
                </div>
                {errors.password && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Sign Up & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-stone-100 text-center">
              <p className="text-xs text-taupe mb-2">Already have an account?</p>
              <Link
                to={`/login${searchParamStr}`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-espresso hover:text-terracotta transition-colors"
              >
                <span>Sign In Here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. FORGOT PASSWORD VIEW
           ========================================================================= */}
        {mode === 'forgot' && (
          forgotStep === 'enter_email' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Registered Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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
                  onClick={() => setMode('login')}
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
                <span>Sent to <strong>{forgotEmail}</strong></span>
                <button
                  type="button"
                  onClick={() => setForgotStep('enter_email')}
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
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
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
                    onChange={(e) => setForgotNewPassword(e.target.value)}
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
                {loading ? 'Updating...' : 'Update Password & Sign In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
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

