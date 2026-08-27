import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validators';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await loginService(formData);
      login(data); // saves to AuthContext + localStorage

      // If they were sent here from a protected page (like checkout), go back there
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

  return (
    <div className="login-page">
      <div className="login-brand">
        <h1>
          LA ROCHE <span>cafe</span>
        </h1>
      </div>

      <form className="login-sheet" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>

        {serverError && <p className="form-error">{serverError}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.name23@college.edu.in"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="signup-link">
          New student? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
