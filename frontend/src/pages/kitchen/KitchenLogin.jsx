import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  login as loginService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';
import './KitchenLogin.css';

const KitchenLogin = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState('enter_email'); // 'enter_email' | 'enter_otp'

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const submissionData = {
      email: formData.email.trim(),
      password: formData.password,
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
      login(data);

      if (from) {
        navigate(from);
      } else {
        navigate('/kitchen/dashboard');
      }
    } catch (err) {
      if (!err.response && (err.message === 'Network Error' || !err.status)) {
        setServerError('Cannot connect to server. Please check your connection.');
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
        setServerError('API endpoint not found. Ensure backend is running.');
      } else {
        setServerError(
          err.response?.data?.message || 'Invalid credentials. Please verify your email and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrors({ forgotEmail: 'Please enter a valid staff email' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await forgotPasswordService({ email: cleanEmail });
      setForgotStep('enter_otp');
      setSuccessMessage(`Password reset code sent to ${cleanEmail}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'No staff account found with this email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const cleanOtp = forgotOtp.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setErrors({ forgotOtp: 'Enter the verification code' });
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
      login(data);
      navigate('/kitchen/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Reset failed. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-oat">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 shadow-warm-xl p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-espresso text-white flex items-center justify-center mx-auto mb-3 shadow-warm-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-espresso tracking-tight">
            {mode === 'forgot' ? 'Staff Password Reset' : 'Kitchen Portal'}
          </h2>
          <p className="text-xs sm:text-sm text-taupe mt-1">
            {mode === 'forgot'
              ? 'Enter staff email to receive a reset code'
              : 'Authorized kitchen personnel access only'}
          </p>
        </div>

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

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-taupe mb-1.5">Authorized Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter staff email"
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter staff password"
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
              {loading ? 'Authenticating...' : 'Sign In to KDS'}
            </button>
          </form>
        ) : (
          forgotStep === 'enter_email' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe mb-1.5">Staff Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-espresso placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="staff@laroche.com"
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
                  <span>Back to Staff Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
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
                {loading ? 'Resetting...' : 'Update Password & Access KDS'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-taupe hover:text-espresso transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Staff Sign In</span>
                </button>
              </div>
            </form>
          )
        )}

      </div>
    </div>
  );
};

export default KitchenLogin;

