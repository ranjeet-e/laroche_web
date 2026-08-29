import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';
import './KitchenLogin.css';

const DEFAULT_KITCHEN_EMAIL = 'kitchen@larochecafe.com';
const DEFAULT_KITCHEN_PASSWORD = 'kitchen123';

const KitchenLogin = () => {
  const [formData, setFormData] = useState({
    email: DEFAULT_KITCHEN_EMAIL,
    password: DEFAULT_KITCHEN_PASSWORD,
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

  const handleFillDemo = () => {
    setFormData({
      email: DEFAULT_KITCHEN_EMAIL,
      password: DEFAULT_KITCHEN_PASSWORD,
    });
    setErrors({});
    setServerError('');
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
        setServerError('Cannot connect to backend server. Please verify VITE_API_BASE_URL points to your live backend API.');
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
        setServerError('API endpoint not found. Ensure VITE_API_BASE_URL is set in your Vercel project settings.');
      } else {
        setServerError(
          err.response?.data?.message || 'Login failed. Please check credentials or network.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kitchen-login-page">
      <div className="kitchen-login-card">
        <div className="kitchen-login-header">
          <span className="kitchen-badge-icon">👨‍🍳</span>
          <h2>Kitchen Staff Portal</h2>
          <p>Log in to view live incoming orders and manage inventory</p>
        </div>

        <div className="kitchen-cred-chip" onClick={handleFillDemo} title="Click to auto-fill credentials">
          <div className="kitchen-cred-info">
            <strong>🔑 Default Staff Credentials:</strong>
            <span>Email: <code>{DEFAULT_KITCHEN_EMAIL}</code></span>
            <span>Password: <code>{DEFAULT_KITCHEN_PASSWORD}</code></span>
          </div>
          <button type="button" className="kitchen-cred-fill-btn">Auto-Fill</button>
        </div>

        {serverError && <p className="form-error">{serverError}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Staff Email</label>
            <input
              type="text"
              name="email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="kitchen@larochecafe.com"
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
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter kitchen password"
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Accessing Kitchen...' : 'Sign in to Dashboard →'}
          </button>
        </form>

        <div className="kitchen-footer-links">
          <Link to="/login">← Switch to Student Login</Link>
        </div>
      </div>
    </div>
  );
};

export default KitchenLogin;
