import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LayoutDashboard, ArrowLeft, ArrowRight, Shield, Sparkles } from 'lucide-react';
import {
  login as loginService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';
import './CmsLogin.css';

const CmsLogin = () => {
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
      
      // Verify CMS / Admin role
      if (data.user?.role !== 'cms' && data.user?.role !== 'admin') {
        setServerError('Access denied: This portal is exclusively for CMS Administrators.');
        setLoading(false);
        return;
      }

      login(data);

      if (from) {
        navigate(from);
      } else {
        navigate('/cms/dashboard');
      }
    } catch (err) {
      if (!err.response && (err.message === 'Network Error' || !err.status)) {
        setServerError('Cannot connect to server. Please check your connection.');
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
        setServerError('API endpoint not found. Ensure backend is running.');
      } else {
        setServerError(
          err.response?.data?.message || 'Invalid CMS administrator credentials.'
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
      setErrors({ forgotEmail: 'Please enter a valid administrator email' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await forgotPasswordService({ email: cleanEmail });
      setForgotStep('enter_otp');
      setSuccessMessage(`Password reset code sent to ${cleanEmail}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'No administrator account found with this email.');
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

      if (data.user?.role !== 'cms' && data.user?.role !== 'admin') {
        setServerError('Password reset, but account lacks CMS administrative privileges.');
        return;
      }

      login(data);
      navigate('/cms/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Reset failed. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 bg-oat dark:bg-[#1f130f] transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#2e1913] rounded-3xl border border-stone-200/80 dark:border-[#4d2a1f] shadow-warm-xl p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-espresso to-stone-800 text-honey-light flex items-center justify-center mx-auto mb-3 shadow-warm-sm border border-honey/20">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-honey/15 border border-honey/30 text-espresso dark:text-honey text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-honey" />
            <span>Content Management Portal</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-espresso dark:text-stone-100 tracking-tight">
            {mode === 'forgot' ? 'Admin Password Reset' : 'La Roche CMS'}
          </h2>
          <p className="text-xs sm:text-sm text-taupe dark:text-stone-400 mt-1">
            {mode === 'forgot'
              ? 'Enter registered admin email to receive reset code'
              : 'Sign in with your CMS Administrator login ID'}
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium mb-5">
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-5">
            {successMessage}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                CMS Login ID / Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-taupe dark:text-stone-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 dark:border-[#4d2a1f] bg-stone-50/50 dark:bg-[#23120d] text-espresso dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white dark:focus:bg-[#23120d] focus:ring-2 focus:ring-terracotta/10 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cms@larochecafe.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-taupe dark:text-stone-300">
                  Password
                </label>
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
                <Lock className="w-4 h-4 text-taupe dark:text-stone-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 dark:border-[#4d2a1f] bg-stone-50/50 dark:bg-[#23120d] text-espresso dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white dark:focus:bg-[#23120d] focus:ring-2 focus:ring-terracotta/10 transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter CMS password"
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
              {loading ? 'Verifying Admin Access...' : 'Sign In to CMS Dashboard'}
            </button>
          </form>
        ) : (
          forgotStep === 'enter_email' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                  CMS Administrator Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-taupe dark:text-stone-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 dark:border-[#4d2a1f] bg-stone-50/50 dark:bg-[#23120d] text-espresso dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="cms@larochecafe.com"
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-taupe dark:text-stone-400 hover:text-espresso transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to CMS Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs text-taupe dark:text-stone-300 mb-1">
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
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-[#4d2a1f] bg-stone-50/50 dark:bg-[#23120d] text-espresso dark:text-stone-100 text-center tracking-[8px] font-extrabold text-xl focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
                  placeholder="••••••"
                  value={forgotOtp}
                  maxLength={6}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                />
                {errors.forgotOtp && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.forgotOtp}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                  New Admin Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-taupe dark:text-stone-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 dark:border-[#4d2a1f] bg-stone-50/50 dark:bg-[#23120d] text-espresso dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 transition-all"
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
                {loading ? 'Resetting...' : 'Update Password & Enter CMS'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-taupe dark:text-stone-400 hover:text-espresso transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to CMS Sign In</span>
                </button>
              </div>
            </form>
          )
        )}

        <div className="mt-8 pt-4 border-t border-stone-200/80 dark:border-[#4d2a1f] flex items-center justify-between text-xs text-taupe dark:text-stone-400">
          <Link to="/menu" className="hover:text-espresso dark:hover:text-stone-200">
            ← Customer Menu
          </Link>
          <Link to="/kitchen/login" className="hover:text-espresso dark:hover:text-stone-200">
            Kitchen KDS Login →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CmsLogin;
