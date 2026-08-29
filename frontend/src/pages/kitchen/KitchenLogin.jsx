import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { login as loginService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';
import './KitchenLogin.css';

const KitchenLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-oat">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 shadow-warm-xl p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-espresso text-white flex items-center justify-center mx-auto mb-3 shadow-warm-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-espresso tracking-tight">
            Staff Portal
          </h2>
          <p className="text-xs sm:text-sm text-taupe mt-1">
            Authorized kitchen personnel access only
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-5">
            {serverError}
          </div>
        )}

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
            <label className="block text-xs font-bold text-taupe mb-1.5">Password</label>
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default KitchenLogin;
