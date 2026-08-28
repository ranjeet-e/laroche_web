import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  sendOtp as sendOtpService,
  verifyOtp as verifyOtpService,
  login as loginService,
  signup as signupService,
} from '../services/authService';
import { useAuth } from '../context/AuthContext';
import {
  isValidPhoneNumber,
  isValidOtp,
  validateLoginForm,
  validateSignupForm,
} from '../utils/validators';
import './Auth.css';

const Auth = ({ initialMode = 'phone' }) => {
  // authType: 'phone' | 'email'
  const [authType, setAuthType] = useState('phone');
  // phoneStep: 'enter_phone' | 'enter_otp'
  const [phoneStep, setPhoneStep] = useState('enter_phone');
  
  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userName, setUserName] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Email form state
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'signup'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  // General state
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const otpInputRef = useRef(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus OTP input when transitioning to OTP step
  useEffect(() => {
    if (phoneStep === 'enter_otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [phoneStep]);

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

  // --- Phone OTP Handlers ---
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!isValidPhoneNumber(cleanPhone)) {
      setErrors({ phone: 'Please enter a valid 10-digit mobile number' });
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
      setSuccessMessage(`OTP sent to +91 ${cleanPhone}`);
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
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
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
      setServerError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Email Handlers ---
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
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

  return (
    <div className="auth-page">
      <div className="auth-card-single">
        {/* Brand Logo & Welcome */}
        <div className="auth-brand-header">
          <img src="/logo2.png" alt="La Roche Cafe" className="auth-header-logo" />
          <h2>Welcome to La Roche Cafe</h2>
          <p>Order food in seconds & skip the canteen queue</p>
        </div>

        {/* Tab Switcher: Phone OTP vs Email */}
        <div className="auth-mode-pill-toggle">
          <button
            type="button"
            className={`mode-pill ${authType === 'phone' ? 'mode-pill-active' : ''}`}
            onClick={() => {
              setAuthType('phone');
              setServerError('');
              setErrors({});
            }}
          >
            📱 Phone Number
          </button>
          <button
            type="button"
            className={`mode-pill ${authType === 'email' ? 'mode-pill-active' : ''}`}
            onClick={() => {
              setAuthType('email');
              setServerError('');
              setErrors({});
            }}
          >
            ✉️ Email & Password
          </button>
        </div>

        {serverError && <div className="auth-alert auth-alert-error">{serverError}</div>}
        {successMessage && <div className="auth-alert auth-alert-success">{successMessage}</div>}

        {/* ----------------- PHONE OTP FLOW ----------------- */}
        {authType === 'phone' && (
          <div className="phone-auth-container">
            {phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">🇮🇳 +91</span>
                    <input
                      type="tel"
                      className="phone-input"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                        if (errors.phone) setErrors({});
                      }}
                      autoFocus
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? 'Sending OTP...' : 'Get Verification Code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-phone-header">
                  <span>
                    Sent to <strong>+91 {phone}</strong>
                  </span>
                  <button
                    type="button"
                    className="edit-phone-btn"
                    onClick={() => {
                      setPhoneStep('enter_phone');
                      setOtp('');
                      setServerError('');
                      setSuccessMessage('');
                    }}
                  >
                    Change Number
                  </button>
                </div>

                {/* Dev Testing Helper */}
                {receivedOtp && (
                  <div
                    className="demo-otp-banner"
                    onClick={() => {
                      setOtp(receivedOtp);
                      if (errors.otp) setErrors({});
                    }}
                    title="Click to auto-fill OTP"
                  >
                    <span>💡 <strong>Quick Fill:</strong> Your OTP is <code>{receivedOtp}</code></span>
                    <span className="fill-btn">Fill OTP</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Enter 6-Digit OTP</label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    className="otp-input-field"
                    placeholder="• • • • • •"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      if (errors.otp) setErrors({});
                    }}
                    autoComplete="one-time-code"
                  />
                  {errors.otp && <span className="field-error">{errors.otp}</span>}
                </div>

                <div className="form-group">
                  <label>Your Name (Optional for first-time login)</label>
                  <input
                    type="text"
                    className="standard-input"
                    placeholder="Enter your name (e.g., Alex)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue 🚀'}
                </button>

                <div className="otp-resend-row">
                  {countdown > 0 ? (
                    <span className="resend-countdown">Resend OTP in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Didn't get the code? <strong>Resend OTP</strong>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* ----------------- EMAIL FLOW (for Kitchen / Staff / Password accounts) ----------------- */}
        {authType === 'email' && (
          <div className="email-auth-container">
            {emailMode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="standard-input"
                    name="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, [e.target.name]: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="standard-input"
                    name="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, [e.target.name]: e.target.value })
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <p className="auth-subswitch">
                  Need a student account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('signup');
                      setErrors({});
                      setServerError('');
                    }}
                  >
                    Register here
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="standard-input"
                    name="name"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, [e.target.name]: e.target.value })
                    }
                    placeholder="Your Full Name"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="standard-input"
                    name="email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, [e.target.name]: e.target.value })
                    }
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="standard-input"
                    name="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, [e.target.name]: e.target.value })
                    }
                    placeholder="Create a password (min 6 chars)"
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <p className="auth-subswitch">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('login');
                      setErrors({});
                      setServerError('');
                    }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;