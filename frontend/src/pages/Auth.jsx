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

const Auth = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [signupMethod, setSignupMethod] = useState('phone'); // 'phone' | 'email'

  // Phone OTP States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneStep, setPhoneStep] = useState('enter_phone'); // 'enter_phone' | 'enter_otp'
  const [receivedOtp, setReceivedOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Email States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

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

  // Sync mode with route if initialMode or pathname changes
  useEffect(() => {
    setMode(initialMode);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  }, [initialMode, location.pathname]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus OTP input on step change
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
    navigate(next === 'signup' ? '/signup' : '/login');
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

  // --- Phone OTP Handlers ---
  const handleSendOtp = async (e) => {
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
      const res = await sendOtpService({ phone: cleanPhone });
      setPhoneStep('enter_otp');
      setCountdown(30);
      if (res.otp) {
        setReceivedOtp(res.otp);
      }
      setSuccessMessage(`Code sent to +91 ${cleanPhone}`);
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

  // --- Email Handlers ---
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

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
      <div className={`auth-card ${mode === 'signup' ? 'is-signup' : ''}`}>
        
        {/* ----------------- LOGIN PANEL (LEFT) ----------------- */}
        <div className="auth-panel auth-panel--login">
          <h2>Sign in</h2>
          
          {/* Method Selector: Phone OTP vs Email */}
          <div className="auth-toggle-bar">
            <button
              type="button"
              className={`toggle-opt ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setLoginMethod('phone');
                setServerError('');
                setErrors({});
              }}
            >
              📱 Mobile OTP
            </button>
            <button
              type="button"
              className={`toggle-opt ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => {
                setLoginMethod('email');
                setServerError('');
                setErrors({});
              }}
            >
              ✉️ Email
            </button>
          </div>

          {serverError && mode === 'login' && <p className="form-error">{serverError}</p>}
          {successMessage && mode === 'login' && <p className="form-success">{successMessage}</p>}

          {loginMethod === 'phone' ? (
            phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">🇮🇳 +91</span>
                    <input
                      type="tel"
                      className="auth-input phone-field"
                      placeholder="10-digit number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (errors.phone) setErrors({});
                      }}
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? 'Sending code...' : 'Get OTP →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-target-info">
                  <span>Sent to <strong>+91 {phone}</strong></span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setPhoneStep('enter_phone');
                      setOtp('');
                    }}
                  >
                    Change
                  </button>
                </div>

                {receivedOtp && (
                  <div
                    className="dev-otp-chip"
                    onClick={() => {
                      setOtp(receivedOtp);
                      if (errors.otp) setErrors({});
                    }}
                    title="Click to auto-fill"
                  >
                    <span>💡 OTP: <strong>{receivedOtp}</strong> (Click to fill)</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    className="auth-input otp-field"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                  />
                  {errors.otp && <span className="field-error">{errors.otp}</span>}
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign in'}
                </button>

                <div className="resend-container">
                  {countdown > 0 ? (
                    <span className="countdown-txt">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      className="resend-link"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  className="auth-input"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="your.name@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="auth-input"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            New to La Roche?{' '}
            <button type="button" onClick={() => switchTo('signup')}>
              Create an account
            </button>
          </p>
        </div>

        {/* ----------------- SIGNUP PANEL (RIGHT) ----------------- */}
        <div className="auth-panel auth-panel--signup">
          <h2>Create account</h2>

          {/* Method Selector: Phone OTP vs Email */}
          <div className="auth-toggle-bar">
            <button
              type="button"
              className={`toggle-opt ${signupMethod === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setSignupMethod('phone');
                setServerError('');
                setErrors({});
              }}
            >
              📱 Mobile OTP
            </button>
            <button
              type="button"
              className={`toggle-opt ${signupMethod === 'email' ? 'active' : ''}`}
              onClick={() => {
                setSignupMethod('email');
                setServerError('');
                setErrors({});
              }}
            >
              ✉️ Email
            </button>
          </div>

          {serverError && mode === 'signup' && <p className="form-error">{serverError}</p>}
          {successMessage && mode === 'signup' && <p className="form-success">{successMessage}</p>}

          {signupMethod === 'phone' ? (
            phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">🇮🇳 +91</span>
                    <input
                      type="tel"
                      className="auth-input phone-field"
                      placeholder="10-digit number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (errors.phone) setErrors({});
                      }}
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? 'Sending code...' : 'Register with OTP →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-target-info">
                  <span>Sent to <strong>+91 {phone}</strong></span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setPhoneStep('enter_phone');
                      setOtp('');
                    }}
                  >
                    Change
                  </button>
                </div>

                {receivedOtp && (
                  <div
                    className="dev-otp-chip"
                    onClick={() => {
                      setOtp(receivedOtp);
                      if (errors.otp) setErrors({});
                    }}
                    title="Click to auto-fill"
                  >
                    <span>💡 OTP: <strong>{receivedOtp}</strong> (Click to fill)</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Enter 6-Digit OTP</label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    className="auth-input otp-field"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                  />
                  {errors.otp && <span className="field-error">{errors.otp}</span>}
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Creating account...' : 'Verify & Complete'}
                </button>

                <div className="resend-container">
                  {countdown > 0 ? (
                    <span className="countdown-txt">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      className="resend-link"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="auth-input"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  className="auth-input"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="your.name@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="auth-input"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Create a password (min 6 chars)"
                  autoComplete="new-password"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => switchTo('login')}>
              Sign in
            </button>
          </p>
        </div>

        {/* ----------------- THE SLIDING BLADE ----------------- */}
        <div className="auth-blade">
          <div className="auth-blade__inner">
            <img src="/logo.png" alt="La Roche Cafe" className="auth-blade__logo" onError={(e) => { e.target.onerror = null; e.target.src = '/logo2.png'; }} />
            <h3 className="auth-blade__title">
            </h3>
            <p className="auth-blade__text">
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
