import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isStudent, isKitchen } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState('');

  // Keep the search box in sync with the URL when on the Menu page
  useEffect(() => {
    if (location.pathname === '/menu') {
      setSearchValue(searchParams.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/menu');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/menu?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/menu', { replace: true });
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="La Roche Cafe Logo" className="navbar-logo" />
      </Link>

      {!isKitchen && (
        <div className="navbar-search-wrap">
          <span className="navbar-search-icon">🔍</span>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search for dishes..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      )}

      <div className="navbar-links">
        {!isKitchen && (
          <>
            <Link to="/menu">Menu</Link>
            <Link to="/cart" className="navbar-cart">
              Cart
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
            {isStudent && <Link to="/orders">My Orders</Link>}
          </>
        )}

        {isKitchen && <Link to="/kitchen/dashboard">Dashboard</Link>}

        {user ? (
          <button className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="navbar-login">
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;