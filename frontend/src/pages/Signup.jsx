import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup as signupService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { validateSignupForm } from '../utils/validators';
import './Login.css'; // reuses the same login-page styling

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await signupService(formData);
      login(data); // auto-login right after signup
      navigate('/menu');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
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
        <h2>Create your account</h2>

        {serverError && <p className="form-error">{serverError}</p>}

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>College Email</label>
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
            placeholder="At least 6 characters"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="signup-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
