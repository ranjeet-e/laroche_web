import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginService, signup as signupService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm, validateSignupForm } from '../utils/validators';
import './Auth.css';

const Auth = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const switchTo = (next) => {
    setMode(next);
    setErrors({});
    setServerError('');
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateLoginForm(loginData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await loginService(loginData);
      login(data);

      if (from) {
        navigate(from);
      } else if (data.user.role === 'kitchen') {
        navigate('/kitchen/dashboard');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateSignupForm(signupData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await signupService(signupData);
      login(data);
      navigate('/menu');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${mode === 'signup' ? 'is-signup' : ''}`}>
        {/* Login form */}
        <div className="auth-panel auth-panel--login">
          <h2>Sign in</h2>
          {serverError && mode === 'login' && <p className="form-error">{serverError}</p>}
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="your.name23@college.edu.in"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">
            New to La Roche?{' '}
            <button type="button" onClick={() => switchTo('signup')}>Create an account</button>
          </p>
        </div>

        {/* Signup form */}
        <div className="auth-panel auth-panel--signup">
          <h2>Create account</h2>
          {serverError && mode === 'signup' && <p className="form-error">{serverError}</p>}
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Your name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="your.name23@college.edu.in"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create a password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => switchTo('login')}>Sign in</button>
          </p>
        </div>

        {/* The sliding blade */}
        <div className="auth-blade">
          <div className="auth-blade__inner">
            <img src="/logo.png" alt="La Roche Cafe" className="auth-blade__logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;